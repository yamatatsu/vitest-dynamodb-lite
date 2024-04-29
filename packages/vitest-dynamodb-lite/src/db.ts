// @ts-ignore
import dynalite from "dynalite";
import { getTables, getDynalitePort } from "./config";
import * as dynamodb from "./dynamodb";

export const dynaliteInstance = dynalite({
  createTableMs: 0,
  deleteTableMs: 0,
  updateTableMs: 0,
});

export const start = async (): Promise<void> => {
  if (!dynaliteInstance.listening) {
    await new Promise<void>((resolve) =>
      dynaliteInstance.listen(process.env.MOCK_DYNAMODB_PORT, resolve),
    );
  }
};

export const stop = async (): Promise<void> => {
  // v3 does something to prevent dynalite
  // from shutting down until we have
  // killed the dynamodb connection
  dynamodb.killConnection();

  if (dynaliteInstance.listening) {
    const closingPromise = new Promise<void>((resolve) =>
      dynaliteInstance.close((err: unknown) => {
        if (err) {
          console.error(err);
        }
        console.info("closing success");
        resolve();
      }),
    );
    if (process.env.VITEST_DYNAMODB_LITE_DEBUG_CLOSING_DB) {
      await closingPromise;
    }
  }
};

export const deleteTables = async (): Promise<void> => {
  const tablesNames = (await getTables()).map((table) => table.TableName);
  await dynamodb.deleteTables(tablesNames, getDynalitePort());
};

export const createTables = async (): Promise<void> => {
  const tables = await getTables();
  await dynamodb.createTables(tables, getDynalitePort());
};
