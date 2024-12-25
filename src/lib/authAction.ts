'use server';
import { auth } from "@/auth"
import { signOut as AuthSignOut } from "@/auth"


export async function signOut() {
  await AuthSignOut()

}

export async function getUser() {
  const session = await auth()
  if (session) return session.user
}