import { Environment, beforeAll, afterEach } from "vitest";

import { builtinEnvironments } from "vitest/environments";
import { setEnvironmentVariables } from "./setEnvironmentVariables";
import { start, stop } from "./db";
import { createTables, deleteTables } from "./db";

const useDynalite = () => {
  beforeAll(async () => {
    await createTables();
  });

  afterEach(async () => {
    await deleteTables();
    await createTables();
  });
};

export { createTables, deleteTables, useDynalite };

export default <Environment>{
  name: "vitest-environment-dynalite",
  async setup(global: any, options: Record<string, any>) {
    const res = await builtinEnvironments.node.setup(global, options);
    await setEnvironmentVariables(global.__vitest_worker__.config.root);

    await start();
    return {
      async teardown() {
        await stop();
        await res.teardown(global);
      },
    };
  },
};
