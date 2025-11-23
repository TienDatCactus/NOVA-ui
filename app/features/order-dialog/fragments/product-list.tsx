// components/fragments/universal-product-list.tsx

import { PackageSearch } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import type { UnifiedProduct } from "..";
import UniversalProductCard from "./product-card";

interface UniversalProductListProps {
  products: UnifiedProduct[];
  isLoading?: boolean;
  getQuantity: (id: string) => number;
  onToggle: (product: UnifiedProduct) => void;
}

export default function UniversalProductList({
  products,
  isLoading,
  getQuantity,
  onToggle,
}: UniversalProductListProps) {
  // 1. Loading State
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 p-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-xl border p-3">
            <Skeleton className="aspect-[4/3] w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="mt-2 flex justify-between">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 2. Empty State
  if (products.length === 0) {
    return (
      <div className="flex h-60 flex-col items-center justify-center gap-2 text-muted-foreground">
        <PackageSearch className="h-10 w-10 opacity-20" />
        <p className="text-sm">Không tìm thấy sản phẩm nào</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4  p-1 pb-20 md:pb-0">
      {products.map((product) => (
        <UniversalProductCard
          key={`${product.type}-${product.id}`} // Unique key trick
          product={product}
          quantity={getQuantity(product.id)}
          onToggle={() => onToggle(product)}
        />
      ))}
    </div>
  );
}
