import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ no: true }, { status: 401 });

  const dbEquippedGear = await db
    .select({
      name: schema.gear.name,
      imagePath: schema.gear.imagePath,
      color: schema.gear.rarity,
    })
    .from(schema.equippedGears)
    .innerJoin(schema.gear, eq(schema.equippedGears.gearId, schema.gear.id))
    .orderBy(schema.equippedGears.slot);

  if (dbEquippedGear.length <= 0)
    return NextResponse.json({ no: true }, { status: 404 });

  return NextResponse.json(dbEquippedGear);
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ no: true }, { status: 401 });
  const equippedGearReq = (await request.json()) as schema.EquippedGear;
  const equippedGear = equippedGearReq.gear as schema.Gear[];
  const equippedGears: schema.EquippedGearsInsert[] = equippedGear.map(
    (eg, index) => ({
      userId: session.user.id,
      gearId: eg.id,
      slot: index,
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
  console.log("equippedGears", equippedGears);
  await Promise.all(
    equippedGears.map(async (equippedGear) => {
      await db
        .insert(schema.equippedGears)
        .values(equippedGear)
        .onConflictDoUpdate({
          target: [schema.equippedGears.userId, schema.equippedGears.slot],
          set: {
            gearId: equippedGear.gearId,
          },
        })
        .onConflictDoNothing();
    })
  );
  const dbEquippedGear = await db
    .select({
      name: schema.gear.name,
      imagePath: schema.gear.imagePath,
      color: schema.gear.rarity,
    })
    .from(schema.equippedGears)
    .innerJoin(schema.gear, eq(schema.equippedGears.gearId, schema.gear.id))
    .orderBy(schema.equippedGears.slot);

  return NextResponse.json(dbEquippedGear);
}
