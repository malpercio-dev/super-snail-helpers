import type { Config } from "drizzle-kit";
import { config } from "./config";
import { loadEnvConfig } from "@next/env";
import { cwd } from "node:process";
import "dotenv/config";

loadEnvConfig(cwd());

const dbCredentials = {
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN!,
};

export default {
  schema: "./db/schema/index.ts",
  driver: "turso",
  dbCredentials,
  verbose: true,
  strict: true,
  tablesFilter: ["!libsql_wasm_func_table"],
} satisfies Config;
