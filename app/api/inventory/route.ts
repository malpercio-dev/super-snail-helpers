"use server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../db";
import * as schema from "../../../db/schema";
import { uuidv7 } from "uuidv7";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const id = request.nextUrl.searchParams.get("iid")!;
  const inventoryGear = await db
    .select()
    .from(schema.inventoryGear)
    .where(eq(schema.inventoryGear.id, id)).limit(1);

  return NextResponse.json(inventoryGear[0]);
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  {
    const inventoryGear = (await request.json()) as schema.InventoryGear;
    if (!inventoryGear.id) inventoryGear.id = uuidv7();
    const dbInventoryGear = await db
      .insert(schema.inventoryGear)
      .values(inventoryGear)
      .onConflictDoUpdate({
        target: schema.inventoryGear.id,
        set: {
          inventory: inventoryGear.inventory,
        },
      })
      .returning();

    return NextResponse.json(dbInventoryGear[0]);
  }
}
