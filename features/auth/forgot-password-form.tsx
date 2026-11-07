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
import { useAuthControllerForgotPassword } from "@/generated/api";
import type { ApiErrorResponseDto } from "@/generated/api/model";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  email: z.email(),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const { mutateAsync, isPending } = useAuthControllerForgotPassword();

  async function onSubmit(values: FormValues) {
    try {
      const result = await mutateAsync({
        data: {
          ...values,
        },
      });

      toast.add({
        type: "success",
        description: result.message,
        timeout: 5000,
      });
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
        <CardTitle>{t("forgotPassword.title")}</CardTitle>
        <CardDescription>{t("forgotPassword.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            type="email"
            placeholder={t("fields.email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={
              errors.email ? "forgotPassword-email-error" : undefined
            }
            {...register("email")}
          />
          {errors.email && (
            <p
              id="forgotPassword-email-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {t("validation.email")}
            </p>
          )}

          <p className="text-center text-sm text-muted-foreground">
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("register.signIn")}
            </Link>
          </p>

          <Button type="submit" disabled={isSubmitting}>
            {t("forgotPassword.submit")}
            {isPending && <Spinner data-icon="inline-start" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
