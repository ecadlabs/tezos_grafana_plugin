import { Buffer } from 'buffer';
import * as bs58check from 'bs58check';

interface RpcTransaction {
  protocol: string;
  chain_id: string;
  hash: string;
  branch: string;
  contents: Content[];
  signature: string;
}

interface Content {
  kind: string;
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  amount: string;
  destination: string;
  parameters: Params;
  metadata: Metadata;
}

interface Metadata {
  balance_updates: Balanceupdate[];
  operation_result: Operationresult;
}

interface Operationresult {
  status: string;
  storage: Storage;
  big_map_diff: Bigmapdiff[];
  consumed_gas: string;
  storage_size: string;
  paid_storage_size_diff: string;
}

interface Bigmapdiff {
  key_hash: string;
  key: Key;
  value: Value;
}

interface Value {
  prim: string;
  args: any[];
}

interface Key {
  bytes: string;
}

interface Storage {
  prim: string;
  args: any[];
}

interface Balanceupdate {
  kind: string;
  contract?: string;
  change: string;
  category?: string;
  delegate?: string;
  level?: number;
}

interface Params {
  prim: string;
  args: any[];
}

function createToken(val, idx: number): any {
  const tokens = [
    PairToken,
    NatToken,
    StringToken,
    BigMapToken,
    AddressToken,
    MapToken,
    BoolToken,
    OrToken,
    ContractToken,
    ListToken
  ];
  const t = tokens.find(x => x.prim === val.prim);
  if (!t) {
    throw Error(JSON.stringify(val));
  }
  return new t(val, idx);
}

export class ParameterSchema {
  private root: Token;
  constructor(val) {
    this.root = createToken(val, 0);
  }

  Execute(val) {
    return this.root.Execute(val);
  }

  ExtractSchema() {
    return this.root.ExtractSchema();
  }
}

export class Schema {
  private root: Token;
  private bigMap: BigMapToken;

  constructor(val) {
    this.root = createToken(val, 0);

    if (val.prim == 'pair' && val.args[0].prim == 'big_map') {
      this.bigMap = new BigMapToken(val.args[0], 0);
    }
  }

  Execute(val) {
    return this.root.Execute(val);
  }

  ExecuteOnBigMapDiff(diff) {
    if (!this.bigMap) {
      throw new Error('No big map schema');
    }

    return this.bigMap.Execute(diff);
  }

  ExecuteOnBigMapValue(key) {
    if (!this.bigMap) {
      throw new Error('No big map schema');
    }

    return this.bigMap.ValueSchema.Execute(key);
  }

  EncodeBigMapKey(key: string) {
    if (!this.bigMap) {
      throw new Error('No big map schema');
    }

    return this.bigMap.KeySchema.ToBigMapKey(key);
  }

  ExtractSchema() {
    return this.root.ExtractSchema();
  }

  ComputeState(tx: RpcTransaction[], state: any) {
    const bigMap = tx.reduce((prev, current) => {
      return {
        ...prev,
        ...this.ExecuteOnBigMapDiff(
          current.contents[0].metadata.operation_result.big_map_diff
        )
      };
    }, {});

    return {
      ...this.Execute(state),
      [this.bigMap.annot]: bigMap
    };
  }
}

abstract class Token {
  constructor(
    protected val: { prim: string; args: any[]; annots: any[] },
    protected idx: number
  ) {}

  get annot() {
    return (Array.isArray(this.val.annots)
      ? this.val.annots[0]
      : String(this.idx)
    ).replace(/(%|\:)(_Liq_entry_)?/, '');
  }

  public abstract ExtractSchema(): any;

  public abstract Execute(val): any;
}

class PairToken extends Token {
  static prim = 'pair';

  constructor(
    protected val: { prim: string; args: any[]; annots: any[] },
    protected idx: number
  ) {
    super(val, idx);
  }

