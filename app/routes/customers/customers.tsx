import { useState, useMemo } from "react";
import { UserPlus, Users, Pencil, Search, Lock, Unlock, Shield, MoreHorizontal } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useCustomers, useRoles } from "./container/useCustomers.hooks";
import { CustomerDetailDialog } from "./components/customer-detail-dialog";
import { CustomerFormDialog } from "./components/customer-create-dialog";
import { CustomerEditDialog } from "./components/customer-edit-dialog";
import { CustomerStats } from "./components/customer-stats";
import { LockUserDialog } from "./components/lock-user-dialog";
import { ManageRolesDialog } from "./components/manage-roles-dialog";
import type { CustomerItem } from "~/services/api/customer/dto";

/**
 * Helper function - Get role badge color
 */
const getRoleBadgeVariant = (role: string) => {
  const roleColors: Record<string, { bg: string; text: string; border: string }> = {
    Receptionist: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    Staff: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    Customer: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
    HotelManager: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
    Accountant: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
    Admin: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
    ServiceStaff: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  };
  return roleColors[role] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
};

export default function CustomersPage() {
  const { data, isPending } = useCustomers();
  const { data: rolesData } = useRoles();
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<CustomerItem | null>(null);
  
  // Lock/Unlock dialog states
  const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);
  const [lockDialogMode, setLockDialogMode] = useState<"lock" | "unlock">("lock");
  const [customerToLock, setCustomerToLock] = useState<CustomerItem | null>(null);
  
  // Manage roles dialog states
  const [isManageRolesOpen, setIsManageRolesOpen] = useState(false);
  const [customerToManageRoles, setCustomerToManageRoles] = useState<CustomerItem | null>(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

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

  // Filtered and searched data
  const filteredCustomers = useMemo(() => {
    if (!data) return [];

    return data.filter((customer) => {
      // Search filter - search in name, email, username
      const matchesSearch =
        searchQuery === "" ||
        customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.userName.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const isLocked = customer.lockoutEnabled && customer.lockoutEnd;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !isLocked) ||
        (statusFilter === "locked" && isLocked);

      // Role filter
      const matchesRole =
        roleFilter === "all" || customer.roles.includes(roleFilter);

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [data, searchQuery, statusFilter, roleFilter]);

  return (
    <div className="min-h-screen bg-muted/30 p-8">
      {/* Header Section - Thoáng đãng với spacing lớn */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Khách hàng</h1>
        </div>
        <p className="text-muted-foreground ml-12">
          Quản lý thông tin và tài khoản khách hàng
        </p>
      </div>

      {/* Statistics Cards */}
      {data && data.length > 0 && (
        <CustomerStats customers={data} />
      )}

      {/* Search & Filter Bar */}
      <Card className="mb-6 p-4 shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, email, tên đăng nhập..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="locked">Bị khóa</SelectItem>
            </SelectContent>
          </Select>

          {/* Role Filter */}
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Lọc theo vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              {rolesData?.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Add Button */}
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 shadow-md"
          >
            <UserPlus className="h-4 w-4" />
            Thêm mới
          </Button>
        </div>
      </Card>

      {/* Main Content Card - Elevation với shadow */}
      <Card className="shadow-lg border-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Họ và tên</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Số điện thoại</TableHead>
                <TableHead className="font-semibold">Vai trò</TableHead>
                <TableHead className="font-semibold">Trạng thái</TableHead>
                <TableHead className="font-semibold text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-20 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredCustomers && filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <TableRow
                    key={customer.id}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => handleViewDetail(customer)}
                  >
                    <TableCell className="font-medium">{customer.fullName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{customer.email}</span>
                        {customer.emailConfirmed }
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.phoneNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {customer.roles.map((role) => {
                          const colors = getRoleBadgeVariant(role);
                          return (
                            <Badge
                              key={role}
                              variant="outline"
                              className={`text-xs ${colors.bg} ${colors.text} ${colors.border} shadow-sm`}
                            >
                              {role}
                            </Badge>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.lockoutEnabled && customer.lockoutEnd ? (
                        <Badge
                          variant="destructive"
                          className="shadow-sm"
                        >
                          Bị khóa
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
                        >
                          Hoạt động
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(customer);
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Chỉnh sửa thông tin
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleManageRoles(customer);
                            }}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Quản lý vai trò
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          {customer.lockoutEnabled && customer.lockoutEnd ? (
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnlockUser(customer);
                              }}
                              className="text-green-600 focus:text-green-600"
                            >
                              <Unlock className="h-4 w-4 mr-2" />
                              Mở khóa tài khoản
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLockUser(customer);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Lock className="h-4 w-4 mr-2" />
                              Khóa tài khoản
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Users className="h-12 w-12 opacity-20" />
                      <p>
                        {data && data.length > 0
                          ? "Không tìm thấy khách hàng phù hợp"
                          : "Chưa có khách hàng nào"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

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

      {/* Edit Customer Dialog */}
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

      {/* Lock/Unlock User Dialog */}
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

      {/* Manage Roles Dialog */}
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
    </div>
  );
}
