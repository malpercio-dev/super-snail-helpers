import { promises as fs } from "fs";
import path from "path";
import downloader from "image-downloader";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

type JsonRelic = {
  name: string;
  imageUrl: string;
  pageUrl: string;
  affct: string;
  grade: string;
  stats: {
    [key: string]: {
      fame: string;
      art: string;
      faith: string;
      civ: string;
      tech: string;
      special: string[];
    };
  };
  skills: {
    skill: string;
    image: string;
  }[];
};

const loadRelics = async () => {
  const relicsToInsert: schema.RelicInsert[] = [];

  const file = await fs.readFile(process.cwd() + "/data/relics.json", "utf8");
  const relics: JsonRelic[] = JSON.parse(file);

  for (const relic of relics) {
    if (relic.imageUrl) {
      const fullPath = `${process.cwd()}/public/media/relics${relic.imageUrl}`;
      const fileStat = await fs.stat(fullPath).catch(() => null);
      if (!fileStat) {
        const dirPath = path.parse(fullPath).dir;
        await fs.mkdir(dirPath, { recursive: true });
        await downloader
          .image({
            url: `https://supersnail.wiki.gg${relic.imageUrl}`,
            dest: fullPath,
          })
          .then(({ filename }) => {
            console.log("Saved to", filename); // saved to /path/to/dest/image.jpg
          })
          .catch((err) => console.error(err));
      }
    }
    relicsToInsert.push({
      name: relic.name,
      imagePath: relic.imageUrl,
      wikiPageUrl: relic.pageUrl,
      affct: relic.affct ?? "unknown",
      grade: relic.grade ?? "unknown",
    });
  }

  await db
    .insert(schema.relic)
    .values(relicsToInsert)
    .onConflictDoUpdate({
      target: [schema.relic.name],
      set: {
        imagePath: sql`excluded.imagePath`,
        wikiPageUrl: sql`excluded.wikiPageUrl`,
        affct: sql`excluded.affct`,
        grade: sql`excluded.grade`,
      },
    });

  const dbRelics = await db.select().from(schema.relic);

  const relicStatsToInsert: schema.RelicStatInsert[] = [];
  const relicSpecialsToInsert: schema.RelicSpecialInsert[] = [];
  const relicSkillsToInsert: schema.RelicSkillInsert[] = [];

  for (const relic of relics) {
    const dbRelic = dbRelics.find((dbr) => dbr.name === relic.name);
    if (!dbRelic) throw new Error("no relic!");

    // stats and specials
    for (const statKey of Object.keys(relic.stats)) {
      const stat = relic.stats[statKey];
      relicStatsToInsert.push({
        relicId: dbRelic.id,
        stars: statKey,
        fame: parseInt(stat.fame),
        art: parseInt(stat.art),
        faith: parseInt(stat.faith),
        civ: parseInt(stat.civ),
        tech: parseInt(stat.tech),
      });

      // specials
      for (const special of stat.special) {
        relicSpecialsToInsert.push({
          relicId: dbRelic.id,
          stars: statKey,
          special: special,
        });
      }
    }

    // skills
    for (const skill of relic.skills) {
      if (skill.image) {
        const fullPath = `${process.cwd()}/public/media/relics${skill.image}`;
        const fileStat = await fs.stat(fullPath).catch(() => null);
        if (!fileStat) {
          const dirPath = path.parse(fullPath).dir;
          await fs.mkdir(dirPath, { recursive: true });
          await downloader
            .image({
              url: `https://supersnail.wiki.gg${skill.image}`,
              dest: fullPath,
            })
            .then(({ filename }) => {
              console.log("Saved to", filename); // saved to /path/to/dest/image.jpg
            })
            .catch((err) => console.error(err));
        }
      }
      relicSkillsToInsert.push({
        relicId: dbRelic.id,
        skill: skill.skill,
        imagePath: skill.image,
      });
    }
  }

  while (relicStatsToInsert.length > 0) {
    await db
      .insert(schema.relicStat)
      .values(relicStatsToInsert.splice(0, 1000))
      .onConflictDoNothing();
  }

  await db.delete(schema.relicSpecial);
  while (relicSpecialsToInsert.length > 0) {
    await db
      .insert(schema.relicSpecial)
      .values(relicSpecialsToInsert.splice(0, 1000));
  }

  await db.delete(schema.relicSkill);
  while (relicSkillsToInsert.length > 0) {
    await db
      .insert(schema.relicSkill)
      .values(relicSkillsToInsert.splice(0, 1000));
  }
};

export async function PUT(_: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ no: true }, { status: 401 });
  if (!session.user.roles.includes("admin"))
    return NextResponse.json({ no: true }, { status: 403 });
  await loadRelics();

  return NextResponse.json({});
}
