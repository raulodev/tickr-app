"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DialogRootChangeEventDetails } from "@base-ui/react/dialog";
import { isAxiosError } from "axios";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useTenantControllerAddMember } from "@/generated/api";
import { ApiErrorResponseDto, Role } from "@/generated/api/model";
import { getMessageError } from "@/lib/utils";

const schema = z.object({
  email: z.email(),
  role: z.enum([Role.ADMIN, Role.MEMBER]),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (
    open: boolean,
    eventDetails?: DialogRootChangeEventDetails,
  ) => void;
  onTenantMemberCreated?: () => void;
}

export function TenantMemberDialog({
  open,
  onOpenChange,
  onTenantMemberCreated,
}: Props) {
  const t = useTranslations("tenant.members");
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", role: Role.MEMBER },
  });
  const { mutateAsync, isPending } = useTenantControllerAddMember();

  const roleItems = [
    { value: Role.ADMIN, label: t("ADMIN") },
    { value: Role.MEMBER, label: t("MEMBER") },
  ];

  function handleOpenChange(
    nextOpen: boolean,
    eventDetails?: DialogRootChangeEventDetails,
  ) {
    if (!nextOpen) {
      reset();
    }

    onOpenChange(nextOpen, eventDetails);
  }

  async function onSubmit(values: FormValues) {
    try {
      await mutateAsync({ data: values });

      toast.add({
        type: "success",
        description: t("add.success", { email: values.email }),
      });

      if (onTenantMemberCreated) {
        onTenantMemberCreated();
      }

      handleOpenChange(false);
    } catch (error: unknown) {
      if (!isAxiosError<ApiErrorResponseDto>(error)) {
        throw error;
      }

      toast.add({
        type: "error",
        description: getMessageError(error?.response?.data, t("add.failed")),
        priority: "high",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t("add.title")}</DialogTitle>
            <DialogDescription>{t("add.description")}</DialogDescription>
          </DialogHeader>

          <Input
            id="member-email"
            type="email"
            autoComplete="email"
            placeholder={t("email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "member-email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p
              id="member-email-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {t("add.validation.email")}
            </p>
          )}

          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <Select
                items={roleItems}
                value={field.value}
                onValueChange={(value) => {
                  if (value) {
                    field.onChange(value);
                  }
                }}
                disabled={isPending}
              >
                <SelectTrigger
                  className="w-full"
                  aria-labelledby="member-role-label"
                  aria-invalid={Boolean(errors.role)}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.role && (
            <p role="alert" className="text-sm text-destructive">
              {t("add.validation.role")}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              {t("add.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting || isPending}>
              {t("add.submit")}
              {isPending && <Spinner data-icon="inline-start" />}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
