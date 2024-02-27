"use client";
import { Tab, Tabs } from "@nextui-org/react";
import { usePathname } from "next/navigation";
import React from "react";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      <Tabs selectedKey={pathname} aria-label="Navigation">
        <Tab key="/profile/overview" href="/profile/overview">
          Overview
        </Tab>
        <Tab key="/profile/gear" href="/profile/gear">
          Gear
        </Tab>
        <Tab key="/profile/inventory" href="/inventory">
          Inventory
        </Tab>
      </Tabs>
      {children}
    </>
  );
}
