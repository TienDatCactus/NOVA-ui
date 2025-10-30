import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { ServiceItem } from "~/services/api/services/dto";
import useServiceFilters from "./service-filter.hooks";
import { useDeleteService } from "./service-mutation.hooks";
import { useServices } from "./service-query.hooks";

export default function useServicesContainer() {
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);
  const {
    filters,
    updateFilter,
    resetFilters,
    filterServices,
    includeInactive,
  } = useServiceFilters();
  const { data: servicesData, isPending } = useServices({
    includeInactive,
    typeCode: filters.typeCode,
  });
  const { mutate: deleteService } = useDeleteService();

  const filteredServices = servicesData ? filterServices(servicesData) : [];

  const handleDelete = (service: ServiceItem) => {
    deleteService(service.serviceItemId);
  };

  const handleBulkEdit = (data: { basePrice?: number; active?: boolean }) => {
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

    toast.info("Tính năng xuất Excel sẽ được cập nhật sau");
  };

  return {
    filteredServices,
    isPending,
    filters,
    updateFilter,
    resetFilters,
    selectedServices,
    setSelectedServices,
    createDialogOpen,
    setCreateDialogOpen,
    bulkEditDialogOpen,
    setBulkEditDialogOpen,
    handleDelete,
    handleBulkEdit,
    handleClearSelection,
    handleExportExcel,
  };
}
