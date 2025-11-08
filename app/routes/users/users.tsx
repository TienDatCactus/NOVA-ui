import { useState } from "react";
import { Card } from "~/components/ui/card";
import { useUsers, useRoles } from "./container/useUsers.hooks";
import { UserDetailDialog } from "./components/user-detail-dialog";
import { UserFormDialog } from "./components/user-create-dialog";
import UsersViewLayout from "./layouts/users-view.layout";
import useUserFilters from "./container/filter.hooks";
import type { UserItem } from "~/services/api/user/dto";
import UsersDataTable from "./components/users-list";
import { useQueryClient } from "@tanstack/react-query";

export default function Component() {
  const { data, isPending } = useUsers();
  const { data: rolesData } = useRoles();
  const { filters, updateFilter, resetFilters, filterUsers } = useUserFilters();
  const queryClient = useQueryClient();

  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleViewDetail = (user: UserItem) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedUser(null);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  const filteredUsers = data ? filterUsers(data) : [];
  const hasFilters = !!(
    filters.searchText ||
    filters.statusFilter !== "all" ||
    filters.roleFilter !== "all"
  );

  return (
    <UsersViewLayout
      filters={filters}
      updateFilter={updateFilter}
      resetFilters={resetFilters}
      totalUsers={data?.length || 0}
      onAddUser={() => setIsCreateOpen(true)}
      roles={rolesData || []}
    >
      <Card className="flex-1 overflow-hidden shadow-sm">
        <UsersDataTable
          users={filteredUsers}
          isLoading={isPending}
          hasFilters={hasFilters}
          onViewDetail={handleViewDetail}
          onSuccess={handleRefresh}
        />
      </Card>

      {/* Detail Dialog */}
      {selectedUser && (
        <UserDetailDialog
          user={selectedUser}
          open={isDetailOpen}
          onClose={handleCloseDetail}
        />
      )}

      <UserFormDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          setIsCreateOpen(false);
          handleRefresh();
        }}
      />
    </UsersViewLayout>
  );
}
