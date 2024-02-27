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
} from "@nextui-org/react";
import styles from "./styles.module.css";
import { PressEvent } from "@react-types/shared";
import { createParser, useQueryState } from "next-usequerystate";
import Pako from "pako";

interface Gear {
  imagePath: string;
  name: string;
  color?: string;
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

const NoEquip: Gear = {
  name: "Nothing Equipped!",
  imagePath: "/media/gear/Unequipped.png",
  color: "white",
};

function convertUint8ArrayToBinaryString(u8Array: Uint8Array) {
  var i,
    len = u8Array.length,
    b_str = "";
  for (i = 0; i < len; i++) {
    b_str += String.fromCharCode(u8Array[i]);
  }
  return b_str;
}

const equippedGearParser = createParser<EquippedGear>({
  parse(value: string): EquippedGear {
    let rawfile = atob(value);
    var bytes = [];
    for (var fileidx = 0; fileidx < rawfile.length; fileidx++) {
      var abyte = rawfile.charCodeAt(fileidx) & 0xff;
      bytes.push(abyte);
    }
    var plain = Pako.inflate(new Uint8Array(bytes));
    var enc = "";
    for (var i = 0; i < plain.length; i++) {
      enc += String.fromCharCode(plain[i]);
    }
    return JSON.parse(enc);
  },
  serialize(value: EquippedGear): string {
    const compress = Pako.deflate(JSON.stringify(value));
    const string = convertUint8ArrayToBinaryString(compress);
    return btoa(string);
  },
});

export default function Home() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedSlot, setSelectedSlot] = useState<number>();
  const [equippedGear, setEquippedGear] = useQueryState(
    "equippedGear",
    equippedGearParser
      .withOptions({
        history: "replace",
      })
      .withDefault([
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
      ])
  );
  const [data, setData] = useState<GearData>({});
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/data/gear.json");
      if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error("Failed to fetch data");
      }
      const gear: GearData = await res.json();
      setData(gear);
      setIsLoading(false);
    };

    fetchData().catch((e) => {
      // handle the error as needed
      console.error("An error occurred while fetching the data: ", e);
    });
  }, []);

  const openGearModal = (slot: number) => (e: PressEvent) => {
    setSelectedSlot(slot);
    onOpen();
  };

  const putGearInSlot =
    (onClose: () => void) =>
    (gear: Gear, category: string, slot: number) =>
    (e: PressEvent) => {
      const modifiedEquippedGear: EquippedGear = [...equippedGear];
      modifiedEquippedGear[slot] = {
        color: category,
        ...gear,
      };
      setEquippedGear(modifiedEquippedGear);
      onClose();
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

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
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
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
