"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useSession } from "next-auth/react";
import { Spinner } from "@/components/ui/spinner";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { useTranslations } from "next-intl";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { LanguageSwitcher } from "@/components/language-switcher/language-switcher";
import { ModeToggle } from "@/components/mode-toggle";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const t = useTranslations("dashboard");

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full p-4">
        <NavigationMenu className="w-full max-w-none mb-4">
          <NavigationMenuList className="gap-2">
            <NavigationMenuItem>
              <SidebarTrigger />
            </NavigationMenuItem>
            <NavigationMenuItem className="ml-auto">
              <LanguageSwitcher />
            </NavigationMenuItem>
            <NavigationMenuItem>
              <ModeToggle />
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        {children}
      </main>

      {status === "loading" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
          <div className="flex max-w-xs flex-col gap-4 [--radius:1rem]">
            <Item variant="muted">
              <ItemMedia>
                <Spinner />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="line-clamp-1">{t("loading")}</ItemTitle>
              </ItemContent>
            </Item>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
}
