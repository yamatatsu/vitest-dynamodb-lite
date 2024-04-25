import { beforeAll, afterEach, afterAll } from "vitest";

import { setEnvironmentVariables } from "./setEnvironmentVariables";
import { start, stop } from "./db";
import { createTables, deleteTables } from "./db";

setEnvironmentVariables("");

beforeAll(async () => {
  console.time("start_dynalite");
  await start();
  console.timeEnd("start_dynalite");
  console.time("createTables");
  await createTables();
  console.timeEnd("createTables");
});

afterEach(async () => {
  console.time("deleteTables");
  await deleteTables();
  console.timeEnd("deleteTables");
  console.time("createTables");
  await createTables();
  console.timeEnd("createTables");
});

afterAll(async () => {
  console.time("stop_dynalite");
  await stop();
  console.timeEnd("stop_dynalite");
});
