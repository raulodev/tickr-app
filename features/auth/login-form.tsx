"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useSession, signIn, signOut } from "next-auth/react";
import { LogOutIcon } from "lucide-react";
import { GithubIcon } from "@/components/icons/github-icon";

export function LoginForm() {
  const t = useTranslations("auth");
  const { data: session } = useSession();

  return (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>{t("login.title")}</CardTitle>
        <CardDescription>{t("login.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        {session?.user?.email ? (
          <>
            <div className="flex">
              {t("login.signedInAs")} {session.user.email}
            </div>
            <Button onClick={() => signOut()}>
              {t("logout.title")} <LogOutIcon />
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => signIn("github")}>
              <GithubIcon />
              Github
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
