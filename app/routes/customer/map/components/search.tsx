import { Loader2, MapPin, Search } from "lucide-react";
import mapboxgl from "mapbox-gl";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { useTranslation } from "react-i18next";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { useMap } from "../context/map-context";
import { useMapboxSearch } from "../hooks/use-mapbox-search";
import Categories from "./categories";
import { normalizePoiDetail } from "../lib/utils";

interface SearchBoxProps extends React.HTMLAttributes<HTMLDivElement> {}

const SearchBox: React.FC<SearchBoxProps> = ({ className }) => {
  const { t } = useTranslation("map");
  const { mapRef } = useMap();
  const search = useMapboxSearch();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery] = useDebounceValue(query, 500);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Helper to clear existing markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  const normalizeResults = useCallback((items: any[]) => {
    return items.map((item: any) => ({
      mapbox_id: item.mapbox_id || item.id || item.properties?.mapbox_id,
      name:
        item.name ||
        item.properties?.name ||
        item.properties?.place_formatted ||
        "",
      full_address:
        item.full_address ||
        item.properties?.full_address ||
        item.properties?.place_formatted ||
        "",
    }));
  }, []);

  useEffect(() => {
    async function doSearch() {
      if (!debouncedQuery) {
        setResults([]);
        return;
      }

      setLoading(true);
      const data = await search.suggest(debouncedQuery);
      setResults(normalizeResults(data.suggestions || []));
      setLoading(false);
    }

    doSearch();
  }, [debouncedQuery, normalizeResults]);

  // Handle category search
  const handleCategoryClick = useCallback(
    async (categoryKey: string) => {
      setLoading(true);
      setQuery("");
      try {
        const data = await search.searchByResortCategory(categoryKey as any);
        const features = (data?.features || data?.suggestions || []) as any[];

        setResults(normalizeResults(features));

        if (!mapRef.current) return;
        clearMarkers();

        const bounds = new mapboxgl.LngLatBounds();
        let count = 0;

        for (const f of features) {
          const coords =
            f?.geometry?.coordinates || f?.center || f?.coordinates;
          if (!coords || coords.length < 2 || !Array.isArray(coords)) continue;
          const [lng, lat] = coords as [number, number];

          const popup = new mapboxgl.Popup({ offset: 12, closeButton: true });

          const marker = new mapboxgl.Marker({
            anchor: "bottom",
            offset: [0, -2],
          })
            .setLngLat([lng, lat])
            .setPopup(popup)
            .addTo(mapRef.current!);

          markersRef.current.push(marker);
          bounds.extend([lng, lat]);

          count += 1;
          if (count >= 50) break; // cap markers
        }

        if (!bounds.isEmpty()) {
          mapRef.current.fitBounds(bounds, { padding: 60, duration: 800 });
        }
      } catch (error) {
        console.error("Category search failed:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [search, normalizeResults, mapRef, clearMarkers]
  );

  async function handleSelectResult(item: any) {
    clearMarkers();

    const raw = await search.retrieve(item.mapbox_id);
    const detail = normalizePoiDetail(raw);

    if (!detail || !mapRef.current) return;

    // marker đẹp hơn
    const marker = new mapboxgl.Marker({
      color: "#0253c9",
      scale: 1.1,
    })
      .setLngLat(detail.coords)
      .setPopup(
        new mapboxgl.Popup({ offset: 14 }).setHTML(`
          <div style="
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background-color: #ffffff;
              padding: 10px;
              max-width: 280px;
              color: #374151;
          ">
            <div style="margin-bottom: 4px;">
              <h3 style="
                  margin: 0 0 4px 0;
                  font-size: 16px;
                  font-weight: 700;
                  color: #111827;
                  line-height: 1.4;
              ">
                ${detail.name}
              </h3>
              <p style="
                  margin: 0;
                  font-size: 13px;
                  color: #6b7280;
                  line-height: 1.5;
              ">
                ${detail.address}
              </p>
            </div>
        
            ${
              detail.rating || (detail.categories && detail.categories.length)
                ? `
                <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
                  ${
                    detail.rating
                      ? `
                      <div style="display: flex; align-items: center; font-size: 13px; font-weight: 600; color: #1f2937;">
                        <span style="color: #f59e0b; margin-right: 4px;">★</span>
                        ${detail.rating}
                        <span style="font-weight: 400; color: #9ca3af; margin-left: 2px; font-size: 12px;">(${detail.ratingCount})</span>
                      </div>
                      `
                      : ""
                  }
                  
                  ${
                    detail.categories?.length
                      ? `
                      <span style="
                          background-color: #eff6ff;
                          color: #2563eb;
                          font-size: 11px;
                          font-weight: 500;
                          padding: 2px 8px;
                          border-radius: 9999px;
                          text-transform: capitalize;
                      ">
                        ${detail.categories[0]} </span>
                      `
                      : ""
                  }
                </div>
                `
                : ""
            }
        
            <div style="
                border-top: 1px solid #f3f4f6; 
                padding-top: 12px; 
                display: flex; 
                flex-direction: column; 
                gap: 6px;
            ">
              ${
                detail.hours
                  ? `
                  <div style="display: flex; align-items: start; font-size: 13px; color: #4b5563;">
                    <span style="margin-right: 8px; min-width: 16px;">🕒</span>
                    <span>${detail.hours}</span>
                  </div>
                  `
                  : ""
              }
              ${
                detail.website
                  ? `
                  <div style="display: flex; align-items: center; font-size: 13px;">
                    <span style="margin-right: 8px; min-width: 16px;">🌐</span>
                    <a href="${detail.website}" target="_blank" style="color: #2563eb; text-decoration: none; font-weight: 500;">
                      Website
                    </a>
                  </div>
                  `
                  : ""
              }
            </div>
        
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <button 
                onclick="window.open('https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(detail.name)}&query_place_id=${detail.id}', '_blank')"
                style="
                  background: #f3f4f6;
                  color: #374151;
                  border: 1px solid #e5e7eb;
                  padding: 6px 0;
                  border-radius: 6px;
                  font-size: 13px;
                  font-weight: 600;
                  cursor: pointer;
                  width: 100%;
                  transition: background 0.2s;
                "
                onmouseover="this.style.background='#e5e7eb'"
                onmouseout="this.style.background='#f3f4f6'"
              >
                Chi tiết
              </button>
        
              <button 
                onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${
                  detail.coords[1]
                },${detail.coords[0]}', '_blank')"
                style="
                  background: #2563eb;
                  color: white;
                  border: none;
                  padding: 6px 0;
                  border-radius: 6px;
                  font-size: 13px;
                  font-weight: 600;
                  cursor: pointer;
                  width: 100%;
                  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
                "
                onmouseover="this.style.background='#1d4ed8'"
                onmouseout="this.style.background='#2563eb'"
              >
                Dẫn đường
              </button>
            </div>
          </div>
        `)
      )

      .addTo(mapRef.current);

    markersRef.current.push(marker);
    marker.togglePopup();

    mapRef.current.flyTo({
      center: detail.coords,
      zoom: 16,
      duration: 1500,
    });

    setQuery("");
    setResults([]);
  }

  return (
    <div className={cn("absolute top-4 left-4 z-10 grid gap-4", className)}>
      <div className="grid gap-2">
        <Input
          placeholder="Nhập tên địa điểm..."
          startAddon={
            <Search className=" h-4 w-4 text-muted-foreground shrink-0" />
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Command
          className={cn({
            hidden: results.length <= 0,
          })}
          shouldFilter={false}
        >
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  {t("search.searching")}
                </span>
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <CommandEmpty>{t("search.noResults")}</CommandEmpty>
            )}

            {!loading && results.length > 0 && (
              <CommandGroup>
                {results.map((item) => (
                  <CommandItem
                    key={item.mapbox_id}
                    value={item.mapbox_id}
                    onSelect={() => handleSelectResult(item)}
                    className="cursor-pointer"
                  >
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <span className="font-medium truncate">{item.name}</span>
                      {item.full_address && (
                        <span className="text-xs text-muted-foreground truncate">
                          {item.full_address}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {!loading && !query && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {t("search.placeholder")}
              </div>
            )}
          </CommandList>
        </Command>
      </div>
      <Categories onCategoryClick={handleCategoryClick} />
    </div>
  );
};

export default SearchBox;
