import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(_: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ no: true }, { status: 401 });

  const dbEquippedGear = await db
    .select({
      name: schema.gear.name,
      imagePath: schema.gear.imagePath,
      color: schema.gear.rarity,
      rarity: schema.gear.rarity,
      plusses: schema.equippedGears.plusses,
    })
    .from(schema.equippedGears)
    .innerJoin(schema.gear, eq(schema.equippedGears.gearId, schema.gear.id))
    .where(eq(schema.equippedGears.userId, session.user.id))
    .orderBy(schema.equippedGears.slot);

  if (dbEquippedGear.length <= 0)
    return NextResponse.json(null, { status: 404 });

  return NextResponse.json(dbEquippedGear);
}

interface GearPlus extends schema.Gear {
  plusses: number;
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ no: true }, { status: 401 });
  const equippedGearReq = (await request.json()) as schema.EquippedGear;
  const equippedGear = equippedGearReq.gear as GearPlus[];
  const equippedGears: schema.EquippedGearsInsert[] = equippedGear.map(
    (eg, index) => ({
      userId: session.user.id,
      gearId: eg.id,
      imagePath: eg.imagePath,
      slot: index,
      plusses: eg.plusses,
      updatedAt: new Date().toISOString(),
    })
  );
  const dbGear = await db.select().from(schema.gear);
  equippedGears.forEach((eg) => {
    if (eg.gearId) return;
    const thing: { imagePath: string } = eg as unknown as { imagePath: string };
    const gearId = dbGear.find((g) => g.imagePath === thing.imagePath)?.id;
    if (!gearId) return;
    eg.gearId = gearId;
  });
  await db
    .insert(schema.equippedGears)
    .values(equippedGears)
    .onConflictDoUpdate({
      target: [schema.equippedGears.userId, schema.equippedGears.slot],
      set: {
        gearId: sql`excluded.gearId`,
        plusses: sql`excluded.plusses`,
        updatedAt: new Date().toISOString(),
      },
    });
  const dbEquippedGear = await db
    .select({
      name: schema.gear.name,
      imagePath: schema.gear.imagePath,
      color: schema.gear.rarity,
      rarity: schema.gear.rarity,
      plusses: schema.equippedGears.plusses,
    })
    .from(schema.equippedGears)
    .innerJoin(schema.gear, eq(schema.equippedGears.gearId, schema.gear.id))
    .where(eq(schema.equippedGears.userId, session.user.id))
    .orderBy(schema.equippedGears.slot);

  return NextResponse.json(dbEquippedGear);
}
