import { ChatForm } from "@/components/chat/chat-form";
import { auth, currentUser } from '@clerk/nextjs/server'



export default async function Page() {

  const { userId } = await auth()
  
  
  if (userId) {
    const fetchUser = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/getUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId }),
    })
    
    var { userData } = await fetchUser.json() as any;
  }
  
  
  const user = await currentUser()
  if(!user) return <div>Forbidden!</div>
  

  if (!userData) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/addUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: user?.id, first_name: user.firstName, last_name: user.lastName, avatar: user.imageUrl, email: user.emailAddresses[0].emailAddress }),
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