import { type ColumnDef } from "@tanstack/react-table";
import { ChevronDown, Image as ImageIcon } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { cn } from "~/lib/utils";
import type { ServiceTypeItem } from "~/services/api/service-types/dto";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import ServiceTypeActionsCell from "../../fragments/service-types/service-type-actions.cell";

type EnrichedServiceTypeItem = ServiceTypeItem & { serviceCount?: number };

export const columns: ColumnDef<EnrichedServiceTypeItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Chọn tất cả"
        />
      </div>
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Chọn dòng"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "index",
    header: "STT",
    cell: ({ row }) => {
      return <span className="font-medium">{row.index + 1}</span>;
    },
  },
  {
    accessorKey: "name",
    header: "Tên loại dịch vụ",
    cell: ({ row }) => {
      const type = row.original;
      //   const hasImages = type.imageUrls && type.imageUrls.length > 0;

      return (
        <div className="flex items-center gap-3">
          {/* Image Indicator */}
          <div
            className={cn(
              "w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0"
              //   hasImages
              //     ? "bg-primary/10 border-2 border-primary/20"
              //     : "bg-muted border border-muted-foreground/20"
            )}
          >
            {/* {hasImages ? (
              <img
                src={type.imageUrls[0]}
                alt={type.name}
                className="w-full h-full object-cover rounded-md"
                onError={(e) => {
                  e.currentTarget.src = "";
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement!.innerHTML = `<svg class="w-6 h-6 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>`;
                }}
              />
            ) : (
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            )} */}
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold truncate">{type.name}</span>
              {!type.active && (
                <Badge variant="secondary" className="text-xs">
                  Ngưng hoạt động
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {type.code}
            </p>
          </div>

          {/* Expand button */}
          {row.getCanExpand() && (
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0"
              onClick={() => row.toggleExpanded()}
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  row.getIsExpanded() && "rotate-180"
                )}
              />
            </Button>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Mô tả",
    cell: ({ row }) => {
      const description = row.original.description;
      return (
        <p className="text-sm text-muted-foreground truncate max-w-xs">
          {description || "—"}
        </p>
      );
    },
  },
  {
    accessorKey: "serviceCount",
    header: () => <p className="text-center">Số lượng dịch vụ</p>,
    cell: ({ row }) => {
      const count = row.original.serviceCount || 0;
      return (
        <div className="flex justify-center">
          <Badge variant={count > 0 ? "default" : "secondary"}>
            {count} dịch vụ
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Ngày tạo",
    cell: ({ row }) => {
      const date = row.original.createdAt;
      if (!date) return "—";
      return (
        <span className="text-sm">
          {format(new Date(date), "dd/MM/yyyy", { locale: vi })}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => {
      return <ServiceTypeActionsCell type={row.original} />;
    },
    enableSorting: false,
    enableHiding: false,
  },
];
