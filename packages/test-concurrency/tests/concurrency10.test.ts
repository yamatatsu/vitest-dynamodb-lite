import { randomUUID } from "node:crypto";
import { test, expect } from "vitest";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

const dynamodb = DynamoDBDocument.from(
  new DynamoDBClient({
    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
    region: "local",
  }),
);

test("config/get-fixture-data", async () => {
  const { Item } = await dynamodb.get({
    TableName: "pk-string-table",
    Key: { pk_string: "pk-0" },
  });
  expect(Item).toEqual({ pk_string: "pk-0" });
});

test("config/get-inserted-data", async () => {
  const randomValue = randomUUID();
  await dynamodb.put({
    TableName: "pk-string-table",
    Item: { pk_string: "pk-10", randomValue },
  });
  const { Item } = await dynamodb.get({
    TableName: "pk-string-table",
    Key: { pk_string: "pk-10" },
  });
  expect(Item).toEqual({ pk_string: "pk-10", randomValue });
});
