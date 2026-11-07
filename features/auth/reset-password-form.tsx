"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { useAuthControllerResetPassword } from "@/generated/api";
import type { ApiErrorResponseDto } from "@/generated/api/model";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useTranslations } from "next-intl";
import { redirect } from "next/navigation";
import { useForm } from "react-hook-form";
import { CircleAlertIcon } from "lucide-react";
import { z } from "zod";

const schema = z.object({
  newPassword: z.string().min(8),
});
type FormValues = z.infer<typeof schema>;

export function ResetPasswordForm({ token }: { token: string | null }) {
  const t = useTranslations("auth");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const { mutateAsync, isPending } = useAuthControllerResetPassword();

  async function onSubmit(values: FormValues) {
    if (!token) return;

    try {
      const result = await mutateAsync({
        data: {
          token: token,
          ...values,
        },
      });

      toast.add({
        type: "success",
        description: result.message,
        priority: "high",
      });

      redirect("/login");
    } catch (error: unknown) {
      if (!isAxiosError<ApiErrorResponseDto>(error)) {
        throw error;
      }

      toast.add({
        type: "error",
        description: (error?.response?.data as ApiErrorResponseDto).message,
        priority: "high",
      });
    }
  }

  if (!token)
    return (
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle className="flex">
            <CircleAlertIcon color="red" size={25} className="mr-4" />
            {t("validation.link")}
          </CardTitle>
        </CardHeader>
      </Card>
    );

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>{t("resetPassword.title")}</CardTitle>
        <CardDescription>{t("resetPassword.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            type="password"
            placeholder={t("fields.password")}
            aria-invalid={Boolean(errors.newPassword)}
            aria-describedby={
              errors.newPassword ? "resetPassword-password-error" : undefined
            }
            {...register("newPassword")}
          />
          {errors.newPassword && (
            <p
              id="resetPassword-password-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {t("validation.passwordMin")}
            </p>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {t("resetPassword.submit")}
            {isPending && <Spinner data-icon="inline-start" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
