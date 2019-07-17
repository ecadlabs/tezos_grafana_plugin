import { RPCClient } from './data/rpc';
import { queries } from './queries/account';
import { blockQueries } from './queries/block';
import { contractQueries } from './queries/contract';
import { Tzscan } from './data/tzscan';
import { miscQueries } from './queries/misc';
import { OHLCApi } from './data/ohlc';

interface QueryResponse {
  data: { datapoints: [(number | string)[]]; target: string }[];
}

export class GenericDatasource {
  type: string;
  url: string;
  name: string;
  backendSrv: any;
  rpc: RPCClient;
  tzscan: Tzscan;
  api: OHLCApi;

  constructor(instanceSettings, backendSrv, private templateSrv) {
    this.type = instanceSettings.type;
    this.url = instanceSettings.jsonData.rpcURL;
    this.name = instanceSettings.name;
    this.backendSrv = backendSrv;
    this.rpc = new RPCClient(this.url, this.backendSrv);
    this.tzscan = new Tzscan(instanceSettings.jsonData.tzscanURL);
    this.api = new OHLCApi(this.backendSrv);
  }

  prepareQueryTarget(target, options) {
    // Replace grafana variables
    const interpolated = this.templateSrv.replace(
      target,
      options.scopedVars,
      'pipe'
    );
    return interpolated;
  }
  query(options: any): Promise<QueryResponse> {
    const q = options.targets.map(target => {
      const queryType = target.queryType;
      const subQueryType = target.subQueryType;
      let returnedQuery: any = null;
      switch (queryType) {
        case 'contract':
          const contractQuery = contractQueries.find(
            x => x.query_type == subQueryType
          );

          if (contractQuery) {
            returnedQuery = new contractQuery().query(
              this.rpc,
              this.tzscan,
              this.prepareQueryTarget(target.address, options),
              target.idx,
              options.range
            );
          }
        case 'account':
          const query = queries.find(x => x.query_type == subQueryType);

          if (query) {
            returnedQuery = new query().query(
              this.rpc,
              this.prepareQueryTarget(target.address, options)
            );
          }

        case 'block':
          const blockQuery = blockQueries.find(
            x => x.query_type == subQueryType
          );

          if (blockQuery) {
            returnedQuery = new blockQuery().query(this.rpc) as any;
          }
        case 'misc':
          const miscQuery = miscQueries.find(x => x.query_type == subQueryType);

          if (miscQuery) {
            returnedQuery = new miscQuery().query(
              this.api,
              options.range
            ) as any;
          }
      }

      if (!returnedQuery) {
        throw new Error('Unsupported query');
      }

      return returnedQuery.then(x => {
        if (Array.isArray(x)) {
          return x.map(y => {
            return {
              ...y,
              target: `${queryType} ${subQueryType}`
            };
          });
        }

        if ('target' in x) {
          return x;
        }

        return [
          {
            ...x,
            target: `${queryType} ${subQueryType}`
          }
        ];
      });
    });

    return Promise.all(q).then((results: any) => {
      return { data: results.reduce((prev, x) => [...prev, ...x], []) };
    });
  }
  testDatasource() {
    return Promise.all([this.rpc.head(), this.tzscan.head()]).then(response => {
      return {
        status: 'success',
        message: 'Data source is working',
        title: 'Success'
      };
    });
  }
  annotationQuery() {}
  metricFindQuery() {}
}
