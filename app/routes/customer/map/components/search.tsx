import { Loader2, MapPin, Search } from "lucide-react";
import mapboxgl from "mapbox-gl";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
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
        const features = data?.features || data?.suggestions || [];
        setResults(normalizeResults(features));
      } catch (error) {
        console.error("Category search failed:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [search, normalizeResults]
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
              font-size:0.875rem;
              font-weight:600;
              margin-bottom:0.25rem;
              color:#111;
              border-radius:2rem;
          ">
            ${detail.name}
          </div>
        
          <div style="
              font-size:0.75rem;
              color:#555;
              margin-bottom:0.375rem;
              max-width:15rem;
              line-height:1.4;
          ">
            ${detail.address}
          </div>
        
          ${
            detail.rating
              ? `
                <div style="font-size:0.75rem;color:#222;margin-bottom:0.375rem;">
                  ⭐ ${detail.rating} 
                  <span style="color:#777;">(${detail.ratingCount})</span>
                </div>
              `
              : ""
          }
        
          ${
            detail.categories?.length
              ? `
                <div style="
                    font-size:0.6875rem;
                    color:#0b62d6;
                    margin-bottom:0.375rem;
                    text-transform:capitalize;
                ">
                  ${detail.categories.join(", ")}
                </div>
              `
              : ""
          }
        
          ${
            detail.website
              ? `
                <div style="margin-bottom:0.375rem;">
                  <a href="${detail.website}" 
                    target="_blank"
                    style="color:#0b62d6;font-size:0.75rem;text-decoration:underline;">
                    🌐 Website
                  </a>
                </div>
              `
              : ""
          }
        
          ${
            detail.hours
              ? `
                <div style="font-size:0.75rem;color:#555;margin-bottom:0.625rem;">
                  🕒 ${detail.hours}
                </div>
              `
              : ""
          }
      
          <button 
            style="
              width:100%;
              background:#2563eb;
              color:white;
              padding:0.375rem 0.625rem;
              border-radius:0.375rem;
              font-size:0.75rem;
              margin-top:0.5rem;
              cursor:pointer;
            "
            onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${
              detail.coords[1]
            },${detail.coords[0]}', '_blank')"
          >
            Điều hướng tới đây
          </button>
      
          <button 
            style="
              width:100%;
              background:#10b981;
              color:white;
              padding:0.375rem 0.625rem;
              border-radius:0.375rem;
              font-size:0.75rem;
              margin-top:0.375rem;
              cursor:pointer;
            "
            onclick="window.open('https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(detail.name)}&query_place_id=${detail.id}', '_blank')"
          >
            Xem chi tiết
          </button>
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
                  Đang tìm kiếm...
                </span>
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <CommandEmpty>Không tìm thấy kết quả</CommandEmpty>
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
                Nhập tên địa điểm để tìm kiếm
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
