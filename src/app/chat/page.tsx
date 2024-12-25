import { ChatForm } from "@/components/chat/chat-form";
import { auth } from "@/auth"



export default async function Page() {
  console.log('env', process.env.NEXT_PUBLIC_API_URL)
  const session = await auth()
  console.log(session?.user.id)

  if (!session) return <div>something went wrong</div>

  const user = session.user

  const fetchUser = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getUser`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: user?.id }),
  })

  const firstName = user?.name?.split(" ")[0]
  const lastName = user?.name?.split(" ")[user.name.length -1]

  const { userData } = await fetchUser.json() as any;
  if (!userData) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: user?.id, first_name: firstName, last_name: lastName, avatar: user?.image, email: user?.email }),
      })
    } catch (error) {
      console.error("Failed to add user:", error);
    }
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center w-full"> 
      <main className="w-full">
        <ChatForm userId={user?.id}/>
      </main>
    </div>
  );
}