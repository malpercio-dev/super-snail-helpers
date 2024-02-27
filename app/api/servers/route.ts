import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import * as schema from "@/db/schema";

export async function GET(_: NextRequest): Promise<NextResponse> {
  const servers = await db.select().from(schema.server);

  return NextResponse.json(servers);
}
