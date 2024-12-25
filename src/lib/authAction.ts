'use server';

import { signOut as workosSignOut, withAuth as customAuth } from '@workos-inc/authkit-nextjs';

export async function signOut() {
  await workosSignOut();
}

export async function getUser() {
  const { user } = await customAuth({ ensureSignedIn: true });
  return user;
}