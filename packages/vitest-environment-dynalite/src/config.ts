import fs from "node:fs";
import { resolve } from "node:path";
import { Config, TableConfig } from "./types";
import { isFunction } from "./utils";

export const CONFIG_FILE_NAME = "vitest-environment-dynalite-config.js";
export const CONFIG_FILE_NAME_CJS = "vitest-environment-dynalite-config.cjs";
export const CONFIG_FILE_NAME_MJS = "vitest-environment-dynalite-config.mjs";
export const CONFIG_FILE_NAME_TS = "vitest-environment-dynalite-config.ts";
export const CONFIG_FILE_NAME_JSON = "vitest-environment-dynalite-config.json";

export class NotFoundError extends Error {
  constructor(dir: string) {
    super(
      `Could not find '${CONFIG_FILE_NAME}', '${CONFIG_FILE_NAME_CJS}', '${CONFIG_FILE_NAME_MJS}', '${CONFIG_FILE_NAME_TS}', or '${CONFIG_FILE_NAME_JSON}' in dir ${dir}`
    );
  }
}

if (!process.env.VITEST_ENVIRONMENT_DYNALITE_CONFIG_DIRECTORY) {
  process.env.VITEST_ENVIRONMENT_DYNALITE_CONFIG_DIRECTORY = process.cwd();
}

const findConfigOrError = (
  directory: string
):
  | typeof CONFIG_FILE_NAME
  | typeof CONFIG_FILE_NAME_CJS
  | typeof CONFIG_FILE_NAME_MJS
  | typeof CONFIG_FILE_NAME_TS
  | typeof CONFIG_FILE_NAME_JSON => {
  const foundFile = (
    [CONFIG_FILE_NAME, CONFIG_FILE_NAME_CJS, CONFIG_FILE_NAME_MJS, CONFIG_FILE_NAME_TS, CONFIG_FILE_NAME_JSON] as const
  ).find((config) => {
    const file = resolve(directory, config);
    return fs.existsSync(file);
  });

  if (!foundFile) {
    throw new NotFoundError(resolve(directory));
  }

  return foundFile;
};

const readConfig = (): Config => {
  const configFile = findConfigOrError(
    process.env.VITEST_ENVIRONMENT_DYNALITE_CONFIG_DIRECTORY!
  );
  const file = resolve(
    process.env.VITEST_ENVIRONMENT_DYNALITE_CONFIG_DIRECTORY!,
    configFile
  );

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
        `Something went wrong reading your ${configFile}: ${e.message}, ${e.stack}`
      );
    } else {
      throw new Error(`Something went wrong reading your ${configFile}: ${e}`);
    }
  }
};

export const setConfigDir = (directory: string): void => {
  // Only allow this directory to be set if a config exists
  findConfigOrError(directory);
  process.env.VITEST_ENVIRONMENT_DYNALITE_CONFIG_DIRECTORY = directory;
};

export const getDynalitePort = (): number => {
  const { basePort = 8000 } = readConfig();
  if (Number.isInteger(basePort) && basePort > 0 && basePort <= 65535) {
    return basePort + parseInt(process.env.VITEST_WORKER_ID || "1", 10);
  }

  throw new TypeError(
    `Option "basePort" must be an number between 1 and 65535. Received "${basePort.toString()}"`
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
      "vitest-environment-dynalite requires that the tables configuration is an array"
    );
  }

  return tablesCache;
};
