import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import * as schema from "@/db/schema";

export async function GET(_: NextRequest): Promise<NextResponse> {
  const servers = await db
    .select()
    .from(schema.server)
    .orderBy(schema.server.group, schema.server.server);

  const serverGroups = servers.reduce((accm, val) => {
    if (accm.findIndex((item) => item.name === val.group) === -1) {
      accm.push({ name: val.group, firstServerId: val.id });
      return accm;
    }
    return accm;
  }, new Array<{ firstServerId: string; name: string }>());

  return NextResponse.json(serverGroups);
}
