import { ChatForm } from "@/components/chat/chat-form";
import { getUser } from "@/lib/authAction";



export default async function Page() {
  const user = await getUser()
  console.log(user)
  if (!user) return <div>Something went wrong!</div>

  const fetchUser = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getUser`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: user.id }),
  })

  const firstName = user.name?.split(" ")[0]
  const lastName = user.name?.split(" ")[user.name.length -1]

  const { userData } = await fetchUser.json() as any;
  if (!userData) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: user.id, first_name: firstName, last_name: lastName, avatar: user.image, email: user.email }),
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