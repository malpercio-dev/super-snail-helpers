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
  Link,
  cn,
} from "@nextui-org/react";

import styles from "./styles.module.css";
import { PressEvent } from "@react-types/shared";
import { useQueryState } from "next-usequerystate";
import { useSession, signIn } from "next-auth/react";
import convertInventoryApiResponses from "@/lib/convertInventoryApiResponses";
import { Input } from "@nextui-org/input";

interface Gear {
  id: string;
  imagePath: string;
  name: string;
  category: string;
  rarity: string;
  color?: string;
  plusses?: number;
}

interface InventoryGear extends Gear {
  count: number;
}

interface InventoryData {
  [key: string]: {
    [key: string]: InventoryGear[];
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

const NoEquip: Gear = {
  id: "NoEquip",
  name: "Nothing Equipped!",
  imagePath: "/media/gear/Unequipped.png",
  color: "white",
  category: "N/A",
  rarity: "N/A",
};

export default function Gear() {
  const { data: session } = useSession();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedSlot, setSelectedSlot] = useState<number>(0);
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
  const [inventory, setInventory] = useState<InventoryData>();
  const [profileId, _setProfileId] = useQueryState("profileId");
  const [profileName, setProfileName] = useState(session ? "your" : undefined);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      if (profileId) {
        const response = await fetch(`/api/profile?profileId=${profileId}`);
        if (response.ok) {
          const data = await response.json();
          setProfileName(`${data.name}s`);
        }

        const profileGear = await fetch(
          `/api/profile/gear?profileId=${profileId}`
        );
        if (!profileGear.ok && profileGear.status !== 404) {
          // This will activate the closest `error.js` Error Boundary
          throw new Error("Failed to fetch myGear");
        }
        const myEquippedGear: EquippedGear = await profileGear.json();
        setEquippedGear((e) => myEquippedGear ?? e);
      } else if (session) {
        const myGear = await fetch("/api/my/gear");
        if (!myGear.ok && myGear.status !== 404) {
          // This will activate the closest `error.js` Error Boundary
          throw new Error("Failed to fetch myGear");
        }
        const myEquippedGear: EquippedGear = await myGear.json();
        setEquippedGear((e) => myEquippedGear ?? e);
      }

      if (session) {
        const myInventory = await fetch("/api/my/inventory");
        if (!myInventory.ok && myInventory.status !== 404) {
          throw new Error("Failed to fetch myInventory");
        }
        const myInventoryGear: InventoryGear[] = await myInventory.json();
        let finalData = convertInventoryApiResponses(myInventoryGear);
        setInventory(finalData);
      }
      setIsLoading(false);
    };

