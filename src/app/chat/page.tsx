import { ChatForm } from "@/components/chat/chat-form";
import {
  withAuth,
} from '@workos-inc/authkit-nextjs';


export default async function Page() {
  const { user } = await withAuth({ ensureSignedIn: true });
  console.log("user", user);
  const fetchUser = await fetch("http://localhost:8787/getUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: user.id }),
  })

  const { userData } = await fetchUser.json() as any;
  if (!userData) {
    try {
      await fetch("http://localhost:8787/addUser", {
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
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <ChatForm userId={user.id}/>
      </main>
    </div>
  );
}