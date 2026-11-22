"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTenantControllerCreate } from "@/generated/api";
import { DialogRootChangeEventDetails } from "@base-ui/react/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/components/ui/toast";
import { isAxiosError } from "axios";
import { ApiErrorResponseDto } from "@/generated/api/model";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getMessageError } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (
    open: boolean,
    eventDetails?: DialogRootChangeEventDetails,
  ) => void;
  onTenantCreated?: () => void;
}

export function TenantDialog({ open, onOpenChange, onTenantCreated }: Props) {
  const t = useTranslations("tenant");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const { mutateAsync, isPending } = useTenantControllerCreate();

  async function onSubmit(values: FormValues) {
    try {
      const result = await mutateAsync({
        data: {
          ...values,
        },
      });

      toast.add({
        type: "success",
        description: t("dialog.orgCreated", {
          name: result.organization.name,
        }),
      });

      if (onTenantCreated) {
        onTenantCreated();
      }

      onOpenChange(false);
    } catch (error: unknown) {
      if (!isAxiosError<ApiErrorResponseDto>(error)) {
        throw error;
      }

      toast.add({
        type: "error",
        description: getMessageError(
          error?.response?.data,
          t("dialog.createFailed"),
        ),
        priority: "high",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t("dialog.title")}</DialogTitle>
          </DialogHeader>
          <Input
            placeholder={t("fields.name")}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
          />
          {errors.name && (
            <p
              id="name-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {t("validation.name")}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {t("add")}
              {isPending && <Spinner data-icon="inline-start" />}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
