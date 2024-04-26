# vitest-environment-dynalite

Rewritten from [jest-dynalite](https://github.com/freshollie/jest-dynalite) to use in vitest.

## Features

- Optionally clear tables between tests
- Isolated tables between test runners
- Ability to specify config directory
- No `java` requirement
- Works with only `@aws-sdk/client-dynamodb` instead of `aws-sdk`

## Installation

```bash
npm i vitest-environment-dynalite -D
# or
yarn add vitest-environment-dynalite -D
# or
pnpm add vitest-environment-dynalite -D
```

## Usage

### 1. Set `setupFiles` in `vitest.config.ts`

```js
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["vitest-environment-dynalite"],
  },
});
```

### 2. Config file

In your project root, create a `vitest-environment-dynalite-config.json` with the tables schemas,
and an optional `basePort` to run dynalite on:

```json
{
  "tables": [
    {
      "TableName": "table",
      "KeySchema": [{ "AttributeName": "id", "KeyType": "HASH" }],
      "AttributeDefinitions": [{ "AttributeName": "id", "AttributeType": "S" }],
      "ProvisionedThroughput": {
        "ReadCapacityUnits": 1,
        "WriteCapacityUnits": 1
      }
    }
  ],
  "basePort": 8000
}
```

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

Some fixture data can be given before each test:

`vitest-environment-dynalite-config.json`:

```json
{
  "tables": [
    {
      ...,
      "data": [
        { "id": "a", "someattribute": "hello world" }
      ]
    }
  ],
}
```

## License

`MIT`
