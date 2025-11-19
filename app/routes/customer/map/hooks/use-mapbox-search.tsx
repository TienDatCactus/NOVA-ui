import { useCallback, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useLocalStorage } from "usehooks-ts";
import {
  Utensils,
  Coffee,
  Wine,
  Hotel,
  Bath,
  ShoppingBag,
  TreePine,
  Landmark,
} from "lucide-react";

const MAPBOX_TOKEN = import.meta.env.VITE_MAP_BOX_TOKEN;

const DEFAULT_BBOX = "103.0280,21.7000,104.2280,22.8500";
const DEFAULT_TYPES =
  "place,city,locality,neighborhood,street,address,poi,category";

// Resort categories for quick search (Vietnamese labels)
export const RESORT_CATEGORIES = {
  restaurant: {
    label: "Nhà hàng",
    icon: Utensils,
    mapbox_category: "restaurant",
  },

  cafe: {
    label: "Quán cà phê",
    icon: Coffee,
    mapbox_category: "cafe",
  },

  bar: {
    label: "Bar",
    icon: Wine,
    mapbox_category: "bar",
  },

  hotel: {
    label: "Khách sạn",
    icon: Hotel,
    mapbox_category: "lodging",
  },

  spa: {
    label: "Spa",
    icon: Bath,
    mapbox_category: "spa",
  },

  shopping: {
    label: "Mua sắm",
    icon: ShoppingBag,
    mapbox_category: "shopping",
  },

  park: {
    label: "Công viên",
    icon: TreePine,
    mapbox_category: "park",
  },

  attraction: {
    label: "Điểm tham quan",
    icon: Landmark,
    mapbox_category: "tourist_attraction",
  },
} as const;

interface SuggestResult {
  suggestions: any[];
  sessionToken: string;
}

export interface SearchHistoryItem {
  id: string;
  name: string;
  full_address?: string;
  mapbox_id: string;
  timestamp: number;
}

export function useMapboxSearch(options?: {
  bbox?: string;
  country?: string;
  types?: string;
  language?: string;
}) {
  const {
    bbox = DEFAULT_BBOX,
    country = "VN",
    types = DEFAULT_TYPES,
    language = "vi",
  } = options || {};

  const sessionTokenRef = useRef(crypto.randomUUID());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchHistory, setSearchHistory] = useLocalStorage<
    SearchHistoryItem[]
  >("mapbox-search-history", []);

  /** -------------------------------------------------------
   * AXIOS INSTANCE (stable via useMemo)
   * ------------------------------------------------------ */
  const api = useMemo(() => {
    return axios.create({
      baseURL: "https://api.mapbox.com/search/searchbox/v1",
      timeout: 7000,
      params: {
        access_token: MAPBOX_TOKEN,
      },
    });
  }, []);

  /** -------------------------------------------------------
   * 1. SUGGEST
   * ------------------------------------------------------ */
  const suggest = useCallback(
    async (query: string): Promise<SuggestResult> => {
      if (!query.trim()) {
        return { suggestions: [], sessionToken: sessionTokenRef.current };
      }

      setLoading(true);
      setError(null);

      try {
        const res = await api.get("/suggest", {
          params: {
            q: query,
            bbox,
            country,
            types,
            language,
            session_token: sessionTokenRef.current,
          },
        });

        return {
          suggestions: res.data?.suggestions ?? [],
          sessionToken: sessionTokenRef.current,
        };
      } catch (err) {
        setError("suggest failed");
        return { suggestions: [], sessionToken: sessionTokenRef.current };
      } finally {
        setLoading(false);
      }
    },
    [api, bbox, country, types, language]
  );

  /** -------------------------------------------------------
   * 2. RETRIEVE
   * ------------------------------------------------------ */
  const retrieve = useCallback(
    async (mapbox_id: string) => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get(`/retrieve/${mapbox_id}`, {
          params: {
            language,
            session_token: sessionTokenRef.current,
          },
        });

        return res.data;
      } catch (err) {
        setError("retrieve failed");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [api, language]
  );

  /** -------------------------------------------------------
   * 3. FORWARD
   * ------------------------------------------------------ */
  const forward = useCallback(
    async (query: string) => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get("/forward", {
          params: {
            q: query,
            bbox,
            country,
            types,
            language,
          },
        });

        return res.data;
      } catch (err) {
        setError("forward failed");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [api, bbox, country, types, language]
  );

  /** -------------------------------------------------------
   * 4. CATEGORY SEARCH
   * ------------------------------------------------------ */
  const searchByCategory = useCallback(
    async (categoryId: string) => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get(`/category/${categoryId}`, {
          params: {
            bbox,
            country,
            language,
          },
        });

        return res.data;
      } catch (err) {
        setError("category search failed");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [api, bbox, country, language]
  );

  // Convenience: search by predefined resort category key
  const searchByResortCategory = useCallback(
    async (categoryKey: keyof typeof RESORT_CATEGORIES) => {
      const category = RESORT_CATEGORIES[categoryKey];
      return searchByCategory(category.mapbox_category);
    },
    [searchByCategory]
  );

  /** -------------------------------------------------------
   * 6. REVERSE LOOKUP
   * ------------------------------------------------------ */
  const reverseLookup = useCallback(
    async ({
      longitude,
      latitude,
    }: {
      longitude: number;
      latitude: number;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get(`/reverse`, {
          params: {
            longitude,
            latitude,
            language,
          },
        });

        return res.data;
      } catch (err) {
        setError("reverse lookup failed");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [api, language]
  );

  /** -------------------------------------------------------
   * 7. RESET SESSION TOKEN
   * ------------------------------------------------------ */
  const resetSession = useCallback(() => {
    sessionTokenRef.current = crypto.randomUUID();
  }, []);

  // Search history management
  const addToHistory = useCallback(
    (item: { name: string; full_address?: string; mapbox_id: string }) => {
      const historyItem: SearchHistoryItem = {
        id: crypto.randomUUID(),
        name: item.name,
        full_address: item.full_address,
        mapbox_id: item.mapbox_id,
        timestamp: Date.now(),
      };

      setSearchHistory((prev) => [
        historyItem,
        ...prev.filter((h) => h.mapbox_id !== item.mapbox_id).slice(0, 9),
      ]);
    },
    [setSearchHistory]
  );

  const removeFromHistory = useCallback(
    (id: string) => {
      setSearchHistory((prev) => prev.filter((item) => item.id !== id));
    },
    [setSearchHistory]
  );

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
  }, [setSearchHistory]);

  return useMemo(
    () => ({
      suggest,
      retrieve,
      forward,
      searchByCategory,
      searchByResortCategory,
      reverseLookup,
      resetSession,
      searchHistory,
      addToHistory,
      removeFromHistory,
      clearHistory,
      sessionToken: sessionTokenRef.current,
      loading,
      error,
    }),
    [
      suggest,
      retrieve,
      forward,
      searchByCategory,
      searchByResortCategory,
      reverseLookup,
      resetSession,
      searchHistory,
      addToHistory,
      removeFromHistory,
      clearHistory,
      loading,
      error,
    ]
  );
}
