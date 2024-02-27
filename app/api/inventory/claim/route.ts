import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import * as schema from "@/db/schema";
import { db } from "@/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { eq } from "drizzle-orm";

interface InventoryGear extends schema.Gear {
  count?: number;
}

interface ClientInventoryData {
  [key: string]: {
    [key: string]: InventoryGear[];
  };
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ no: true });
  const inventoryGearRequest = (await request.json()) as ClientInventoryData;
  const dbGear = await db.select().from(schema.gear);

  await Promise.all(
    Object.keys(inventoryGearRequest).flatMap((category) => {
      const inventoryCategory = inventoryGearRequest[category];
      return Object.keys(inventoryCategory).flatMap((rarity) => {
        const inventoryRarity = inventoryCategory[rarity];
        return inventoryRarity.map((item) => {
          if (item.count === undefined || item.count <= 0) return;
          const gear = dbGear.find((gear) => gear.imagePath === item.imagePath);
          if (!gear) return NextResponse.json({ no: true });
          return db
            .insert(schema.inventoryGears)
            .values({
              userId: session.user.id,
              gearId: gear.id,
              count: item.count,
              updatedAt: new Date().toISOString(),
            })
            .onConflictDoUpdate({
              target: [
                schema.inventoryGears.userId,
                schema.inventoryGears.gearId,
              ],
              set: {
                count: item.count,
                updatedAt: new Date().toISOString(),
              },
            });
        });
      });
    })
  );
  const dbInventoryGear = await db
    .select({
      name: schema.gear.name,
      imagePath: schema.gear.imagePath,
      rarity: schema.gear.rarity,
      category: schema.gear.category,
      count: schema.inventoryGears.count,
    })
    .from(schema.inventoryGears)
    .innerJoin(schema.gear, eq(schema.inventoryGears.gearId, schema.gear.id));

  return NextResponse.json(dbInventoryGear);
}
