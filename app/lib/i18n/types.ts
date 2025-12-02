import "react-i18next";
import type viCommon from "./locales/vi/common.json";
import type viCatalog from "./locales/vi/catalog.json";
import type viGuides from "./locales/vi/guides.json";
import type viChat from "./locales/vi/chat.json";
import type viMap from "./locales/vi/map.json";

declare module "react-i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof viCommon;
      catalog: typeof viCatalog;
      guides: typeof viGuides;
      chat: typeof viChat;
      map: typeof viMap;
    };
  }
}
