import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const env = createEnv({
  server: {
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]),
    DATABASE_CONNECTION_TYPE: z.enum(["local", "remote"]),
    DATABASE_URL: z.string().min(1),
    DATABASE_AUTH_TOKEN: z
      .string()
      .optional()
      .refine((s) => {
        // not needed for local only
        const type = process.env.DATABASE_CONNECTION_TYPE;
        return type === "remote" ? s && s.length > 0 : true;
      }),
    NODE_ENV: z.enum(["development", "production"]),
    HOST_URL: z.string().min(1),
    // TURSO_API_KEY: z.string().min(1),
  },
  runtimeEnv: {
    LOG_LEVEL: process.env.LOG_LEVEL,
    DATABASE_CONNECTION_TYPE: process.env.DATABASE_CONNECTION_TYPE,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
    HOST_URL: process.env.HOST_URL,
  },
});

const args = {
  // watch: process.argv.includes("--watch"),
  // liveReload: true,
};

export const config = {
  env,
  args,
};
