export type SiteConfig = typeof siteConfig;

export const siteConfig = {
	name: "Malpercio's Super Snail Helpers",
	description: "Let's snail together.",
	navItems: [
		{
			label: "Home",
			href: "/",
		},
    {
      label: "Gear",
      href: "/gear",
    },
	],
	navMenuItems: [],
	links: {
		github: "https://github.com/malpercio-dev",
		twitter: "https://twitter.com/SuperSnailUS",
		docs: "https://supersnail.wiki.gg/wiki/Super_Snail_Wiki",
		discord: "https://discord.gg/Hc4sRPsmmQ",
        sponsor: "https://patreon.com/malpercio-dev"
	},
};
