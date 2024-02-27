import { Config, createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { config } from "../config";
import * as schema from "./schema/index";

const options = (() => {
  switch (config.env.DATABASE_CONNECTION_TYPE) {
    case "local":
      return {
        url: "file:local.sqlite",
      } satisfies Config;
    case "remote":
      return {
        url: config.env.DATABASE_URL,
        authToken: config.env.DATABASE_AUTH_TOKEN!,
      } satisfies Config;
  }
})();

export const client = createClient(options);

await client.sync();

export const db = drizzle(client, { schema, logger: true });