import { RPCClient } from '../rpc';
import { parseNumber, parseString } from '../response_parser';

class AccountBalanceQuery {
  static query_type = 'balance';
  static display_name = 'Balance';

  query(rpc: RPCClient, address: string) {
    return rpc
      .balance(address)
      .then(x => Number(x) / 1000000)
      .then(parseNumber);
  }
}

class AccountCounterQuery {
  static query_type = 'counter';
  static display_name = 'Counter';

  query(rpc: RPCClient, address: string) {
    return rpc
      .contract(address)
      .then(({ counter }) => counter)
      .then(parseNumber);
  }
}

class AccountManagerQuery {
  static query_type = 'manager';
  static display_name = 'Manager';
  query(rpc: RPCClient, address: string) {
    return rpc
      .contract(address)
      .then(({ manager }) => manager)
      .then(parseString);
  }
}

export const queries = [
  AccountBalanceQuery,
  AccountCounterQuery,
  AccountManagerQuery
];
