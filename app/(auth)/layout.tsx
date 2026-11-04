import { LanguageSwitcher } from "@/components/language-switcher/language-switcher";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex justify-end px-4 pt-4">
        <LanguageSwitcher />
      </div>
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        {children}
      </main>
    </div>
  );
}
