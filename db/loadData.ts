import { db } from ".";
import * as schema from "./schema";
import gearData from "../public/data/gear.json";
import { uuidv7 } from "uuidv7";

interface Gear {
  imagePath: string;
  name: string;
}

interface GearData {
  [key: string]: {
    [key: string]: Gear[];
  };
}

export const doTheThing = async () => {
  const gear = JSON.parse(JSON.stringify(gearData)) as GearData;

  const thing = Object.keys(gear).flatMap((category) =>
    Object.keys(gear[category]).flatMap((rarity) =>
      gear[category][rarity].map((gear) =>
        db.insert(schema.gear).values({
          id: uuidv7(),
          name: gear.name,
          imagePath: gear.imagePath,
          category,
          rarity,
        })
      )
    )
  );

  await Promise.all(thing);
};
