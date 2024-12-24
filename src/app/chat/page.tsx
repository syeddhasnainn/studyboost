import { ChatForm } from "@/components/chat/chat-form";
import {
  withAuth,
} from '@workos-inc/authkit-nextjs';


export default async function Page() {
  const { user } = await withAuth({ ensureSignedIn: true });
  const fetchUser = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getUser`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: user.id }),
  })

  const { userData } = await fetchUser.json() as any;
  if (!userData) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: user.id, first_name: user.firstName, last_name: user.lastName, avatar: user.profilePictureUrl, email: user.email }),
      })
    } catch (error) {
      console.error("Failed to add user:", error);
    }
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center w-full"> 
      <main className="w-full">
        <ChatForm userId={user.id}/>
      </main>
    </div>
  );
}