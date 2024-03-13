import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

interface RelicWithSpecial extends schema.Relic {
  specials: string[];
}

export async function GET(_: NextRequest): Promise<NextResponse> {
  const relics = await db
    .select()
    .from(schema.relic)
    .innerJoin(
      schema.relicSpecial,
      eq(schema.relic.id, schema.relicSpecial.relicId),
    )
    .orderBy(schema.relic.id);

  const result = relics.reduce<Record<string, RelicWithSpecial>>((acc, row) => {
    const relic = row.relic;
    const specials = row.relicSpecial;
    if (!acc[relic.id]) {
      acc[relic.id] = { ...relic, specials: [] };
    }
    if (specials) {
      acc[relic.id].specials.push(specials.special);
    }
    return acc;
  }, {});
  return NextResponse.json(Object.values(result));
}
