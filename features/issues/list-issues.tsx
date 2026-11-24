"use client";

import { Pencil } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IssueDialog } from "@/features/issues/issue-dialog";
import { useIssueControllerList } from "@/generated/api";
import {
  IssuePriority,
  IssueResponseDto,
  IssueStatus,
} from "@/generated/api/model";
import { PAGE_SIZE } from "@/lib/constants";
import { getPageItems } from "@/lib/utils";

const STATUS_STYLES: Record<IssueStatus, string> = {
  [IssueStatus.OPEN]: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  [IssueStatus.IN_PROGRESS]:
    "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  [IssueStatus.CLOSED]:
    "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
};

const STATUS_LABELS: Record<IssueStatus, string> = {
  [IssueStatus.OPEN]: "status.OPEN",
  [IssueStatus.IN_PROGRESS]: "status.IN_PROGRESS",
  [IssueStatus.CLOSED]: "status.CLOSED",
};

const PRIORITY_STYLES: Record<IssuePriority, string> = {
  [IssuePriority.LOW]: "bg-muted text-muted-foreground",
  [IssuePriority.MEDIUM]: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  [IssuePriority.HIGH]: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  [IssuePriority.URGENT]: "bg-red-500/15 text-red-600 dark:text-red-400",
};

const PRIORITY_LABELS: Record<IssuePriority, string> = {
  [IssuePriority.LOW]: "priority.LOW",
  [IssuePriority.MEDIUM]: "priority.MEDIUM",
  [IssuePriority.HIGH]: "priority.HIGH",
  [IssuePriority.URGENT]: "priority.URGENT",
};

const columns = 6;

interface Props {
  projectId: string;
}

export function ListIssues({ projectId }: Props) {
  const t = useTranslations("issues");
  const format = useFormatter();
  const [page, setPage] = useState(1);
  const [editedIssue, setEditedIssue] = useState<IssueResponseDto | null>(null);
  const { data, isPending, isError } = useIssueControllerList({
    page,
    limit: PAGE_SIZE,
    projectId,
  });

  const issues = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("columns.key")}</TableHead>
            <TableHead>{t("columns.title")}</TableHead>
            <TableHead>{t("columns.status")}</TableHead>
            <TableHead>{t("columns.priority")}</TableHead>
            <TableHead className="text-right">
              {t("columns.createdAt")}
            </TableHead>
            <TableHead className="w-0">
              <span className="sr-only">{t("columns.actions")}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending && (
            <TableRow>
              <TableCell colSpan={columns} className="text-muted-foreground">
                {t("loading")}
              </TableCell>
            </TableRow>
          )}

          {isError && (
            <TableRow>
              <TableCell colSpan={columns} className="text-muted-foreground">
                {t("error")}
              </TableCell>
            </TableRow>
          )}

          {!isPending && !isError && issues.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns} className="text-muted-foreground">
                {t("empty")}
              </TableCell>
            </TableRow>
          )}

          {!isPending &&
            !isError &&
            issues.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {issue.key}
                </TableCell>
                <TableCell className="font-medium whitespace-normal">
                  {issue.title}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[issue.status]}`}
                  >
                    {t(STATUS_LABELS[issue.status])}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[issue.priority]}`}
                  >
                    {t(PRIORITY_LABELS[issue.priority])}
                  </span>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {format.dateTime(new Date(issue.createdAt), {
                    dateStyle: "medium",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("edit.action", { key: issue.key })}
                    onClick={() => setEditedIssue(issue)}
                  >
                    <Pencil aria-hidden />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

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

      <IssueDialog
        projectId={projectId}
        issue={editedIssue ?? undefined}
        open={editedIssue !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditedIssue(null);
          }
        }}
      />
    </>
  );
}
