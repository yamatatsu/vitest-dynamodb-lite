import fs from "node:fs";
import { resolve, relative } from "node:path";
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

export class NotFoundError extends Error {
  constructor(dir: string) {
    super(
      `Could not find '${CONFIG_FILE_NAME}', '${CONFIG_FILE_NAME_CJS}', '${CONFIG_FILE_NAME_MJS}' or '${CONFIG_FILE_NAME_JSON}' in dir ${dir}`,
    );
  }
}

const findConfigOrError = (): string => {
  const rootDir = process.cwd();
  const foundFileName = CONFIG_FILE_NAMES.find((config) => {
    const file = resolve(rootDir, config);
    return fs.existsSync(file);
  });

  if (!foundFileName) {
    throw new NotFoundError(resolve(rootDir));
  }

  const foundFilePath = resolve(rootDir, foundFileName);

  return foundFilePath;
};

const readConfig = async (): Promise<Config> => {
  const file = findConfigOrError();
  const relativePath = relative(__dirname, file);
  try {
    const config = await import(relativePath);

    if (config.default) {
      return config.default;
    } else {
      return config;
    }
  } catch (e) {
    if (e instanceof Error) {
      throw new Error(
        `Something went wrong reading your config file: ${e.message}, ${e.stack}`,
      );
    } else {
      throw new Error(`Something went wrong reading your config file: ${e}`);
    }
  }
};

export const getDynalitePort = async (): Promise<number> => {
  const configString = await readConfig();
  const basePort = configString.basePort ?? 8000;
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

  const { tables: tablesConfig } = await readConfig();

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
