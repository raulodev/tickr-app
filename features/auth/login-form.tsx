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
import { useAuthControllerLogin } from "@/generated/api";
import type { ApiErrorResponseDto } from "@/generated/api/model";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { redirect } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { setAuthCookie } from "./actions";

const schema = z.object({
  email: z.email(),
  password: z.string().min(8),
});
type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const t = useTranslations("auth");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const { mutateAsync, isPending } = useAuthControllerLogin();

  async function onSubmit(values: FormValues) {
    try {
      const result = await mutateAsync({
        data: {
          ...values,
        },
      });

      await setAuthCookie(result.access_token, result.refresh_token);

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
        <CardTitle>{t("login.title")}</CardTitle>
        <CardDescription>{t("login.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            type="email"
            placeholder={t("fields.email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p
              id="login-email-error"
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
              errors.password ? "login-password-error" : undefined
            }
            {...register("password")}
          />
          {errors.password && (
            <p
              id="login-password-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {t("validation.passwordMin")}
            </p>
          )}

          <p className="text-center text-sm text-muted-foreground">
            {t("login.noAccount")}{" "}
            <Link
              href="/register"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("login.signUp")}
            </Link>
          </p>

          <Button type="submit" disabled={isSubmitting}>
            {t("login.submit")}
            {isPending && <Spinner data-icon="inline-start" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
