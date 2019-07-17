import { RPCClient } from '../data/rpc';
import { parseNumber, parseString } from '../response_parser';

class BlockLevelQuery {
  static query_type = 'level';
  static display_name = 'Level';

  query(rpc: RPCClient) {
    return rpc
      .head()
      .then(({ header: { level } }) => {
        return level;
      })
      .then(parseNumber);
  }
}

class BlockCycleQuery {
  static query_type = 'current_cycle';
  static display_name = 'Cycle';

  query(rpc: RPCClient) {
    return rpc
      .head()
      .then(({ metadata: { level: { cycle } } }) => {
        return cycle;
      })
      .then(parseNumber);
  }
}

class BlockTimeCycleEndQuery {
  static query_type = 'time_until_cycle_end';
  static display_name = 'Time until cycle end';

  query(rpc: RPCClient) {
    return rpc.context().then(({ blocks_per_cycle }) => {
      return rpc
        .head()
        .then(({ metadata: { level: { cycle_position } } }) => {
          return (Number(blocks_per_cycle) - cycle_position) * 60 * 1000;
        })
        .then(parseNumber);
    });
  }
}

class BlockVotingPeriodEndQuery {
  static query_type = 'time_until_voting_end';
  static display_name = 'Time until voting period end';

  query(rpc: RPCClient) {
    return rpc.context().then(({ blocks_per_voting_period }) => {
      return rpc
        .head()
        .then(({ metadata: { level: { voting_period_position } } }) => {
          return (
            (Number(blocks_per_voting_period) - voting_period_position) *
            60 *
            1000
          );
        })
        .then(parseNumber);
    });
  }
}

class BlockTimestampQuery {
  static query_type = 'timestamp';
  static display_name = 'Time since last block';

  query(rpc: RPCClient) {
    return rpc
      .head()
      .then(({ header: { timestamp } }) => {
        const ts: any = new Date(timestamp);
        return Math.abs((new Date() as any) - ts);
      })
      .then(parseNumber);
  }
}

class BlockVotingPeriodKindQuery {
  static query_type = 'voting_period_kind';
  static display_name = 'Voting Period Kind';

  query(rpc: RPCClient) {
    return rpc
      .head()
      .then(({ metadata: { voting_period_kind } }) => {
        return voting_period_kind.replace('testing_vote', 'exploration_vote');
      })
      .then(parseString);
  }
}

class BlockLatestBakerQuery {
  static query_type = 'latest_baker';
  static display_name = 'Latest Baker';

  query(rpc: RPCClient) {
    return rpc
      .head()
      .then(({ metadata: { baker } }) => {
        return baker;
      })
      .then(parseString);
  }
}

class BlockVotingPeriodQuery {
  static query_type = 'voting_period';
  static display_name = 'Voting Period';

  query(rpc: RPCClient) {
    return rpc
      .head()
      .then(({ metadata: { level: { voting_period } } }) => {
        return voting_period;
      })
      .then(parseNumber);
  }
}

class BlockBakingRightQuery {
  static query_type = 'baking_rights';
  static display_name = 'Baking rights';

  query(rpc: RPCClient) {
    return rpc.backingRight().then(rights => {
      return rights.map(x => {
        return { datapoints: [[x.delegate, Date.now()]] };
      });
    });
  }
}

class BlockNumberOfOpsQuery {
  static query_type = 'number_of_ops';
  static display_name = 'Number of operations';

  query(rpc: RPCClient) {
    return rpc
      .head()
      .then(({ operations }) => {
        return (operations || []).reduce((prevSum, op) => {
          return (
            prevSum +
            op.reduce((prev, subOp) => {
              return prev + subOp.contents.length;
            }, 0)
          );
        }, 0);
      })
      .then(parseNumber);
  }
}

class BlockVolumeQuery {
  static query_type = 'volume';
  static display_name = 'Volume';

  query(rpc: RPCClient) {
    return rpc
      .head()
      .then(({ operations }) => {
        return (operations || []).reduce((prevSum, op) => {
          return (
            prevSum +
            op.reduce((prev, subOp: any) => {
              return (
                prev +
                subOp.contents
                  .filter(x => x.kind === 'transaction')
                  .reduce(
                    (prevAmount, x) => prevAmount + Number(x.amount) / 1000000,
                    0
                  )
              );
            }, 0)
          );
        }, 0);
      })
      .then(parseNumber);
  }
}

export const blockQueries = [
  BlockLevelQuery,
  BlockCycleQuery,
  BlockTimestampQuery,
  BlockVotingPeriodQuery,
  BlockTimeCycleEndQuery,
  BlockVotingPeriodKindQuery,
  BlockLatestBakerQuery,
  BlockNumberOfOpsQuery,
  BlockVolumeQuery,
  BlockVotingPeriodEndQuery,
  BlockBakingRightQuery
];
