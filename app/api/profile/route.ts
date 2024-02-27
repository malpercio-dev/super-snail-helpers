import { db } from "@/db";
import * as schema from "../../../db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const id = request.nextUrl.searchParams.get("profileId")!;
  const profile = await db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      image: schema.users.image,
    })
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);

  return NextResponse.json(profile[0]);
}
