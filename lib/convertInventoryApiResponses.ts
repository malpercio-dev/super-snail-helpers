import groupBy from "./groupBy";

interface Gear {
  id: string;
  imagePath: string;
  name: string;
  category: string;
  rarity: string;
  color?: string;
}

interface InventoryGear extends Gear {
  count: number;
}

interface InventoryData {
  [key: string]: {
    [key: string]: InventoryGear[];
  };
}

export default function convertInventoryApiResponses(data: InventoryGear[]): InventoryData | undefined {
  const finalData: InventoryData = {
    realm: {
      white: [],
      green: [],
      blue: [],
      purple: [],
      orange: [],
      red: [],
      ["red+"]: [],
    },
    form: {
      white: [],
      green: [],
      blue: [],
      purple: [],
      orange: [],
      red: [],
      ["red+"]: [],
    },
    instrument: {
      white: [],
      green: [],
      blue: [],
      purple: [],
      orange: [],
      red: [],
      ["red+"]: [],
    },
    armor: {
      white: [],
      green: [],
      blue: [],
      purple: [],
      orange: [],
      red: [],
      ["red+"]: [],
    },
    material: {
      white: [],
      green: [],
      blue: [],
      purple: [],
      orange: [],
      red: [],
      ["red+"]: [],
    },
  };
  const groupedByCategory = groupBy(data, (k) => k.category);
  if (groupedByCategory.size <= 0) return undefined;
  Array.from(groupedByCategory.keys()).forEach((category) => {
    if (!finalData[category]) {
      finalData[category] = {};
    }

    const categoryGroupedByRarity = groupBy(
      groupedByCategory.get(category)!,
      (k) => k.rarity
    );

    Array.from(categoryGroupedByRarity.keys()).forEach((rarity) => {
      finalData[category][rarity] = categoryGroupedByRarity.get(rarity)!;
    });
  });
  return finalData;
};
