import { useState } from "react";
import { useCustomers, useRoles } from "./container/useCustomers.hooks";
import { CustomerDetailDialog } from "./components/customer-detail-dialog";
import { CustomerFormDialog } from "./components/customer-create-dialog";
import { CustomerEditDialog } from "./components/customer-edit-dialog";
import { LockUserDialog } from "./components/lock-user-dialog";
import { ManageRolesDialog } from "./components/manage-roles-dialog";
import ChangePasswordDialog from "./components/change-password-dialog";
import CustomersDataTable from "./components/customers-data-table";
import CustomersViewLayout from "./layouts/customers-view.layout";
import useCustomerFilters from "./container/filter.hooks";
import type { CustomerItem } from "~/services/api/customer/dto";
import type { Route } from "./+types/customers";

export const action = async ({ request, params }: Route.ActionArgs) => {
  return {};
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  return {};
};

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { data, isPending } = useCustomers();
  const { data: rolesData } = useRoles();
  const { filters, updateFilter, resetFilters, filterCustomers } =
    useCustomerFilters();

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<CustomerItem | null>(
    null
  );

  // Lock/Unlock dialog states
  const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);
  const [lockDialogMode, setLockDialogMode] = useState<"lock" | "unlock">(
    "lock"
  );
  const [customerToLock, setCustomerToLock] = useState<CustomerItem | null>(
    null
  );

  // Manage roles dialog states
  const [isManageRolesOpen, setIsManageRolesOpen] = useState(false);
  const [customerToManageRoles, setCustomerToManageRoles] =
    useState<CustomerItem | null>(null);

  // Change password dialog states
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [customerToChangePassword, setCustomerToChangePassword] =
    useState<CustomerItem | null>(null);

  const handleViewDetail = (customer: CustomerItem) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedCustomer(null);
  };

  const handleCreateSuccess = () => {
    setIsCreateOpen(false);
  };

  const handleEdit = (customer: CustomerItem) => {
    setCustomerToEdit(customer);
    setIsEditOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditOpen(false);
    setCustomerToEdit(null);
  };

  const handleLockUser = (customer: CustomerItem) => {
    setCustomerToLock(customer);
    setLockDialogMode("lock");
    setIsLockDialogOpen(true);
  };

  const handleUnlockUser = (customer: CustomerItem) => {
    setCustomerToLock(customer);
    setLockDialogMode("unlock");
    setIsLockDialogOpen(true);
  };

  const handleManageRoles = (customer: CustomerItem) => {
    setCustomerToManageRoles(customer);
    setIsManageRolesOpen(true);
  };

  const handleChangePassword = (customer: CustomerItem) => {
    setCustomerToChangePassword(customer);
    setIsChangePasswordOpen(true);
  };

  const filteredCustomers = data ? filterCustomers(data) : [];

  return (
    <CustomersViewLayout
      filters={filters}
      updateFilter={updateFilter}
      resetFilters={resetFilters}
      totalCustomers={filteredCustomers.length}
      onAddCustomer={() => setIsCreateOpen(true)}
      roles={rolesData || []}
    >
      <CustomersDataTable
        customers={filteredCustomers}
        isLoading={isPending}
        onViewDetail={handleViewDetail}
        onEdit={handleEdit}
        onManageRoles={handleManageRoles}
        onChangePassword={handleChangePassword}
        onLockUser={handleLockUser}
        onUnlockUser={handleUnlockUser}
      />

      {/* Dialogs */}
      {selectedCustomer && (
        <CustomerDetailDialog
          customer={selectedCustomer}
          open={isDetailOpen}
          onClose={handleCloseDetail}
        />
      )}

      <CustomerFormDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {customerToEdit && (
        <CustomerEditDialog
          customer={customerToEdit}
          open={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setCustomerToEdit(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {customerToLock && (
        <LockUserDialog
          customer={customerToLock}
          open={isLockDialogOpen}
          onClose={() => {
            setIsLockDialogOpen(false);
            setCustomerToLock(null);
          }}
          mode={lockDialogMode}
        />
      )}

      {customerToManageRoles && (
        <ManageRolesDialog
          customer={customerToManageRoles}
          open={isManageRolesOpen}
          onClose={() => {
            setIsManageRolesOpen(false);
            setCustomerToManageRoles(null);
          }}
        />
      )}

      {customerToChangePassword && (
        <ChangePasswordDialog
          open={isChangePasswordOpen}
          onOpenChange={setIsChangePasswordOpen}
          customerId={customerToChangePassword.id}
          customerName={customerToChangePassword.fullName}
          onSuccess={() => {
            setIsChangePasswordOpen(false);
            setCustomerToChangePassword(null);
          }}
        />
      )}
    </CustomersViewLayout>
  );
}
