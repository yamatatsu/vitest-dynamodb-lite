import fs from "node:fs";
import { resolve } from "node:path";
import { Config, TableConfig } from "./types";
import { isFunction } from "./utils";

const CONFIG_FILE_NAME = "vitest-dynamodb-lite-config.js";
const CONFIG_FILE_NAME_CJS = "vitest-dynamodb-lite-config.cjs";
const CONFIG_FILE_NAME_MJS = "vitest-dynamodb-lite-config.mjs";
const CONFIG_FILE_NAME_JSON = "vitest-dynamodb-lite-config.json";
const CONFIG_FILE_NAMES = [
  CONFIG_FILE_NAME,
  CONFIG_FILE_NAME_CJS,
  CONFIG_FILE_NAME_MJS,
  CONFIG_FILE_NAME_JSON,
] as const;

type ConfigFileName = (typeof CONFIG_FILE_NAMES)[number];

export class NotFoundError extends Error {
  constructor(dir: string) {
    super(
      `Could not find '${CONFIG_FILE_NAME}', '${CONFIG_FILE_NAME_CJS}', '${CONFIG_FILE_NAME_MJS}' or '${CONFIG_FILE_NAME_JSON}' in dir ${dir}`,
    );
  }
}

const findConfigOrError = (directory: string): ConfigFileName => {
  const foundFile = CONFIG_FILE_NAMES.find((config) => {
    const file = resolve(directory, config);
    return fs.existsSync(file);
  });

  if (!foundFile) {
    throw new NotFoundError(resolve(directory));
  }

  return foundFile;
};

const readConfig = (): Config => {
  const rootDir = process.cwd();
  const configFile = findConfigOrError(rootDir);
  const file = resolve(rootDir, configFile);

  try {
    if (file.endsWith(".json")) {
      return JSON.parse(fs.readFileSync(file, "utf-8"));
    }
    const importedConfig = eval(fs.readFileSync(file, "utf-8"));
    if ("default" in importedConfig) {
      return importedConfig.default;
    }
    return importedConfig;
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(
        `Something went wrong reading your ${configFile}: ${e.message}, ${e.stack}`,
      );
    } else {
      throw new Error(`Something went wrong reading your ${configFile}: ${e}`);
    }
  }
};

export const getDynalitePort = (): number => {
  const { basePort = 8000 } = readConfig();
  if (Number.isInteger(basePort) && basePort > 0 && basePort <= 65535) {
    return basePort + parseInt(process.env.VITEST_WORKER_ID || "1", 10);
  }

  throw new TypeError(
    `Option "basePort" must be an number between 1 and 65535. Received "${basePort.toString()}"`,
  );
};

// Cache the tables result from the config function, so that we
// are not calling it over and over
let tablesCache: TableConfig[] | undefined;

export const getTables = async (): Promise<TableConfig[]> => {
  if (tablesCache) {
    return tablesCache;
  }

  const { tables: tablesConfig } = readConfig();

  if (isFunction(tablesConfig)) {
    tablesCache = await tablesConfig();
  } else {
    tablesCache = tablesConfig ?? [];
  }

  if (!Array.isArray(tablesCache)) {
    throw new Error(
      "vitest-dynamodb-lite requires that the tables configuration is an array",
    );
  }

  return tablesCache;
};
