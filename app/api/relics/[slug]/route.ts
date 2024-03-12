import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
): Promise<NextResponse> {
  const relic = (
    await db
      .select()
      .from(schema.relic)
      .where(eq(schema.relic.id, params.slug))
      .limit(1)
  )[0];

  const relicStats = await db
    .select()
    .from(schema.relicStat)
    .where(eq(schema.relicStat.relicId, params.slug));

  const relicSpecials = await db
    .select()
    .from(schema.relicSpecial)
    .where(eq(schema.relicSpecial.relicId, params.slug));

  return NextResponse.json({
    ...relic,
    stats: Object.assign(
      {},
      ...relicStats.map((rs) => ({
        [rs.stars]: rs,
      }))
    ),
    specials: relicSpecials,
  });
}
