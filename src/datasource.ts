import { RPCClient } from './rpc';
import { queries } from './queries/account';
import { blockQueries } from './queries/block';

interface QueryResponse {
  data: { datapoints: [(number | string)[]]; target: string }[];
}

export class GenericDatasource {
  type: string;
  url: string;
  name: string;
  backendSrv: any;
  rpc: RPCClient;

  constructor(instanceSettings, backendSrv, private templateSrv) {
    this.type = instanceSettings.type;
    this.url = instanceSettings.jsonData.rpcURL;
    this.name = instanceSettings.name;
    this.backendSrv = backendSrv;
    this.rpc = new RPCClient(this.url, this.backendSrv);
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
      }

      if (!returnedQuery) {
        throw new Error('Unsupported query');
      }

      return returnedQuery.then(x => {
        if (Array.isArray(x)) {
          return x.map(y => {
            return {
              ...y,
              target: target.target
            };
          });
        }

        return [
          {
            ...x,
            target: target.target
          }
        ];
      });
    });

    return Promise.all(q).then((results: any) => {
      return { data: results.reduce((prev, x) => [...prev, ...x], []) };
    });
  }
  testDatasource() {
    return this.rpc.head().then(response => {
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
