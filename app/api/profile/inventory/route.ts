import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, ne, and } from "drizzle-orm";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const id = request.nextUrl.searchParams.get("profileId")!;

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
    .where(
      and(
        eq(schema.inventoryGears.userId, id),
        ne(schema.inventoryGears.count, 0)
      )
    );

  if (dbInventoryGear.length <= 0)
    return NextResponse.json(null, { status: 404 });

  return NextResponse.json(dbInventoryGear);
}
