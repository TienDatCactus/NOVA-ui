import { Globe } from "lucide-react";
import React from "react";
import { Link, Outlet, useLocation } from "react-router";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";
import { useIsMobile } from "~/hooks/use-mobile";
import { CUSTOMER_NAVS, SUPPORTED_LANGUAGES } from "~/lib/constants";
import { cn } from "~/lib/utils";
import { useChatTranslationStore } from "~/store/chat-translation.store";
const CustomerLayout: React.FC = () => {
  const isMobile = useIsMobile();
  const { userLanguage, setUserLanguage } = useChatTranslationStore();
  const curPath = useLocation().pathname;
  const currentLanguage =
    SUPPORTED_LANGUAGES.find((lang) => lang.code === userLanguage) ||
    SUPPORTED_LANGUAGES[0];

  return (
    <div
      className="h-dvh flex flex-col relative w-full"
      suppressHydrationWarning
    >
      <header
        className={cn(
          "h-12 p-4 border-b shadow-sm flex items-center justify-between shrink-0 bg-background z-10",
          {
            hidden: isMobile,
          }
        )}
        suppressHydrationWarning
      >
        <h1 className="font-bold text-lg uppercase">NOVA</h1>
        <div>
          <NavigationMenu viewport={false}>
            <NavigationMenuList>
              {CUSTOMER_NAVS.map((nav) => (
                <NavigationMenuItem key={nav.name}>
                  <NavigationMenuLink
                    asChild
                    className={cn(navigationMenuTriggerStyle())}
                    active={curPath.includes(nav.href)}
                  >
                    <Link to={nav.href}>{nav.name}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <Globe className="h-4 w-4 mr-2" />
                {currentLanguage.flag} {currentLanguage.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setUserLanguage(lang.code)}
                  className={cn(userLanguage === lang.code && "bg-muted")}
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main
        className="flex-1 flex flex-col overflow-hidden bg-white relative w-full"
        suppressHydrationWarning
      >
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;
