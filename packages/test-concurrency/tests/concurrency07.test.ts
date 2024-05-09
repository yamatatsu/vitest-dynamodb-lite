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
test("011", testFn);
test("012", testFn);
test("013", testFn);
test("014", testFn);
test("015", testFn);
test("016", testFn);
test("017", testFn);
test("018", testFn);
test("019", testFn);
test("020", testFn);
test("021", testFn);
test("022", testFn);
test("023", testFn);
test("024", testFn);
test("025", testFn);
test("026", testFn);
test("027", testFn);
test("028", testFn);
test("029", testFn);
test("030", testFn);
test("031", testFn);
test("032", testFn);
test("033", testFn);
test("034", testFn);
test("035", testFn);
test("036", testFn);
test("037", testFn);
test("038", testFn);
test("039", testFn);
test("040", testFn);
test("041", testFn);
test("042", testFn);
test("043", testFn);
test("044", testFn);
test("045", testFn);
test("046", testFn);
test("047", testFn);
test("048", testFn);
test("049", testFn);
test("050", testFn);
test("051", testFn);
test("052", testFn);
test("053", testFn);
test("054", testFn);
test("055", testFn);
test("056", testFn);
test("057", testFn);
test("058", testFn);
test("059", testFn);
test("060", testFn);
test("061", testFn);
test("062", testFn);
test("063", testFn);
test("064", testFn);
test("065", testFn);
test("066", testFn);
test("067", testFn);
test("068", testFn);
test("069", testFn);
test("070", testFn);
test("071", testFn);
test("072", testFn);
test("073", testFn);
test("074", testFn);
test("075", testFn);
test("076", testFn);
test("077", testFn);
test("078", testFn);
test("079", testFn);
test("080", testFn);
test("081", testFn);
test("082", testFn);
test("083", testFn);
test("084", testFn);
test("085", testFn);
test("086", testFn);
test("087", testFn);
test("088", testFn);
test("089", testFn);
test("090", testFn);
test("091", testFn);
test("092", testFn);
test("093", testFn);
test("094", testFn);
test("095", testFn);
test("096", testFn);
test("097", testFn);
test("098", testFn);
test("099", testFn);
test("100", testFn);
