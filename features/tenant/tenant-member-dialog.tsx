"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DialogRootChangeEventDetails } from "@base-ui/react/dialog";
import { isAxiosError } from "axios";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
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
import {
  useTenantControllerAddMember,
  useTenantControllerChangeRole,
} from "@/generated/api";
import {
  ApiErrorResponseDto,
  Role,
  TenantMemberResponseDto,
} from "@/generated/api/model";
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
  /** Si se recibe un miembro, el diálogo edita su rol en lugar de agregarlo. */
  member?: TenantMemberResponseDto;
  onTenantMemberCreated?: () => void;
  onTenantMemberUpdated?: () => void;
}

export function TenantMemberDialog({
  open,
  onOpenChange,
  member,
  onTenantMemberCreated,
  onTenantMemberUpdated,
}: Props) {
  const t = useTranslations("tenant.members");
  const isEditing = Boolean(member?.userId);
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
  const { mutateAsync: addMember, isPending: isAdding } =
    useTenantControllerAddMember();
  const { mutateAsync: changeRole, isPending: isChangingRole } =
    useTenantControllerChangeRole();
  const isPending = isEditing ? isChangingRole : isAdding;

  // Al abrir, el formulario se llena con el miembro a editar o queda vacío
  // para agregar uno nuevo (el input de correo va oculto al editar).
  useEffect(() => {
    if (!open) return;

    reset({
      email: member?.email ?? "",
      role: member?.role ?? Role.MEMBER,
    });
  }, [open, member, reset]);

  const roleItems = [
    { value: Role.ADMIN, label: t("ADMIN") },
    { value: Role.MEMBER, label: t("MEMBER") },
  ];

  function handleOpenChange(
    nextOpen: boolean,
    eventDetails?: DialogRootChangeEventDetails,
  ) {
    if (!nextOpen) {
      reset({ email: "", role: Role.MEMBER });
    }

    onOpenChange(nextOpen, eventDetails);
  }

  async function onSubmit(values: FormValues) {
    try {
      if (member?.userId) {
        await changeRole({
          userId: member.userId,
          data: { role: values.role },
        });

        toast.add({
          type: "success",
          description: t("edit.success"),
        });

        if (onTenantMemberUpdated) {
          onTenantMemberUpdated();
        }
      } else {
        await addMember({ data: values });

        toast.add({
          type: "success",
          description: t("add.success", { email: values.email }),
        });

        if (onTenantMemberCreated) {
          onTenantMemberCreated();
        }
      }

      handleOpenChange(false);
    } catch (error: unknown) {
      if (!isAxiosError<ApiErrorResponseDto>(error)) {
        throw error;
      }

      toast.add({
        type: "error",
        description: getMessageError(
          error?.response?.data,
          t(isEditing ? "edit.failed" : "add.failed"),
        ),
        priority: "high",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {t(isEditing ? "edit.title" : "add.title")}
            </DialogTitle>
            <DialogDescription>
              {t(isEditing ? "edit.description" : "add.description")}
            </DialogDescription>
          </DialogHeader>

          {!isEditing && (
            <>
              <Input
                id="member-email"
                type="email"
                autoComplete="email"
                placeholder={t("email")}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? "member-email-error" : undefined
                }
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
            </>
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
              {t(isEditing ? "edit.submit" : "add.submit")}
              {isPending && <Spinner data-icon="inline-start" />}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
