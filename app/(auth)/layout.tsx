import { LanguageSwitcher } from "@/components/language-switcher/language-switcher";
import { ModeToggle } from "@/components/mode-toggle";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-col p-4">
      <NavigationMenu className="w-full max-w-none">
        <NavigationMenuList className="gap-2">
          <NavigationMenuItem className="ml-auto">
            <LanguageSwitcher />
          </NavigationMenuItem>
          <NavigationMenuItem>
            <ModeToggle />
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex flex-1 min-h-[80vh] justify-center items-center">
        {children}
      </div>
    </main>
  );
}
