"use client";

import { useState } from "react";
import { Crown, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useTenantControllerListMembers,
  useAuthControllerMe,
} from "@/generated/api";
import { Role, TenantMemberResponseDto } from "@/generated/api/model";
import { getAvatarFallback } from "@/lib/utils";
import { DeleteTenantMemberDialog } from "./delete-tenant-member-dialog";
import { TenantMemberDialog } from "./tenant-member-dialog";

function roleWeight(role: TenantMemberResponseDto["role"]): number {
  return role === Role.ADMIN ? 0 : 1;
}

export function ListMembers() {
  const t = useTranslations("tenant.members");
  const {
    data: members,
    isPending,
    isError,
    refetch,
  } = useTenantControllerListMembers();
  const { data: me } = useAuthControllerMe();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editedMember, setEditedMember] =
    useState<TenantMemberResponseDto | null>(null);

  const sortedMembers = [...(members ?? [])].sort(
    (a, b) => roleWeight(a.role) - roleWeight(b.role),
  );

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("name")}</TableHead>
            <TableHead>{t("email")}</TableHead>
            <TableHead>{t("role")}</TableHead>
            <TableHead className="w-0 text-right">
              <span className="sr-only">{t("actions")}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending && (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground">
                {t("loading")}
              </TableCell>
            </TableRow>
          )}

          {isError && (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground">
                {t("error")}
              </TableCell>
            </TableRow>
          )}

          {!isPending && !isError && sortedMembers.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground">
                {t("empty")}
              </TableCell>
            </TableRow>
          )}

          {sortedMembers.map((member) => {
            const isAdmin = member.role === Role.ADMIN;
            const displayName = member.name ?? member.email;

            return (
              <TableRow key={member.userId}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar size="sm">
                      <AvatarFallback>
                        {getAvatarFallback(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{displayName}</span>
                    {isAdmin && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                        <Crown className="size-3.5" aria-hidden />
                        {t("ADMIN")}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {member.email}
                </TableCell>
                <TableCell>
                  {isAdmin ? (
                    <span className="font-medium">{t("ADMIN")}</span>
                  ) : (
                    <span className="text-muted-foreground">{t("MEMBER")}</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("edit.title")}
                      onClick={() => setEditedMember(member)}
                    >
                      <Pencil aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t("remove.title")}
                      onClick={() => setSelectedUserId(member.userId)}
                      disabled={member.userId === me?.sub}
                    >
                      <Trash2 className="text-destructive" aria-hidden />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {selectedUserId && (
        <DeleteTenantMemberDialog
          open
          userId={selectedUserId}
          onOpenChange={(open) => {
            if (!open) setSelectedUserId(null);
          }}
          onTenantMemberDeleted={() => refetch()}
        />
      )}

      {editedMember && (
        <TenantMemberDialog
          open
          member={editedMember}
          onOpenChange={(open) => {
            if (!open) setEditedMember(null);
          }}
          onTenantMemberUpdated={() => refetch()}
        />
      )}
    </>
  );
}
