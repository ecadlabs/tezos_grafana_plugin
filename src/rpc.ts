import { Contract, Balance, Block, Context } from './model';

export class RPCClient {
  private rpcHeadEndpoint = '/chains/main/blocks/';
  private rpcBalanceEndpoint =
    '/chains/main/blocks/head/context/contracts/%s/balance';
  private rpcContractEndpoint = (level, addr) =>
    `/chains/main/blocks/${level}/context/contracts/${addr}`;
  private rpcContextEndpoint = '/chains/main/blocks/head/context/constants';
  private rpcBakingRightsEndpoint =
    '/chains/main/blocks/head/helpers/baking_rights';

  private rpcOpEndpoint = (block, op) => {
    return `/chains/main/blocks/${block}/operations/3`;
  };

  private rpcBigMapGet = (key: string, pkh: string, level: string) => {
    return `/chains/main/blocks/${level}/context/contracts/${pkh}/big_map_get?key=${key}`;
  };

  private cache = new Map<string, { result: Promise<any>; timestamp: any }>();

  constructor(private baseUrl: string, private backend) {}

  contract(pkh: string, level = 'head'): Promise<Contract> {
    return this.doRequest({
      url: this.baseUrl + this.rpcContractEndpoint(level, pkh),
      method: 'GET'
    }).then(({ data }) => {
      return data as Contract;
    });
  }

  bigMapGet(key: any, pkh: string, level = 'head') {
    return this.doRequest({
      url: this.baseUrl + this.rpcBigMapGet(key.key.bytes, pkh, level),
      method: 'POST',
      data: key,
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(({ data }) => {
      return data as any;
    });
  }

  operation(op: string, level = 'head'): Promise<any> {
    return this.doRequest({
      url: this.baseUrl + this.rpcOpEndpoint(level, op),
      method: 'GET'
    }).then(({ data }) => {
      return data as any;
    });
  }

  balance(pkh: string): Promise<Balance> {
    return this.doRequest({
      url: this.baseUrl + this.rpcBalanceEndpoint.replace('%s', pkh),
      method: 'GET'
    }).then(({ data }) => {
      return data as string;
    });
  }

  head(level = 'head'): Promise<Block> {
    return this.doRequest({
      url: this.baseUrl + this.rpcHeadEndpoint + level,
      method: 'GET'
    }).then(({ data }) => {
      return data as Block;
    });
  }

  backingRight(): Promise<any> {
    return this.doRequest({
      url: this.baseUrl + this.rpcBakingRightsEndpoint,
      method: 'GET'
    }).then(({ data }) => {
      return data as Block;
    });
  }

  context(): Promise<Context> {
    return this.doRequest({
      url: this.baseUrl + this.rpcContextEndpoint,
      method: 'GET'
    }).then(({ data }) => {
      return data as Context;
    });
  }

  private hasOption(options) {
    const lastOption = this.cache.get(options);
    const now: any = new Date();
    return (
      lastOption && lastOption.timestamp && now - lastOption.timestamp < 5000 // Cache for 5 seconds
    );
  }

  private doRequest(options): Promise<{ data: any; status: number }> {
    if (!this.hasOption(options.url)) {
      this.cache.set(options.url, {
        result: this.backend.datasourceRequest(options),
        timestamp: new Date()
      });
    }

    return this.cache.get(options.url)!.result;
  }
}
