"use client";
import React, { useEffect, useState } from "react";
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  Image,
  CardFooter,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Link
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
  count: string;
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
  const [inventoryId, setInventoryId] = useQueryState("iid");
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<GearData>({});
  const [modalData, setModalData] = useState<InventoryData>({});
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
        setInventoryId(null);
        setInventory(finalData);
      }
      setIsLoading(false);
    };

    fetchData().catch((e) => {
      // handle the error as needed
      console.error("An error occurred while fetching the data: ", e);
    });
  }, [inventoryId]);

  const createDefaultInventory = (): InventoryData => {
    const defaultInventory: InventoryData = JSON.parse(JSON.stringify(data));
    Object.keys(defaultInventory).forEach((category) =>
      Object.keys(defaultInventory[category]).forEach((rarity) =>
        defaultInventory[category][rarity].forEach((gear) => {
          gear.count = "0";
          gear.color = rarity;
        })
      )
    );
    return defaultInventory;
  };

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
            i.count = "0";
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
      setInventoryId(null);
      setInventory(finalData);
      onClose();
      return data;
    }

    const inventoryGear: ApiInventoryGear = {
      inventory: modalData!,
      id: inventoryId ?? undefined,
    };
    const response = await fetch("/api/inventory", {
      method: "PUT",
      body: JSON.stringify(inventoryGear),
    });

    if (!response.ok) {
      throw new Error("failed to put inventory");
    }

    const data = (await response.json()) as ApiInventoryGear;
    setInventoryId(data.id!);
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
      or visit another person's profile to see inventory!
    </>
  ) : (
    <>
      <h2>Inventory</h2>
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
                              className={`align-top rounded-xl h-[15px] w-[15px] md:h-[30px] md:w-[30px] md:pt-[2px] text-[10px] md:text-[20px] ${styles[category]} `}
                            >
                              {category === "red+" ? <span>➕</span> : ""}
                            </div>
                          }
                        >
                          {inventory[gd][category].map((item) =>
                            parseInt(item.count) > 0 ? (
                              <Card key={`inv-${item.name}`}>
                                <CardBody className={`p-0 grow-0 w-[75px]`}>
                                  <Image
                                    shadow="sm"
                                    radius="lg"
                                    removeWrapper
                                    alt={item.name}
                                    className={`h-[50px] w-[50px] md:h-[75px] md:w-[75px] place-self-center ${styles[category]}`}
                                    src={item.imagePath}
                                  />
                                  <CardFooter className="bg-white/30 bottom-0 border-t-1 border-zinc-100/50 z-10 justify-between">
                                    <b className="text-black text-tiny">
                                      {item.name}
                                    </b>
                                    <p className="text-black text-tiny">
                                      {item.count ? item.count : 0}
                                    </p>
                                  </CardFooter>
                                </CardBody>
                              </Card>
                            ) : (
                              <></>
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

      <Button onPress={openInventoryModal}>Update Inventory</Button>
      {session && inventoryId ? (
        <Button onPress={claimInventoryGear}>Claim Inventory</Button>
      ) : (
        <></>
      )}

      {/* Gear Slot Modal */}
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
                  {Object.keys(modalData).map((gd) => (
                    <Tab key={`inv-modal-${gd}`} title={gd}>
                      <Card>
                        <CardBody>
                          <Tabs aria-label="Rarities">
                            {Object.keys(modalData![gd]).map((category) => {
                              if (modalData![gd][category].length === 0) {
                                return;
                              }
                              return (
                                <Tab
                                  key={`inv-modal-${category}`}
                                  title={category}
                                  className="gap-2 grid grid-rows-auto grid-cols-5"
                                >
                                  {modalData![gd][category].map((item) => (
                                    <Card key={`inv-modal-${item.name}`}>
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
                                        <Input
                                          type="number"
                                          defaultValue={item.count}
                                          onValueChange={(value) => {
                                            if (
                                              !isNaN(parseInt(value)) &&
                                              parseInt(value) < 0
                                            )
                                              return;
                                            item.count =
                                              parseInt(value).toString();
                                            return;
                                          }}
                                        />
                                        <CardFooter className="text-black p-0.5 text-xs">
                                          <p>{item.name}</p>
                                        </CardFooter>
                                      </CardBody>
                                    </Card>
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
