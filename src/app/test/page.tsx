'use client'
import { fetcher } from "@/lib/utils"
import useSWR from "swr"

export default function Page() {
    const {data, error, isLoading } = useSWR(`${process.env.NEXT_PUBLIC_API_URL}/db/getChat?chatId=1Kn1fky2t4`, fetcher)
    console.log(data)
    if (error) return <div>failed to load</div>
    if (isLoading) return <div>loading...</div>
    return <div>hello {JSON.stringify(data)}!</div>
}