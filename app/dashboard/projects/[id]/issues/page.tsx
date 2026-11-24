"use client";

import { ArrowLeft, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { IssueDialog } from "@/features/issues/issue-dialog";
import { ListIssues } from "@/features/issues/list-issues";
import { useProjectControllerFindOne } from "@/generated/api";

export default function ProjectIssues() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations("issues");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: project } = useProjectControllerFindOne(id);

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard/projects"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t("back")}
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-heading text-lg font-medium">
          {project ? t("projectTitle", { name: project.name }) : t("title")}
        </h1>

        <Button type="button" onClick={() => setIsDialogOpen(true)}>
          <Plus aria-hidden />
          {t("add")}
        </Button>
      </div>

      <ListIssues projectId={id} />

      <IssueDialog
        projectId={id}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
