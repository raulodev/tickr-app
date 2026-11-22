export { cn } from "cn";
import { ApiErrorResponseDto } from "@/generated/api/model";

export function getAvatarFallback(name: string): string {
  if (!name) return "";

  const words = name.trim().split(/\s+/);
  const firstWord = words[0] ?? "";

  return words.length === 1
    ? firstWord.charAt(0).toUpperCase()
    : `${firstWord.charAt(0)}${words.at(-1)?.charAt(0) ?? ""}`.toUpperCase();
}

interface ValidationError {
  constraints?: Record<string, string>;
}

/**
 * El backend responde `message` como string, como array de strings o como
 * array de errores de validación de class-validator con `constraints`.
 */
function extractMessage(message: unknown): string {
  if (typeof message === "string") return message.trim();
  if (!Array.isArray(message)) return "";

  const messages = message.flatMap((item): string[] => {
    if (typeof item === "string") return [item];

    if (item && typeof item === "object") {
      const constraints = (item as ValidationError).constraints;

      if (constraints && typeof constraints === "object") {
        return Object.values(constraints).filter(
          (text): text is string => typeof text === "string" && text.length > 0,
        );
      }
    }

    return [];
  });

  return [...new Set(messages.map((text) => text.trim()))]
    .filter(Boolean)
    .join(". ");
}

export function getMessageError(
  apiError: ApiErrorResponseDto | undefined,
  fallback = "",
): string {
  return extractMessage(apiError?.message) || fallback;
}

export function getPageItems(
  page: number,
  totalPages: number,
): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: (number | "ellipsis")[] = [1];

  if (page > 3) {
    items.push("ellipsis");
  }

  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  for (let number = start; number <= end; number++) {
    items.push(number);
  }

  if (page < totalPages - 2) {
    items.push("ellipsis");
  }

  items.push(totalPages);

  return items;
}
