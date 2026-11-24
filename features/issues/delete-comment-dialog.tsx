"use client";

import { DialogRootChangeEventDetails } from "@base-ui/react/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useTranslations } from "next-intl";

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
import {
  getCommentControllerListQueryKey,
  useCommentControllerRemove,
} from "@/generated/api";
import { ApiErrorResponseDto } from "@/generated/api/model";
import { getMessageError } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (
    open: boolean,
    eventDetails?: DialogRootChangeEventDetails,
  ) => void;
  commentId: string;
  issueId: string;
  onCommentDeleted?: () => void;
}

export function DeleteCommentDialog({
  open,
  onOpenChange,
  commentId,
  issueId,
  onCommentDeleted,
}: Props) {
  const t = useTranslations("issues.comments.remove");
  const queryClient = useQueryClient();
  const { mutateAsync: removeComment, isPending } =
    useCommentControllerRemove();

  async function onConfirm() {
    try {
      await removeComment({ id: commentId });

      toast.add({
        type: "success",
        description: t("success"),
      });

      queryClient.invalidateQueries({
        queryKey: getCommentControllerListQueryKey(issueId),
      });

      if (onCommentDeleted) {
        onCommentDeleted();
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
            variant="outline"
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
