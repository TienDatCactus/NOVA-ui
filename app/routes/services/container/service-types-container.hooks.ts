import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { ServiceTypeItem } from "~/services/api/service-types/dto";
import { useServiceTypes } from "./service-types-query.hooks";
import useServiceTypeFilters from "./service-types-filter.hooks";
import { useServices } from "~/routes/services/container/service-query.hooks";
import { useDeleteServiceType } from "./service-type-mutation.hooks";

export default function useServiceTypesContainer() {
  const { data: serviceTypesData, isPending } = useServiceTypes();
  const { data: servicesData } = useServices(); // For service count
  const { filters, updateFilter, resetFilters, filterServiceTypes } =
    useServiceTypeFilters();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<ServiceTypeItem[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editingType, setEditingType] = useState<ServiceTypeItem | null>(null);

  const { mutate: deleteServiceType } = useDeleteServiceType();

  const enrichedTypes = useMemo(() => {
    if (!serviceTypesData) return [];
    return serviceTypesData.map((type) => {
      const serviceCount =
        servicesData?.find((group) => group.serviceTypeId === type.id)?.items
          .length || 0;

      return {
        ...type,
        serviceCount,
      };
    });
  }, [serviceTypesData, servicesData]);

  // Apply filters and search
  const filteredTypes = useMemo(() => {
    let result = filterServiceTypes(enrichedTypes);

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.code.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [enrichedTypes, filterServiceTypes, searchQuery]);

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

    // TODO: Backend will implement Excel export API
    toast.info("Tính năng xuất Excel sẽ được cập nhật sau");
  };

  return {
    filteredTypes,
    isPending,
    filters,
    updateFilter,
    resetFilters,
    searchQuery,
    setSearchQuery,
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
