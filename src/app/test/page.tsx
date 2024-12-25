import SignIn from "@/components/sign-in";
import { auth } from "@/auth"

export default async function Page() {

    const session = await auth()
    console.log(session)
    if (!session?.user) return <div><SignIn /></div>

    return (
        <div>
            welcome {session.user.name}
        </div>
    )
}