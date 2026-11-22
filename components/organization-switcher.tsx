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
  ApiErrorResponseDto,
  AuthUserResponseDto,
  TenantOrganizationResponseDto,
} from "@/generated/api/model";
import { toast } from "@/components/ui/toast";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import logo from "@/public/logo.webp";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setAuthCookie } from "@/features/auth/actions";

const EMPTY_TENANT: TenantOrganizationResponseDto = {
  id: "",
  name: "",
  role: "ADMIN",
  slug: "",
};

/**
 * Mientras se refrescan `me` y `tenants` tras cambiar de organización el
 * `tenantId` puede no existir todavía en la lista, así que siempre se
 * devuelve un tenant válido (vacío) en lugar de `undefined`.
 */
const activeTenant = (
  tenants: TenantOrganizationResponseDto[] | undefined,
  me: AuthUserResponseDto | undefined,
): TenantOrganizationResponseDto => {
  if (!tenants || !me) return EMPTY_TENANT;

  return (
    tenants.find((item) => item.id === me.tenantId) ?? EMPTY_TENANT
  );
};

export function OrganizationSwitcher() {
  const t = useTranslations("OrganizationSwitcher");
  const router = useRouter();
  const { isMobile } = useSidebar();
  const [isTenantDialogOpen, setIsTenantDialogOpen] = useState(false);

  const queryClient = useQueryClient();
  const { data: tenants, refetch: refetchTenants } = useTenantControllerList();
  const { data: me } = useAuthControllerMe();
  const { mutateAsync } = useAuthControllerSwitchTenant();

  const currentTenant = activeTenant(tenants, me);

  async function onChangeTenant(tenantId: string) {
    if (tenantId === currentTenant.id) return;

    try {
      const result = await mutateAsync({
        data: {
          tenantId: tenantId,
        },
      });

      // Guardar el nuevo access token (el tenantId viaja dentro del JWT).
      await setAuthCookie(result.access_token);

      // Los datos cacheados (me, organizaciones y el resto de la página actual)
      // pertenecen al tenant anterior: se invalidan todas las queries para que
      // se vuelvan a pedir al backend con el nuevo token.
      await queryClient.invalidateQueries();
      router.refresh();
    } catch (error) {
      if (!isAxiosError<ApiErrorResponseDto>(error)) throw error;

      toast.add({
        type: "error",
        description: t("switchFailed"),
        priority: "high",
      });
    }
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
