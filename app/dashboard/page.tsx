"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function Dashboard() {
  const { data } = useSession();
  const t = useTranslations("dashboard");

  return (
    <div>
      {t("home.welcome", { name: data?.user?.name ?? data?.user?.email ?? "" })}
    </div>
  );
}
