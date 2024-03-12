"use client";
import { useEffect, useState } from "react";
import {
  Image,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
} from "@nextui-org/react";

type JsonRelic = {
  name: string;
  imagePath: string;
  wikiPageUrl: string;
  affct: string;
  grade: string;
  stats: {
    [key: string]: {
      fame: string;
      art: string;
      faith: string;
      civ: string;
      tech: string;
    };
  };
  specials: {
    id: string;
    stars: string;
    special: string;
  }[];
};

export default function Relic({ params }: { params: { slug: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [relic, setRelic] = useState<JsonRelic>();
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const relicRes = await fetch(`/api/relics/${params.slug}`);
      if (!relicRes.ok) {
        throw new Error("error getting relic");
      }
      const relicObj = await relicRes.json();
      setRelic(relicObj);
      setIsLoading(false);
    };
    fetchData().catch(console.error);
  }, []);

  const columns = [
    {
      key: "stars",
      label: "Stars",
    },
    {
      key: "art",
      label: "Art",
    },
    {
      key: "fame",
      label: "Fame",
    },
    {
      key: "faith",
      label: "Faith",
    },
    {
      key: "civ",
      label: "Civ",
    },
    {
      key: "tech",
      label: "Tech",
    },
    {
      key: "special",
      label: "Special",
    },
  ];

  if (isLoading || !relic) {
    return <div>Loading...</div>;
  }

  console.log(relic)

  const rows = Object.keys(relic.stats).map((stat) => {
    const specials = relic.specials.filter((s) => s.stars === stat);
    return {
      stars: stat,
      art: relic.stats[stat].art,
      fame: relic.stats[stat].fame,
      faith: relic.stats[stat].faith,
      civ: relic.stats[stat].civ,
      tech: relic.stats[stat].tech,
      special: specials.map((s) => s.special).join(';\n'),
    };
  });

  return (
    <div>
      <p>
        Name: <b>{relic?.name}</b>
      </p>
      <Image src={`/media/relics${relic?.imagePath}`} />
      <p>
        Primary AFFCT: <b className="capitalize">{relic?.affct}</b>
      </p>
      <p>
        Grade: <b>{relic?.grade}</b>
      </p>
      <a
        href={`https://supersnail.wiki.gg${relic?.wikiPageUrl}`}
        target="_blank"
      >
        Wiki
      </a>
      <Table aria-label="Example table with dynamic content">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={rows}>
          {(item) => (
            <TableRow key={item.stars}>
              {(columnKey) => (
                <TableCell>{getKeyValue(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
