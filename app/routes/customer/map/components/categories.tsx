import React, { useEffect, useState } from "react";
import z from "zod";
import { useMapboxSearch } from "../hooks/use-mapbox-search";

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
import { Button } from "~/components/ui/button";

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
  return (
    <div className={`z-10 ${props.className}`}>
      {(!RESORT_CATEGORIES || Object.keys(RESORT_CATEGORIES).length === 0) && (
        <div>Không có danh mục nào để hiển thị</div>
      )}
      <div className="flex flex-wrap items-center max-w-sm gap-2">
        {RESORT_CATEGORIES &&
          Object.entries(RESORT_CATEGORIES).map(([key, cat]) => (
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
