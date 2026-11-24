"use client";

import { CircleDot, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { DeleteProjectDialog } from "@/features/projects/delete-project-dialog";
import { ProjectDialog } from "@/features/projects/project-dialog";
import { useProjectControllerList } from "@/generated/api";
import { ProjectResponseDto } from "@/generated/api/model";

import { getPageItems } from "@/lib/utils";
import { PAGE_SIZE } from "@/lib/constants";

export function ListProjects() {
  const t = useTranslations("projects");
  const format = useFormatter();
  const [page, setPage] = useState(1);
  const { data, isPending, isError, refetch } = useProjectControllerList({
    page,
    limit: PAGE_SIZE,
  });
  const [deletedProject, setDeletedProject] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editedProject, setEditedProject] = useState<ProjectResponseDto | null>(
    null,
  );

  if (isPending) {
    return <p className="text-sm text-muted-foreground">{t("loading")}</p>;
  }

  if (isError) {
    return <p className="text-sm text-muted-foreground">{t("error")}</p>;
  }

  const projects = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1;

  return (
    <>
      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Card className="relative h-full">
                <Link
                  href={`/dashboard/projects/${project.id}/issues`}
                  aria-label={t("viewIssues", { name: project.name })}
                  className="absolute inset-0 z-0 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                />
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
                        <MenubarItem onClick={() => setEditedProject(project)}>
                          <Pencil aria-hidden />
                          {t("dialog.edit.title")}
                        </MenubarItem>
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
                  <CardTitle className="group-hover/card:underline">
                    {project.name}
                  </CardTitle>
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
      )}

      {meta && totalPages > 1 && (
        <Pagination className="mt-6" aria-label={t("pagination.label")}>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                text={t("pagination.previous")}
                aria-disabled={page === 1}
                tabIndex={page === 1 ? -1 : undefined}
                className={
                  page === 1 ? "pointer-events-none opacity-50" : undefined
                }
                onClick={(event) => {
                  event.preventDefault();
                  if (page > 1) {
                    setPage(page - 1);
                  }
                }}
              />
            </PaginationItem>

            {getPageItems(page, totalPages).map((item, index) =>
              item === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <PaginationLink
                    href="#"
                    isActive={item === page}
                    aria-label={t("pagination.page", { page: item })}
                    onClick={(event) => {
                      event.preventDefault();
                      setPage(item);
                    }}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                text={t("pagination.next")}
                aria-disabled={page === totalPages}
                tabIndex={page === totalPages ? -1 : undefined}
                className={
                  page === totalPages
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
                onClick={(event) => {
                  event.preventDefault();
                  if (page < totalPages) {
                    setPage(page + 1);
                  }
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <ProjectDialog
        open={editedProject !== null}
        project={editedProject ?? undefined}
        onOpenChange={(open) => {
          if (!open) {
            setEditedProject(null);
          }
        }}
        onProjectUpdated={() => {
          refetch();
        }}
      />

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
