"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { setLocale } from "./actions";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LANGUAGES = [
  { value: "en", labelKey: "english" },
  { value: "es", labelKey: "spanish" },
] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("LanguageSwitcher");
  const [isPending, startTransition] = useTransition();

  const items = LANGUAGES.map(({ value, labelKey }) => ({
    value,
    label: t(labelKey),
  }));

  function changeLanguage(nextLocale: string | null) {
    if (!nextLocale || nextLocale === locale) return;

    startTransition(async () => {
      await setLocale(nextLocale);
    });
  }

  return (
    <Select
      items={items}
      value={locale}
      onValueChange={changeLanguage}
      disabled={isPending}
    >
      <SelectTrigger className="w-full max-w-48" aria-label={t("label")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{t("label")}</SelectLabel>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
