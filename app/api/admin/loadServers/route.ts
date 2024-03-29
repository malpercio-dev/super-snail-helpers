import { db } from "@/db";
import * as schema from "@/db/schema";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

const loadServers = async () => {
  const servers: schema.ServerInsert[] = [];

  for (let index = 0; index < 14; index++) {
    servers.push({
      group: "Mashed Potato",
      server: `S${index + 1}`,
    });
  }

  for (let index = 0; index < 30; index++) {
    servers.push({
      group: "Extra Crispy",
      server: `S${index + 1}`,
    });
  }

  for (let index = 0; index < 30; index++) {
    servers.push({
      group: "Cheestborger",
      server: `S${index + 1}`,
    });
  }

  for (let index = 0; index < 30; index++) {
    servers.push({
      group: "Lorg Fries",
      server: `S${index + 1}`,
    });
  }

  for (let index = 0; index < 30; index++) {
    servers.push({
      group: "Hamborger",
      server: `S${index + 1}`,
    });
  }

  for (let index = 0; index < 30; index++) {
    servers.push({
      group: "Potatowo",
      server: `S${index + 1}`,
    });
  }

  for (let index = 0; index < 30; index++) {
    servers.push({
      group: "Avo Toast",
      server: `S${index + 1}`,
    });
  }

  for (let index = 0; index < 30; index++) {
    servers.push({
      group: "Deep Fried",
      server: `S${index + 1}`,
    });
  }

  for (let index = 0; index < 30; index++) {
    servers.push({
      group: "Half Chips",
      server: `S${index + 1}`,
    });
  }

  for (let index = 0; index < 30; index++) {
    servers.push({
      group: "Pitted Olives",
      server: `S${index + 1}`,
    });
  }

  for (let index = 0; index < 30; index++) {
    servers.push({
      group: "Americanowo",
      server: `S${index + 1}`,
    });
  }

  for (let index = 0; index < 18; index++) {
    servers.push({
      group: "Hotdowog",
      server: `S${index + 1}`,
    });
  }

  console.log(servers);

  await db.insert(schema.server).values(servers).onConflictDoNothing();
};

export async function PUT(_: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ no: true }, { status: 401 });
  if (!session.user.roles.includes('admin')) return NextResponse.json({ no: true }, { status: 403 });
  await loadServers();

  return NextResponse.json({});
}
