import { AdapterAccount } from "@auth/core/adapters";
import { sql } from "drizzle-orm";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";
import { uuidv7 } from "uuidv7";

export const gear = sqliteTable("gear", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  name: text("name").notNull(),
  imagePath: text("imagePath").notNull(),
  category: text("category").notNull(),
  rarity: text("rarity").notNull(),
  createdAt: text("createdAt").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt"),
});

export const equippedGear = sqliteTable("equippedGear", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  gear: text("gear", { mode: "json" }).notNull(),
  createdAt: text("createdAt").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt"),
});

export const inventoryGear = sqliteTable("inventoryGear", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  inventory: text("inventory", { mode: "json" }).notNull(),
  createdAt: text("createdAt").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updatedAt"),
});

export const equippedGears = sqliteTable(
  "equippedGears",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gearId: text("gearId")
      .notNull()
      .references(() => gear.id, { onDelete: "cascade" }),
    slot: integer("slot").notNull().default(0),
    plusses: integer("plusses").default(0),
    createdAt: text("createdAt").$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updatedAt"),
  },
  (t) => ({
    unique: unique().on(t.userId, t.slot),
  })
);

export const inventoryGears = sqliteTable(
  "inventoryGears",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gearId: text("gearId")
      .notNull()
      .references(() => gear.id, { onDelete: "cascade" }),
    count: integer("count").notNull().default(0),
    createdAt: text("createdAt").$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updatedAt"),
  },
  (t) => ({
    unique: unique().on(t.userId, t.gearId),
  })
);

export const users = sqliteTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
  createdAt: text("createdAt").$defaultFn(() => new Date().toISOString()),
});

export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
    createdAt: text("createdAt").$defaultFn(() => new Date().toISOString()),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
  })
);

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  createdAt: text("createdAt").$defaultFn(() => new Date().toISOString()),
});

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
    createdAt: text("createdAt").$defaultFn(() => new Date().toISOString()),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  })
);

export type EquippedGear = typeof equippedGear.$inferSelect;
export type InventoryGear = typeof inventoryGear.$inferSelect;
export type Gear = typeof gear.$inferSelect;

export type EquippedGearsInsert = typeof equippedGears.$inferInsert;
export type InventoryGearsInsert = typeof inventoryGears.$inferInsert;
