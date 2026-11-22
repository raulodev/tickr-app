import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { useSession } from "next-auth/react";
import { NavUser } from "./nav-user";
import { useTranslations } from "next-intl";
import { HomeIcon, FolderIcon, UserRoundGroupIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { OrganizationSwitcher } from "./organization-switcher";

export function AppSidebar() {
  const { data: session } = useSession();
  const t = useTranslations("AppSidebar");
  const router = useRouter();

  const data = [
    {
      title: t("home"),
      url: "/dashboard",
      icon: HomeIcon,
    },
    {
      title: t("projects"),
      url: "/dashboard/projects",
      icon: FolderIcon,
    },
    {
      title: t("members"),
      url: "/dashboard/members",
      icon: UserRoundGroupIcon,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <OrganizationSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {data.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    onClick={() => router.push(item.url)}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: session?.user?.name as string,
            avatar: session?.user?.image as string,
            email: session?.user?.email as string,
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
