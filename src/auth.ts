import NextAuth, { type DefaultSession } from "next-auth"

import Google from "next-auth/providers/google"
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      async profile(profile) {
        return { ...profile }
      },
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Persist the user ID to the token right after sign-in
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Send the user ID to the client
      if (token) {
        session.user.id = token.id;
      }
      return session;
    },
  },
})