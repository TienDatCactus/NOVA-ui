import React, { useState, useEffect } from "react";
import { useMapboxSearch } from "../hooks/use-mapbox";
import { useMap } from "../context/map-context";
import { cn } from "~/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { Search, MapPin, Loader2, ChevronsUpDown } from "lucide-react";
import { useDebounceValue } from "usehooks-ts";

interface SearchBoxProps extends React.HTMLAttributes<HTMLDivElement> {}

const SearchBox: React.FC<SearchBoxProps> = ({ className }) => {
  const { mapRef } = useMap();
  const search = useMapboxSearch();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery] = useDebounceValue(query, 500);
  useEffect(() => {
    async function doSearch() {
      if (!debouncedQuery) {
        setResults([]);
        return;
      }

      setLoading(true);
      const data = await search.suggest(debouncedQuery);
      setResults(data.suggestions || []);
      setLoading(false);
    }

    doSearch();
  }, [debouncedQuery]);

  async function handleSelectResult(item: any) {
    const detail = await search.retrieve(item.mapbox_id);
    const coords = detail.features[0].geometry.coordinates;

    mapRef.current?.flyTo({
      center: coords,
      zoom: 16,
      duration: 2000,
    });

    setOpen(false);
    setSelectedName(item.name);
    setQuery("");
    setResults([]);
  }

  return (
    <div className={cn("absolute top-4 left-4 z-10", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-80 justify-between bg-card shadow-m"
          >
            <div className="flex items-center gap-2 flex-1 overflow-hidden">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-sm">
                {selectedName || "Tìm địa điểm..."}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Nhập tên địa điểm..."
              value={query}
              onValueChange={(val) => setQuery(val)}
            />
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
                        <span className="font-medium truncate">
                          {item.name}
                        </span>
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
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SearchBox;
