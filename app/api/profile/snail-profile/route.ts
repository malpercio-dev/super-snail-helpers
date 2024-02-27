import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, ne } from "drizzle-orm";
import { idText } from "typescript";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const id = request.nextUrl.searchParams.get("profileId")!;

  const dbSnailProfile = await db
    .select({
      id: schema.snailProfile.id,
      name: schema.snailProfile.name,
      server: {
        id: schema.server.id,
        group: schema.server.group,
        server: schema.server.server,
      },
      club: {
        id: schema.club.id,
        name: schema.club.name,
      },
    })
    .from(schema.snailProfile)
    .innerJoin(
      schema.server,
      eq(schema.snailProfile.serverId, schema.server.id)
    )
    .innerJoin(
      schema.clubMember,
      eq(schema.snailProfile.id, schema.clubMember.snailProfileId)
    )
    .innerJoin(schema.club, eq(schema.clubMember.clubId, schema.club.id))
    .where(eq(schema.snailProfile.userId, id));

  if (dbSnailProfile.length <= 0)
    return NextResponse.json(null, { status: 404 });

  return NextResponse.json(dbSnailProfile[0]);
}

export interface SnailProfilePut extends schema.SnailProfileInsert {
  clubId?: string;
  clubName?: string;
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const id = request.nextUrl.searchParams.get("profileId")!;
  const body: SnailProfilePut = await request.json();
  console.log(body);

  const updatedSnails = await db
    .insert(schema.snailProfile)
    .values({
      id: body.id,
      name: body.name,
      serverId: body.serverId,
      userId: id,
    })
    .onConflictDoUpdate({
      target: schema.snailProfile.id,
      set: {
        name: body.name,
        serverId: body.serverId,
        userId: id,
      },
    })
    .returning();

  const updatedSnail = updatedSnails[0];

  let server;
  if (updatedSnail.serverId) {
    server = (
      await db
        .select()
        .from(schema.server)
        .where(eq(schema.server.id, updatedSnail.serverId!))
    )[0];
  }

  let club: schema.Club | null = null;
  if (body.clubId) {
    club = (
      await db.select().from(schema.club).where(eq(schema.club.id, body.clubId))
    )[0];
  } else if (body.clubName) {
    club = (
      await db
        .select()
        .from(schema.club)
        .where(eq(schema.club.name, body.clubName))
    )[0];

    if (!club) {
      club = (
        await db
          .insert(schema.club)
          .values({
            name: body.clubName,
            serverId: body.serverId,
          })
          .returning()
      )[0];
    }
  }

  if (club) {
    await db
      .insert(schema.clubMember)
      .values({ clubId: club.id, snailProfileId: updatedSnail.id })
      .onConflictDoUpdate({
        target: schema.clubMember.snailProfileId,
        set: {
          clubId: club.id,
        },
      });
  }

  return NextResponse.json({
    id: updatedSnail.id,
    name: updatedSnail.name,
    server,
    club,
  });
}
