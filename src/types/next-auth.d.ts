import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      // Add other properties if needed
    } & DefaultSession["user"];
  }
}