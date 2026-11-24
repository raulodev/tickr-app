"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DialogRootChangeEventDetails } from "@base-ui/react/dialog";
import { useQueryClient } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  getIssueControllerListQueryKey,
  getProjectControllerListQueryKey,
  useIssueControllerCreate,
  useTenantControllerListMembers,
} from "@/generated/api";
import { ApiErrorResponseDto, IssuePriority } from "@/generated/api/model";
import { getMessageError } from "@/lib/utils";
import { useAppStore } from "@/stores/app";

const schema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim(),
  priority: z.enum([
    IssuePriority.LOW,
    IssuePriority.MEDIUM,
    IssuePriority.HIGH,
    IssuePriority.URGENT,
  ]),
  assigneeId: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (
    open: boolean,
    eventDetails?: DialogRootChangeEventDetails,
  ) => void;
  projectId: string;
}

export function IssueDialog({ open, onOpenChange, projectId }: Props) {
  const t = useTranslations("issues");
  const queryClient = useQueryClient();
  const { currentUser } = useAppStore();
  const { data: members } = useTenantControllerListMembers();
  const { mutateAsync: createIssue, isPending } = useIssueControllerCreate();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      priority: IssuePriority.MEDIUM,
      assigneeId: "",
    },
  });

  const defaultAssigneeId = currentUser?.id ?? "";

  // Al abrir, el formulario se vacía y se asigna el issue al usuario actual,
  // ya que el backend exige un responsable para crear el issue.
  useEffect(() => {
    if (!open) return;

    reset({
      title: "",
      description: "",
      priority: IssuePriority.MEDIUM,
      assigneeId: defaultAssigneeId,
    });
  }, [open, defaultAssigneeId, reset]);

  const priorityItems = [
    { value: IssuePriority.LOW, label: t("priority.LOW") },
    { value: IssuePriority.MEDIUM, label: t("priority.MEDIUM") },
    { value: IssuePriority.HIGH, label: t("priority.HIGH") },
    { value: IssuePriority.URGENT, label: t("priority.URGENT") },
  ];

  const assigneeItems = (members ?? []).map((member) => ({
    value: member.userId,
    label: member.name ?? member.email,
  }));

  function handleOpenChange(
    nextOpen: boolean,
    eventDetails?: DialogRootChangeEventDetails,
  ) {
    if (!nextOpen) {
      reset({
        title: "",
        description: "",
        priority: IssuePriority.MEDIUM,
        assigneeId: defaultAssigneeId,
      });
    }

    onOpenChange(nextOpen, eventDetails);
  }

  async function onSubmit(values: FormValues) {
    try {
      const issue = await createIssue({
        data: {
          projectId,
          title: values.title,
          description: values.description,
          priority: values.priority,
          assigneeId: values.assigneeId,
        },
      });

      toast.add({
        type: "success",
        description: t("dialog.success", { key: issue.key }),
      });

      queryClient.invalidateQueries({
        queryKey: getIssueControllerListQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getProjectControllerListQueryKey(),
      });

      handleOpenChange(false);
    } catch (error: unknown) {
      if (!isAxiosError<ApiErrorResponseDto>(error)) {
        throw error;
      }

      toast.add({
        type: "error",
        description: getMessageError(
          error?.response?.data,
          t("dialog.failed"),
        ),
        priority: "high",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t("dialog.title")}</DialogTitle>
            <DialogDescription>{t("dialog.description")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Input
              id="issue-title"
              autoComplete="off"
              placeholder={t("dialog.titlePlaceholder")}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "issue-title-error" : undefined}
              disabled={isPending}
              {...register("title")}
            />
            {errors.title && (
              <p
                id="issue-title-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {t("dialog.validation.title")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Textarea
              id="issue-description"
              rows={4}
              placeholder={t("dialog.descriptionPlaceholder")}
              disabled={isPending}
              {...register("description")}
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-2">
              <p
                id="issue-priority-label"
                className="text-sm text-muted-foreground"
              >
                {t("dialog.priority")}
              </p>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select
                    items={priorityItems}
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
                      aria-labelledby="issue-priority-label"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <p
                id="issue-assignee-label"
                className="text-sm text-muted-foreground"
              >
                {t("dialog.assignee")}
              </p>
              <Controller
                control={control}
                name="assigneeId"
                render={({ field }) => (
                  <Select
                    items={assigneeItems}
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
                      aria-labelledby="issue-assignee-label"
                      aria-invalid={Boolean(errors.assigneeId)}
                    >
                      <SelectValue
                        placeholder={t("dialog.assigneePlaceholder")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {assigneeItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.assigneeId && (
                <p role="alert" className="text-sm text-destructive">
                  {t("dialog.validation.assignee")}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              {t("dialog.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting || isPending}>
              {t("dialog.submit")}
              {isPending && <Spinner data-icon="inline-start" />}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
