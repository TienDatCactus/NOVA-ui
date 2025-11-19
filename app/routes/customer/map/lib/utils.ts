import type { MapboxRetrieveResponse } from "../types/mapbox-search";

export function normalizePoiDetail(res: MapboxRetrieveResponse) {
  const f = res.features?.[0];
  if (!f) return null;

  const p = f.properties;

  return {
    id: p.mapbox_id,
    name: p.name,
    address: p.full_address || p.address || "",
    formatted: p.place_formatted,
    categories: p.poi_category || [],
    coords: f.geometry.coordinates as [number, number],

    country: p.context?.country?.name,
    region: p.context?.region?.name,
    postcode: p.context?.postcode?.name,
    place: p.context?.place?.name,
    neighborhood: p.context?.neighborhood?.name,
    street: p.context?.street?.name,

    phone: p.coordinates?.routable_points?.[0]?.name,
    external: p.external_ids,
    website: p.metadata?.website,
    hours: p.metadata?.opening_hours,
    rating: p.metadata?.rating?.score,
    ratingCount: p.metadata?.rating?.count,
  };
}

export type NormalizedPoi = ReturnType<typeof normalizePoiDetail>;
