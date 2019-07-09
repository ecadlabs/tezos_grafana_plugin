import { Contract, Balance, Block, Context } from './model';

export class RPCClient {
  private rpcHeadEndpoint = '/chains/main/blocks/head';
  private rpcBalanceEndpoint =
    '/chains/main/blocks/head/context/contracts/%s/balance';
  private rpcContractEndpoint = '/chains/main/blocks/head/context/contracts/%s';
  private rpcContextEndpoint = '/chains/main/blocks/head/context/constants';
  private rpcBakingRightsEndpoint =
    '/chains/main/blocks/head/helpers/baking_rights';

  private cache = new Map<string, { result: Promise<any>; timestamp: any }>();

  constructor(private baseUrl: string, private backend) {}

  contract(pkh: string): Promise<Contract> {
    return this.doRequest({
      url: this.baseUrl + this.rpcContractEndpoint.replace('%s', pkh),
      method: 'GET'
    }).then(({ data }) => {
      return data as Contract;
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

  head(): Promise<Block> {
    return this.doRequest({
      url: this.baseUrl + this.rpcHeadEndpoint,
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
