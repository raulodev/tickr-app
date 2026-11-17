import { Sidebar, SidebarFooter } from "@/components/ui/sidebar";

import { useSession } from "next-auth/react";
import { NavUser } from "./nav-user";

export function AppSidebar() {
  const { data } = useSession();

  return (
    <Sidebar>
      <SidebarFooter>
        <NavUser
          user={{
            name: data?.user?.name as string,
            avatar: data?.user?.image as string,
            email: data?.user?.email as string,
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
