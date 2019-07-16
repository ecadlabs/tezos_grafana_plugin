import { parseStorage } from '../storage_parser';
import { RPCClient } from '../rpc';
import { parseString } from '../response_parser';
import * as _ from 'lodash';
import moment from 'moment';
import { Tzscan } from '../tzscan';
import { Schema, ParameterSchema } from '../parser';

interface Transaction {
  hash: string;
  block_hash: string;
  network_hash: string;
  type: Type;
}

interface Type {
  kind: string;
  source: Source;
  operations: Operation[];
}

interface Operation {
  kind: string;
  src: Source;
  amount: number;
  destination: Source;
  str_parameters: string;
  failed: boolean;
  internal: boolean;
  burn: number;
  counter: number;
  fee: number;
  gas_limit: string;
  storage_limit: string;
  op_level: number;
  timestamp: string;
}

interface Source {
  tz: string;
}

function getTimestamp(tx: Transaction): number {
  return new Date(tx.type.operations[0].timestamp).getTime();
}

class ContractTransactionsQuery {
  static query_type = 'contract_transactions';
  static display_name = 'Contract transaction';

  async query(
    rpc: RPCClient,
    tzscan: Tzscan,
    address: string,
    label: number | string,
    range: { from: moment.Moment; to: moment.Moment }
  ) {
    const data: Transaction[] = await tzscan.transactions(address);
    const result = _.flatMap(data, tx =>
      tx.type.operations.map(x => {
        const paramMatch = /\"prim\":\"Left\".*\"%(.*)\"/.exec(
          x.str_parameters
        );
        return [
          {
            functionCall:
              Array.isArray(paramMatch) && paramMatch.length > 0
                ? paramMatch[1]
                : 'Unknown',
            hash: tx.hash,
            ...x
          }[label],
          getTimestamp(tx)
        ];
      })
    );

    return {
      datapoints: [...result],
      target: label
    };
  }
}

function getKeyFromQuery(query): [string, string] {
  const split = query.split('.');
  return [split[1], `$.${split.slice(2).join('.')}`];
}

function extractProp(query: string = '$', obj: {}) {
  const split = query.split('.');

  return split.slice(1).reduce((prev, prop) => {
    if (typeof prev != 'object' && !Array.isArray(prev)) {
      return prev;
    }

    return prev[prop];
  }, obj);
}

function convertNumberIfPossible(num: any) {
  try {
    const converted = Number.parseFloat(num);
    if (Number.isNaN(converted)) {
      return num;
    }
    return converted;
  } catch (e) {
    return num;
  }
}

class ContractStorageQuery {
  static query_type = 'contract_storage';
  static display_name = 'Contract Storage';
  async query(
    rpc: RPCClient,
    tzscan: Tzscan,
    address: string,
    idx: number,
    range: { from: moment.Moment; to: moment.Moment }
  ) {
    const sorted: Transaction[] = filterTxByRanges(
      await tzscan.transactions(address),
      range
    );

    const result = await Promise.all(
      sorted.map(async tx => {
        const contract = (await rpc.contract(address, tx.block_hash)) as any;
        const schema = new Schema(
          (contract.script.code.find(x => x.prim === 'storage') as any).args[0]
        );
        return [
          convertNumberIfPossible(
            extractProp(String(idx), schema.Execute(contract.script.storage))
          ),
          new Date(tx.type.operations[0].timestamp).getTime()
        ];
      })
    );

    return {
      datapoints: [...result]
    };
  }
}

class ContractTransactionParamQuery {
  static query_type = 'contract_transaction_param';
  static display_name = 'Contract Transaction Param';
  async query(
    rpc: RPCClient,
    tzscan: Tzscan,
    address: string,
    idx: number,
    range: { from: moment.Moment; to: moment.Moment }
  ) {
    const data: Transaction[] = filterTxByRanges(
      await tzscan.transactions(address),
      range,
      false
    );
    const contract = (await rpc.contract(address)) as any;

    const schema = new ParameterSchema(
      (contract.script.code.find(x => x.prim === 'parameter') as any).args[0]
    );

    return {
      datapoints: data
        .map(x => {
          const parsed = JSON.parse(x.type.operations[0].str_parameters);

          const res = schema.Execute(parsed);
          return [
            convertNumberIfPossible(extractProp(String(idx), res)),
            new Date(x.type.operations[0].timestamp).getTime()
          ];
          return null;
        })
        .filter(x => x)
    };
  }
}

function filterTxByRanges(
  data: Transaction[],
  range: { from: moment.Moment; to: moment.Moment },
  virtualPoint = true
) {
  const txInRanges = _.filter(data, item => {
    return _.inRange(
      getTimestamp(item),
      range.from.toDate().getTime(),
      range.to.toDate().getTime() + 1
    );
  });

  if (txInRanges.length < 2) {
    const maxDate = _.maxBy(data, item => getTimestamp(item));
    if (maxDate && getTimestamp(maxDate) < range.from.toDate().getTime()) {
      maxDate.type.operations[0].timestamp = range.from.toISOString();
      txInRanges.push(maxDate);
    }
  }

  if (virtualPoint) {
    const maxDate = _.maxBy(txInRanges, item => getTimestamp(item));
    if (maxDate) {
      const dc = _.cloneDeep(maxDate);
      dc.type.operations[0].timestamp = range.to.toISOString();
      txInRanges.push(dc);
    }
  }

  return _.sortBy(txInRanges, getTimestamp);
}

class ContractBigMapStorageQuery {
  static query_type = 'contract_big_map_storage';
  static display_name = 'Contract Big Map';
  async query(
    rpc: RPCClient,
    tzscan: Tzscan,
    address: string,
    idx: number,
    range: { from: moment.Moment; to: moment.Moment }
  ) {
    const sorted: Transaction[] = filterTxByRanges(
      await tzscan.transactions(address),
      range
    );

    let schema: Schema;
    const contract = (await rpc.contract(address)) as any;

    schema = new Schema(
      (contract.script.code.find(x => x.prim === 'storage') as any).args[0]
    );

    const [key, query] = getKeyFromQuery(String(idx));

    const result = await Promise.all(
      sorted.map(async tx => {
        return await Promise.all([
          rpc.bigMapGet(schema.EncodeBigMapKey(key), address, tx.block_hash)
        ]).then(([bigMapValue]: [any, any, any]) => {
          let val = [0];
          if (bigMapValue) {
            val = schema.ExecuteOnBigMapValue(bigMapValue);
          }
          return [
            convertNumberIfPossible(extractProp(String(query), val)),
            new Date(tx.type.operations[0].timestamp).getTime()
          ];
        });
      })
    );

    return {
      datapoints: [...result]
    };
  }
}
class ContractSnapshotStorageQuery {
  static query_type = 'contract_snapshot_storage';
  static display_name = 'Contract Snapshot Storage';
  query(rpc: RPCClient, tzscan: Tzscan, address: string, idx: string) {
    return rpc
      .contract(address)
      .then(contract => extractProp(String(idx), parseStorage(contract)))
      .then(parseString);
  }
}

export const contractQueries = [
  ContractStorageQuery,
  ContractSnapshotStorageQuery,
  ContractTransactionsQuery,
  ContractBigMapStorageQuery,
  ContractTransactionParamQuery
];