  public Execute(val): { [key: string]: any } {
    const leftToken = createToken(this.val.args[0], this.idx);
    const rightToken = createToken(this.val.args[1], this.idx + 1);

    let rightValue;
    if (rightToken instanceof PairToken) {
      rightValue = rightToken.Execute(val.args[1]);
    } else {
      rightValue = { [rightToken.annot]: rightToken.Execute(val.args[1]) };
    }

    const res = {
      [leftToken.annot]: leftToken.Execute(val.args[0]),
      ...rightValue
    };
    return res;
  }

  public ExtractSchema() {
    const leftToken = createToken(this.val.args[0], this.idx);
    const rightToken = createToken(this.val.args[1], this.idx + 1);

    let rightValue;
    if (rightToken instanceof PairToken) {
      rightValue = rightToken.ExtractSchema();
    } else {
      rightValue = { [rightToken.annot]: rightToken.ExtractSchema() };
    }

    const res = {
      [leftToken.annot]: leftToken.ExtractSchema(),
      ...rightValue
    };
    return res;
  }
}

class OrToken extends Token {
  static prim = 'or';

  constructor(
    protected val: { prim: string; args: any[]; annots: any[] },
    protected idx: number
  ) {
    super(val, idx);
  }

  public Execute(val): { [key: string]: any } {
    const leftToken = createToken(this.val.args[0], this.idx);
    const rightToken = createToken(this.val.args[1], this.idx + 1);

    if (val.prim == 'Right') {
      return rightToken.Execute(val.args[0]);
    } else {
      return {
        [leftToken.annot]: leftToken.Execute(val.args[0])
      };
    }
  }

  public ExtractSchema(): { [key: string]: any } {
    const leftToken = createToken(this.val.args[0], this.idx);
    const rightToken = createToken(this.val.args[1], this.idx + 1);

    let leftValue;
    if (leftToken instanceof OrToken) {
      leftValue = leftToken.ExtractSchema();
    } else {
      leftValue = { [leftToken.annot]: leftToken.ExtractSchema() };
    }

    let rightValue;
    if (rightToken instanceof OrToken) {
      rightValue = rightToken.ExtractSchema();
    } else {
      rightValue = { [rightToken.annot]: rightToken.ExtractSchema() };
    }

    return {
      ...leftValue,
      ...rightValue
    };
  }
}

class NatToken extends Token {
  static prim = 'nat';

  constructor(
    protected val: { prim: string; args: any[]; annots: any[] },
    protected idx: number
  ) {
    super(val, idx);
  }

  public Execute(val): { [key: string]: any } {
    return val.int;
  }

  public ExtractSchema() {
    return NatToken.prim;
  }
}

class BoolToken extends Token {
  static prim = 'bool';

  constructor(
    protected val: { prim: string; args: any[]; annots: any[] },
    protected idx: number
  ) {
    super(val, idx);
  }

  public Execute(val): { [key: string]: any } {
    return val.prim;
  }

  public ExtractSchema() {
    return BoolToken.prim;
  }
}

class ContractToken extends Token {
  static prim = 'contract';

  constructor(
    protected val: { prim: string; args: any[]; annots: any[] },
    protected idx: number
  ) {
    super(val, idx);
  }

  public Execute(val) {
    return '';
  }

  public ExtractSchema() {
    return ContractToken.prim;
  }
}

class ListToken extends Token {
  static prim = 'list';

  constructor(
    protected val: { prim: string; args: any[]; annots: any[] },
    protected idx: number
  ) {
    super(val, idx);
  }

  public Execute(val) {
    return '';
  }

  public ExtractSchema() {
    return ContractToken.prim;
  }
}

class StringToken extends Token {
  static prim = 'string';

  constructor(
    protected val: { prim: string; args: any[]; annots: any[] },
    protected idx: number
  ) {
    super(val, idx);
  }

  public Execute(val): { [key: string]: any } {
    return val.string;
  }

