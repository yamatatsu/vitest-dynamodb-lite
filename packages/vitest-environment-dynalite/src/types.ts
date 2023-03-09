import type { CreateTableInput } from "@aws-sdk/client-dynamodb";

export type TableConfig = CreateTableInput & {
  data?: Record<string, unknown>[];
  TableName: string;
};

export type Config = {
  tables?: TableConfig[] | (() => TableConfig[] | Promise<TableConfig[]>);
  basePort?: number;
};
