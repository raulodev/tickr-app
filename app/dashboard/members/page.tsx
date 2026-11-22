"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { ListMembers } from "@/features/tenant/list-members";
import { TenantMemberDialog } from "@/features/tenant/tenant-member-dialog";
import { getTenantControllerListMembersQueryKey } from "@/generated/api";

export default function Members() {
  const t = useTranslations("tenant.members");
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-heading text-lg font-medium">{t("title")}</h1>
        <Button type="button" onClick={() => setIsDialogOpen(true)}>
          <Plus aria-hidden />
          {t("add.title")}
        </Button>
      </div>

      <ListMembers />

      <TenantMemberDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onTenantMemberCreated={() => {
          queryClient.invalidateQueries({
            queryKey: getTenantControllerListMembersQueryKey(),
          });
        }}
      />
    </div>
  );
}
