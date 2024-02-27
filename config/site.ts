export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Super Snail Helpers",
  description: "Let's snail together.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Profile",
      href: "/profile/overview",
    },
    {
      label: "Chat Colors",
      href: "/chat-color",
    },
  ],
  navMenuItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Profile",
      href: "/profile/overview",
    },
    {
      label: "Chat Colors",
      href: "/chat-color",
    },
  ],
  links: {
    github: "https://github.com/malpercio-dev/super-snail-helpers",
    twitter: "https://twitter.com/SuperSnailUS",
    docs: "https://supersnail.wiki.gg/wiki/Super_Snail_Wiki",
    discord: "https://discord.gg/Hc4sRPsmmQ",
    sponsor: "https://www.patreon.com/malpercio_dev",
  },
};
