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
  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const { mutateAsync, isPending } = useAuthControllerLogin();

  async function onSubmit(values: FormValues) {
    try {
      const result = await mutateAsync({
        data: {
          email: values.email,
          password: values.password,
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Input
            type="email"
            placeholder={t("fields.email")}
            {...form.register("email")}
          />
          <Input
            type="password"
            placeholder={t("fields.password")}
            {...form.register("password")}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {t("login.submit")}
            {isPending && <Spinner data-icon="inline-start" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
