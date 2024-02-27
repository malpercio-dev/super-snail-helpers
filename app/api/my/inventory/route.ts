import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, ne } from "drizzle-orm";

interface InventoryGear extends schema.Gear {
  count?: number;
}

interface ClientInventoryData {
  [key: string]: {
    [key: string]: InventoryGear[];
  };
}

export async function GET(_: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ no: true }, { status: 401 });

  const dbInventoryGear = await db
    .select({
      id: schema.gear.id,
      name: schema.gear.name,
      imagePath: schema.gear.imagePath,
      rarity: schema.gear.rarity,
      category: schema.gear.category,
      count: schema.inventoryGears.count,
    })
    .from(schema.inventoryGears)
    .innerJoin(schema.gear, eq(schema.inventoryGears.gearId, schema.gear.id))
    .where(eq(schema.inventoryGears.userId, session.user.id))
    .where(ne(schema.inventoryGears.count, 0));

  if (dbInventoryGear.length <= 0)
    return NextResponse.json(null, { status: 404 });

  return NextResponse.json(dbInventoryGear);
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ no: true }, { status: 401 });
  const inventoryGearReq = (await request.json()) as ClientInventoryData;
  const inventoryGears: schema.InventoryGearsInsert[] = Object.keys(
    inventoryGearReq
  ).flatMap((category) => {
    const inventoryCategory = inventoryGearReq[category];
    return Object.keys(inventoryCategory).flatMap((rarity) => {
      const inventoryRarity = inventoryCategory[rarity];
      return inventoryRarity.map((item) => ({
        userId: session.user.id,
        gearId: item.id,
        imagePath: item.imagePath,
        count: item.count,
      }));
    });
  });
  const dbGear = await db.select().from(schema.gear);
  const dbInventory = await db
    .select()
    .from(schema.inventoryGears)
    .where(eq(schema.inventoryGears.userId, session.user.id));
  console.log("got gears", inventoryGears);
  inventoryGears.forEach((ig) => {
    if (ig.gearId) return;
    const thing: { imagePath: string } = ig as unknown as { imagePath: string };
    const gearId = dbGear.find((g) => g.imagePath === thing.imagePath)?.id;
    if (!gearId) return;
    ig.gearId = gearId;
  });
  await Promise.all(
    inventoryGears.map(async (inventoryGear) => {
      const foundInventory = dbInventory.find(
        (dbi) => dbi.gearId === inventoryGear.gearId
      );
      if (foundInventory) {
        console.log("found a match!");
        console.log(foundInventory);
        console.log(inventoryGear);
      }
      if (
        !foundInventory &&
        (inventoryGear.count === undefined || inventoryGear.count <= 0)
      )
        return;
      await db
        .insert(schema.inventoryGears)
        .values(inventoryGear)
        .onConflictDoUpdate({
          target: [schema.inventoryGears.userId, schema.inventoryGears.gearId],
          set: {
            count: inventoryGear.count,
          },
        });
    })
  );
  const dbInventoryGear = await db
    .select({
      id: schema.gear.id,
      name: schema.gear.name,
      imagePath: schema.gear.imagePath,
      rarity: schema.gear.rarity,
      category: schema.gear.category,
      count: schema.inventoryGears.count,
    })
    .from(schema.inventoryGears)
    .innerJoin(schema.gear, eq(schema.inventoryGears.gearId, schema.gear.id))
    .where(eq(schema.inventoryGears.userId, session.user.id))
    .where(ne(schema.inventoryGears.count, 0));

  return NextResponse.json(dbInventoryGear);
}