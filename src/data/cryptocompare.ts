import moment from 'moment';
interface ApiResponse {
  Response: string;
  Type: number;
  Aggregated: boolean;
  Data: Datum[];
  TimeTo: number;
  TimeFrom: number;
  FirstValueInArray: boolean;
  ConversionType: ConversionType;
  RateLimit: RateLimit;
  HasWarning: boolean;
}

interface RateLimit {}

interface ConversionType {
  type: string;
  conversionSymbol: string;
}

interface Datum {
  time: number;
  close: number;
  high: number;
  low: number;
  open: number;
  volumefrom: number;
  volumeto: number;
}

export class KrakenAPI {
  constructor(private backendSrv) {}

  getTickerPrice(
    sym: string,
    range: { from: moment.Moment; to: moment.Moment }
  ): Promise<ApiResponse> {
    const diff = range.to.unix() - range.from.unix();
    const numOfDataPoint = Math.ceil(diff / 3600);

    return this.doRequest({
      url: `https://min-api.cryptocompare.com/data/histohour?fsym=XTZ&tsym=${sym}&limit=${numOfDataPoint}&toTs=${range.to.unix()}`
    }).then(({ data }) => data);
  }

  private doRequest(options): Promise<any> {
    return this.backendSrv.datasourceRequest(options);
  }
}
