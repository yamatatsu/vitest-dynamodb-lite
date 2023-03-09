// @vitest-environment dynalite

import { test, expect } from "vitest";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { useDynalite } from "vitest-environment-dynalite";

const dynamodb = DynamoDBDocument.from(
  new DynamoDBClient({
    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
    region: "local",
  })
);

useDynalite();

test("testfile/get-fixture-data", async () => {
  const { Item } = await dynamodb.get({
    TableName: "pk-string-table",
    Key: { pk_string: "pk-0" },
  });
  expect(Item).toEqual({ pk_string: "pk-0" });
});

test("testfile/get-inserted-data", async () => {
  await dynamodb.put({
    TableName: "pk-string-table",
    Item: { pk_string: "pk-10" },
  });
  const { Item } = await dynamodb.get({
    TableName: "pk-string-table",
    Key: { pk_string: "pk-10" },
  });
  expect(Item).toEqual({ pk_string: "pk-10" });
});
