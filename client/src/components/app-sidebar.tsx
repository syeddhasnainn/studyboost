"use client";

import { Plus } from "lucide-react";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SidebarChats } from "./nav-chats";
import { SidebarNewChat } from "./nav-main";
import { NavUser } from "./nav-user";
import { SidebarLogo } from "./nav-logo";
import useSWR from "swr";

// const user = {
//   name: "Hasnain",
//   email: "syedhasnain@gmail.com",
//   avatar: "https://github.com/shadcn.png",
// };

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [sidebarChats, setSidebarChats] = React.useState([]);

  const fetcher = async (url: string) => {
    const response = await fetch(url);
    const { results } = (await response.json()) as any;
    return results;
  };

  const { isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/db/getAllChats`,
    fetcher,
    {
      onSuccess: (data) => {
        setSidebarChats(data);
      },
    }
  );

  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <SidebarLogo />
        <SidebarNewChat />
      </SidebarHeader>
      <SidebarContent>
        <SidebarChats sidebarChats={sidebarChats} isLoading={isLoading} />
      </SidebarContent>
      <NavUser />
      <SidebarRail />
    </Sidebar>
  );
}
