# vitest-dynamodb-lite

vitest-dynamodb-lite is a fast, concurrent-safe DynamoDB mock for testing with vitest.

![concurrent-test](https://github.com/yamatatsu/vitest-dynamodb-lite/assets/11013683/d46ec607-71b2-478b-ae5b-686624c54015)

In this gif, 16 test files run concurrently without manually launching any dynamodb server.
Each dynamodb server is launched when each test file is executed.

vitest-dynamodb-lite runs a local dynamodb server for each test case, so it is safe to run tests concurrently.
These test cases in this gif perform PUT and GET an item for the same table name and the same key but different dynamodb servers concurrently.

vitest-dynamodb-lite uses [dynalite](https://github.com/architect/dynalite#readme) instead of
[DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) to run DynamoDB locally.

This repository was forked from [jest-dynalite](https://github.com/freshollie/jest-dynalite) to use in vitest
and added some performance improvements.

## Features

- Optionally clear tables between tests
- Isolated tables between test runners
- Ability to specify a config directory
- No `java` requirement
- Works with only `@aws-sdk/client-dynamodb` instead of `aws-sdk`

## Installation

```bash
npm i vitest-dynamodb-lite -D
# or
yarn add vitest-dynamodb-lite -D
# or
pnpm add vitest-dynamodb-lite -D
```

## Usage

### 1. Set `setupFiles` in `vitest.config.ts`

```js
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["vitest-dynamodb-lite"],
  },
});
```

### 2. Config file

In your project root, create a config file with the tables schemas, and an optional `basePort` to run dynalite on.

`vitest-dynamodb-lite-config.js`

```js
export default {
  tables: [
    {
      TableName: "table",
      KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
      AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      },
    },
  ],
  basePort: 8000,
};
```

You can write the config file in either `json` format.

### 3. Update your source code

```javascript
const client = new DynamoDBClient({
  ...yourConfig,
  ...(process.env.MOCK_DYNAMODB_ENDPOINT && {
    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
    region: "local",
  }),
});
```

`process.env.MOCK_DYNAMODB_ENDPOINT` is unique to each test runner.

After all your tests, make sure you destroy your client.
You can even do this by adding an `afterAll` in a [`setupFilesAfterEnv`](https://jestjs.io/docs/en/configuration#setupfilesafterenv-array) file.

```javascript
afterAll(() => {
  client.destroy();
});
```

### [Optional] Using fixtures

You can set some fixture data before each test:

`vitest-dynamodb-lite-config.json`:

```js
module.exports = {
  tables: [
    {
      // ...
      data: [{ id: "a", someattribute: "hello world" }],
    },
  ],
};
```

## License

`MIT`
