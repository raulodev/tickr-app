"use client";

import { ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { useTenantControllerList, useAuthControllerMe } from "@/generated/api";
import type {
  TenantOrganizationResponseDto,
  AuthUserResponseDto,
} from "@/generated/api/model";
import { useTranslations } from "next-intl";
import Image from "next/image";
import logo from "@/public/logo.webp";

const activeTenant = (
  tenants: TenantOrganizationResponseDto[] | undefined,
  me: AuthUserResponseDto | undefined,
): TenantOrganizationResponseDto => {
  if (!tenants || !me)
    return {
      id: "",
      name: "Default",
      role: "ADMIN",
      slug: "",
    };

  return tenants.filter(
    (item) => item.id === me.tenantId,
  )[0] as TenantOrganizationResponseDto;
};

export function OrganizationSwitcher() {
  const t = useTranslations("OrganizationSwitcher");
  const { isMobile } = useSidebar();

  const { data: tenants } = useTenantControllerList();
  const { data: me } = useAuthControllerMe();

  const currentTenant = activeTenant(tenants, me);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-10 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                <Image src={logo} width={40} height={40} alt="Tick Logo" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {currentTenant.name}
                </span>
                <span className="truncate text-xs">
                  {t(currentTenant.role)}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuItem className="text-xs text-muted-foreground">
              {t("organizations")}
            </DropdownMenuItem>

            {tenants?.map((item) => (
              <DropdownMenuItem className="gap-2 p-2" key={item.id}>
                {item.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
