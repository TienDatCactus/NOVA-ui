import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { ServiceTypeItem } from "~/services/api/service-types/dto";
import { useServiceTypes } from "./service-types-query.hooks";
import useServiceTypeFilters from "./service-types-filter.hooks";
import { useServices } from "~/routes/services/container/service-query.hooks";
import { useDeleteServiceType } from "./service-type-mutation.hooks";

export default function useServiceTypesContainer() {
  const [selectedTypes, setSelectedTypes] = useState<ServiceTypeItem[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editingType, setEditingType] = useState<ServiceTypeItem | null>(null);
  const {
    filters,
    updateFilter,
    resetFilters,
    filterServiceTypes,
    includeInactive,
  } = useServiceTypeFilters();
  const { data: serviceTypesData, isPending } = useServiceTypes({
    includeInactive,
  });
  const { mutate: deleteServiceType } = useDeleteServiceType();

  const filteredTypes = filterServiceTypes(serviceTypesData ?? []) ?? [];
  const handleEdit = (type: ServiceTypeItem) => {
    setEditingType(type);
    setEditSheetOpen(true);
  };

  const handleDelete = (type: ServiceTypeItem) => {
    deleteServiceType(type.id);
  };

  const handleClearSelection = () => {
    setSelectedTypes([]);
  };

  const handleExportExcel = () => {
    if (filteredTypes.length === 0) {
      toast.error("Không có dữ liệu để xuất");
      return;
    }
    toast.info("Tính năng xuất Excel sẽ được cập nhật sau");
  };

  return {
    filteredTypes,
    isPending,
    filters,
    updateFilter,
    resetFilters,
    selectedTypes,
    setSelectedTypes,
    createDialogOpen,
    setCreateDialogOpen,
    editSheetOpen,
    setEditSheetOpen,
    editingType,
    handleEdit,
    handleDelete,
    handleClearSelection,
    handleExportExcel,
  };
}
