"use client";
import { Server } from "@/db/schema";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import { useSession } from "next-auth/react";
import { useQueryState } from "next-usequerystate";
import { useEffect, useState } from "react";

export default function Overview() {
  const { data: session } = useSession();
  const [servers, setServers] = useState<Server[]>([]);
  const [profileId, _setProfileId] = useQueryState("profileId");
  const [profileName, setProfileName] = useState(session ? "your" : undefined);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/servers");
      if (!res.ok) {
        throw new Error("Failed to fetch allGear");
      }
      const gear: Server[] = await res.json();
      setServers(gear);

      if (profileId) {
        const response = await fetch(`/api/profile?profileId=${profileId}`);
        if (response.ok) {
          const data = await response.json();
          setProfileName(`${data.name}s`);
        }
      }
      setIsLoading(false);
    };

    fetchData().catch((e) => {
      // handle the error as needed
      console.error("An error occurred while fetching the data: ", e);
    });
  }, [profileId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const serverGroups = servers.reduce((accm, val) => {
    if (accm.indexOf(val.group) === -1) {
      accm.push(val.group);
      return accm;
    }
    return accm;
  }, new Array<string>());

  console.log(serverGroups);

  return (
    <>
      <Autocomplete
        items={serverGroups}
        label="Server Group"
        placeholder="Search a server group"
        className="max-w-xs"
      >
        {(serverGroup) => {
          console.log(serverGroup);
          return (
            <AutocompleteItem key={serverGroup.replace(" ", "")}>
              {serverGroup}
            </AutocompleteItem>
          );
        }}
      </Autocomplete>
    </>
  );
}
