"use client";
import React, { useEffect, useState } from "react";
import { Image, Button, Link } from "@nextui-org/react";
import { useRouter } from "next/navigation";

import styles from "./styles.module.css";
import { useQueryState } from "next-usequerystate";
import { useSession, signIn } from "next-auth/react";

interface Gear {
  id: string;
  imagePath: string;
  name: string;
  category: string;
  rarity: string;
  color?: string;
  plusses?: number;
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
  const router = useRouter();
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
  const [equippedGearId, _setEquippedGearId] = useQueryState("egid");
  const [inventoryId, _setInventoryId] = useQueryState("iid");
  const [profileId, _setProfileId] = useQueryState("profileId");
  const [isLoading, setIsLoading] = useState(true);

  if (!equippedGearId) {
    router.replace(`/profile/gear${profileId ? `?profileId=${profileId}` : ``}`);
  }

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
      setIsLoading(false);
    };

    fetchData().catch((e) => {
      // handle the error as needed
      console.error("An error occurred while fetching the data: ", e);
    });
  }, [equippedGearId]);

  const claimEquippedGear = async () => {
    await fetch("/equippedGear/claim", {
      method: "PUT",
      body: JSON.stringify(equippedGear),
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return !session && !equippedGearId ? (
    <>
      Please{" "}
      <Link onPress={() => signIn()} aria-label="Sign In">
        <p>Sign In</p>
      </Link>{" "}
      or visit another persons profile to see equipped gear!
    </>
  ) : (
    <>
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
                className={`h-[50px] w-[50px] md:h-[75px] md:w-[75px] ${
                  item.color ? styles[item.color] : ""
                }`}
                isIconOnly
                isDisabled={true}
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
      {session && equippedGearId ? (
        <Button onPress={claimEquippedGear}>Claim Equipped Gear</Button>
      ) : (
        <></>
      )}
      {equippedGearId ? (
        <Link href={`/inventory?egid=${equippedGearId}&iid=${inventoryId}`}>
          View Inventory
        </Link>
      ) : (
        <></>
      )}
      {!session && equippedGearId ? (
        <p>
          <Link onPress={() => signIn()} aria-label="Sign In">
            <p>Sign In</p>
          </Link>{" "}
          in order to edit and save gear to your profile.
        </p>
      ) : (
        <></>
      )}
    </>
  );
}
