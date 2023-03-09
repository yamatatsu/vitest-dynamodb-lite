import { beforeAll, afterEach } from "vitest";
import { deleteTables, createTables } from "vitest-environment-dynalite";

beforeAll(async () => {
  await createTables();
});

afterEach(async () => {
  await deleteTables();
  await createTables();
});
