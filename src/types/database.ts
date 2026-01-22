export interface SnowflakeConnectionPayload {
  connection_name: string;
  account: string;
  username: string;
  password: string;
  warehouse: string;
  role: string;
  cron_expression: string;
}

export interface DatabaseNode {
  name: string;
}

export interface SchemaNode {
  name: string;
}

export interface ApiError {
  detail?: string;
  message?: string;
}
