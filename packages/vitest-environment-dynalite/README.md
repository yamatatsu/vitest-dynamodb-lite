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

### Config file

In your project root, create a `vitest-environment-dynalite-config.js` (or `.cjs` or `.ts`) with the tables schemas,
and an optional `basePort` to run dynalite on:

```js
// use export default for ts based configs
module.exports = {
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

Some fixture data can be given to exist in the table before each test:

```js
module.exports = {
  tables: [
    {
      TableName: "table",
      KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
      AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      },
      data: [
        {
          id: "a",
          someattribute: "hello world",
        },
      ],
    },
  ],
  basePort: 8000,
};
```

If you use fixture data, using `useDynalite()` is needed. see, [setup fixture](#setup-fixture).

Your tables can also be resolved from an optionally async function:

```js
module.exports = {
  // Please note, this function is resolved
  // once per test file
  tables: async () => {
    const myTables = await someFunction();
    if (myTables.find((table) => ...)) {
      return someOtherFunction();
    }
    return myTables;
  },
  basePort: 8000
};
```

### Update your source code

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

### Set environment

`vitest-environment-dynalite` uses vitest [Test Environment](https://vitest.dev/guide/environment.html#test-environment).

#### With test files

Add `@vitest-environment dynalite` to the top of your test files as following:

```ts
// @vitest-environment dynalite
```

#### With `vitest.config.js`

```js
// vitest.config.js
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "dynalite",
  },
});
```

### Setup fixture

If you use fixture data, using `useDynalite()` is needed.

```ts
import { useDynalite } from "vitest-environment-dynalite";

useDynalite();
```

## License

`MIT`
