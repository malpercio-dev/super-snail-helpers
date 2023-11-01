import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const equippedGear = sqliteTable("equippedGear", {
    id: text("id").primaryKey().default(''),
    gear: text('gear', { mode: 'json' }).notNull()
});

export type EquippedGear = typeof equippedGear.$inferSelect;