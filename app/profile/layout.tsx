"use client";
import { Tab, Tabs } from "@nextui-org/react";
import { useQueryState } from "next-usequerystate";
import { usePathname } from "next/navigation";
import React from "react";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [profileId, _setProfileId] = useQueryState("profileId");

  return (
    <>
      <Tabs selectedKey={pathname} aria-label="Navigation">
        <Tab
          key="/profile/overview"
          href={
            profileId
              ? `/profile/overview?profileId=${profileId}`
              : "/profile/overview"
          }
        >
          Overview
        </Tab>
        <Tab
          key="/profile/gear"
          href={
            profileId
              ? `/profile/gear?profileId=${profileId}`
              : "/profile/gear"
          }
        >
          Gear
        </Tab>
        <Tab
          key="/profile/inventory"
          href={
            profileId
              ? `/profile/inventory?profileId=${profileId}`
              : "/profile/inventory"
          }
        >
          Inventory
        </Tab>
      </Tabs>
      {children}
    </>
  );
}
