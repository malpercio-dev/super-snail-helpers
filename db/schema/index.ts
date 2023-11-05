import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const gear = sqliteTable("gear", {
    id: text("id").primaryKey().default(''),
    name: text("name").notNull(),
    imagePath: text("imagePath").notNull(),
    category: text("category").notNull(),
    rarity: text("rarity").notNull(),
})

export const equippedGear = sqliteTable("equippedGear", {
    id: text("id").primaryKey().default(''),
    gear: text('gear', { mode: 'json' }).notNull()
});

export const inventoryGear = sqliteTable('inventoryGear', {
    id: text("id").primaryKey().default(''),
    inventory: text('inventory', { mode: 'json' }).notNull()
})

export type EquippedGear = typeof equippedGear.$inferSelect;
export type InventoryGear = typeof inventoryGear.$inferSelect;
export type Gear = typeof gear.$inferSelect;
