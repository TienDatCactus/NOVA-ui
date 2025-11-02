import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { ServiceTypeItem } from "~/services/api/service-types/dto";
import { useServiceTypes } from "./service-types-query.hooks";
import useServiceTypeFilters from "./service-types-filter.hooks";
import { useServices } from "~/routes/services/container/service-query.hooks";
import { useDeleteServiceType } from "./service-type-mutation.hooks";

export default function useServiceTypesContainer() {
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
