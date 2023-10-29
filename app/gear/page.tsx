"use client";
import React, { useEffect, useState } from "react";
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  Image,
  CardFooter,
} from "@nextui-org/react";
import styles from './styles.module.css'

interface GearData {
  [key: string]: {
    [key: string]: {
      imagePath: string;
      name: string;
    }[];
  };
}

const gearColors: { [key: string]: string } = {
  white: "#9c9c9c",
  green: "#7de87f",
  blue: "#7de8e6",
  purple: "#f3b5e1",
  orange: "#ffb066",
  red: "#f66",
  redp: "#f66",
};

export default function Home() {
  const [data, setData] = useState<GearData>({});
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/data/gear.json");
      if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error("Failed to fetch data");
      }
      const gear: GearData = await res.json();
      setData(gear);
    };

    fetchData().catch((e) => {
      // handle the error as needed
      console.error("An error occurred while fetching the data: ", e);
    });
  }, []);

  return (
    <div className="flex w-full flex-col">
      <Tabs aria-label="Categories">
        {Object.keys(data).map((gd) => (
          <Tab key={gd} title={gd}>
            <Card>
              <CardBody>
                <Tabs aria-label="Rarities">
                  {Object.keys(data[gd]).map((category) => (
                    <Tab
                      key={category}
                      title={category}
                      className="gap-2 grid grid-cols-8 grid-rows-auto"
                    >
                      {data[gd][category].map((item) => (
                        <Card key={item.name} isPressable>
                          <CardBody
                            className={`overflow-visible p-0 ${styles[category]} place-content-center`}
                          >
                            <Image
                              shadow="sm"
                              radius="lg"
                              removeWrapper
                              alt={item.name}
                              className="object-cover h-[75px] w-[75px] place-self-center"
                              src={item.imagePath}
                            />
                            <CardFooter className="text-small justify-between text-black">
                              <b>{item.name}</b>
                            </CardFooter>
                          </CardBody>
                        </Card>
                      ))}
                    </Tab>
                  ))}
                </Tabs>
              </CardBody>
            </Card>
          </Tab>
        ))}
      </Tabs>
      {/* {Object.keys(gear).map((gd) => (
        <>
          <h2>{gd}</h2>
          <>
            {Object.keys(gear[gd]).map((category) => (
              <>
                <h3>{category}</h3>
                {gear[gd][category].map((item) => (
                  <>
                    <Image
                      src={item.imagePath}
                      alt={item.name}
                      width="50"
                      height="50"
                    />
                  </>
                ))}
              </>
            ))}
          </>
        </>
      ))} */}
    </div>
  );
}
