import { useState, useMemo } from "react";
import type { UnitItemDetailResponseDto } from "~/services/api/units/dto";
import { useUnits } from "./unit-query.hooks";
import useUnitFilters from "./filter.hooks";

function useUnitsContainer() {
  const { filters, updateFilter, resetFilters, filterUnits, includeInactive } =
    useUnitFilters();
  const { data: units, isPending } = useUnits({ includeInactive });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const filteredUnits = units ? filterUnits(units) : [];

  const stats = useMemo(() => {
    const allUnits = units || [];
    return {
      total: allUnits.length,
      active: allUnits.filter((u) => u.active).length,
      inactive: allUnits.filter((u) => !u.active).length,
    };
  }, [units]);

  return {
    filteredUnits,
    isPending,
    filters,
    updateFilter,
    resetFilters,
    stats,
    createDialogOpen,
    setCreateDialogOpen,
  };
}

export default useUnitsContainer;
