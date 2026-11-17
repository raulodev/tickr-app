export { cn } from "cn";

export function getAvatarFallback(name: string): string {
  if (!name) return "";

  const words = name.trim().split(/\s+/);
  const firstWord = words[0] ?? "";

  return words.length === 1
    ? firstWord.charAt(0).toUpperCase()
    : `${firstWord.charAt(0)}${words.at(-1)?.charAt(0) ?? ""}`.toUpperCase();
}
