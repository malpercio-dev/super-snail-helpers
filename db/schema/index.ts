import { AdapterAccount } from "@auth/core/adapters";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const gear = sqliteTable("gear", {
  id: text("id").primaryKey().default(""),
  name: text("name").notNull(),
  imagePath: text("imagePath").notNull(),
  category: text("category").notNull(),
  rarity: text("rarity").notNull(),
});

export const equippedGear = sqliteTable("equippedGear", {
  id: text("id").primaryKey().default(""),
  gear: text("gear", { mode: "json" }).notNull(),
});

export const inventoryGear = sqliteTable("inventoryGear", {
  id: text("id").primaryKey().default(""),
  inventory: text("inventory", { mode: "json" }).notNull(),
});

export const users = sqliteTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
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
});

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  })
);

export type EquippedGear = typeof equippedGear.$inferSelect;
export type InventoryGear = typeof inventoryGear.$inferSelect;
export type Gear = typeof gear.$inferSelect;
