"use client";

import { CircleDot, MoreHorizontal, Trash2 } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { DeleteProjectDialog } from "@/features/projects/delete-project-dialog";
import { useProjectControllerList } from "@/generated/api";

export function ListProjects() {
  const t = useTranslations("projects");
  const format = useFormatter();
  const { data, isPending, isError, refetch } = useProjectControllerList({
    page: 1,
    limit: 50,
  });
  const [deletedProject, setDeletedProject] = useState<{
    id: string;
    name: string;
  } | null>(null);

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
    <>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <li key={project.id}>
            <Card className="relative h-full">
              <div className="absolute top-4 right-4 z-10">
                <Menubar className="h-auto border-0 p-0">
                  <MenubarMenu>
                    <MenubarTrigger
                      className="size-7 justify-center p-0 text-muted-foreground"
                      aria-label={t("actions")}
                    >
                      <MoreHorizontal className="size-4" aria-hidden />
                    </MenubarTrigger>
                    <MenubarContent align="end" className="w-auto min-w-40">
                      <MenubarItem
                        variant="destructive"
                        onClick={() =>
                          setDeletedProject({
                            id: project.id,
                            name: project.name,
                          })
                        }
                      >
                        <Trash2 aria-hidden />
                        {t("remove.action")}
                      </MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                </Menubar>
              </div>
              <CardHeader className="pr-14">
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

      <DeleteProjectDialog
        open={deletedProject !== null}
        projectId={deletedProject?.id ?? ""}
        projectName={deletedProject?.name}
        onOpenChange={(open) => {
          if (!open) {
            setDeletedProject(null);
          }
        }}
        onProjectDeleted={() => {
          refetch();
        }}
      />
    </>
  );
}
