import sapaGeoJson from "./sapa.geojson";
import sapaPoiJson from "./sapa-poi.json";

export const sapaData = sapaGeoJson as GeoJSON.FeatureCollection;
export const sapaPoiData = sapaPoiJson as GeoJSON.FeatureCollection;
