import NextAuth, { type DefaultSession } from "next-auth"

import Google from "next-auth/providers/google"


declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's id. */
      id: string
      /**
       * By default, TypeScript merges new interface properties and overwrites existing ones.
       * In this case, the default session user properties will be overwritten,
       * with the new ones defined above. To keep the default session user properties,
       * you need to add them back into the newly declared interface.
       */
    } & DefaultSession["user"]
  }
}



export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google 
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) { // User is available during sign-in
        token.id = user.id
      }
      return token
    },
    session({ session, token, }) {
      // @ts-ignore
      session.user.id = token.id
      return session
    },
  },
})