import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

interface RelicWithSpecial extends Omit<schema.Relic,'wikiPageUrl'> {
  specials: string[];
  skills: {
    skill: string;
  }[];
}

export async function GET(_: NextRequest): Promise<NextResponse> {
  const relics = await db
    .select()
    .from(schema.relic)
    .orderBy(schema.relic.id);

    const relicSpecials = await db
    .select()
    .from(schema.relicSpecial)
    .orderBy(schema.relicSpecial.relicId);

    const relicSkills = await db
    .select()
    .from(
      schema.relicSkill)
    .orderBy(schema.relicSkill.relicId);

    const relicResults = relics.map(relic => ({
      relic: relic,
      relicSpecial: relicSpecials.filter(rs => rs.relicId === relic.id).map(rs => rs.special),
      relicSkill: relicSkills.filter(rs => rs.relicId === relic.id).map(rs => ({
        skill: rs.skill
      }))
    }))

  const result = relicResults.reduce<Record<string, RelicWithSpecial>>((acc, row) => {
    const relic = row.relic;
    const specials = row.relicSpecial;
    const skills = row.relicSkill;
    if (!acc[relic.id]) {
      acc[relic.id] = { ...relic, specials: [], skills: [] };
    }
    if (specials) {
      acc[relic.id].specials.push(...specials);
    }
    if (skills) {
      acc[relic.id].skills.push(...skills);
    }
    return acc;
  }, {});
  return NextResponse.json(Object.values(result));
}
