"use client";

import { CircleDot } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProjectControllerList } from "@/generated/api";

export function ListProjects() {
  const t = useTranslations("projects");
  const format = useFormatter();
  const { data, isPending, isError } = useProjectControllerList({
    page: 1,
    limit: 50,
  });

  if (isPending) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  }

  if (isError) {
    return <p className="text-sm text-muted-foreground">{t("error")}</p>;
  }

  const projects = data?.data ?? [];

  if (projects.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <li key={project.id}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>
                {t("createdAt", {
                  date: format.dateTime(new Date(project.createdAt), {
                    dateStyle: "medium",
                  }),
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto flex items-center gap-1.5 text-muted-foreground">
              <CircleDot className="size-4" aria-hidden />
              {t("issues", { count: project.issueCounter })}
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
