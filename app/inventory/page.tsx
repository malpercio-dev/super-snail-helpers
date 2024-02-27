"use client";
import React, { useEffect, useState } from "react";
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  Image,
  Button,
  Link,
  cn,
} from "@nextui-org/react";
import styles from "./styles.module.css";
import { useQueryState } from "next-usequerystate";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import convertInventoryApiResponses from "@/lib/convertInventoryApiResponses";

interface Gear {
  id: string;
  imagePath: string;
  name: string;
  category: string;
  rarity: string;
  color?: string;
}

interface GearData {
  [key: string]: {
    [key: string]: Gear[];
  };
}

interface InventoryGear extends Gear {
  count: number;
}

interface InventoryData {
  [key: string]: {
    [key: string]: InventoryGear[];
  };
}

type ApiInventoryGear = {
  id?: string;
  inventory: InventoryData;
};

export default function Inventory() {
  const { data: session } = useSession();
  const router = useRouter();
  const [inventory, setInventory] = useState<InventoryData>();
  const [inventoryId, setInventoryId] = useQueryState("iid");
  const [equippedGearId, _] = useQueryState("egid");
  const [profileId, _setProfileId] = useQueryState("profileId");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<GearData>({});

  if (!inventoryId) {
    router.replace(
      `/profile/inventory${profileId ? `?profileId=${profileId}` : ``}`
    );
  }

  const createDefaultInventory = (): InventoryData => {
    const defaultInventory: InventoryData = JSON.parse(JSON.stringify(data));
    Object.keys(defaultInventory).forEach((category) =>
      Object.keys(defaultInventory[category]).forEach((rarity) =>
        defaultInventory[category][rarity].forEach((gear) => {
          gear.count = 0;
          gear.color = rarity;
        })
      )
    );
    return defaultInventory;
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/allGear");
      if (!res.ok) {
        throw new Error("Failed to fetch allGear");
      }
      const gear: GearData = await res.json();
      setData(gear);

      if (inventoryId) {
        const inventoryRes = await fetch(`/api/inventory?iid=${inventoryId}`);
        if (!inventoryRes.ok) {
          throw new Error("Failed to fetch iid");
        }
        const inventoryGear: ApiInventoryGear = await inventoryRes.json();
        let inventory = inventoryGear.inventory;
        if (!inventory) {
          inventory = createDefaultInventory();
        }
        setInventory(inventory);
      }
      setIsLoading(false);
    };

    fetchData().catch((e) => {
      // handle the error as needed
      console.error("An error occurred while fetching the data: ", e);
    });
  }, [inventoryId, createDefaultInventory]);

  const claimInventoryGear = async () => {
    const response = await fetch("/api/inventory/claim", {
      method: "PUT",
      body: JSON.stringify(inventory),
    });
    const data = (await response.json()) as InventoryGear[];
    let finalData = convertInventoryApiResponses(data);
    if (finalData === null) {
      finalData = createDefaultInventory();
    }
    setInventoryId(null);
    setInventory(finalData);
    return data;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return !session && !inventoryId ? (
    <>
      Please{" "}
      <Link onPress={() => signIn()} aria-label="Sign In">
        <p>Sign In</p>
      </Link>{" "}
      or visit another persons profile to see inventory!
    </>
  ) : (
    <>
      <br />
      {inventory ? (
        <Tabs
          aria-label="Categories"
          size="lg"
          classNames={{
            tab: "max-w-fit px-0 h-[20px] w-[20px] md:h-[40px] md:w-[40px]",
          }}
        >
          {Object.keys(inventory).map((gd) => (
            <Tab
              key={`inv-tab-${gd}`}
              title={
                gd === "realm" ? (
                  <Image
                    src="/media/icons/Globe.webp"
                    className="h-[20px] w-[20px] md:h-[40px] md:w-[40px]"
                    height="40"
                    width="40"
                    alt="realm"
                  />
                ) : gd === "form" ? (
                  <span className="h-[20px] w-[20px] md:h-[40px] md:w-[40px] md:text-[30px]">
                    🐌
                  </span>
                ) : gd === "instrument" ? (
                  <span className="h-[20px] w-[20px] md:h-[40px] md:w-[40px] md:text-[30px]">
                    ⚔
                  </span>
                ) : gd === "armor" ? (
                  <span className="h-[20px] w-[20px] md:h-[40px] md:w-[40px] md:text-[30px]">
                    🛡
                  </span>
                ) : gd === "material" ? (
                  <span className="h-[20px] w-[20px] md:h-[40px] md:w-[40px] md:text-[30px]">
                    🔨
                  </span>
                ) : (
                  gd
                )
              }
            >
              <Card>
                <CardBody>
                  <Tabs
                    aria-label="Rarities"
                    size="lg"
                    classNames={{
                      tab: "max-w-fit h-[20px] w-[20px] md:h-[40px] md:w-[40px]",
                      panel: "gap-2 flex flex-row flex-wrap",
                    }}
                  >
                    {Object.keys(inventory[gd]).map((category) => {
                      if (inventory[gd][category].length === 0) {
                        return;
                      }
                      return (
                        <Tab
                          key={`inv-tab-${category}`}
                          title={
                            <div
                              className={`align-top rounded-xl h-[15px] w-[15px] pt-[0px] text-[10px] md:h-[30px] md:w-[30px] md:pt-[2px] md:text-[20px] ${styles[category]}`}
                            >
                              {category === "red+" ? (
                                <span
                                  className={`absolute top-[-4px] left-0 right-0 bottom-0 md:bottom-[-4px] md:top-0`}
                                >
                                  ➕
                                </span>
                              ) : (
                                ""
                              )}
                            </div>
                          }
                          className="gap-2 flex flex-row flex-wrap"
                        >
                          {inventory[gd][category].map((item) =>
                            item.count > 0 ? (
                              <div
                                key={`inv-${item.name}`}
                                className={cn(
                                  "p-0 inline-flex flex flex-row gap-2",
                                  "rounded-lg gap-2 p-4",
                                  "w-full md:w-1/5"
                                )}
                              >
                                <div
                                  className={`max-w[50px] md:max-w-[75px] h-[50px] md:h-[75px]`}
                                >
                                  <Image
                                    shadow="sm"
                                    radius="lg"
                                    removeWrapper
                                    alt={item.name}
                                    src={item.imagePath}
                                    className={`max-w-[50px] md:max-w-[75px] h-[50px] md:h-[75px] ${
                                      item.rarity ? styles[item.rarity] : ""
                                    }`}
                                  />
                                  {item.rarity === "red+" ? (
                                    <span className="relative z-10 text-xl font-extrabold top-[-50px] left-[20px] md:top-[-75px] md:left-[40px]">
                                      +{item.count}
                                    </span>
                                  ) : (
                                    <></>
                                  )}
                                </div>
                                <div className="self-center text-left">
                                  <p className="text-xs">{item.name}</p>
                                  {item.category === "material" ? (
                                    <p className="text-xs">
                                      {item.count ? item.count : 0}
                                    </p>
                                  ) : (
                                    <></>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div key={`inv-${item.name}`}></div>
                            )
                          )}
                        </Tab>
                      );
                    })}
                  </Tabs>
                </CardBody>
              </Card>
            </Tab>
          ))}
        </Tabs>
      ) : (
        <p>No inventory saved!</p>
      )}
      {session && inventoryId ? (
        <Button onPress={claimInventoryGear}>Claim Inventory</Button>
      ) : (
        <></>
      )}
      {equippedGearId ? (
        <Link href={`/gear?egid=${equippedGearId}&iid=${inventoryId}`}>
          View Gear
        </Link>
      ) : (
        <></>
      )}
      {!session && inventoryId ? (
        <p>
          <Link onPress={() => signIn()} aria-label="Sign In">
            <p>Sign In</p>
          </Link>{" "}
          in order to edit and save inventory to your profile.
        </p>
      ) : (
        <></>
      )}
    </>
  );
}
