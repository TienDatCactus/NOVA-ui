import {
  Loader2,
  Search,
  Sparkles,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import { cn } from "~/lib/utils";
import {
  useCustomerMenuList,
  useCustomerServices,
} from "./container/query.hooks";
import MenuCard from "./components/menu-card";
import ServiceCard from "./components/service-card";
import type { Route } from "./+types/catalog";

export default function CustomerGuidesPage({}: Route.ComponentProps) {
  const { t } = useTranslation("catalog");
  const [searchQuery, setSearchQuery] = useState("");

  // --- Data Fetching ---
  const { data: menuItems, isPending: isLoadingMenu } = useCustomerMenuList();
  const { data: services, isPending: isLoadingServices } =
    useCustomerServices();

  // --- Filtering Logic ---
  const filteredMenuItems = useMemo(() => {
    if (!menuItems) return [];
    return menuItems.filter(
      (item) =>
        item.active &&
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [menuItems, searchQuery]);

  const filteredServices = useMemo(() => {
    if (!services) return [];
    return services.filter(
      (service) =>
        service.active &&
        service.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [services, searchQuery]);

  const clearSearch = () => setSearchQuery("");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* === HERO HEADER === */}
      {/* UX: Using a gradient/image background makes it feel more like a 'Guide' than a 'List' */}
      <div className="relative bg-primary/5 pb-12 pt-12 md:pt-20 border-b">
        <div className="container mx-auto px-4 space-y-6 text-center max-w-2xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background border shadow-sm text-xs font-medium text-primary mb-2">
              <Sparkles className="w-3 h-3" />
              {t("subtitle")}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              {t("title")}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

          {/* Search Bar (Floating) */}
          <div className="relative max-w-lg mx-auto shadow-lg rounded-full">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Search className="h-5 w-5" />
            </div>
            <Input
              placeholder={t("search.placeholder")}
              className="h-12 pl-12 pr-10 rounded-full border-transparent bg-background focus-visible:ring-2 focus-visible:ring-primary/20 text-base shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* === MAIN CONTENT === */}
      <div className="flex-1 container mx-auto px-4 -mt-8 mb-12 relative z-10">
        <Tabs defaultValue="menu" className="w-full space-y-8">
          {/* Tabs List (Floating Pill Style) */}
          <div className="flex justify-center">
            <TabsList className="h-12 p-1 bg-background/80 backdrop-blur-md border shadow-md rounded-full inline-flex">
              <TabsTrigger
                value="menu"
                className="rounded-full px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <UtensilsCrossed className="h-4 w-4 mr-2" />
                {t("tabs.food")}
                <Badge
                  variant="secondary"
                  className="ml-2 bg-white/20 text-current border-0 hidden sm:inline-flex"
                >
                  {menuItems?.length || 0}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="services"
                className="rounded-full px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {t("tabs.service")}
                <Badge
                  variant="secondary"
                  className="ml-2 bg-white/20 text-current border-0 hidden sm:inline-flex"
                >
                  {services?.length || 0}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* --- MENU TAB --- */}
          <TabsContent
            value="menu"
            className="space-y-6 focus-visible:outline-none"
          >
            {isLoadingMenu ? (
              <LoadingGrid />
            ) : filteredMenuItems.length === 0 ? (
              <EmptyState
                type="menu"
                isSearching={!!searchQuery}
                onClear={clearSearch}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMenuItems.map((item) => (
                  <MenuCard key={item.itemId} item={item} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* --- SERVICES TAB --- */}
          <TabsContent
            value="services"
            className="space-y-6 focus-visible:outline-none"
          >
            {isLoadingServices ? (
              <LoadingGrid />
            ) : filteredServices.length === 0 ? (
              <EmptyState
                type="service"
                isSearching={!!searchQuery}
                onClear={clearSearch}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredServices.map((service) => (
                  <ServiceCard key={service.serviceItemId} service={service} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// --- Sub-Components for cleaner code ---

function LoadingGrid() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-pulse">
      <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary/50" />
      <p>Đang tải trải nghiệm tuyệt vời...</p>
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
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-muted/30 rounded-2xl border-2 border-dashed border-muted">
      <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4 shadow-sm">
        {type === "menu" ? (
          <UtensilsCrossed className="h-8 w-8 text-muted-foreground/50" />
        ) : (
          <Sparkles className="h-8 w-8 text-muted-foreground/50" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        {isSearching ? "Không tìm thấy kết quả nào" : "Danh sách đang trống"}
      </h3>
      <p className="text-muted-foreground max-w-xs mx-auto mt-2">
        {isSearching
          ? "Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để xem tất cả."
          : "Hiện tại chưa có mục nào được hiển thị ở đây. Vui lòng quay lại sau."}
      </p>
      {isSearching && (
        <Button variant="outline" className="mt-6" onClick={onClear}>
          Xóa tìm kiếm
        </Button>
      )}
    </div>
  );
}
