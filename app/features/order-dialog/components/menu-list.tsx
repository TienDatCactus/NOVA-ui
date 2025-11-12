import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import type { MenuListResponseDto } from "~/services/api/menu/dto";
import MenuCard from "../fragments/menu.card";

interface MenuListProps {
  menuItems: MenuListResponseDto;
  searchText: string;
  onSearchChange: (value: string) => void;
  isSelected: (itemId: string) => boolean;
  getQuantity: (itemId: string) => number;
  onToggleSelect: (itemId: string) => void;
  onQuantityChange: (itemId: string, quantity: number) => void;
}

/**
 * Menu list component
 * Displays filterable grid of menu items
 */
export default function MenuList({
  menuItems,
  searchText,
  onSearchChange,
  isSelected,
  getQuantity,
  onToggleSelect,
  onQuantityChange,
}: MenuListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2 h-96 overflow-y-auto">
      {menuItems.length === 0 ? (
        <div className="text-center text-muted-foreground col-span-2 py-8">
          Không có món ăn
        </div>
      ) : (
        menuItems.map((menuItem) => (
          <MenuCard
            key={menuItem.itemId}
            menuItem={menuItem}
            isSelected={isSelected(menuItem.itemId)}
            quantity={getQuantity(menuItem.itemId)}
            onToggle={() => onToggleSelect(menuItem.itemId)}
            onQuantityChange={(qty) => onQuantityChange(menuItem.itemId, qty)}
          />
        ))
      )}
    </div>
  );
}
