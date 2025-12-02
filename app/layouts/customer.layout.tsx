import { Globe, Menu, User } from "lucide-react";
import React, { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
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
import { syncI18nWithStore } from "~/lib/i18n/sync-store";

const CustomerLayout: React.FC = () => {
  const isMobile = useIsMobile();
  const { i18n } = useTranslation();
  const { userLanguage, setUserLanguage } = useChatTranslationStore();
  const location = useLocation();

  // Sync i18n with chat translation store
  useEffect(() => {
    const unsubscribe = syncI18nWithStore();
    return () => unsubscribe();
  }, []);

  const currentLanguage =
    SUPPORTED_LANGUAGES.find((lang) => lang.code === userLanguage) ||
    SUPPORTED_LANGUAGES[0];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setUserLanguage(langCode);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-background w-full relative">
      {!isMobile && (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            {/* Brand / Logo */}
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar>
                <AvatarFallback className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                  N
                </AvatarFallback>
              </Avatar>
              <span className="font-bold text-lg tracking-tight">NOVA</span>
            </div>

            {/* Desktop Navigation */}
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                {CUSTOMER_NAVS.map((nav) => (
                  <NavigationMenuItem key={nav.name}>
                    <NavigationMenuLink
                      asChild
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "bg-transparent hover:bg-accent hover:text-accent-foreground transition-all",
                        isActive(nav.href) &&
                          "bg-accent/50 text-primary font-medium"
                      )}
                    >
                      <Link to={nav.href}>{nav.name}</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Actions: Language & User */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="text-xs font-medium">
                      {currentLanguage.label}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[150px]">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={cn(
                        "justify-between",
                        userLanguage === lang.code &&
                          "bg-accent text-accent-foreground"
                      )}
                    >
                      <span>{lang.label}</span>
                      <span className="text-lg leading-none">{lang.flag}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Optional: User Profile Trigger */}
              <Button variant="outline" size="icon" className="rounded-full">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
      )}

      {/* --- MAIN CONTENT --- */}
      {/* Flex-1 ensures it pushes the footer down */}
      <main className="flex-1 w-full relative flex flex-col">
        <Outlet />
      </main>

      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-lg pb-safe-area">
          <div className="flex h-16 items-center justify-around px-2">
            {CUSTOMER_NAVS.map((nav) => {
              const active = isActive(nav.href);
              return (
                <Link
                  key={nav.name}
                  to={nav.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 w-full h-full rounded-md transition-colors",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {/* Replace <Menu /> with nav.icon if available */}
                  <Menu className={cn("h-5 w-5", active && "fill-current")} />
                  <span className="text-[10px] font-medium">{nav.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};

export default CustomerLayout;
