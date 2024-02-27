import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const id = request.nextUrl.searchParams.get("profileId")!;
  const dbEquippedGear = await db
    .select({
      name: schema.gear.name,
      imagePath: schema.gear.imagePath,
      color: schema.gear.rarity,
      rarity: schema.gear.rarity,
    })
    .from(schema.equippedGears)
    .innerJoin(schema.gear, eq(schema.equippedGears.gearId, schema.gear.id))
    .where(eq(schema.equippedGears.userId, id))
    .orderBy(schema.equippedGears.slot);

  if (dbEquippedGear.length <= 0)
    return NextResponse.json(null, { status: 404 });

  return NextResponse.json(dbEquippedGear);
}
