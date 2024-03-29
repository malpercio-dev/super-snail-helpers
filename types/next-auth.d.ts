import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's id. */
      id: string;

      /** The user's name. */
      name: string;

      /** URL of the user's avatar. */
      image: string;

      /** List of roles that the user belongs to. */
      roles: string[];
    };
  }
  interface Profile {
    /** The user's id. */
    id: string;

    /** The user's name. */
    name?: string;
  }
}

import { JWT } from "next-auth/jwt";

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** ID */
    id?: string;
  }
}
