"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";

import { DialogRootChangeEventDetails } from "@base-ui/react/dialog";

import { useTenantControllerRemoveMember } from "@/generated/api";
import { ApiErrorResponseDto } from "@/generated/api/model";
import { getMessageError } from "@/lib/utils";
import { isAxiosError } from "axios";
import { useTranslations } from "next-intl";

interface Props {
  open: boolean;
  onOpenChange: (
    open: boolean,
    eventDetails?: DialogRootChangeEventDetails,
  ) => void;
  onTenantMemberDeleted?: () => void;
  userId: string;
}

export function DeleteTenantMemberDialog({
  open,
  onOpenChange,
  onTenantMemberDeleted,
  userId,
}: Props) {
  const t = useTranslations("tenant.members.remove");
  const { mutateAsync, isPending } = useTenantControllerRemoveMember();

  async function onConfirm() {
    try {
      await mutateAsync({ userId });

      toast.add({
        type: "success",
        description: t("success"),
      });

      if (onTenantMemberDeleted) {
        onTenantMemberDeleted();
      }

      onOpenChange(false);
    } catch (error: unknown) {
      if (!isAxiosError<ApiErrorResponseDto>(error)) {
        throw error;
      }

      toast.add({
        type: "error",
        description: getMessageError(error?.response?.data, t("failed")),
        priority: "high",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={onConfirm}
          >
            {t("confirm")}
            {isPending && <Spinner data-icon="inline-start" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
