import { KrakenAPI } from '../data/cryptocompare';
import moment from 'moment';
class BTCTokenPriceQuery {
  static query_type = 'btc_token_price';
  static display_name = 'XTZ/BTC Price';

  async query(
    api: KrakenAPI,
    range: { from: moment.Moment; to: moment.Moment }
  ) {
    const result = await api.getTickerPrice('BTC', range);
    return {
      datapoints: result.Data.map(x => {
        return [x.close, x.time * 1000];
      })
    };
  }
}

class USDTokenPriceQuery {
  static query_type = 'usd_token_price';
  static display_name = 'XTZ/USD Price';

  async query(
    api: KrakenAPI,
    range: { from: moment.Moment; to: moment.Moment }
  ) {
    const result = await api.getTickerPrice('USD', range);
    return {
      datapoints: result.Data.map(x => {
        return [x.close, x.time * 1000];
      })
    };
  }
}

export const miscQueries = [BTCTokenPriceQuery, USDTokenPriceQuery];