    fetchData().catch((e) => {
      // handle the error as needed
      console.error("An error occurred while fetching the data: ", e);
    });
  }, [profileId, session]);

  const saveGearToApi = async (
    equippedGear: ApiEquippedGear
  ): Promise<ApiEquippedGear> => {
    const response = await fetch("/api/my/gear", {
      method: "PUT",
      body: JSON.stringify(equippedGear),
    });
    if (!response.ok) {
      // This will activate the closest `error.js` Error Boundary
      throw new Error("Failed to post my gear");
    }

    const data = (await response.json()) as EquippedGear;
    setEquippedGear(data);
    return {
      gear: data,
    };
  };

  const openGearModal = (slot: number) => (_: PressEvent) => {
    setSelectedSlot(slot);
    onOpen();
  };

  const putGearInSlot =
    (onClose: () => void) =>
    (gear: Gear, category: string, slot: number, plusses = 0) =>
    async (_: PressEvent) => {
      const modifiedEquippedGear = [...equippedGear] as EquippedGear;
      modifiedEquippedGear[slot] = {
        color: category,
        plusses,
        ...gear,
      };
      const apiGear = await saveGearToApi({
        gear: modifiedEquippedGear,
      });
      setEquippedGear(apiGear.gear);
      if (selectedSlot >= 11) {
        onClose();
        return;
      }
      setSelectedSlot(selectedSlot + 1);
    };

  const clearSlot =
    (onClose: () => void) => (slot: number) => async (_: PressEvent) => {
      const modifiedEquippedGear = [...equippedGear] as EquippedGear;
      modifiedEquippedGear[slot] = NoEquip;
      const apiGear = await saveGearToApi({
        gear: modifiedEquippedGear,
      });
      setEquippedGear(apiGear.gear);
      if (selectedSlot >= 11) {
        onClose();
        return;
      }
      setSelectedSlot(selectedSlot + 1);
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
      or visit another persons profile to see equipped gear!
    </>
  ) : (
    <>
      <p>Viewing {profileName} gear.</p>
      <br />
      <div className="gap-2 grid grid-cols-6 grid-rows-2">
        {equippedGear.map((item, index) => {
          return (
            <div
              key={`${index}-${item.name}`}
              className={`mb-10 rounded-xl h-[50px] w-[50px] md:h-[75px] md:w-[75px] ${
                item.color ? styles[item.color] : ""
              }`}
            >
              <Button
                onPress={openGearModal(index)}
                className={`h-[50px] w-[50px] md:h-[75px] md:w-[75px] ${
                  item.color ? styles[item.color] : ""
                }`}
                isIconOnly
                isDisabled={!!profileId || !session}
              >
                <Image
                  shadow="none"
                  radius="none"
                  alt={item.name}
                  src={item.imagePath}
                />
                {item.rarity === "red+" ? (
                  <span className="absolute z-10 text-xl md:text-2xl font-extrabold left-[20px] bottom-[25px] md:left-[40px] md:bottom-[45px]">
                    {`+${item.plusses}`}
                  </span>
                ) : (
                  <></>
                )}
              </Button>
            </div>
          );
        })}
      </div>
      {!session ? (
        <p>
          <Link onPress={() => signIn()} aria-label="Sign In">
            <p>Sign In</p>
          </Link>{" "}
          in order to edit and save gear to your profile.
        </p>
      ) : (
        <></>
      )}

      {session ? (
        <>
          <p>Use the following link to share your gear with other snails:</p>
          <Input
            disabled
            defaultValue={`https://super-snail-helpers.malpercio.dev/profile/gear?profileId=${session.user.id}`}
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
                Select Gear
              </ModalHeader>
              <ModalBody>
                <>
                  <div>
                    <p>Currently Equipped</p>
                    <Image
                      shadow="sm"
                      radius="lg"
                      removeWrapper
                      alt={equippedGear[selectedSlot].name}
                      className={`object-cover h-[75px] w-[75px] place-self-center ${
                        styles[equippedGear[selectedSlot].color!]
                      }`}
                      src={equippedGear[selectedSlot].imagePath}
                    />
                    {equippedGear[selectedSlot].rarity === "red+" ? (
                      <span className="relative z-10 text-xl md:text-2xl font-extrabold left-[45px] bottom-[80px] md:left-[40px] md:bottom-[80px]">
                        {`+${equippedGear[selectedSlot].plusses}`}
                      </span>
                    ) : (
                      <></>
                    )}
                  </div>
                  <Tabs
                    aria-label="Categories"
                    size="lg"
                    classNames={{
                      tab: "max-w-fit px-0 h-[20px] w-[20px] md:h-[40px] md:w-[40px]",
                    }}
                  >
                    {Object.keys(inventory!).map((gd) => (
                      <Tab
                        key={gd}
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
                              {Object.keys(inventory![gd]).map((category) => {
                                if (inventory![gd][category].length === 0) {
                                  return;
                                }
                                return (
                                  <Tab
                                    key={category}
                                    title={
                                      <div
                                        className={`align-top rounded-xl h-[15px] w-[15px] md:h-[30px] md:w-[30px] md:pt-[2px] text-[10px] md:text-[20px] ${styles[category]} `}
                                      >
                                        {category === "red+" ? (
                                          <span>➕</span>
                                        ) : (
                                          ""
                                        )}
                                      </div>
                                    }
                                    className="gap-2 flex flex-row flex-wrap"
                                  >
                                    {inventory![gd][category].map((item) => (
                                      <Card
                                        key={item.name}
                                        isPressable
                                        onPress={putGearInSlot(onClose)(
                                          item,
                                          category,
                                          selectedSlot,
                                          item.rarity === "red+"
                                            ? item.count
                                            : 0
                                        )}
                                      >
                                        <CardBody
                                          className={cn(
                                            "p-0 inline-flex flex flex-row gap-2",
                                            "rounded-lg gap-2 p-4",
                                            "w-full"
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
                                                item.rarity
                                                  ? styles[item.rarity]
                                                  : ""
                                              }`}
                                            />
                                            {item.rarity === "red+" ? (
                                              <span className="absolute z-10 text-xl md:text-2xl font-extrabold left-[37px] bottom-[42px] md:left-[55px] md:bottom-[65px]">
                                                {`+${item.count}`}
                                              </span>
                                            ) : (
                                              <></>
                                            )}
                                          </div>
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
                </>
              </ModalBody>
              <ModalFooter>
                {selectedSlot >= 0 ? (
                  <Button
                    color="primary"
                    variant="light"
                    onPress={() => {
                      if (selectedSlot < 0) return;
                      setSelectedSlot(selectedSlot - 1);
                      return;
                    }}
                  >
                    Previous Slot
                  </Button>
                ) : (
                  <></>
                )}
                {selectedSlot <= 10 ? (
                  <Button
                    color="primary"
                    variant="light"
                    onPress={() => {
                      if (selectedSlot > 11) return;
                      setSelectedSlot(selectedSlot + 1);
                      return;
                    }}
                  >
                    Next Slot
                  </Button>
                ) : (
                  <></>
                )}

                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="danger"
                  variant="light"
                  onPress={clearSlot(onClose)(selectedSlot)}
                >
                  Clear Slot
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
