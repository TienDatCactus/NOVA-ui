import {
  CloudFog,
  Leaf,
  Map,
  Search,
  TreePalm,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import Image from "~/components/ui/image";
import sapaBg from "~/assets/img/pexels-pixabay-235925.jpg"; // Đảm bảo đường dẫn đúng

import MenuCard from "./components/menu-card";
import ServiceCard from "./components/service-card";
import {
  useCustomerMenuList,
  useCustomerServices,
} from "./container/query.hooks";
import type { Route } from "./+types/catalog";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dịch Vụ - NOVA Hotel" },
    { name: "description", content: "Danh sách dịch vụ và thực đơn" },
  ];
}

// --- Custom Hook: Debounce ---
// Giúp tối ưu hiệu năng khi search, tránh filter liên tục mỗi khi gõ phím
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function CustomerGuidesPage({}: Route.ComponentProps) {
  const { t } = useTranslation("catalog");
  const [searchQuery, setSearchQuery] = useState("");
  // Áp dụng debounce cho search query (300ms)
  const debouncedSearch = useDebounce(searchQuery, 300);

  // --- Data Fetching ---
  const { data: menuItems, isPending: isLoadingMenu } = useCustomerMenuList();
  const { data: services, isPending: isLoadingServices } =
    useCustomerServices();

  // --- Filtering Logic (Sử dụng debounced value) ---
  const filteredMenuItems = useMemo(() => {
    if (!menuItems) return [];
    const lowerQuery = debouncedSearch.toLowerCase();
    return menuItems.filter(
      (item) => item.active && item.name.toLowerCase().includes(lowerQuery)
    );
  }, [menuItems, debouncedSearch]);

  const filteredServices = useMemo(() => {
    if (!services) return [];
    const lowerQuery = debouncedSearch.toLowerCase();
    return services.filter(
      (service) =>
        service.active && service.name.toLowerCase().includes(lowerQuery)
    );
  }, [services, debouncedSearch]);

  return (
    <div className="min-h-screen bg-background selection:bg-emerald-200 selection:text-emerald-900 font-sans">
      {/* === HERO SECTION === */}
      <div className="relative pt-24 pb-28 md:pt-32 md:pb-40 overflow-hidden">
        {/* Background Parallax Layer */}
        <div className="absolute inset-0 z-0">
          <Image
            src={sapaBg}
            alt="Misty Sapa Landscape"
            className="w-full h-full object-cover filter brightness-[0.75] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/30 via-transparent to-background/70" />
        </div>

        <div className="container relative z-10 mx-auto px-4 flex flex-col items-center text-center max-w-3xl space-y-8">
          {/* Badge */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/90 border border-emerald-50 dark:border-emerald-700 text-sm font-medium text-emerald-800 dark:text-emerald-200 shadow-sm backdrop-blur-md">
              <TreePalm className="w-3.5 h-3.5" />
              {t("subtitle")}
            </span>
          </div>

          {/* Titles */}
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-white drop-shadow-md">
              {t("title")}
            </h1>
            <p className="text-white text-lg md:text-xl leading-relaxed max-w-2xl mx-auto flex items-center justify-center gap-2 font-light">
              <CloudFog className="w-5 h-5 text-muted-foreground" />
              {t("description")}
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-300 dark:from-emerald-700 to-teal-300 dark:to-teal-700 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500" />

              <div className="relative bg-background/90 backdrop-blur-xl rounded-full shadow-2xl flex items-center p-1.5 transition-all ring-1 ring-black/5 focus-within:ring-4 focus-within:ring-emerald-500/20">
                <div className="pl-4 text-stone-400">
                  <Search className="h-5 w-5" />
                </div>
                <Input
                  placeholder={t("search.placeholder")}
                  className="h-12 border-0 bg-transparent focus-visible:ring-0 px-4 text-base placeholder:text-stone-400 text-emerald-950 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-2 mr-1 text-stone-400 hover:text-red-500 hover:bg-stone-100 rounded-full transition-all"
                    aria-label="Clear search"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === CONTENT SECTION === */}
      <div className="container mx-auto px-4 relative z-10 -mt-12 pb-20">
        <Tabs defaultValue="menu" className="w-full space-y-8">
          {/* Sticky Tab Navigation */}
          <div className="flex justify-center sticky top-6 z-40">
            <TabsList className="h-16 p-2 bg-background/80 backdrop-blur-xl border border-white/50 shadow-xl shadow-stone-500/10 rounded-full inline-flex items-center gap-2 ring-1 ring-black/5">
              <NatureTabTrigger
                value="menu"
                icon={UtensilsCrossed}
                label={t("tabs.food")}
                count={menuItems?.length}
              />
              <NatureTabTrigger
                value="services"
                icon={Map}
                label={t("tabs.service")}
                count={services?.length}
              />
            </TabsList>
          </div>

          <div className="min-h-[500px]">
            <TabsContent value="menu" className="focus-visible:outline-none">
              <ContentGrid
                isLoading={isLoadingMenu}
                isEmpty={filteredMenuItems.length === 0}
                type="menu"
                isSearching={!!searchQuery}
                onClear={() => setSearchQuery("")}
              >
                {filteredMenuItems.map((item) => (
                  <MenuCard key={item.itemId} item={item} />
                ))}
              </ContentGrid>
            </TabsContent>

            <TabsContent
              value="services"
              className="focus-visible:outline-none"
            >
              <ContentGrid
                isLoading={isLoadingServices}
                isEmpty={filteredServices.length === 0}
                type="service"
                isSearching={!!searchQuery}
                onClear={() => setSearchQuery("")}
              >
                {filteredServices.map((service) => (
                  <ServiceCard key={service.serviceItemId} service={service} />
                ))}
              </ContentGrid>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS (Clean & Reusable) ---

// Wrapper để xử lý các trạng thái Loading/Empty/List đồng nhất
function ContentGrid({
  isLoading,
  isEmpty,
  children,
  type,
  isSearching,
  onClear,
}: {
  isLoading: boolean;
  isEmpty: boolean;
  children: React.ReactNode;
  type: "menu" | "service";
  isSearching: boolean;
  onClear: () => void;
}) {
  if (isLoading) return <LoadingNature />;
  if (isEmpty)
    return (
      <EmptyState type={type} isSearching={isSearching} onClear={onClear} />
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
      {children}
    </div>
  );
}

function NatureTabTrigger({ value, icon: Icon, label, count = 0 }: any) {
  return (
    <TabsTrigger
      value={value}
      className="rounded-full px-6 h-full text-base font-medium text-muted-foreground 
      data-[state=active]:bg-emerald-800 dark:data-[state=active]:bg-emerald-700 data-[state=active]:text-background data-[state=active]:shadow-lg
      hover:text-emerald-800 dark:hover:text-emerald-300 transition-all duration-300 gap-2"
    >
      <Icon className="h-4 w-4" />
      {label}
      {count > 0 && (
        <Badge
          variant="secondary"
          className="ml-1 bg-stone-100 text-stone-600 
          data-[state=active]:bg-background/20 data-[state=active]:text-white
          border-0 h-5 px-1.5 min-w-[1.25rem] hidden sm:inline-flex items-center justify-center pointer-events-none transition-colors"
        >
          {count}
        </Badge>
      )}
    </TabsTrigger>
  );
}

function LoadingNature() {
  const { t } = useTranslation("catalog");
  return (
    <div className="flex flex-col items-center justify-center py-32 text-muted-foreground ">
      <div className="relative">
        <div className="absolute inset-0 bg-emerald-200/40 dark:bg-emerald-700/40 rounded-full blur-xl animate-pulse"></div>
        <CloudFog className="relative h-14 w-14 animate-bounce  text-emerald-600/70 dark:text-emerald-300/70 duration-[3000ms]" />
      </div>
      <p className="mt-6 text-sm font-medium tracking-wide text-emerald-800/60 dark:text-emerald-300/60 uppercase">
        {t("loading")}...
      </p>
    </div>
  );
}

function EmptyState({
  type,
  isSearching,
  onClear,
}: {
  type: "menu" | "service";
  isSearching: boolean;
  onClear: () => void;
}) {
  const { t } = useTranslation("catalog");
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center border border-dashed border-emerald-900/10 dark:border-emerald-700/20 rounded-3xl bg-background/40 backdrop-blur-sm">
      <div className="w-20 h-20 bg-background/80 rounded-full flex items-center justify-center mb-6 shadow-sm border border-accent">
        {type === "menu" ? (
          <UtensilsCrossed className="h-9 w-9 text-emerald-800/40 dark:text-emerald-400" />
        ) : (
          <Leaf className="h-9 w-9 text-emerald-800/40 dark:text-emerald-400" />
        )}
      </div>
      <h3 className="text-xl font-serif font-bold text-emerald-950 dark:text-emerald-100">
        {isSearching ? t("empty.searching.title") : t("empty.noItems.title")}
      </h3>
      <p className="text-muted-foreground max-w-sm mx-auto mt-2 mb-8 leading-relaxed font-light">
        {isSearching
          ? t("empty.searching.description")
          : t("empty.noItems.description")}
      </p>
      {isSearching && (
        <Button
          onClick={onClear}
          className="rounded-full px-8 bg-emerald-800 dark:bg-emerald-300 text-accent-foreground hover:bg-emerald-900 dark:hover:bg-emerald-400 shadow-lg shadow-emerald-900/10 transition-all"
        >
          {t("empty.clearButton")}
        </Button>
      )}
    </div>
  );
}
