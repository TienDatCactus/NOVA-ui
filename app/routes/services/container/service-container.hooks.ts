import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { ServiceItem } from "~/services/api/services/dto";
import type { ServiceDensity } from "~/services/types/service.types";
import useServiceFilters from "./service-filter.hooks";
import { useDeleteService } from "./service-mutation.hooks";
import { useServices } from "./service-query.hooks";

export default function useServicesContainer() {
  const { data: servicesData, isPending } = useServices();
  const { filters, updateFilter, resetFilters, filterServices } =
    useServiceFilters();
  const [density, setDensity] = useState<ServiceDensity>("comfortable");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(
    null
  );

  const { mutate: deleteService } = useDeleteService();

  // Flatten services from grouped structure
  const flattenedServices = useMemo(() => {
    if (!servicesData) return [];

    const all: ServiceItem[] = [];
    servicesData.forEach((group) => {
      group.items.forEach((item) => {
        all.push({
          ...item,
          serviceTypeName: group.typeName,
          serviceTypeCode: group.typeCode,
        } as ServiceItem);
      });
    });
    return all;
  }, [servicesData]);

  // Apply filters and search
  const filteredServices = useMemo(() => {
    let result = flattenedServices;

    // Apply type filter
    if (filters.typeCode && filters.typeCode !== "all") {
      result = result.filter(
        (s) => (s as any).serviceTypeCode === filters.typeCode
      );
    }

    // Apply active filter
    result = filterServices(result);

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.code.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [flattenedServices, filters, filterServices, searchQuery]);

  const handleEdit = (service: ServiceItem) => {
    setEditingService(service);
    setEditSheetOpen(true);
  };

  const handleDelete = (service: ServiceItem) => {
    deleteService(service.serviceItemId);
  };

  const handleBulkEdit = (data: { basePrice?: number; active?: boolean }) => {
    // TODO: Implement bulk edit API call
    console.log("Bulk edit:", data, selectedServices);
    toast.success(`Đã cập nhật ${selectedServices.length} dịch vụ`);
    setSelectedServices([]);
    setBulkEditDialogOpen(false);
  };

  const handleClearSelection = () => {
    setSelectedServices([]);
  };

  const handleExportExcel = () => {
    if (filteredServices.length === 0) {
      toast.error("Không có dữ liệu để xuất");
      return;
    }

    // TODO: Backend will implement Excel export API
    toast.info("Tính năng xuất Excel sẽ được cập nhật sau");
  };

  return {
    flattenedServices: filteredServices,
    isPending,
    filters,
    updateFilter,
    resetFilters,
    density,
    setDensity,
    searchQuery,
    setSearchQuery,
    selectedServices,
    setSelectedServices,
    createDialogOpen,
    setCreateDialogOpen,
    editSheetOpen,
    setEditSheetOpen,
    bulkEditDialogOpen,
    setBulkEditDialogOpen,
    editingService,
    handleEdit,
    handleDelete,
    handleBulkEdit,
    handleClearSelection,
    handleExportExcel,
  };
}