  public ExtractSchema() {
    return StringToken.prim;
  }
}

class AddressToken extends Token {
  static prim = 'address';

  constructor(
    protected val: { prim: string; args: any[]; annots: any[] },
    protected idx: number
  ) {
    super(val, idx);
  }

  public ToBigMapKey(val: string) {
    const decoded = b58decode(val);
    return {
      key: { bytes: decoded },
      type: { prim: 'bytes' }
    };
  }

  public Execute(val): { [key: string]: any } {
    return val.string;
  }

  public ExtractSchema() {
    return AddressToken.prim;
  }
}

class BigMapToken extends Token {
  static prim = 'big_map';
  constructor(
    protected val: { prim: string; args: any[]; annots: any[] },
    protected idx: number
  ) {
    super(val, idx);
  }

  get ValueSchema() {
    return createToken(this.val.args![1], 0);
  }

  get KeySchema() {
    return createToken(this.val.args[0], 0);
  }

  public ExtractSchema() {
    return {
      [this.KeySchema.ExtractSchema()]: this.ValueSchema.ExtractSchema()
    };
  }

  public Execute(val: any[]): { [key: string]: any } {
    return val.reduce((prev, current) => {
      return {
        ...prev,
        [encodePubKey(current.key.bytes)]: this.ValueSchema.Execute(
          current.value
        )
      };
    }, {});
  }
}

class MapToken extends Token {
  static prim = 'map';

  constructor(
    protected val: { prim: string; args: any[]; annots: any[] },
    protected idx: number
  ) {
    super(val, idx);
  }

  get ValueSchema() {
    return createToken(this.val.args![1], 0);
  }

  get KeySchema() {
    return createToken(this.val.args[0], 0);
  }

  public Execute(val: any[]): { [key: string]: any } {
    return val.reduce((prev, current) => {
      return {
        ...prev,
        [encodePubKey(current.args[0].bytes)]: this.ValueSchema.Execute(
          current.args[1]
        )
      };
    }, {});
  }

  public ExtractSchema() {
    return {
      [this.KeySchema.ExtractSchema()]: this.ValueSchema.ExtractSchema()
    };
  }
}

function b58cencode(payload, prefix) {
  payload = Uint8Array.from(Buffer.from(payload, 'hex'));

  const n = new Uint8Array(prefix.length + payload.length);
  n.set(prefix);
  n.set(payload, prefix.length);

  return bs58check.encode(Buffer.from(n.buffer));
}

function b58decode(payload) {
  const buf: Buffer = bs58check.decode(payload);
  const buf2hex = function(buffer) {
    const byteArray = new Uint8Array(buffer),
      hexParts = [] as any[];
    for (let i = 0; i < byteArray.length; i++) {
      let hex = byteArray[i].toString(16);
      let paddedHex = ('00' + hex).slice(-2);
      hexParts.push(paddedHex);
    }
    return hexParts.join('');
  };

  const prefix = {
    [new Uint8Array([6, 161, 159]).toString()]: '0000',
    [new Uint8Array([6, 161, 161]).toString()]: '0001',
    [new Uint8Array([6, 161, 164]).toString()]: '0002'
  };

  let pref = prefix[new Uint8Array(buf.slice(0, 3)).toString()];
  if (pref) {
    const hex = buf2hex(buf.slice(3));
    return pref + hex;
  } else {
    return '01' + buf2hex(buf.slice(3, 42)) + '00';
  }
}

function encodePubKey(value) {
  if (value.substring(0, 2) === '00') {
    const prefix = {
      '0000': new Uint8Array([6, 161, 159]),
      '0001': new Uint8Array([6, 161, 161]),
      '0002': new Uint8Array([6, 161, 164])
    };

    return b58cencode(value.substring(4), prefix[value.substring(0, 4)]);
  }

  return b58cencode(value.substring(2, 42), new Uint8Array([2, 90, 121]));
}
