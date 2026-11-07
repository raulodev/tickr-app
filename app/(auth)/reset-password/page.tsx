"use client";

import { ResetPasswordForm } from "@/features/auth/reset-password-form";
import { useSearchParams } from "next/navigation";

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  return <ResetPasswordForm token={token} />;
}
