import { useState } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { useMenuCategories } from "~/routes/menu/container/menu-categories/query.hooks";
import {
  useMenuList,
  useMenuListByCategory,
} from "~/routes/menu/container/menu/query.hooks";
import { useAddItemToPOSOrder } from "../container/pos-orders-mutation.hooks";
import type { MenuListItemDto } from "~/services/api/menu/dto";

interface MenuBrowserProps {
  orderId: string;
  isEditable: boolean;
}

export default function MenuBrowser({ orderId, isEditable }: MenuBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fetch categories
  const { data: categories, isPending: categoriesLoading } = useMenuCategories({
    includeInactive: false,
  });

  // Fetch menu items (all or by category)
  const { data: allMenuItems, isPending: allItemsLoading } = useMenuList({});

  const { data: categoryItems, isPending: categoryItemsLoading } =
    useMenuListByCategory(selectedCategory);

  // Add item mutation
  const addItemMutation = useAddItemToPOSOrder();

  // Determine which items to show
  const menuItems = selectedCategory === "all" ? allMenuItems : categoryItems;
  const isLoading =
    selectedCategory === "all" ? allItemsLoading : categoryItemsLoading;

  // Filter by search query
  const filteredItems = menuItems?.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddItem = async (item: MenuListItemDto) => {
    if (!isEditable) return;

    try {
      await addItemMutation.mutateAsync({
        orderId,
        data: {
          menuItemId: item.itemId,
          quantity: 1,
          unitPrice: item.price,
        },
      });
    } catch (error) {
      // Error handled by mutation hook
      console.error("Failed to add item:", error);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm món ăn..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Tabs */}
      <Tabs
        value={selectedCategory}
        onValueChange={setSelectedCategory}
        className="flex-1 overflow-hidden"
      >
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          {categoriesLoading ? (
            <div className="flex items-center gap-2 px-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Đang tải...</span>
            </div>
          ) : (
            categories?.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
                <Badge variant="secondary" className="ml-2">
                  {category.menuItemCount}
                </Badge>
              </TabsTrigger>
            ))
          )}
        </TabsList>

        {/* Menu Items Grid */}
        <TabsContent
          value={selectedCategory}
          className="mt-4 h-[calc(100%-3rem)]"
        >
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredItems && filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 pr-4 md:grid-cols-2">
                {filteredItems.map((item) => (
                  <Card
                    key={item.itemId}
                    className="transition-shadow hover:shadow-md"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <p className="text-lg font-bold text-primary">
                              {item.price.toLocaleString()} VNĐ
                            </p>
                            {item.unitName && (
                              <span className="text-xs text-muted-foreground">
                                / {item.unitName}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddItem(item)}
                          disabled={!isEditable || addItemMutation.isPending}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "Không tìm thấy món nào"
                    : "Chưa có món ăn trong danh mục này"}
                </p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
