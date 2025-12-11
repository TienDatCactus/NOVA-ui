import {
  Bath,
  Coffee,
  Hotel,
  Landmark,
  ShoppingBag,
  TreePine,
  Utensils,
  Wine,
} from "lucide-react";
import React from "react";
import z from "zod";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/button";

export const CategoryItemSchema = z.object({
  canonical_id: z.string(),
  icon: z.string(),
  name: z.string(),
  version: z.string(),
  uuid: z.string(),
});
export const CategoryListSchema = z.object({
  listItems: z.array(CategoryItemSchema),
});

interface MapCategoriesProps extends React.HTMLAttributes<HTMLDivElement> {
  category?: string;
  onCategoryClick?: (categoryKey: string) => void;
}

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

const MapCategories: React.FC<MapCategoriesProps> = ({ ...props }) => {
  const { t } = useTranslation("map");

  const categories = {
    restaurant: {
      label: t("categories.restaurant"),
      icon: Utensils,
      mapbox_category: "restaurant",
    },
    cafe: {
      label: t("categories.cafe"),
      icon: Coffee,
      mapbox_category: "cafe",
    },
    bar: {
      label: t("categories.bar"),
      icon: Wine,
      mapbox_category: "bar",
    },
    hotel: {
      label: t("categories.hotel"),
      icon: Hotel,
      mapbox_category: "lodging",
    },
    spa: {
      label: t("categories.spa"),
      icon: Bath,
      mapbox_category: "spa",
    },
    shopping: {
      label: t("categories.shopping"),
      icon: ShoppingBag,
      mapbox_category: "shopping",
    },
    park: {
      label: t("categories.park"),
      icon: TreePine,
      mapbox_category: "park",
    },
    attraction: {
      label: t("categories.attraction"),
      icon: Landmark,
      mapbox_category: "tourist_attraction",
    },
  };

  return (
    <div className={`z-10 ${props.className}`}>
      {(!categories || Object.keys(categories).length === 0) && (
        <div>{t("categories.noCategories")}</div>
      )}
      <div className="flex flex-wrap items-center max-w-sm gap-2">
        {categories &&
          Object.entries(categories).map(([key, cat]) => (
            <Button
              key={cat.label}
              variant={"outline"}
              className="rounded-full"
              onClick={() => props.onCategoryClick?.(key)}
            >
              <cat.icon className="w-6 h-6" />
              <span>{cat.label}</span>
            </Button>
          ))}
      </div>
    </div>
  );
};

export default MapCategories;
