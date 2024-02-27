"use client";
import { Club, Server, SnailProfile } from "@/db/schema";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Checkbox,
  Image,
  Input,
} from "@nextui-org/react";
import { useSession } from "next-auth/react";
import { useQueryState } from "next-usequerystate";
import { Key, useEffect, useState, useMemo } from "react";

type ServerGroup = {
  firstServerId: string;
  name: string;
};

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

export default function Overview() {
  const { data: session } = useSession();
  const [servers, setServers] = useState<Server[]>([]);
  const [serverGroups, setServerGroups] = useState<ServerGroup[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [snailProfile, setSnailProfile] = useState<ApiSnailProfile>();
  const [profileId, _setProfileId] = useQueryState("profileId");
  const [profile, setProfile] = useState<Profile>();
  const [isLoading, setIsLoading] = useState(true);

  const [characterName, setCharacterName] = useState<string>();
  const [selectedServerGroup, setSelectedServerGroup] = useState<ServerGroup>();
  const [selectedServerId, setSelectedServerId] = useState<string>();
  const [selectedClub, setSelectedClub] = useState<ApiClub>();
  const [isNewClub, setIsNewClub] = useState<boolean>();
  const [newClubName, setNewClubName] = useState<string>();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const serverGroupsRes = await fetch("/api/server-groups");
      if (!serverGroupsRes.ok) {
        throw new Error("Failed to fetch server-groups");
      }
      const serverGroups: ServerGroup[] = await serverGroupsRes.json();
      setServerGroups(serverGroups);

      const serversRes = await fetch("/api/servers");
      if (!serversRes.ok) {
        throw new Error("Failed to fetch servers");
      }
      const servers: Server[] = await serversRes.json();
      setServers(servers);

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

      const snailProfileRes = await fetch(
        `/api/profile/snail-profile?profileId=${
          profile?.id ?? session?.user.id
        }`
      );
      if (snailProfileRes.ok) {
        const snailProfile: ApiSnailProfile = await snailProfileRes.json();
        setSnailProfile(snailProfile);
        setCharacterName(snailProfile.name);
        if (snailProfile.server) {
          const serverGroup = serverGroups.find(
            (sg) => sg.name === snailProfile.server.group
          );
          setSelectedServerGroup(serverGroup);
          setSelectedServerId(snailProfile.server.id);
        }
        if (snailProfile.club) {
          setSelectedClub(snailProfile.club);
        }
      }
      setIsLoading(false);
    };

    fetchData().catch((e) => {
      // handle the error as needed
      console.error("An error occurred while fetching the data: ", e);
    });
  }, [profileId, session]);

  useEffect(() => {
    const filteredServers = servers.filter(
      (server) => server.group === selectedServerGroup?.name
    );
    setServers(filteredServers);
  }, [selectedServerGroup]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/servers/${selectedServerId}/clubs`);
      if (!res.ok) {
        throw new Error("Failed to fetch clubs");
      }
      const clubs: Club[] = await res.json();
      setClubs(clubs);
    };

    fetchData().catch((e) => {
      // handle the error as needed
      console.error("An error occurred while fetching the data: ", e);
    });
  }, [selectedServerId]);

  const onServerGroupSelectionChange = (id: Key): void => {
    const serverGroup = serverGroups.find(
      (sg) => sg.firstServerId === id.toString()
    );
    setSelectedServerGroup(serverGroup);
  };

  const onServerSelectionChange = (id: Key): void => {
    const server = servers.find((s) => s.id === id.toString());
    setSelectedServerId(id.toString());
    setSnailProfile({
      ...snailProfile!,
      server: server!,
    });
  };

  const onClubSelectionChange = (id: Key): void => {
    const club = clubs.find((c) => c.id === id?.toString());
    console.log(club);
    if (club) {
      setSelectedClub(club);
      setSnailProfile({
        ...snailProfile!,
        club: club,
      });
    }
  };

  const nameValueChange = (value: string): void => {
    setCharacterName(value);
    setSnailProfile({
      ...snailProfile!,
      name: value,
    });
  };

  const saveProfile = async () => {
    console.log(snailProfile);
    const profile = {
      id: snailProfile?.id,
      name: snailProfile?.name,
      serverId: snailProfile?.server?.id,
      userId: session?.user.id,
      clubId: isNewClub ? undefined : snailProfile?.club.id,
      clubName: isNewClub ? newClubName : undefined,
    };
    console.log(profile);
    const res = await fetch(
      `/api/profile/snail-profile?profileId=${
        profile?.userId ?? session?.user.id
      }`,
      {
        method: "PUT",
        body: JSON.stringify(profile),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to save profile");
    }
  };

  if (isLoading && !snailProfile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-row">
        <Image src={profile?.image} alt={profile?.name} />
        <div>
          <Input
            value={characterName}
            onValueChange={nameValueChange}
            label="Character Name"
            isDisabled={!session}
          />
          {/* Server Group */}
          <Autocomplete
            defaultItems={serverGroups}
            onSelectionChange={onServerGroupSelectionChange}
            isDisabled={!session}
            allowsCustomValue={false}
            selectedKey={selectedServerGroup?.firstServerId}
            label="Server Group"
            placeholder="Search a server group"
            className="max-w-xs"
          >
            {(serverGroup) => {
              return (
                <AutocompleteItem key={serverGroup.firstServerId}>
                  {serverGroup.name}
                </AutocompleteItem>
              );
            }}
          </Autocomplete>
          {/* Server */}
          <Autocomplete
            defaultItems={servers}
            onSelectionChange={onServerSelectionChange}
            isDisabled={!session || !!!selectedServerGroup}
            allowsCustomValue={false}
            selectedKey={selectedServerId}
            label="Server"
            placeholder="Search a server"
            className="max-w-xs"
          >
            {(server) => {
              return (
                <AutocompleteItem key={server.id}>
                  {server.server}
                </AutocompleteItem>
              );
            }}
          </Autocomplete>
          {/* Club */}
          <div>
            <Autocomplete
              defaultItems={clubs}
              onSelectionChange={onClubSelectionChange}
              isDisabled={isNewClub || !session || !!!selectedServerId}
              allowsCustomValue={false}
              selectedKey={selectedClub?.id}
              label="Club"
              placeholder="Search clubs"
              className="max-w-xs"
            >
              {(club) => {
                return (
                  <AutocompleteItem key={club.id!}>
                    {club.name}
                  </AutocompleteItem>
                );
              }}
            </Autocomplete>
            {session ? (
              <Checkbox isSelected={isNewClub} onValueChange={setIsNewClub}>
                Add new club?
              </Checkbox>
            ) : (
              <></>
            )}
            {isNewClub ? (
              <Input
                value={newClubName}
                onValueChange={setNewClubName}
                label="Club Name"
              />
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
      {session ? (
        <Button className="max-w-xs mt-4" onPress={saveProfile}>
          Save
        </Button>
      ) : (
        <></>
      )}
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
    </div>
  );
}
