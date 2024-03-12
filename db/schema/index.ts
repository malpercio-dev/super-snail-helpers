import { AdapterAccount } from "@auth/core/adapters";
import {
  AnySQLiteColumn,
  foreignKey,
  integer,
  primaryKey,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";
import { uuidv7 } from "uuidv7";
import { number } from "zod";

export const relic = sqliteTable(
  "relic",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    name: text("name").notNull(),
    imagePath: text("imagePath"),
    wikiPageUrl: text("wikiPageUrl"),
    affct: text("affct").notNull(),
    grade: text("grade").notNull(),
  },
  (t) => ({
    unique: unique().on(t.name),
  })
);

export const relicStat = sqliteTable(
  "relicStats",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    relicId: text("relicId")
      .notNull()
      .references(() => relic.id, { onDelete: "cascade" }),
    stars: text("stars").notNull(),
    fame: integer("fame").notNull(),
    art: integer("art").notNull(),
    faith: integer("faith").notNull(),
    civ: integer("civ").notNull(),
    tech: integer("tech").notNull(),
  },
  (t) => ({
    unique: unique().on(t.relicId, t.stars),
  })
);

export const relicSpecial = sqliteTable("relicSpecial", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  relicId: text("relicId")
    .notNull()
    .references(() => relic.id, { onDelete: "cascade" }),
  stars: text("stars").notNull(),
  special: text("special").notNull(),
});

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

export const server = sqliteTable(
  "server",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    group: text("group").notNull(),
    server: text("server").notNull(),
  },
  (t) => ({
    unique: unique().on(t.group, t.server),
  })
);

export const club = sqliteTable("club", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  serverId: text("serverId"),
  name: text("name").notNull(),
});

export const clubMember = sqliteTable(
  "clubMember",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    clubId: text("clubId"),
    snailProfileId: text("snailProfileId"),
  },
  (t) => ({
    unique: unique().on(t.snailProfileId),
  })
);

export const snailProfile = sqliteTable(
  "snailProfile",
  {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    userId: text("userId").notNull(),
    name: text("name").notNull(),
    serverId: text("serverId"),
  },
  (t) => ({
    unique: unique().on(t.userId, t.serverId),
  })
);

export const userRoles = sqliteTable("userRoles", {
  userId: text("id").notNull().primaryKey(),
  roles: text("roles"),
});

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
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
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
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

export type Gear = typeof gear.$inferSelect;
export type Server = typeof server.$inferSelect;
export type Club = typeof club.$inferSelect;
export type SnailProfile = typeof snailProfile.$inferSelect;
export type Relic = typeof relic.$inferSelect;

export type EquippedGearsInsert = typeof equippedGears.$inferInsert;
export type InventoryGearsInsert = typeof inventoryGears.$inferInsert;
export type SnailProfileInsert = typeof snailProfile.$inferInsert;
export type ServerInsert = typeof server.$inferInsert;
export type RelicInsert = typeof relic.$inferInsert;
export type RelicStatInsert = typeof relicStat.$inferInsert;
export type RelicSpecialInsert = typeof relicSpecial.$inferInsert;
