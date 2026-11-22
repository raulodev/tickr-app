"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DialogRootChangeEventDetails } from "@base-ui/react/dialog";
import { isAxiosError } from "axios";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import {
  useProjectControllerCreate,
  useProjectControllerUpdate,
} from "@/generated/api";
import { ApiErrorResponseDto, ProjectResponseDto } from "@/generated/api/model";
import { getMessageError } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(1),
  key: z
    .string()
    .trim()
    .regex(/^[A-Z][A-Z0-9]{1,9}$/),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (
    open: boolean,
    eventDetails?: DialogRootChangeEventDetails,
  ) => void;
  /** Si se recibe un proyecto, el diálogo actualiza su nombre en lugar de crear uno. */
  project?: ProjectResponseDto;
  onProjectCreated?: () => void;
  onProjectUpdated?: () => void;
}

export function ProjectDialog({
  open,
  onOpenChange,
  project,
  onProjectCreated,
  onProjectUpdated,
}: Props) {
  const t = useTranslations("projects.dialog");
  const isEditing = Boolean(project?.id);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", key: "" },
  });
  const { mutateAsync: createProject, isPending: isCreating } =
    useProjectControllerCreate();
  const { mutateAsync: updateProject, isPending: isUpdating } =
    useProjectControllerUpdate();
  const isPending = isEditing ? isUpdating : isCreating;

  // Al abrir, el formulario se llena con el proyecto a editar o queda vacío
  // para crear uno nuevo (la clave solo se define al crear).
  useEffect(() => {
    if (!open) return;

    reset({
      name: project?.name ?? "",
      key: project?.key ?? "",
    });
  }, [open, project, reset]);

  function handleOpenChange(
    nextOpen: boolean,
    eventDetails?: DialogRootChangeEventDetails,
  ) {
    if (!nextOpen) {
      reset({ name: "", key: "" });
    }

    onOpenChange(nextOpen, eventDetails);
  }

  async function onSubmit(values: FormValues) {
    try {
      if (project?.id) {
        await updateProject({
          id: project.id,
          data: { name: values.name },
        });

        toast.add({
          type: "success",
          description: t("edit.success", { name: values.name }),
        });

        if (onProjectUpdated) {
          onProjectUpdated();
        }
      } else {
        await createProject({ data: values });

        toast.add({
          type: "success",
          description: t("create.success", { name: values.name }),
        });

        if (onProjectCreated) {
          onProjectCreated();
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
          t(isEditing ? "edit.failed" : "create.failed"),
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
              {t(isEditing ? "edit.title" : "create.title")}
            </DialogTitle>
            <DialogDescription>
              {t(isEditing ? "edit.description" : "create.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label htmlFor="project-name" className="text-sm font-medium">
              {t("name")}
            </label>
            <Input
              id="project-name"
              autoComplete="off"
              placeholder={t("namePlaceholder")}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={
                errors.name ? "project-name-error" : undefined
              }
              disabled={isPending}
              {...register("name")}
            />
            {errors.name && (
              <p
                id="project-name-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {t("validation.name")}
              </p>
            )}
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <label htmlFor="project-key" className="text-sm font-medium">
                {t("key")}
              </label>
              <Input
                id="project-key"
                autoComplete="off"
                placeholder={t("keyPlaceholder")}
                aria-invalid={Boolean(errors.key)}
                aria-describedby={
                  errors.key ? "project-key-error" : undefined
                }
                disabled={isPending}
                {...register("key")}
              />
              {errors.key ? (
                <p
                  id="project-key-error"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {t("validation.key")}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("keyHint")}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting || isPending}>
              {t(isEditing ? "edit.submit" : "create.submit")}
              {isPending && <Spinner data-icon="inline-start" />}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
