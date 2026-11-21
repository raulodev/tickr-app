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

import { TenantDialog } from "@/features/tenant/tenant-dialog";

import {
  useAuthControllerMe,
  useAuthControllerSwitchTenant,
  useTenantControllerList,
} from "@/generated/api";
import type {
  AuthUserResponseDto,
  TenantOrganizationResponseDto,
} from "@/generated/api/model";
import logo from "@/public/logo.webp";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setAuthCookie } from "@/features/auth/actions";

const activeTenant = (
  tenants: TenantOrganizationResponseDto[] | undefined,
  me: AuthUserResponseDto | undefined,
): TenantOrganizationResponseDto => {
  if (!tenants || !me)
    return {
      id: "",
      name: "",
      role: "ADMIN",
      slug: "",
    };

  return tenants.filter(
    (item) => item.id === me.tenantId,
  )[0] as TenantOrganizationResponseDto;
};

export function OrganizationSwitcher() {
  const t = useTranslations("OrganizationSwitcher");
  const router = useRouter();
  const { isMobile } = useSidebar();
  const [isTenantDialogOpen, setIsTenantDialogOpen] = useState(false);

  const { data: tenants, refetch: refetchTenants } = useTenantControllerList();
  const { data: me, refetch: refetchMe } = useAuthControllerMe();
  const { mutateAsync } = useAuthControllerSwitchTenant();

  const currentTenant = activeTenant(tenants, me);

  async function onChangeTenant(tenantId: string) {
    if (tenantId === currentTenant.id) return;

    const result = await mutateAsync({
      data: {
        tenantId: tenantId,
      },
    });

    // Guardar el nuevo access token (el tenantId viaja dentro del JWT).
    await setAuthCookie(result.access_token);

    await Promise.all([refetchMe(), refetchTenants()]);
    router.refresh();
  }

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
              <DropdownMenuItem
                className="gap-2 p-2"
                key={item.id}
                onClick={() => onChangeTenant(item.id)}
              >
                {item.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => setIsTenantDialogOpen(true)}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                {t("addOrg")}
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <TenantDialog
          open={isTenantDialogOpen}
          onOpenChange={setIsTenantDialogOpen}
          onTenantCreated={async () => {
            await refetchTenants();
          }}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
