import { beforeAll, afterEach, afterAll } from "vitest";

import { setEnvironmentVariables } from "./setEnvironmentVariables";
import { start, stop, createTables, deleteTables } from "./db";

setEnvironmentVariables();

beforeAll(async () => {
  await start();
  await createTables();
});

afterEach(async () => {
  await deleteTables();
  await createTables();
});

afterAll(async () => {
  await stop();
});
