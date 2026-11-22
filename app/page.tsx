"use client";

import {
  Building2,
  CircleDot,
  FolderKanban,
  LayoutDashboard,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import logo from "@/public/logo.webp";

import { GithubIcon } from "@/components/icons/github-icon";
import { LanguageSwitcher } from "@/components/language-switcher/language-switcher";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FEATURES = [
  { key: "projects", icon: FolderKanban },
  { key: "members", icon: Building2 },
  { key: "issues", icon: CircleDot },
] as const;

export default function Home() {
  const t = useTranslations("landing");
  const { data: session } = useSession();
  const isSignedIn = Boolean(session?.user);

  return (
    <main className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={logo}
            alt=""
            width={28}
            height={28}
            className="size-7 object-contain"
            priority
          />
          <span className="font-heading text-base font-medium">Tickr</span>
        </Link>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ModeToggle />
          {isSignedIn ? (
            <Button nativeButton={false} render={<Link href="/dashboard" />}>
              <LayoutDashboard aria-hidden />
              {t("nav.dashboard")}
            </Button>
          ) : (
            <Button size="lg" onClick={() => signIn("github")}>
              <GithubIcon aria-hidden />
              {t("nav.login")}
            </Button>
          )}
        </div>
      </header>

      <section className="border-y bg-muted/30">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-6 py-24 text-center">
          <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
            {t("hero.badge")}
          </span>
          <h1 className="font-heading text-4xl font-medium tracking-tight text-balance sm:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="max-w-xl text-base text-balance text-muted-foreground">
            {t("hero.description")}
          </p>

          <div className="mt-2 flex flex-col items-center gap-3">
            {isSignedIn ? (
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href="/dashboard" />}
              >
                <LayoutDashboard aria-hidden />
                {t("hero.dashboard")}
              </Button>
            ) : (
              <Button size="lg" onClick={() => signIn("github")}>
                <GithubIcon aria-hidden />
                {t("hero.signIn")}
              </Button>
            )}
            <span className="text-xs text-muted-foreground">
              {t("hero.note")}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="mb-10 max-w-xl space-y-2">
          <h2 className="font-heading text-2xl font-medium">
            {t("features.title")}
          </h2>
          <p className="text-muted-foreground">{t("features.description")}</p>
        </div>

        <ul className="grid gap-4 md:grid-cols-3">
          {FEATURES.map(({ key, icon: Icon }) => (
            <li key={key}>
              <Card className="h-full">
                <CardHeader>
                  <span className="mb-2 flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <CardTitle>{t(`features.${key}.title`)}</CardTitle>
                  <CardDescription>
                    {t(`features.${key}.description`)}
                  </CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-auto border-t">
        <div className="mx-auto w-full max-w-6xl px-6 py-6 text-sm text-muted-foreground">
          {t("footer.tagline")}
        </div>
      </footer>
    </main>
  );
}
