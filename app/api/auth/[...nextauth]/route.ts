import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { config } from "@/config";
import { db } from "@/db";

// https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes
const scopes = ["identify", "email"].join(" ");

const handler = NextAuth({
  // @ts-expect-error
  adapter: DrizzleAdapter(db),
  providers: [
    DiscordProvider({
      clientId: config.env.DISCORD_CLIENT_ID,
      clientSecret: config.env.DISCORD_CLIENT_SECRET,
      authorization: { params: { scope: scopes } },
    }),
  ],
});

export { handler as GET, handler as POST };
