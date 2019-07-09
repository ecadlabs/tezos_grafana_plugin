export type Balance = string;
export type Contract = { counter: string; balance: string; manager: string };
export type Context = {
  blocks_per_cycle: string;
  blocks_per_voting_period: string;
};

export interface Block {
  protocol: string;
  chain_id: string;
  hash: string;
  header: Header;
  metadata: Metadata;
  operations: (Operation | Operations2)[][];
}

export interface Operations2 {
  protocol: string;
  chain_id: string;
  hash: string;
  branch: string;
  contents: Content2[];
  signature: string;
}

export interface Content2 {
  kind: string;
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  amount: string;
  destination: string;
  metadata: Metadata3;
}

export interface Metadata3 {
  balance_updates: Balanceupdate[];
  operation_result: Operationresult;
}

export interface Operationresult {
  status: string;
  balance_updates: Balanceupdate2[];
  consumed_gas: string;
}

export interface Balanceupdate2 {
  kind: string;
  contract: string;
  change: string;
}

export interface Operation {
  protocol: string;
  chain_id: string;
  hash: string;
  branch: string;
  contents: Content[];
  signature: string;
}

export interface Content {
  kind: string;
  level: number;
  metadata: Metadata2;
}

export interface Metadata2 {
  balance_updates: Balanceupdate[];
  delegate: string;
  slots: number[];
}

export interface Metadata {
  protocol: string;
  next_protocol: string;
  test_chain_status: Testchainstatus;
  max_operations_ttl: number;
  max_operation_data_length: number;
  max_block_header_length: number;
  max_operation_list_length: Maxoperationlistlength[];
  baker: string;
  level: Level;
  voting_period_kind: string;
  nonce_hash?: any;
  consumed_gas: string;
  deactivated: any[];
  balance_updates: Balanceupdate[];
}

export interface Balanceupdate {
  kind: string;
  contract?: string;
  change: string;
  category?: string;
  delegate?: string;
  cycle?: number;
}

export interface Level {
  level: number;
  level_position: number;
  cycle: number;
  cycle_position: number;
  voting_period: number;
  voting_period_position: number;
  expected_commitment: boolean;
}

export interface Maxoperationlistlength {
  max_size: number;
  max_op?: number;
}

export interface Testchainstatus {
  status: string;
}

export interface Header {
  level: number;
  proto: number;
  predecessor: string;
  timestamp: string;
  validation_pass: number;
  operations_hash: string;
  fitness: string[];
  context: string;
  priority: number;
  proof_of_work_nonce: string;
  signature: string;
}
