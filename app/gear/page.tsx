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
  Divider,
  Input,
} from "@nextui-org/react";
import styles from "./styles.module.css";
import { PressEvent } from "@react-types/shared";
import { useQueryState } from "next-usequerystate";
import gearData from "../../public/data/gear.json";

interface Gear {
  imagePath: string;
  name: string;
  color?: string;
}

interface InventoryGear extends Gear {
  count: string;
}

interface InventoryData {
  [key: string]: {
    [key: string]: InventoryGear[];
  };
}

interface GearData {
  [key: string]: {
    [key: string]: Gear[];
  };
}

type EquippedGear = [
  Gear,
  Gear,
  Gear,
  Gear,
  Gear,
  Gear,
  Gear,
  Gear,
  Gear,
  Gear,
  Gear,
  Gear
];

type ApiEquippedGear = {
  id?: string;
  gear: EquippedGear;
};

type ApiInventoryGear = {
  id?: string;
  inventory: InventoryData;
};

const NoEquip: Gear = {
  name: "Nothing Equipped!",
  imagePath: "/media/gear/Unequipped.png",
  color: "white",
};
const data = gearData as GearData;

const defaultInventory: InventoryData = JSON.parse(JSON.stringify(data));
Object.keys(defaultInventory).forEach((category) =>
  Object.keys(defaultInventory[category]).forEach((rarity) =>
    defaultInventory[category][rarity].forEach((gear) => {
      gear.count = "0";
      gear.color = rarity;
    })
  )
);

