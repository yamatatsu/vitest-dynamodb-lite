import { getDynalitePort } from "./config";

export const setEnvironmentVariables = async (): Promise<void> => {
  const port = await getDynalitePort();

  // Provide environment variables before other scripts are executed
  process.env.MOCK_DYNAMODB_PORT = port.toString();
  process.env.MOCK_DYNAMODB_ENDPOINT = `http://localhost:${port}`;

  // aws-sdk requires access and secret key to be able to call DDB
  if (!process.env.AWS_ACCESS_KEY_ID) {
    process.env.AWS_ACCESS_KEY_ID = "access-key";
  }

  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    process.env.AWS_SECRET_ACCESS_KEY = "secret-key";
  }
};
