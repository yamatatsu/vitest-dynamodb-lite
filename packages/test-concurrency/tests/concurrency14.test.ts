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

const testFn = async () => {
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
};

test("config/get-inserted-data", testFn);

test("001", testFn);
test("002", testFn);
test("003", testFn);
test("004", testFn);
test("005", testFn);
test("006", testFn);
test("007", testFn);
test("008", testFn);
test("009", testFn);
test("010", testFn);
