import type { Config } from "vitest-dynamodb-lite";

export default {
  tables: [
    {
      TableName: "pk-string-table",
      KeySchema: [{ AttributeName: "pk_string", KeyType: "HASH" }],
      AttributeDefinitions: [
        { AttributeName: "pk_string", AttributeType: "S" },
      ],
      ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
      data: [
        { pk_string: "pk-0" },
        { pk_string: "pk-1" },
        { pk_string: "pk-2" },
      ],
    },
    {
      TableName: "pk-string-sk-number-table",
      KeySchema: [
        { AttributeName: "pk_string", KeyType: "HASH" },
        { AttributeName: "sk_number", KeyType: "RANGE" },
      ],
      AttributeDefinitions: [
        { AttributeName: "pk_string", AttributeType: "S" },
        { AttributeName: "sk_number", AttributeType: "N" },
      ],
      ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 },
      data: [
        { pk_string: "pk-0", sk_number: 1, group: "a-1" },
        { pk_string: "pk-0", sk_number: 2, group: "a-1" },
        { pk_string: "pk-0", sk_number: 3, group: "a-1" },
        { pk_string: "pk-0", sk_number: 4, group: "a-1" },
        { pk_string: "pk-1", sk_number: 1, group: "a-1" },
        { pk_string: "pk-1", sk_number: 2, group: "a-2" },
        { pk_string: "pk-1", sk_number: 3, group: "a-3" },
        { pk_string: "pk-1", sk_number: 4, group: "b-1" },
        { pk_string: "pk-1", sk_number: 5, group: "b-2" },
        { pk_string: "pk-1", sk_number: 6, group: "b-3" },
        { pk_string: "pk-1", sk_number: 7, group: "b-4" },
        { pk_string: "pk-1", sk_number: 8, group: "b-5" },
      ],
    },
  ],
  basePort: 8100,
} satisfies Config;
