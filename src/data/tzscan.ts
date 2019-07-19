export class Tzscan {
  private cache = new Map<string, { result: Promise<any>; timestamp: any }>();

  constructor(private baseUrl: string) {}

  private hasUrl(url) {
    const lastOption = this.cache.get(url);
    const now: any = new Date();

    return (
      lastOption && lastOption.timestamp && now - lastOption.timestamp < 30000 // Cache for 30 seconds
    );
  }

  public async head() {
    return await this.doRequest(`${this.baseUrl}/v1/head`);
  }

  public async transactions(address: string) {
    let lastResult: any[] | null = null;
    const txs = [] as any[];
    while (
      !lastResult ||
      (lastResult.length % 10 == 0 && lastResult.length < 50)
    ) {
      lastResult = (await this.doRequest(
        `${
          this.baseUrl
        }/v1/operations/${address}?type=Transaction&number=10&p=0`
      )) as any[];
      txs.push(...lastResult);
      if (txs.length === 0) {
        return txs;
      }
    }
    return txs;
  }

  private async doRequest(url: string): Promise<any> {
    if (!this.hasUrl(url)) {
      const resp = await fetch(url);
      const res = await resp.json();
      this.cache.set(url, {
        result: res,
        timestamp: new Date()
      });
    }

    return this.cache.get(url)!.result;
  }
}
