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
  const allGear: GearData = {
    realm: {
      white: [],
      green: [],
      blue: [],
      purple: [],
      orange: [],
      red: [],
      ['red+']: [],
    },
    form: {
      white: [],
      green: [],
      blue: [],
      purple: [],
      orange: [],
      red: [],
      ['red+']: [],
    },
    instrument: {
      white: [],
      green: [],
      blue: [],
      purple: [],
      orange: [],
      red: [],
      ['red+']: [],
    },
    armor: {
      white: [],
      green: [],
      blue: [],
      purple: [],
      orange: [],
      red: [],
      ['red+']: [],
    },
    material: {
      white: [],
      green: [],
      blue: [],
      purple: [],
      orange: [],
      red: [],
      ['red+']: [],
    }
  };
  const dbGear = await db.select().from(schema.gear);
  dbGear.forEach((gear) => {
    if (!allGear[gear.category]) allGear[gear.category] = {};
    if (!allGear[gear.category][gear.rarity]) allGear[gear.category][gear.rarity] = [];
    allGear[gear.category][gear.rarity].push(gear);
  });
  return NextResponse.json(allGear);
}