export default function Gear() {
  const {
    isOpen,
    onOpen,
    onOpenChange,
  } = useDisclosure();
  const [selectedSlot, setSelectedSlot] = useState<number>();
  const [equippedGear, setEquippedGear] = useState([
    NoEquip,
    NoEquip,
    NoEquip,
    NoEquip,
    NoEquip,
    NoEquip,
    NoEquip,
    NoEquip,
    NoEquip,
    NoEquip,
    NoEquip,
    NoEquip,
  ]);
  const [equippedGearId, setEquippedGearId] = useQueryState("egid");
  const [inventory, setInventory] = useState<InventoryData>(defaultInventory);
  const [inventoryId, setInventoryId] = useQueryState("iid");
  const [isLoading, setIsLoading] = useState(true);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showGearModal, setShowGearModal] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      if (equippedGearId) {
        const equippedGearRes = await fetch(
          `/equippedGear?egid=${equippedGearId}`
        );
        if (!equippedGearRes.ok) {
          // This will activate the closest `error.js` Error Boundary
          throw new Error("Failed to fetch egid");
        }
        const equippedGear: ApiEquippedGear = await equippedGearRes.json();
        setEquippedGear(equippedGear.gear);
      }

      if (inventoryId) {
        const inventoryRes = await fetch(`/inventory?iid=${inventoryId}`);
        if (!inventoryRes.ok) {
          // This will activate the closest `error.js` Error Boundary
          throw new Error("Failed to fetch iid");
        }
        const inventoryGear: ApiInventoryGear = await inventoryRes.json();
        setInventory(inventoryGear.inventory);
      }
      setIsLoading(false);
    };

    fetchData().catch((e) => {
      // handle the error as needed
      console.error("An error occurred while fetching the data: ", e);
    });
  }, [equippedGearId, inventoryId]);

  const saveGearToApi = async (
    equippedGear: ApiEquippedGear
  ): Promise<ApiEquippedGear> => {
    const response = await fetch("/equippedGear", {
      method: "PUT",
      body: JSON.stringify(equippedGear),
    });

    if (!response.ok) {
      // This will activate the closest `error.js` Error Boundary
      throw new Error("Failed to post equippedGear");
    }

    const data = (await response.json()) as ApiEquippedGear;
    setEquippedGearId(data.id!);
    return data;
  };

  const openGearModal = (slot: number) => (_: PressEvent) => {
    setSelectedSlot(slot);
    setShowInventoryModal(false);
    setShowGearModal(true);
    onOpen();
  };

  const putGearInSlot =
    (onClose: () => void) =>
    (gear: Gear, category: string, slot: number) =>
    async (_: PressEvent) => {
      const modifiedEquippedGear = [...equippedGear] as EquippedGear;
      modifiedEquippedGear[slot] = {
        color: category,
        ...gear,
      };
      const apiGear = await saveGearToApi({ gear: modifiedEquippedGear });
      setEquippedGear(apiGear.gear);
      onClose();
    };

  const clearSlot =
    (onClose: () => void) => (slot: number) => async (_: PressEvent) => {
      const modifiedEquippedGear = [...equippedGear] as EquippedGear;
      modifiedEquippedGear[slot] = NoEquip;
      const apiGear = await saveGearToApi({ gear: modifiedEquippedGear });
      setEquippedGear(apiGear.gear);
      onClose();
    };

    const openInventoryModal = (_: PressEvent) => {
      setShowGearModal(false);
      setShowInventoryModal(true);
      onOpen();
    }

  const saveInventoryToApi = (onClose: () => void) => async (_: PressEvent) => {
    const inventoryGear = { inventory };
    const response = await fetch("/inventory", {
      method: "PUT",
      body: JSON.stringify(inventoryGear),
    });

    if (!response.ok) {
      throw new Error("failed to put inventory");
    }

    const data = (await response.json()) as ApiInventoryGear;
    setInventoryId(data.id!);
    onClose();
    return data;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="gap-2 grid grid-cols-6 grid-rows-2">
        {equippedGear.map((item, index) => {
          return (
            <div
              key={`${index}-${item.name}`}
              className={`mb-10 h-[50px] w-[50px] h-[75px] md:w-[75px] ${
                item.color ? styles[item.color] : ""
              }`}
            >
              <Button
                onPress={openGearModal(index)}
                className="h-[50px] w-[50px] md:h-[75px] md:w-[75px]"
                isIconOnly
              >
                <Image
                  shadow="none"
                  radius="none"
                  alt={item.name}
                  className={`object-cover place-self-center ${
                    item.color ? styles[item.color] : ""
                  }`}
                  src={item.imagePath}
                />
              </Button>
            </div>
          );
        })}
      </div>
      <Divider className="my-4" />
      <h2>Inventory</h2>
      {inventory ? (
        <Tabs aria-label="Categories" className="grid">
          {Object.keys(inventory).map((gd) => (
            <Tab key={`inv-${gd}`} title={gd}>
              <Card>
                <CardBody>
                  <Tabs aria-label="Rarities">
                    {Object.keys(inventory[gd]).map((category) => {
                      if (inventory[gd][category].length === 0) {
                        return;
                      }
                      return (
                        <Tab
                          key={`inv-${category}`}
                          title={category}
                          className="gap-2 grid grid-rows-auto grid-cols-5"
                        >
                          {inventory[gd][category].map((item) =>
                            parseInt(item.count) > 0 ? (
                              <Card key={`inv-${item.name}`}>
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
                                  <p>Owned: {item.count ? item.count : 0}</p>
                                  <CardFooter className="text-black p-0.5 text-xs">
                                    <p>{item.name}</p>
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

      {/* Gear Slot Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        {showGearModal ? (
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Select Gear
                </ModalHeader>
                <ModalBody>
                  <Tabs aria-label="Categories" className="grid">
                    {Object.keys(data).map((gd) => (
                      <Tab key={gd} title={gd}>
                        <Card>
                          <CardBody>
                            <Tabs aria-label="Rarities">
                              {Object.keys(data[gd]).map((category) => {
                                if (data[gd][category].length === 0) {
                                  return;
                                }
                                return (
                                  <Tab
                                    key={category}
                                    title={category}
                                    className="gap-2 grid grid-rows-auto grid-cols-5"
                                  >
                                    {data[gd][category].map((item) => (
                                      <Card
                                        key={item.name}
                                        isPressable
                                        onPress={putGearInSlot(onClose)(
                                          item,
                                          category,
                                          selectedSlot!
                                        )}
                                      >
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
                    onPress={clearSlot(onClose)(selectedSlot!)}
                  >
                    Clear Slot
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        ) : showInventoryModal ? (
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Update Inventory
                </ModalHeader>
                <ModalBody>
                  <Tabs aria-label="Categories" className="grid">
                    {Object.keys(data).map((gd) => (
                      <Tab key={`inv-modal-${gd}`} title={gd}>
                        <Card>
                          <CardBody>
                            <Tabs aria-label="Rarities">
                              {Object.keys(inventory[gd]).map((category) => {
                                if (inventory[gd][category].length === 0) {
                                  return;
                                }
                                return (
                                  <Tab
                                    key={`inv-modal-${category}`}
                                    title={category}
                                    className="gap-2 grid grid-rows-auto grid-cols-5"
                                  >
                                    {inventory[gd][category].map((item) => (
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
                                              console.log(value);
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
        ) : (
          <></>
        )}
      </Modal>
    </>
  );
}
