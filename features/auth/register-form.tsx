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
import { useAuthControllerRegister } from "@/generated/api";
import type { ApiErrorResponseDto } from "@/generated/api/model";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { useTranslations } from "next-intl";
import { redirect } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { setAuthCookie } from "./actions";

const schema = z.object({
  tenantName: z.string().nonempty(),
  name: z.string().nonempty(),
  email: z.email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const t = useTranslations("auth");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const { mutateAsync, isPending } = useAuthControllerRegister();

  async function onSubmit(values: FormValues) {
    try {
      const result = await mutateAsync({
        data: {
          ...values,
        },
      });

      await setAuthCookie(result.access_token, result.refresh_token);

      // TODO: Send email verification
      redirect("/dashboard/");
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

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>{t("register.title")}</CardTitle>
        <CardDescription>{t("register.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            type="text"
            placeholder={t("fields.name")}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "register-name-error" : undefined}
            {...register("name")}
          />
          {errors.name && (
            <p
              id="register-name-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {t("validation.name")}
            </p>
          )}

          <Input
            type="text"
            placeholder={t("fields.tenantName")}
            aria-invalid={Boolean(errors.tenantName)}
            aria-describedby={
              errors.tenantName ? "register-tenantName-error" : undefined
            }
            {...register("tenantName")}
          />
          {errors.tenantName && (
            <p
              id="register-tenantName-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {t("validation.tenantName")}
            </p>
          )}

          <Input
            type="email"
            placeholder={t("fields.email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "register-email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p
              id="register-email-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {t("validation.email")}
            </p>
          )}

          <Input
            type="password"
            placeholder={t("fields.password")}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "register-password-error" : undefined
            }
            {...register("password")}
          />
          {errors.password && (
            <p
              id="register-password-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {t("validation.passwordMin")}
            </p>
          )}
          {/* TODO: connect to login form */}
          <Button type="submit" disabled={isSubmitting}>
            {t("register.submit")}
            {isPending && <Spinner data-icon="inline-start" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
