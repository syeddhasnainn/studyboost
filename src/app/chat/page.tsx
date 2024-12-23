import { ChatForm } from "@/components/chat/chat-form";
import {
  withAuth,
} from '@workos-inc/authkit-nextjs';


export default async function Page() {

  const { user } = await withAuth({ ensureSignedIn: true });

  const fetchUser = await fetch("http://localhost:8787/getUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: user.id }),
  })

  const { results } = await fetchUser.json() as any;
  if (!results) {
    try {
      await fetch("http://localhost:8787/addUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: user.id }),
      })
    } catch (error) {
      console.error("Failed to add user:", error);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <ChatForm />
      </main>
    </div>
  );
}