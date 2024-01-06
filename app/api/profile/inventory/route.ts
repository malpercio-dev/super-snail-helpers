import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, ne, sql } from "drizzle-orm";

interface InventoryGear extends schema.Gear {
  count?: number;
}

interface ClientInventoryData {
  [key: string]: {
    [key: string]: InventoryGear[];
  };
}

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
    .where(eq(schema.inventoryGears.userId, id))
    .where(ne(schema.inventoryGears.count, 0));

  if (dbInventoryGear.length <= 0)
    return NextResponse.json(null, { status: 404 });

  return NextResponse.json(dbInventoryGear);
}
