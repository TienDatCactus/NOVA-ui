import { Search, X, ChevronDown, Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Checkbox } from "~/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { StaffFilters } from "../container/filter.hooks";
import { useStaffRoleList } from "../container/staff-roles/query.hooks";
import { useState } from "react";
import StaffRoleCreateDialog from "../components/staff-role-create-dialog";
import StaffRoleUpdateDialog from "../components/staff-role-update-dialog";
import StaffRoleDeleteDialog from "../components/staff-role-delete-dialog";
import type { StaffRoleItem } from "~/services/api/staff-role/dto";

interface StaffFilterSidebarProps {
  filters: StaffFilters;
  onFilterChange: <K extends keyof StaffFilters>(
    key: K,
    value: StaffFilters[K]
  ) => void;
  onResetFilters: () => void;
}

export default function StaffFilterSidebar({
  filters,
  onFilterChange,
  onResetFilters,
}: StaffFilterSidebarProps) {
  const { data: staffRolesData, refetch } = useStaffRoleList();
  const staffRoles = staffRolesData?.data || [];

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<StaffRoleItem | null>(null);

  const activeFiltersCount =
    (filters.searchText ? 1 : 0) +
    (filters.staffRoleIds && filters.staffRoleIds.length > 0 ? 1 : 0);

  const handleRoleToggle = (roleId: string) => {
    const currentIds = filters.staffRoleIds || [];
    const newIds = currentIds.includes(roleId)
      ? currentIds.filter((id) => id !== roleId)
      : [...currentIds, roleId];
    onFilterChange("staffRoleIds", newIds);
  };

  const handleEditRole = (role: StaffRoleItem) => {
    setSelectedRole(role);
    setIsUpdateDialogOpen(true);
  };

  const handleDeleteRole = (role: StaffRoleItem) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const handleSuccess = () => {
    refetch();
  };

  return (
    <aside className="w-72 flex-shrink-0 space-y-2">
      <div className="flex items-center justify-between">
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-8 text-xs gap-1"
          >
            <X className="h-3 w-3" />
            Xóa ({activeFiltersCount})
          </Button>
        )}
      </div>

      <Card className="p-3 shadow-sm">
        <CardContent className="px-0">
          <div className="space-y-2">
            <Label htmlFor="search" className="text-sm font-medium">
              Tìm kiếm
            </Label>
            <Input
              id="search"
              placeholder="Mã, tên..."
              value={filters.searchText}
              onChange={(e) => onFilterChange("searchText", e.target.value)}
              endAddon={<Search className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        </CardContent>

        <Separator />

        <CardContent className="px-0 rounded-md mt-4">
          <Collapsible className="space-y-3">
            <div className="flex items-center justify-between w-full mb-2">
              <Label className="text-sm font-semibold">Chức danh</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2 gap-1 font-semibold"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span className="text-xs">Thêm</span>

              </Button>
            </div>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <span className="text-xs text-muted-foreground">
                {staffRoles.length} vai trò
              </span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              {staffRoles.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Chưa có vai trò nào
                </p>
              ) : (
                staffRoles.map((role) => (
                  <div key={role.id} className="flex items-center gap-2 group/item">
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={filters.staffRoleIds?.includes(role.id) || false}
                      onCheckedChange={() => handleRoleToggle(role.id)}
                    />
                    <Label
                      htmlFor={`role-${role.id}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {role.name}
                    </Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover/item:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditRole(role)}>
                          <Pencil className="h-3 w-3 mr-2" />
                          Sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteRole(role)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-3 w-3 mr-2" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Staff Role Create Dialog */}
      <StaffRoleCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleSuccess}
      />

      {/* Staff Role Update Dialog */}
      {selectedRole && (
        <StaffRoleUpdateDialog
          open={isUpdateDialogOpen}
          onOpenChange={setIsUpdateDialogOpen}
          role={selectedRole}
          onSuccess={handleSuccess}
        />
      )}

      {/* Staff Role Delete Dialog */}
      {selectedRole && (
        <StaffRoleDeleteDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          role={selectedRole}
          onSuccess={handleSuccess}
        />
      )}
    </aside>
  );
}
