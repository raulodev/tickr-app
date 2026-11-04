import { LanguageSwitcher } from "@/components/language-switcher/language-switcher";
import { getLocale } from "next-intl/server";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body className="flex min-h-screen flex-col">
        <div className="flex justify-end px-4 pt-4">
          <LanguageSwitcher />
        </div>
        <main className="flex flex-1 items-center justify-center px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
