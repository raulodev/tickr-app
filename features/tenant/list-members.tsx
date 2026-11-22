"use client";

import { Crown } from "lucide-react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTenantControllerListMembers } from "@/generated/api";
import { Role, TenantMemberResponseDto } from "@/generated/api/model";
import { getAvatarFallback } from "@/lib/utils";

function roleWeight(role: TenantMemberResponseDto["role"]): number {
  return role === Role.ADMIN ? 0 : 1;
}

export function ListMembers() {
  const t = useTranslations("tenant.members");
  const { data: members, isPending, isError } = useTenantControllerListMembers();

  const sortedMembers = [...(members ?? [])].sort(
    (a, b) => roleWeight(a.role) - roleWeight(b.role),
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("name")}</TableHead>
          <TableHead>{t("email")}</TableHead>
          <TableHead>{t("role")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isPending && (
          <TableRow>
            <TableCell colSpan={3} className="text-muted-foreground">
              {t("loading")}
            </TableCell>
          </TableRow>
        )}

        {isError && (
          <TableRow>
            <TableCell colSpan={3} className="text-muted-foreground">
              {t("error")}
            </TableCell>
          </TableRow>
        )}

        {!isPending && !isError && sortedMembers.length === 0 && (
          <TableRow>
            <TableCell colSpan={3} className="text-muted-foreground">
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
                    <AvatarFallback>{getAvatarFallback(displayName)}</AvatarFallback>
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
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
