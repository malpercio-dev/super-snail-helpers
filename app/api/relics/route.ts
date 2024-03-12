import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import * as schema from "@/db/schema";

export async function GET(_: NextRequest): Promise<NextResponse> {
  const relics = await db.select().from(schema.relic).orderBy(schema.relic.id);

  return NextResponse.json(relics);
}
