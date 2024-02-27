"use server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../db";
import * as schema from "../../db/schema";
import { uuidv7 } from "uuidv7";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const id = request.nextUrl.searchParams.get("egid")!;
  const equippedGear = await db
    .select()
    .from(schema.equippedGear)
    .where(eq(schema.equippedGear.id, id))
    .limit(1);

  return NextResponse.json(equippedGear[0]);
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const equippedGear = (await request.json()) as schema.EquippedGear;
  if (!equippedGear.id) equippedGear.id = uuidv7();
  const dbEquippedGear = await db
    .insert(schema.equippedGear)
    .values(equippedGear)
    .onConflictDoUpdate({
      target: schema.equippedGear.id,
      set: {
        gear: equippedGear.gear,
      },
    })
    .returning();

  return NextResponse.json(dbEquippedGear[0]);
}