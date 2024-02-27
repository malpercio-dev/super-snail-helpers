"use client";
import React, { useEffect, useState } from "react";
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  Image,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Link,
  Checkbox,
  cn,
} from "@nextui-org/react";
import styles from "./styles.module.css";
import { PressEvent } from "@react-types/shared";
import { useQueryState } from "next-usequerystate";
import { useSession, signIn } from "next-auth/react";
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
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [inventory, setInventory] = useState<InventoryData>();
  const [profileId, _setProfileId] = useQueryState("profileId");
  const [profileName, setProfileName] = useState(session ? "your" : undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<GearData>({});
  const [modalData, setModalData] = useState<InventoryData>({});
  
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

      if (profileId) {
        const response = await fetch(`/api/profile?profileId=${profileId}`);
        if (response.ok) {
          const data = await response.json();
          setProfileName(`${data.name}s`);
        }

        const myInventory = await fetch(
          `/api/profile/inventory?profileId=${profileId}`
        );
        if (!myInventory.ok && myInventory.status !== 404) {
          throw new Error("Failed to fetch myInventory");
        }
        const myInventoryGear: InventoryGear[] = await myInventory.json();
        let finalData = convertInventoryApiResponses(myInventoryGear);
        if (!finalData) {
          finalData = createDefaultInventory();
        }
        setInventory(finalData);
      } else if (session) {
        const myInventory = await fetch("/api/my/inventory");
        if (!myInventory.ok && myInventory.status !== 404) {
          throw new Error("Failed to fetch myInventory");
        }
        const myInventoryGear: InventoryGear[] = await myInventory.json();
        let finalData = convertInventoryApiResponses(myInventoryGear);
        if (!finalData) {
          finalData = createDefaultInventory();
        }
        setInventory(finalData);
      }
      setIsLoading(false);
    };

    fetchData().catch((e) => {
      // handle the error as needed
      console.error("An error occurred while fetching the data: ", e);
    });
  }, [profileId, createDefaultInventory]);


  const openInventoryModal = (_: PressEvent) => {
    const modalData = structuredClone(data) as InventoryData;
    const flatInventory = Object.keys(inventory!).flatMap((c) =>
      Object.keys(inventory![c]).flatMap((r) => inventory![c][r])
    );
    Object.keys(modalData).forEach((c) =>
      Object.keys(modalData[c]).forEach((r) =>
        modalData[c][r].forEach((i) => {
          const inventoryItem = flatInventory.find((ii) => ii.id === i.id);
          if (!inventoryItem) {
            i.count = 0;
            return;
          }
          i.count = inventoryItem.count;
        })
      )
    );
    setModalData(modalData);
    onOpen();
  };

  const saveInventoryToApi = (onClose: () => void) => async (_: PressEvent) => {
    if (session) {
      const response = await fetch("/api/my/inventory", {
        method: "PUT",
        body: JSON.stringify(modalData!),
      });

      if (!response.ok) {
        throw new Error("Failed to save inventory");
      }

      const data = (await response.json()) as InventoryGear[];
      let finalData = convertInventoryApiResponses(data);
      if (finalData === null) {
        finalData = createDefaultInventory();
      }
      setInventory(finalData);
      onClose();
      return data;
    }

    const inventoryGear: ApiInventoryGear = {
      inventory: modalData!,
    };
    const response = await fetch("/api/inventory", {
      method: "PUT",
      body: JSON.stringify(inventoryGear),
    });

    if (!response.ok) {
      throw new Error("failed to put inventory");
    }

    const data = (await response.json()) as ApiInventoryGear;
    setInventory(data.inventory);
    onClose();
    return data;
  };

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
    setInventory(finalData);
    return data;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return !session && !profileId ? (
    <>
      Please{" "}
      <Link onPress={() => signIn()} aria-label="Sign In">
        <p>Sign In</p>
      </Link>{" "}
      or visit another persons profile to see inventory!
    </>
  ) : (
    <>
      <p>Viewing {profileName} inventory.</p>
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
      {!profileId && session ? (
        <Button onPress={openInventoryModal}>Update Inventory</Button>
      ) : (
        <></>
      )}
      {!session ? (
        <p>
          <Link onPress={() => signIn()} aria-label="Sign In">
            <p>Sign In</p>
          </Link>{" "}
          in order to edit and save inventory to your profile.
        </p>
      ) : (
        <></>
      )}

      {session ? (
        <>
          <p>
            Use the following link to share your inventory with other snails:
          </p>
          <Input
            disabled
            defaultValue={`https://super-snail-helpers.malpercio.dev/inventory?profileId=${session.user.id}`}
          ></Input>
        </>
      ) : (
        <></>
      )}

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Update Inventory
              </ModalHeader>
              <ModalBody>
                <Tabs aria-label="Categories" className="grid">
                  {Object.keys(modalData)
                    .filter((gd) => gd !== "NULL")
                    .map((gd) => (
                      <Tab
                        key={`inv-modal-${gd}`}
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
                              }}
                            >
                              {Object.keys(modalData![gd]).map((category) => {
                                if (modalData![gd][category].length === 0) {
                                  return;
                                }
                                return (
                                  <Tab
                                    key={`inv-modal-${category}`}
                                    title={
                                      <div
                                        className={`align-top rounded-xl h-[15px] w-[15px] md:h-[30px] md:w-[30px] md:pt-[2px] text-[10px] md:text-[20px] ${styles[category]}`}
                                      >
                                        {category === "red+" ? (
                                          <span>➕</span>
                                        ) : (
                                          ""
                                        )}
                                      </div>
                                    }
                                  >
                                    {modalData![gd][category].map((item) => (
                                      <div
                                        key={`inv-modal-${item.name}`}
                                        className={cn(
                                          "inline-flex w-full max-w-md items-center",
                                          "rounded-lg gap-2 p-4 border-2 border-transparent",
                                          "m-2 p-0.5 text-xs"
                                        )}
                                      >
                                        <Checkbox
                                          aria-label={item.name}
                                          classNames={{
                                            base: cn(
                                              "inline-flex w-full max-w-md bg-content1",
                                              "hover:bg-content2 items-center",
                                              "cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent",
                                              "data-[selected=true]:border-primary",
                                              "m-2 p-0.5"
                                            ),
                                            label: "w-full",
                                          }}
                                          defaultSelected={item.count >= 1}
                                          onValueChange={(isSelected) => {
                                            if (
                                              isSelected &&
                                              item.count === 0
                                            ) {
                                              item.count = 1;
                                            } else {
                                              item.count = 0;
                                            }
                                          }}
                                        >
                                          <div className="w-full flex justify-between gap-2">
                                            <Image
                                              shadow="sm"
                                              radius="lg"
                                              removeWrapper
                                              alt={item.name}
                                              className={`h-[50px] w-[50px] md:h-[75px] md:w-[75px] ${
                                                item.rarity
                                                  ? styles[item.rarity]
                                                  : ""
                                              }`}
                                              src={item.imagePath}
                                            />
                                            <div className="text-xs text-right">
                                              {item.name}
                                            </div>
                                          </div>
                                        </Checkbox>
                                        {item.rarity === "red+" ? (
                                          <div>
                                            Upgrade Level:{" "}
                                            <Input
                                              type="number"
                                              className="w-16"
                                              defaultValue={item.count.toString()}
                                              onValueChange={(value) => {
                                                if (
                                                  !isNaN(parseInt(value)) &&
                                                  parseInt(value) < 0
                                                )
                                                  return;
                                                item.count = parseInt(value);
                                                return;
                                              }}
                                            />
                                          </div>
                                        ) : item.category === "material" ? (
                                          <div>
                                            Owned:{" "}
                                            <Input
                                              type="number"
                                              className="w-16"
                                              defaultValue={item.count.toString()}
                                              onValueChange={(value) => {
                                                if (
                                                  !isNaN(parseInt(value)) &&
                                                  parseInt(value) < 0
                                                )
                                                  return;
                                                item.count = parseInt(value);
                                                return;
                                              }}
                                            />
                                          </div>
                                        ) : (
                                          <></>
                                        )}
                                      </div>
                                    ))}
                                  </Tab>
                                );
                              })}
                            </Tabs>
                          </CardBody>
                        </Card>
                      </Tab>
                    ))}
                </Tabs>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="danger"
                  variant="light"
                  onPress={saveInventoryToApi(onClose)}
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
