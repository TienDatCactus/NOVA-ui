import { Globe, TreePalm, User } from "lucide-react";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, Outlet, useLocation } from "react-router";
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
import { ModeToggle } from "~/features/theme/toggler";
import { useIsMobile } from "~/hooks/use-mobile";
import { AuthLoader, UserRole } from "~/lib/auth/auth.loader";
import { hasAllRoles } from "~/lib/auth/bouncer";
import { CUSTOMER_NAVS, SUPPORTED_LANGUAGES } from "~/lib/constants";
import { AUTH, DASHBOARD } from "~/lib/fe-url";
import { syncI18nWithStore } from "~/lib/i18n/sync-store";
import { cn } from "~/lib/utils";
import { useChatTranslationStore } from "~/store/chat-translation.store";

const CustomerLayout: React.FC = () => {
  const isMobile = useIsMobile();
  const { i18n, t } = useTranslation("common");
  const { userLanguage, setUserLanguage } = useChatTranslationStore();
  const location = useLocation();

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
    <div className="min-h-screen flex flex-col w-full relative font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {!isMobile && (
        <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-sidebar backdrop-blur-xl supports-[backdrop-filter]:bg-background/40 shadow-sm shadow-stone-900/5">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2 cursor-pointer group">
              <Avatar className="transition-transform group-hover:scale-105">
                <AvatarFallback className=" bg-emerald-700 rounded-xl flex items-center justify-center text-white font-serif font-bold shadow-md shadow-emerald-900/10">
                  <TreePalm className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <span className="font-serif font-bold text-xl tracking-tight text-foreground group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
                Eco Palm Sapa
              </span>
            </div>

            {/* Desktop Navigation */}
            <NavigationMenu>
              <NavigationMenuList className="gap-2">
                {CUSTOMER_NAVS.map((nav) => (
                  <NavigationMenuItem key={nav.name}>
                    <NavigationMenuLink
                      asChild
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "bg-transparent h-9 px-4 rounded-full transition-all duration-300",
                        isActive(nav.href)
                          ? "bg-emerald-100/50 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 font-medium shadow-sm"
                          : "text-muted-foreground hover:bg-background/50 hover:text-emerald-700 dark:hover:text-emerald-300"
                      )}
                    >
                      <Link to={nav.href}>{t(nav.name)}</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Actions: Language & User */}
            <div className="flex items-center gap-3">
              <ModeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-muted-foreground hover:text-emerald-800 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/50 dark:hover:text-emerald-200 rounded-full px-3 transition-all"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="text-xs font-medium">
                      {currentLanguage.label}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[150px] bg-background/90 border-background/40 shadow-lg shadow-stone-500/10"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={cn(
                        "justify-between cursor-pointer focus:bg-emerald-50 focus:text-emerald-800",
                        userLanguage === lang.code &&
                          "bg-emerald-50 text-emerald-800 font-medium"
                      )}
                    >
                      <span>{lang.label}</span>
                      <span className="text-lg leading-none opacity-80">
                        {lang.flag}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Profile Trigger */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full border-stone-200 bg-background/50 hover:bg-background hover:text-emerald-700  dark:hover:text-emerald-200 dark:hover:bg-emerald-900/50 dark:hover:border-emerald-200 shadow-sm transition-all"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                {!!AuthLoader.getUser() ? (
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      asChild
                      className="focus:bg-emerald-50 focus:text-emerald-800 cursor-pointer"
                    >
                      <Link to={DASHBOARD.fall}>Truy cập trang quản lý</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                ) : (
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      asChild
                      className="focus:bg-emerald-50 focus:text-emerald-800 cursor-pointer"
                    >
                      <Link to={AUTH.login}>Đăng nhập</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                )}
              </DropdownMenu>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 w-full relative flex flex-col z-10">
        <Outlet />
      </main>

      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/20 bg-background/80 backdrop-blur-xl pb-safe-area shadow-md">
          <div className="flex h-16 items-center justify-around px-2">
            {CUSTOMER_NAVS.map((nav) => {
              const active = isActive(nav.href);
              return (
                <Link
                  key={nav.name}
                  to={nav.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 w-full h-full rounded-xl transition-all duration-300",
                    active
                      ? "text-emerald-700 scale-105"
                      : "text-stone-400 hover:text-stone-600"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0 w-8 h-1 rounded-b-full transition-all duration-300 bg-emerald-500 shadow-emerald-200 shadow-sm",
                      active ? "opacity-100" : "opacity-0"
                    )}
                  />

                  {/* Icon */}
                  <div
                    className={cn(
                      "p-1.5 rounded-full transition-colors",
                      active ? "bg-emerald-100/50" : "bg-transparent"
                    )}
                  >
                    <nav.icon
                      className={cn(
                        "h-5 w-5",
                        active && "fill-emerald-700/20 stroke-emerald-700"
                      )}
                    />
                  </div>

                  <span
                    className={cn(
                      "text-[10px] font-medium transition-colors",
                      active ? "text-emerald-800" : "text-stone-500"
                    )}
                  >
                    {t(nav.name)}
                  </span>
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
