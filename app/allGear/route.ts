"use server";
import { doTheThing } from "@/db/loadData";
import { db } from "../../db";
import * as schema from "../../db/schema";
import { NextRequest, NextResponse } from "next/server";

interface Gear {
  imagePath: string;
  name: string;
  category: string;
  rarity: string;
}

interface GearData {
  [key: string]: {
    [key: string]: Gear[];
  };
}

export async function GET(): Promise<NextResponse> {
  const allGear: GearData = {};
  const dbGear = await db.select().from(schema.gear);
  dbGear.forEach((gear) => {
    if (!allGear[gear.category]) allGear[gear.category] = {};
    if (!allGear[gear.category][gear.rarity]) allGear[gear.category][gear.rarity] = [];
    allGear[gear.category][gear.rarity].push(gear);
  });
  return NextResponse.json(allGear);
}

// export async function POST(request: NextRequest): Promise<NextResponse> {
//   await doTheThing();
//   return NextResponse.json({ ok: true });
// }
