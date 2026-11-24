"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DialogRootChangeEventDetails } from "@base-ui/react/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Pencil, Trash2 } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
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
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { DeleteCommentDialog } from "@/features/issues/delete-comment-dialog";
import {
  getCommentControllerListQueryKey,
  useCommentControllerCreate,
  useCommentControllerList,
  useCommentControllerUpdate,
} from "@/generated/api";
import {
  ApiErrorResponseDto,
  CommentResponseDto,
  IssueResponseDto,
} from "@/generated/api/model";
import { getMessageError, getPageItems } from "@/lib/utils";
import { useAppStore } from "@/stores/app";

const COMMENTS_PAGE_SIZE = 5;

const schema = z.object({
  body: z.string().trim().min(1),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (
    open: boolean,
    eventDetails?: DialogRootChangeEventDetails,
  ) => void;
  issue: IssueResponseDto;
}

export function IssueCommentsDialog({ open, onOpenChange, issue }: Props) {
  const t = useTranslations("issues");
  const format = useFormatter();
  const queryClient = useQueryClient();
  const { currentUser } = useAppStore();
  // Se monta de nuevo al abrir otro issue, así que siempre empieza en la
  // primera página.
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [deletedComment, setDeletedComment] =
    useState<CommentResponseDto | null>(null);

  const { data, isPending, isError } = useCommentControllerList(issue.id, {
    page,
    limit: COMMENTS_PAGE_SIZE,
  });
  const { mutateAsync: createComment, isPending: isCreating } =
    useCommentControllerCreate();
  const { mutateAsync: updateComment, isPending: isUpdating } =
    useCommentControllerUpdate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { body: "" },
  });

  const comments = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1;

  function handleOpenChange(
    nextOpen: boolean,
    eventDetails?: DialogRootChangeEventDetails,
  ) {
    if (!nextOpen) {
      reset({ body: "" });
      setEditingId(null);
      setEditingBody("");
    }

    onOpenChange(nextOpen, eventDetails);
  }

  async function onCreate(values: FormValues) {
    try {
      await createComment({ issueId: issue.id, data: { body: values.body } });

      toast.add({
        type: "success",
        description: t("comments.created"),
      });

      reset({ body: "" });
      setPage(1);
      queryClient.invalidateQueries({
        queryKey: getCommentControllerListQueryKey(issue.id),
      });
    } catch (error: unknown) {
      if (!isAxiosError<ApiErrorResponseDto>(error)) {
        throw error;
      }

      toast.add({
        type: "error",
        description: getMessageError(
          error?.response?.data,
          t("comments.failed"),
        ),
        priority: "high",
      });
    }
  }

  function startEditing(comment: CommentResponseDto) {
    setEditingId(comment.id);
    setEditingBody(comment.body);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingBody("");
  }

  async function onUpdate(commentId: string) {
    const body = editingBody.trim();

    if (!body) return;

    try {
      await updateComment({ id: commentId, data: { body } });

      toast.add({
        type: "success",
        description: t("comments.edit.success"),
      });

      cancelEditing();
      queryClient.invalidateQueries({
        queryKey: getCommentControllerListQueryKey(issue.id),
      });
    } catch (error: unknown) {
      if (!isAxiosError<ApiErrorResponseDto>(error)) {
        throw error;
      }

      toast.add({
        type: "error",
        description: getMessageError(
          error?.response?.data,
          t("comments.edit.failed"),
        ),
        priority: "high",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("comments.title")}</DialogTitle>
          <DialogDescription>
            {t("comments.description", { key: issue.key })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onCreate)} className="space-y-2">
          <Textarea
            id="new-comment"
            rows={3}
            placeholder={t("comments.placeholder")}
            aria-label={t("comments.placeholder")}
            aria-invalid={Boolean(errors.body)}
            aria-describedby={errors.body ? "new-comment-error" : undefined}
            disabled={isCreating}
            {...register("body")}
          />
          {errors.body && (
            <p
              id="new-comment-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {t("comments.validation.body")}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={isCreating}>
              {t("comments.submit")}
              {isCreating && <Spinner data-icon="inline-start" />}
            </Button>
          </div>
        </form>

        <div className="max-h-[45vh] overflow-y-auto">
          {isPending && (
            <p className="py-4 text-muted-foreground">
              {t("comments.loading")}
            </p>
          )}

          {isError && (
            <p className="py-4 text-muted-foreground">{t("comments.error")}</p>
          )}

          {!isPending && !isError && comments.length === 0 && (
            <p className="py-4 text-muted-foreground">{t("comments.empty")}</p>
          )}

          {!isPending &&
            !isError &&
            comments.map((comment) => {
              const isOwn = currentUser?.id === comment.authorId;
              const isEdited = comment.updatedAt !== comment.createdAt;

              return (
                <div
                  key={comment.id}
                  className="space-y-2 border-b py-3 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {comment.author.name} ({comment.author.email})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format.dateTime(new Date(comment.createdAt), {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                        {isEdited && (
                          <span className="ml-2">{t("comments.edited")}</span>
                        )}
                      </p>
                    </div>

                    {isOwn && editingId !== comment.id && (
                      <div className="inline-flex shrink-0 items-center gap-0.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t("comments.edit.action")}
                          onClick={() => startEditing(comment)}
                        >
                          <Pencil aria-hidden />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={t("comments.remove.action")}
                          onClick={() => setDeletedComment(comment)}
                        >
                          <Trash2 aria-hidden />
                        </Button>
                      </div>
                    )}
                  </div>

                  {editingId === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        rows={3}
                        value={editingBody}
                        aria-label={t("comments.edit.placeholder")}
                        disabled={isUpdating}
                        onChange={(event) => setEditingBody(event.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isUpdating}
                          onClick={cancelEditing}
                        >
                          {t("comments.edit.cancel")}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={
                            isUpdating || editingBody.trim().length === 0
                          }
                          onClick={() => onUpdate(comment.id)}
                        >
                          {t("comments.edit.save")}
                          {isUpdating && <Spinner data-icon="inline-start" />}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap wrap-break-word">
                      {comment.body}
                    </p>
                  )}
                </div>
              );
            })}
        </div>

        {meta && totalPages > 1 && (
          <Pagination aria-label={t("comments.pagination.label")}>
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

        {deletedComment !== null && (
          <DeleteCommentDialog
            commentId={deletedComment.id}
            issueId={issue.id}
            open
            onOpenChange={(nextOpen) => {
              if (!nextOpen) {
                setDeletedComment(null);
              }
            }}
            onCommentDeleted={() => {
              // Si se borró el último comentario de la página, vuelve a la
              // anterior.
              if (comments.length === 1 && page > 1) {
                setPage(page - 1);
              }
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
