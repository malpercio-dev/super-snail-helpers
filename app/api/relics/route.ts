import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

interface RelicWithSpecial extends schema.Relic {
  specials: string[];
  skills: {
    skill: string;
  }[];
}

export async function GET(_: NextRequest): Promise<NextResponse> {
  const relics = await db
    .select({
      relic: schema.relic,
      relicSpecial: {
        special: schema.relicSpecial.special,
      },
      relicSkill: {
        skill: schema.relicSkill.skill,
      },
    })
    .from(schema.relic)
    .innerJoin(
      schema.relicSpecial,
      eq(schema.relic.id, schema.relicSpecial.relicId)
    )
    .innerJoin(
      schema.relicSkill,
      eq(schema.relic.id, schema.relicSkill.relicId)
    )
    .orderBy(schema.relic.id);

  const result = relics.reduce<Record<string, RelicWithSpecial>>((acc, row) => {
    const relic = row.relic;
    const specials = row.relicSpecial;
    const skills = row.relicSkill;
    if (!acc[relic.id]) {
      acc[relic.id] = { ...relic, specials: [], skills: [] };
    }
    if (specials) {
      acc[relic.id].specials.push(specials.special);
    }
    if (skills) {
      acc[relic.id].skills.push(skills);
    }
    return acc;
  }, {});
  return NextResponse.json(Object.values(result));
}
