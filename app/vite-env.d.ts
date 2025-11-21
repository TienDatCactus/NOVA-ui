/// <reference types="vite/client" />
/// <reference types="./types/geojson.d.ts" />
declare module "*.geojson" {
  const value: GeoJSON.FeatureCollection;
  export default value;
}
