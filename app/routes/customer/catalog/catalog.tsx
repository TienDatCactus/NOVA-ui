import {
  CloudFog, // Represents Sapa's mist
  Leaf,
  Map, // Represents Fansipan/TreePalms
  Search, // Represents exploration/trekking
  TreePalm,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import type { Route } from "./+types/catalog";
import MenuCard from "./components/menu-card";
import ServiceCard from "./components/service-card";
import {
  useCustomerMenuList,
  useCustomerServices,
} from "./container/query.hooks";

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
    // Base: A soft, misty stone color
    <div className="min-h-screen bg-stone-50/80 relative flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* === BACKGROUND LAYERS (Terraces & Mist) === */}

      {/* === HERO HEADER === */}
      <div className="relative pt-20 pb-24 md:pt-28 md:pb-36">
        <div className="container mx-auto px-4 flex flex-col items-center text-center max-w-3xl space-y-8">
          {/* Badge: Styled like natural fabric or a leaf */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/50 border border-emerald-200 text-sm font-medium text-emerald-800 shadow-sm backdrop-blur-sm">
              <TreePalm className="w-3.5 h-3.5" />
              {t("subtitle")}
            </span>
          </div>

          {/* Titles */}
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-emerald-950 drop-shadow-sm">
              {t("title")}
            </h1>
            <p className="text-stone-600 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto flex items-center justify-center gap-2">
              <CloudFog className="w-5 h-5 text-stone-400" />
              {t("description")}
            </p>
          </div>

          {/* Search Bar: Floating in the mist */}
          <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="relative group">
              {/* Soft Green Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-200/50 to-teal-200/50 rounded-full blur opacity-40 group-hover:opacity-60 transition duration-500"></div>

              <div className="relative bg-white/70 backdrop-blur-xl rounded-full shadow-lg border border-white/50 flex items-center p-1.5 transition-all ring-1 ring-stone-900/5 focus-within:ring-2 focus-within:ring-emerald-500/30">
                <div className="pl-4 text-emerald-700/60">
                  <Search className="h-5 w-5" />
                </div>
                <Input
                  placeholder={t("search.placeholder")}
                  className="h-11 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-3 text-base placeholder:text-stone-400 text-emerald-950 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="p-2 mr-1 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-all"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === MAIN CONTENT === */}
      <div className="flex-1 container mx-auto px-4 relative z-10 -mt-12 mb-20">
        <Tabs defaultValue="menu" className="w-full space-y-10">
          {/* Tabs Navigation: Stone pill on glass */}
          <div className="flex justify-center sticky top-6 z-30">
            <TabsList className="h-14 p-1.5 bg-white/60 backdrop-blur-md border border-white/40 shadow-xl shadow-stone-500/5 rounded-full inline-flex items-center gap-1 ring-1 ring-stone-900/5">
              <NatureTabTrigger
                value="menu"
                icon={UtensilsCrossed}
                label={t("tabs.food")}
                count={menuItems?.length}
              />
              <NatureTabTrigger
                value="services"
                icon={Map} // Changed icon to Map for "Services/Treks" feel
                label={t("tabs.service")}
                count={services?.length}
              />
            </TabsList>
          </div>

          <div className="min-h-[400px]">
            {/* --- MENU TAB --- */}
            <TabsContent
              value="menu"
              className="space-y-6 focus-visible:outline-none animate-in fade-in zoom-in-95 duration-500"
            >
              {isLoadingMenu ? (
                <LoadingNature />
              ) : filteredMenuItems.length === 0 ? (
                <EmptyState
                  type="menu"
                  isSearching={!!searchQuery}
                  onClear={clearSearch}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
                  {filteredMenuItems.map((item) => (
                    <MenuCard key={item.itemId} item={item} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* --- SERVICES TAB --- */}
            <TabsContent
              value="services"
              className="space-y-6 focus-visible:outline-none animate-in fade-in zoom-in-95 duration-500"
            >
              {isLoadingServices ? (
                <LoadingNature />
              ) : filteredServices.length === 0 ? (
                <EmptyState
                  type="service"
                  isSearching={!!searchQuery}
                  onClear={clearSearch}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
                  {filteredServices.map((service) => (
                    <ServiceCard
                      key={service.serviceItemId}
                      service={service}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

// --- Nature Themed Sub-Components ---

function NatureTabTrigger({ value, icon: Icon, label, count = 0 }: any) {
  return (
    <TabsTrigger
      value={value}
      className="rounded-full px-6 h-full text-base font-medium 
      text-stone-500 
      data-[state=active]:bg-emerald-700 data-[state=active]:text-white data-[state=active]:shadow-md
      hover:text-emerald-800 transition-all duration-300"
    >
      <Icon className="h-4 w-4 mr-2.5" />
      {label}
      {count > 0 && (
        <Badge
          variant="secondary"
          className="ml-2.5 bg-stone-200/50 text-stone-600 
          data-[state=active]:bg-white/20 data-[state=active]:text-white
          border-0 h-5 px-1.5 min-w-[1.25rem] hidden sm:inline-flex items-center justify-center pointer-events-none"
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
    <div className="flex flex-col items-center justify-center py-24 text-stone-400">
      <div className="relative">
        <div className="absolute inset-0 bg-emerald-200/40 rounded-full blur-xl animate-pulse"></div>
        {/* CloudFog icon mimics the Sapa weather */}
        <CloudFog className="relative h-12 w-12 animate-bounce text-emerald-600/70 duration-[2000ms]" />
      </div>
      <p className="mt-6 text-sm font-medium tracking-wide text-emerald-800/60">
        {t("loading")}
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
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-emerald-900/10 rounded-3xl bg-white/30 backdrop-blur-sm">
      <div className="w-20 h-20 bg-white/60 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-100">
        {type === "menu" ? (
          <UtensilsCrossed className="h-8 w-8 text-emerald-800/40" />
        ) : (
          <Leaf className="h-8 w-8 text-emerald-800/40" />
        )}
      </div>
      <h3 className="text-xl font-serif font-bold text-emerald-950">
        {isSearching ? t("empty.searching.title") : t("empty.noItems.title")}
      </h3>
      <p className="text-stone-500 max-w-sm mx-auto mt-2 mb-8 leading-relaxed">
        {isSearching
          ? t("empty.searching.description")
          : t("empty.noItems.description")}
      </p>
      {isSearching && (
        <Button
          variant="outline"
          onClick={onClear}
          className="rounded-full px-8 border-emerald-200 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
        >
          {t("empty.clearButton")}
        </Button>
      )}
    </div>
  );
}
