"use client";
import { Button, Image, Input, cn } from "@nextui-org/react";
import { useSession } from "next-auth/react";
import { useQueryState } from "next-usequerystate";
import { useEffect, useState } from "react";
import styles from "./styles.module.css";

type Profile = {
  id: string;
  name: string;
  image: string;
};

type ApiClub = {
  id?: string;
  name?: string;
};

type ApiSnailProfile = {
  id: string;
  name: string;
  server: {
    id: string;
    group: string;
    server: string;
  };
  club: ApiClub;
};

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
  id: "NoEquip",
  name: "Nothing Equipped!",
  imagePath: "/media/gear/Unequipped.png",
  color: "white",
  category: "N/A",
  rarity: "N/A",
};

export default function Overview() {
  const { data: session } = useSession();
  const [snailProfile, setSnailProfile] = useState<ApiSnailProfile>();
  const [profileId, _setProfileId] = useQueryState("profileId");
  const [profile, setProfile] = useState<Profile>();
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
  const [topGear, setTopGear] = useState<InventoryGear[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      let profile = session?.user;
      if (profileId) {
        const response = await fetch(`/api/profile?profileId=${profileId}`);
        if (response.ok) {
          profile = await response.json();
          setProfile(profile);
        }
      } else if (session) {
        profile = session.user;
        setProfile(profile);
      }

      const viewingProfileId = profile?.id ?? session?.user.id;

      const snailProfileRes = await fetch(
        `/api/profile/snail-profile?profileId=${viewingProfileId}`
      );
      if (snailProfileRes.ok) {
        const snailProfile: ApiSnailProfile = await snailProfileRes.json();
        setSnailProfile(snailProfile);
      }

      const profileGear = await fetch(
        `/api/profile/gear?profileId=${viewingProfileId}`
      );
      if (!profileGear.ok && profileGear.status !== 404) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error("Failed to fetch profileGear");
      }
      const profileEquippedGear: EquippedGear = await profileGear.json();
      setEquippedGear((e) => profileEquippedGear ?? e);

      const profileInventory = await fetch(
        `/api/profile/inventory?profileId=${viewingProfileId}`
      );
      if (!profileInventory.ok && profileInventory.status !== 404) {
        throw new Error("Failed to fetch profileInventory");
      }
      const profileInventoryGear: InventoryGear[] =
        await profileInventory.json();
      const profileTopGear = profileInventoryGear
        .filter(
          (g) =>
            g.category !== "material" &&
            (g.rarity === "orange" || g.rarity === "red" || g.rarity === "red+")
        )
        .sort((item) => {
          if (item.rarity === "red+" || item.rarity === "red") {
            return -1;
          }
          return 0;
        });
      setTopGear(profileTopGear);

      setIsLoading(false);
    };

    fetchData().catch((e) => {
      // handle the error as needed
      console.error("An error occurred while fetching the data: ", e);
    });
  }, [profileId, session]);

  if (isLoading && !snailProfile) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="flex flex-col w-1/2 rounded-lg border-zinc-400 border-2 p-4">
        <div className="flex flex-row">
          <div className="m-2 flex-col text-md">
            <Image src={profile?.image} alt={profile?.name} className="m-2" />
            <p>
              <label>
                <b>Name:</b>{" "}
              </label>
              <span className="text-xs">{snailProfile?.name}</span>
            </p>
            <p>
              <label>
                <b>Server</b>:{" "}
              </label>
              <span className="text-xs">
                {snailProfile?.server.group} {snailProfile?.server.server}
              </span>
            </p>
            <p>
              <label>
                <b>Club:</b>{" "}
              </label>
              <span className="text-xs">{snailProfile?.club.name}</span>
            </p>
          </div>
          <div className="flex-col pl-6">
            <div>
              <p>
                <b>Equipped Gear:</b>
              </p>
              <div className="gap-2 grid grid-cols-6 grid-rows-2">
                {equippedGear.map((item, index) => {
                  return (
                    <div
                      key={`${index}-${item.name}`}
                      className={`mb-2 rounded-xl h-[50px] w-[50px] ${
                        item.color ? styles[item.color] : ""
                      }`}
                    >
                      <Button
                        className={`h-[50px] w-[50px] ${
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
                          <span className="absolute z-10 text-xl font-extrabold left-[20px] bottom-[25px]">
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
            </div>
            <div>
              <p>
                <b>Best items:</b>
              </p>
              <div>
                {topGear.map((item) => {
                  return item.count > 0 ? (
                    <div
                      key={`inv-${item.name}`}
                      className={cn(
                        "p-0 inline-flex flex flex-row",
                        "rounded-lg gap-1 p-1"
                      )}
                    >
                      <div className="relative max-w[35px] max-h[35px] box-content">
                        <Image
                          shadow="sm"
                          radius="lg"
                          removeWrapper
                          alt={item.name}
                          src={item.imagePath}
                          className={`max-w-[35px] h-[35px] ${
                            item.rarity ? styles[item.rarity] : ""
                          }`}
                        />
                        {item.rarity === "red+" ? (
                          <span className="absolute z-10 text-md font-bold top-[-4px] right-[3px]">
                            +{item.count}
                          </span>
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div key={`inv-${item.name}`}></div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {session ? (
        <div className="mt-4">
          <p>Use the following link to share your profile with other snails:</p>
          <Input
            disabled
            defaultValue={`https://super-snail-helpers.malpercio.dev/profile/overview?profileId=${session.user.id}`}
          ></Input>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
