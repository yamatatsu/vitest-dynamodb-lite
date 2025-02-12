import { beforeAll, afterEach, afterAll } from "vitest";

import { setEnvironmentVariables } from "./setEnvironmentVariables";
import { start, stop, createTables, deleteTables } from "./db";

export type { Config } from "./types";

await setEnvironmentVariables();

beforeAll(async () => {
  // console.time("await start();");
  await start();
  // console.timeEnd("await start();");
  // console.time("await createTables();");
  await createTables();
  // console.timeEnd("await createTables();");
});

afterEach(async () => {
  // console.time("await deleteTables();");
  await deleteTables();
  // console.timeEnd("await deleteTables();");
  // console.time("await createTables();");
  await createTables();
  // console.timeEnd("await createTables();");
});

afterAll(async () => {
  // console.time("await stop();");
  await stop();
  // console.timeEnd("await stop();");
});
