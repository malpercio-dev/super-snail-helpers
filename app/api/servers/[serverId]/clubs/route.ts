import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  _: NextRequest,
  {
    params,
  }: {
    params: { serverId: string };
  }
): Promise<NextResponse> {
  console.log(params);
  const clubs = await db
    .select()
    .from(schema.club)
    .where(eq(schema.club.serverId, params.serverId));

  return NextResponse.json(clubs);
}

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: { serverId: string };
  }
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ no: true }, { status: 401 });
  const createClubReq = (await request.json()) as { name: string };
  console.log(createClubReq);
  console.log(params);
  const clubs = await db
    .select()
    .from(schema.club)
    .where(
      and(
        eq(schema.club.serverId, params.serverId),
        eq(schema.club.name, createClubReq.name)
      )
    );

  if (clubs.length > 0) {
    return NextResponse.json(clubs[0]);
  }

  const club = await db
    .insert(schema.club)
    .values({
      serverId: params.serverId,
      name: createClubReq.name,
    })
    .returning();

  return NextResponse.json(club);
}
