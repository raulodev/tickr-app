"use client";

import { DialogRootChangeEventDetails } from "@base-ui/react/dialog";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  useIssueControllerHistory,
  useTenantControllerListMembers,
} from "@/generated/api";
import {
  IssueEventResponseDto,
  IssueEventType,
  IssuePriority,
  IssueResponseDto,
  IssueStatus,
} from "@/generated/api/model";
import { getPageItems } from "@/lib/utils";

const HISTORY_PAGE_SIZE = 5;

const EVENT_LABELS: Record<IssueEventType, string> = {
  [IssueEventType.CREATED]: "history.event.CREATED",
  [IssueEventType.STATUS_CHANGED]: "history.event.STATUS_CHANGED",
  [IssueEventType.PRIORITY_CHANGED]: "history.event.PRIORITY_CHANGED",
  [IssueEventType.ASSIGNEE_CHANGED]: "history.event.ASSIGNEE_CHANGED",
};

const STATUS_LABELS: Record<IssueStatus, string> = {
  [IssueStatus.OPEN]: "status.OPEN",
  [IssueStatus.IN_PROGRESS]: "status.IN_PROGRESS",
  [IssueStatus.CLOSED]: "status.CLOSED",
};

const PRIORITY_LABELS: Record<IssuePriority, string> = {
  [IssuePriority.LOW]: "priority.LOW",
  [IssuePriority.MEDIUM]: "priority.MEDIUM",
  [IssuePriority.HIGH]: "priority.HIGH",
  [IssuePriority.URGENT]: "priority.URGENT",
};

const columns = 4;

interface Props {
  open: boolean;
  onOpenChange: (
    open: boolean,
    eventDetails?: DialogRootChangeEventDetails,
  ) => void;
  issue: IssueResponseDto;
}

export function IssueHistoryDialog({ open, onOpenChange, issue }: Props) {
  const t = useTranslations("issues");
  const format = useFormatter();
  // El diálogo se monta de nuevo cada vez que se abre otro issue, así que la
  // paginación siempre empieza en la primera página.
  const [page, setPage] = useState(1);
  const { data, isPending, isError } = useIssueControllerHistory(
    issue.id,
    {
      page,
      limit: HISTORY_PAGE_SIZE,
    },
    {},
  );
  const { data: members } = useTenantControllerListMembers();

  const events = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1;

  const memberNames = new Map(
    (members ?? []).map((member) => [member.userId, member.email]),
  );

  function formatValue(event: IssueEventResponseDto, value: string | null) {
    if (!value) return t("history.emptyValue");

    if (event.type === IssueEventType.STATUS_CHANGED) {
      return value in STATUS_LABELS
        ? t(STATUS_LABELS[value as IssueStatus])
        : value;
    }

    if (event.type === IssueEventType.PRIORITY_CHANGED) {
      return value in PRIORITY_LABELS
        ? t(PRIORITY_LABELS[value as IssuePriority])
        : value;
    }

    if (event.type === IssueEventType.ASSIGNEE_CHANGED) {
      return memberNames.get(value) ?? value;
    }

    return value;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("history.title")}</DialogTitle>
          <DialogDescription>
            {t("history.description", { key: issue.key })}
          </DialogDescription>
        </DialogHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("history.columns.event")}</TableHead>
              <TableHead>{t("history.columns.change")}</TableHead>
              <TableHead>{t("history.columns.actor")}</TableHead>
              <TableHead className="text-right">
                {t("history.columns.createdAt")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending && (
              <TableRow>
                <TableCell colSpan={columns} className="text-muted-foreground">
                  {t("history.loading")}
                </TableCell>
              </TableRow>
            )}

            {isError && (
              <TableRow>
                <TableCell colSpan={columns} className="text-muted-foreground">
                  {t("history.error")}
                </TableCell>
              </TableRow>
            )}

            {!isPending && !isError && events.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns} className="text-muted-foreground">
                  {t("history.empty")}
                </TableCell>
              </TableRow>
            )}

            {!isPending &&
              !isError &&
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{t(EVENT_LABELS[event.type])}</TableCell>
                  <TableCell className="whitespace-normal">
                    {event.type === IssueEventType.CREATED
                      ? t("history.emptyValue")
                      : t("history.change", {
                          from: formatValue(event, event.oldValue),
                          to: formatValue(event, event.newValue),
                        })}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {event.actor.email}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {format.dateTime(new Date(event.createdAt), {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        {meta && totalPages > 1 && (
          <Pagination aria-label={t("history.pagination.label")}>
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
      </DialogContent>
    </Dialog>
  );
}
