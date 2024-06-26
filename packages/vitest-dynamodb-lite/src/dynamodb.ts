import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { TableConfig } from "./types";
import { omit, runWithRealTimers, sleep } from "./utils";

type Connection = {
  dynamoDB: DynamoDB;
};

let connection: Connection | undefined;

const dbConnection = (port: number): Connection => {
  if (connection) {
    return connection;
  }
  const options = {
    endpoint: `http://localhost:${port}`,
    sslEnabled: false,
    region: "local",
  };

  connection = {
    dynamoDB: new DynamoDB(options),
  };

  return connection;
};

const waitForTable = async (
  client: DynamoDB,
  tableName: string,
): Promise<void> => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const details = await client
      .describeTable({ TableName: tableName })
      .catch(() => undefined);

    if (details?.Table?.TableStatus === "ACTIVE") {
      // eslint-disable-next-line no-await-in-loop
      await sleep(5);
      break;
    }
    // eslint-disable-next-line no-await-in-loop
    await sleep(5);
  }
};

/**
 * Poll the tables list to ensure that the given list of tables exists
 */
const waitForDeleted = async (
  client: DynamoDB,
  tableName: string,
): Promise<void> => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const details = await client
      .describeTable({ TableName: tableName })
      .catch((e) => e.name === "ResourceInUseException");

    // eslint-disable-next-line no-await-in-loop
    await sleep(5);

    if (!details) {
      break;
    }
  }
};

export const deleteTables = (
  tableNames: string[],
  port: number,
): Promise<void> =>
  runWithRealTimers(async () => {
    const { dynamoDB } = dbConnection(port);

    await Promise.all(
      tableNames.map(async (table) => {
        await dynamoDB.deleteTable({ TableName: table }).catch(() => {});
        await waitForDeleted(dynamoDB, table);
      }),
    );
  });

export const createTables = (
  tables: TableConfig[],
  port: number,
): Promise<void> =>
  runWithRealTimers(async () => {
    const { dynamoDB } = dbConnection(port);

    await Promise.all(
      tables.map(async (table) => {
        await dynamoDB.createTable(omit(table, "data"));
        await waitForTable(dynamoDB, table.TableName);
        if (!table.data) {
          return;
        }
        await Promise.all(
          table.data.map((row) =>
            dynamoDB
              .putItem({
                TableName: table.TableName,
                Item: marshall(row) as any,
              })
              .catch((e) => {
                throw new Error(
                  `Could not add ${JSON.stringify(row)} to "${
                    table.TableName
                  }": ${e.message}`,
                );
              }),
          ),
        );
      }),
    );
  });

export const killConnection = (): void => {
  connection?.dynamoDB.destroy();
};
