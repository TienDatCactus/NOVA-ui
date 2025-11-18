import { useCallback, useMemo, useRef, useState } from "react";
import axios from "axios";

const MAPBOX_TOKEN = import.meta.env.VITE_MAP_BOX_TOKEN;

// Lào Cai bounding box
const DEFAULT_BBOX = "103.0280,21.7000,104.2280,22.8500";
const DEFAULT_TYPES =
  "place,city,locality,neighborhood,street,address,poi,category";

interface SuggestResult {
  suggestions: any[];
  sessionToken: string;
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

  const sessionTokenRef = useRef<string>(crypto.randomUUID());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** -------------------------------------------------------
   * AXIOS INSTANCE
   * ------------------------------------------------------ */
  const api = axios.create({
    baseURL: "https://api.mapbox.com/search/searchbox/v1",
    timeout: 7000,
    params: {
      access_token: MAPBOX_TOKEN,
    },
  });

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
    [bbox, country, types, language]
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
    [language]
  );

  /** -------------------------------------------------------
   * 3. FORWARD GEOCODING
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
    [bbox, country, types, language]
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
    [bbox, country, language]
  );

  /** -------------------------------------------------------
   * 5. RESET SESSION TOKEN
   * ------------------------------------------------------ */
  const resetSession = useCallback(() => {
    sessionTokenRef.current = crypto.randomUUID();
  }, []);

  return useMemo(
    () => ({
      suggest,
      retrieve,
      forward,
      searchByCategory,
      resetSession,
      sessionToken: sessionTokenRef.current,
      loading,
      error,
    }),
    [suggest, retrieve, forward, searchByCategory, resetSession, loading, error]
  );
}
