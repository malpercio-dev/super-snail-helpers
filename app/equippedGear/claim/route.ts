import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import * as schema from "@/db/schema";
import { db } from "@/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { eq } from "drizzle-orm";

interface Gear {
  id: string;
  imagePath: string;
  name: string;
  category: string;
  rarity: string;
  color?: string;
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ no: true });
  const equippedGearRequest = (await request.json()) as Gear[];
  const dbGear = await db.select().from(schema.gear);

  await Promise.all(
    equippedGearRequest.map(async (equippedGear, index) => {
      const gear = dbGear.find(
        (value) => value.imagePath === equippedGear.imagePath
      );
      if (!gear) return NextResponse.json({ no: true });
      await db
        .insert(schema.equippedGears)
        .values({
          userId: session.user.id,
          gearId: gear.id,
          slot: index,
          updatedAt: new Date().toISOString(),
        })
        .onConflictDoUpdate({
          target: [schema.equippedGears.userId, schema.equippedGears.slot],
          set: {
            gearId: gear.id,
            updatedAt: new Date().toISOString(),
          },
        });
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
