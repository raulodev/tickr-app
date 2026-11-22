"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ListProjects } from "@/features/projects/list-projects";
import { ProjectDialog } from "@/features/projects/project-dialog";
import { getProjectControllerListQueryKey } from "@/generated/api";
import { useAppStore } from "@/stores/app";

export default function Projects() {
  const t = useTranslations("projects");
  const queryClient = useQueryClient();
  const { currentUser } = useAppStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-heading text-lg font-medium">{t("title")}</h1>

        {currentUser && currentUser.role === "ADMIN" && (
          <Button type="button" onClick={() => setIsDialogOpen(true)}>
            <Plus aria-hidden />
            {t("add")}
          </Button>
        )}
      </div>

      <ListProjects />

      <ProjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onProjectCreated={() => {
          queryClient.invalidateQueries({
            queryKey: getProjectControllerListQueryKey(),
          });
        }}
      />
    </div>
  );
}
