# 🔐 Hướng Dẫn Sử Dụng RBAC Auth System - NOVA-UI

## 📚 Mục Lục

1. [Tổng Quan Hệ Thống](#tổng-quan-hệ-thống)
2. [Bảo Vệ Routes với clientLoader](#bảo-vệ-routes-với-clientloader)
3. [Conditional Rendering trong Components](#conditional-rendering-trong-components)
4. [useAuth Hook](#useauth-hook)
5. [Protected Components](#protected-components)
6. [Các Case Thực Tế](#các-case-thực-tế)

---

## Tổng Quan Hệ Thống

### 5 User Roles (Vai trò người dùng)

```typescript
UserRole.Admin; // Quản trị viên - Toàn quyền hệ thống
UserRole.HotelManager; // Quản lý khách sạn - Toàn quyền nghiệp vụ
UserRole.Accountant; // Kế toán - Quản lý tài chính
UserRole.Receptionist; // Lễ tân - Quản lý đặt phòng, hóa đơn
UserRole.ServiceStaff; // Nhân viên phục vụ - Quản lý kho, menu
```

### 24 Route Modules (Module chức năng)

```typescript
RouteModule.Users; // Quản lý tài khoản
RouteModule.Bookings; // Đặt phòng
RouteModule.Rooms; // Quản lý phòng
RouteModule.Invoices; // Hóa đơn
RouteModule.Staff; // Nhân viên
RouteModule.Payroll; // Bảng lương
RouteModule.Stock; // Kho hàng
RouteModule.Menu; // Thực đơn
// ... và 16 modules khác
```

### 5 Permission Types (Quyền)

```typescript
Permission.Read; // Xem dữ liệu
Permission.Create; // Tạo mới
Permission.Update; // Chỉnh sửa
Permission.Delete; // Xóa
Permission.Execute; // Thực thi (approve, refund, etc.)
```

---

## Bảo Vệ Routes với clientLoader

### 📌 Case 1: Bảo vệ route cơ bản (chỉ yêu cầu đăng nhập)

```typescript
// app/routes/dashboard/home.tsx
import { AuthLoader } from "~/lib/auth/auth.loader";

export const clientLoader = () => AuthLoader.requireAuth();

export default function HomePage() {
  return <div>Welcome!</div>;
}
```

**Khi nào dùng:** Route không nhạy cảm, chỉ cần user đã đăng nhập.

---

### 📌 Case 2: Bảo vệ route theo Role (Admin only)

```typescript
// app/routes/users/users.tsx
import { AuthLoader, UserRole } from "~/lib/auth/auth.loader";

export const clientLoader = () => AuthLoader.requireRole(UserRole.Admin);

export default function UsersPage() {
  // CHỈ Admin mới vào được trang này
  return <div>User Management</div>;
}
```

**Khi nào dùng:** Trang chỉ dành cho 1 role cụ thể (Users, AuditLogs, Configs).

---

### 📌 Case 3: Bảo vệ route cho nhiều Roles

```typescript
// app/routes/chat/chat.tsx
import { AuthLoader, UserRole } from "~/lib/auth/auth.loader";

export const clientLoader = () =>
  AuthLoader.requireRole([
    UserRole.HotelManager,
    UserRole.Receptionist,
    UserRole.ServiceStaff
  ]);

export default function ChatPage() {
  // HotelManager, Receptionist, ServiceStaff đều vào được
  return <div>Chat Support</div>;
}
```

**Khi nào dùng:** Nhiều role có thể truy cập (Chat, Menu, Services).

---

### 📌 Case 4: Bảo vệ route theo Module (recommended - tự động map permissions)

```typescript
// app/routes/reservation/bookings/list.tsx
import { AuthLoader, RouteModule } from "~/lib/auth/auth.loader";

export const clientLoader = () =>
  AuthLoader.requireModule(RouteModule.Bookings);

export default function BookingsListPage() {
  // Tự động kiểm tra: user có quyền truy cập module Bookings không?
  // Dựa vào MODULE_PERMISSIONS trong roles.ts
  return <div>Bookings List</div>;
}
```

**Khi nào dùng:** Khi bạn muốn dựa vào permission matrix tự động.

---

### 📌 Case 5: Bảo vệ route theo Permission cụ thể ⭐ (RECOMMENDED)

```typescript
// app/routes/reservation/new-booking.tsx
import { AuthLoader, RouteModule, Permission } from "~/lib/auth/auth.loader";

export const clientLoader = () =>
  AuthLoader.guard(RouteModule.Bookings, Permission.Create);

export default function NewBookingPage() {
  // CHỈ user có quyền CREATE booking mới vào được
  // (Receptionist có, nhưng Accountant không có)
  return <div>Create New Booking</div>;
}
```

**Khi nào dùng:**

- Trang tạo mới: `Permission.Create`
- Trang chỉnh sửa: `Permission.Update`
- Trang xóa/archive: `Permission.Delete`
- Trang approve/refund: `Permission.Execute`

---

### 📌 Case 6: Custom logic trong clientLoader

```typescript
// app/routes/staff/payrolls/detail.tsx
import { AuthLoader, RouteModule, Permission } from "~/lib/auth/auth.loader";
import { redirect } from "react-router";

export const clientLoader = async ({ params }) => {
  const user = AuthLoader.getUser();

  // Custom check: chỉ cho phép xem payroll của chính mình
  if (user?.role === UserRole.ServiceStaff && params.staffId !== user.staffId) {
    throw redirect("/unauthorized");
  }

  // Hoặc dùng guard chuẩn
  AuthLoader.guard(RouteModule.Payroll, Permission.Read);

  // Load data
  const payroll = await PayrollService.getDetail(params.payrollId);
  return { payroll };
};
```

**Khi nào dùng:** Logic phức tạp, cần check thêm business rules.

---

## Conditional Rendering trong Components

### 📌 Case 7: Ẩn/hiện button theo Permission (phổ biến nhất)

```typescript
// app/routes/invoices/invoice-detail.tsx
import { useAuth } from "~/lib/auth/components";
import { RouteModule } from "~/lib/auth/roles";

export default function InvoiceDetail({ invoice }) {
  const { can } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice #{invoice.code}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Amount: {invoice.total}</p>
        <p>Status: {invoice.status}</p>
      </CardContent>
      <CardFooter className="gap-2">
        {/* CHỈ hiện nút "Mark as Paid" nếu có quyền Execute */}
        {can.execute(RouteModule.Invoices) && (
          <Button onClick={handleMarkPaid}>
            Mark as Paid
          </Button>
        )}

        {/* CHỈ hiện nút "Edit" nếu có quyền Update */}
        {can.update(RouteModule.Invoices) && (
          <Button variant="outline" onClick={handleEdit}>
            Edit Invoice
          </Button>
        )}

        {/* CHỈ hiện nút "Void" nếu có quyền Execute (Accountant only) */}
        {can.execute(RouteModule.Invoices) && (
          <Button variant="destructive" onClick={handleVoid}>
            Void Invoice
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
```

**Khi nào dùng:** Action buttons, CTA, form actions.

---

### 📌 Case 8: Ẩn/hiện cột trong table

```typescript
// app/routes/staff/components/staff-table/columns.tsx
import { useAuth } from "~/lib/auth/components";
import { RouteModule } from "~/lib/auth/roles";

export function useStaffColumns() {
  const { can } = useAuth();

  const columns = [
    { key: "name", label: "Name" },
    { key: "role", label: "Role" },
    { key: "phone", label: "Phone" },
  ];

  // CHỈ Admin và HotelManager mới thấy cột Salary
  if (can.read(RouteModule.Payroll)) {
    columns.push({ key: "salary", label: "Salary" });
  }

  // CHỈ có quyền Update mới hiện cột Actions
  if (can.update(RouteModule.Staff)) {
    columns.push({ key: "actions", label: "Actions" });
  }

  return columns;
}
```

**Khi nào dùng:** Sensitive data columns, action columns.

---

### 📌 Case 9: Hiển thị UI khác nhau theo Role

```typescript
// app/routes/dashboard/home.tsx
import { useAuth } from "~/lib/auth/components";
import { UserRole } from "~/lib/auth/roles";

export default function Dashboard() {
  const { user, hasRole, hasAnyRole } = useAuth();

  // Admin thấy dashboard đầy đủ
  if (hasRole(UserRole.Admin)) {
    return <AdminDashboard />;
  }

  // HotelManager + Accountant thấy financial dashboard
  if (hasAnyRole([UserRole.HotelManager, UserRole.Accountant])) {
    return <FinancialDashboard />;
  }

  // Receptionist thấy booking dashboard
  if (hasRole(UserRole.Receptionist)) {
    return <BookingDashboard />;
  }

  // ServiceStaff thấy orders dashboard
  return <OrdersDashboard />;
}
```

**Khi nào dùng:** Personalized dashboards, role-specific views.

---

### 📌 Case 10: Filter navigation items

```typescript
// app/components/sidebar/nav-items.tsx
import { useAuth } from "~/lib/auth/components";
import { RouteModule } from "~/lib/auth/roles";

export function NavigationMenu() {
  const { canAccess } = useAuth();

  const navItems = [
    {
      label: "Đặt phòng",
      href: "/bookings",
      module: RouteModule.Bookings
    },
    {
      label: "Hóa đơn",
      href: "/invoices",
      module: RouteModule.Invoices
    },
    {
      label: "Nhân viên",
      href: "/staff",
      module: RouteModule.Staff
    },
    {
      label: "Tài khoản",
      href: "/users",
      module: RouteModule.Users
    },
  ];

  return (
    <nav>
      {navItems
        .filter(item => canAccess(item.module)) // CHỈ hiện nav item có quyền
        .map(item => (
          <NavLink key={item.href} to={item.href}>
            {item.label}
          </NavLink>
        ))
      }
    </nav>
  );
}
```

**Khi nào dùng:** Sidebar, navigation menu, breadcrumbs.

---

## useAuth Hook

### 📌 Case 11: Lấy thông tin user hiện tại

```typescript
import { useAuth } from "~/lib/auth/components";

function UserProfile() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.fullName}</h1>
      <p>Email: {user.email}</p>
      <p>Roles: {user.roles.join(", ")}</p>
    </div>
  );
}
```

---

### 📌 Case 12: Check role trực tiếp

```typescript
import { useAuth } from "~/lib/auth/components";
import { UserRole } from "~/lib/auth/roles";

function AdvancedSettings() {
  const { hasRole } = useAuth();

  if (!hasRole(UserRole.Admin)) {
    return <div>Access Denied</div>;
  }

  return <AdminSettings />;
}
```

---

### 📌 Case 13: Check multiple permissions cùng lúc

```typescript
import { useAuth } from "~/lib/auth/components";
import { RouteModule } from "~/lib/auth/roles";

function BookingActions({ bookingId }) {
  const { can } = useAuth();

  const canEdit = can.update(RouteModule.Bookings);
  const canCancel = can.delete(RouteModule.Bookings);
  const canRefund = can.execute(RouteModule.Refunds);

  return (
    <div className="flex gap-2">
      {canEdit && <Button>Edit</Button>}
      {canCancel && <Button variant="destructive">Cancel</Button>}
      {canRefund && <Button>Request Refund</Button>}
    </div>
  );
}
```

---

## Protected Components

### 📌 Case 14: Wrapper component theo Role

```typescript
import { ProtectedByRole } from "~/lib/auth/components";
import { UserRole } from "~/lib/auth/roles";

function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>

      {/* CHỈ Admin mới thấy */}
      <ProtectedByRole roles={UserRole.Admin}>
        <SystemConfigPanel />
      </ProtectedByRole>

      {/* HotelManager hoặc Admin mới thấy */}
      <ProtectedByRole roles={[UserRole.Admin, UserRole.HotelManager]}>
        <BusinessConfigPanel />
      </ProtectedByRole>

      {/* Tất cả role đều thấy */}
      <PersonalSettingsPanel />
    </div>
  );
}
```

---

### 📌 Case 15: Wrapper component theo Module

```typescript
import { ProtectedByModule } from "~/lib/auth/components";
import { RouteModule } from "~/lib/auth/roles";

function ReportsPage() {
  return (
    <div>
      <h1>Reports</h1>

      <ProtectedByModule module={RouteModule.FinancialReports}>
        <FinancialReportSection />
      </ProtectedByModule>

      <ProtectedByModule module={RouteModule.Bookings}>
        <BookingReportSection />
      </ProtectedByModule>

      <ProtectedByModule module={RouteModule.Staff}>
        <StaffReportSection />
      </ProtectedByModule>
    </div>
  );
}
```

---

### 📌 Case 16: Wrapper component theo Permission cụ thể

```typescript
import { ProtectedByPermission } from "~/lib/auth/components";
import { RouteModule, Permission } from "~/lib/auth/roles";

function InvoicePage({ invoice }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice #{invoice.code}</CardTitle>
      </CardHeader>

      <CardContent>
        {/* Hiển thị chi tiết */}
        <InvoiceDetails invoice={invoice} />
      </CardContent>

      <CardFooter>
        {/* CHỈ hiện nếu có quyền Update */}
        <ProtectedByPermission
          module={RouteModule.Invoices}
          permission={Permission.Update}
        >
          <Button onClick={handleEdit}>Edit Invoice</Button>
        </ProtectedByPermission>

        {/* CHỈ hiện nếu có quyền Execute (void/refund) */}
        <ProtectedByPermission
          module={RouteModule.Invoices}
          permission={Permission.Execute}
        >
          <Button variant="destructive" onClick={handleVoid}>
            Void Invoice
          </Button>
        </ProtectedByPermission>
      </CardFooter>
    </Card>
  );
}
```

---

### 📌 Case 17: Sử dụng fallback UI

```typescript
import { ProtectedByRole } from "~/lib/auth/components";
import { UserRole } from "~/lib/auth/roles";

function PricingSensitiveData() {
  return (
    <ProtectedByRole
      roles={[UserRole.Admin, UserRole.HotelManager, UserRole.Accountant]}
      fallback={
        <div className="text-muted-foreground">
          You don't have permission to view pricing information.
        </div>
      }
    >
      <PricingTable />
    </ProtectedByRole>
  );
}
```

---

## Các Case Thực Tế

### 📌 Case 18: Form với fields có điều kiện

```typescript
import { useAuth } from "~/lib/auth/components";
import { RouteModule, UserRole } from "~/lib/auth/roles";

function BookingForm() {
  const { hasRole, can } = useAuth();
  const form = useForm();

  return (
    <Form {...form}>
      {/* Tất cả users đều nhập được */}
      <FormField name="customerName">
        <FormLabel>Customer Name</FormLabel>
        <FormControl>
          <Input {...form.register("customerName")} />
        </FormControl>
      </FormField>

      {/* CHỈ Receptionist và HotelManager mới thấy discount field */}
      {hasRole(UserRole.Receptionist) || hasRole(UserRole.HotelManager) && (
        <FormField name="discount">
          <FormLabel>Discount (%)</FormLabel>
          <FormControl>
            <Input type="number" {...form.register("discount")} />
          </FormControl>
        </FormField>
      )}

      {/* CHỈ HotelManager mới override được giá */}
      {can.execute(RouteModule.Bookings) && (
        <FormField name="customPrice">
          <FormLabel>Custom Price (Override)</FormLabel>
          <FormControl>
            <Input type="number" {...form.register("customPrice")} />
          </FormControl>
        </FormField>
      )}

      <Button type="submit">Submit</Button>
    </Form>
  );
}
```

---

### 📌 Case 19: Table actions với permissions

```typescript
import { useAuth } from "~/lib/auth/components";
import { RouteModule } from "~/lib/auth/roles";

function StaffTableActions({ staff }) {
  const { can } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {/* Tất cả đều xem được */}
        <DropdownMenuItem onClick={() => viewDetails(staff.id)}>
          View Details
        </DropdownMenuItem>

        {/* CHỈ có quyền Update mới Edit được */}
        {can.update(RouteModule.Staff) && (
          <DropdownMenuItem onClick={() => editStaff(staff.id)}>
            Edit
          </DropdownMenuItem>
        )}

        {/* CHỈ có quyền Delete mới Terminate được */}
        {can.delete(RouteModule.Staff) && (
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => terminateStaff(staff.id)}
          >
            Terminate
          </DropdownMenuItem>
        )}

        {/* CHỈ có quyền Execute mới Approve Leave được */}
        {can.execute(RouteModule.Staff) && (
          <DropdownMenuItem onClick={() => approveLeave(staff.id)}>
            Approve Leave Request
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

### 📌 Case 20: Complex permission logic

```typescript
import { useAuth } from "~/lib/auth/components";
import { RouteModule, UserRole } from "~/lib/auth/roles";

function PayrollApprovalButton({ payroll }) {
  const { user, hasRole, can } = useAuth();

  // Business logic phức tạp
  const canApprove =
    // Phải có quyền Execute
    can.execute(RouteModule.Payroll) &&
    // KHÔNG phải payroll của chính mình
    payroll.staffId !== user?.staffId &&
    // Payroll chưa được approve
    payroll.status === "Pending" &&
    // Phải là HotelManager hoặc Admin
    (hasRole(UserRole.HotelManager) || hasRole(UserRole.Admin));

  if (!canApprove) {
    return null; // Không hiện button
  }

  return (
    <Button onClick={handleApprove}>
      Approve Payroll
    </Button>
  );
}
```

---

### 📌 Case 21: Conditional Sidebar Navigation (Đã implement)

```typescript
// app/components/layouts/side-bar/dashboard/side-bar.dashboard.tsx
import { useAuth } from "~/lib/auth/components";

export function AppSidebar() {
  const { canAccess } = useAuth();

  const filteredNavMain = useMemo(() => {
    return SIDEBAR_NAV_MAIN
      .filter((item) => {
        if (!item.module) return true;
        return canAccess(item.module); // Tự động lọc theo permission
      })
      .map((item) => {
        if (item.items) {
          return {
            ...item,
            items: item.items.filter((subItem) => {
              if (!subItem.module) return true;
              return canAccess(subItem.module);
            }),
          };
        }
        return item;
      });
  }, [canAccess]);

  return (
    <Sidebar>
      <NavMain items={filteredNavMain} />
    </Sidebar>
  );
}
```

---

### 📌 Case 22: Optimistic UI với permission check

```typescript
import { useAuth } from "~/lib/auth/components";
import { RouteModule } from "~/lib/auth/roles";
import { toast } from "sonner";

function QuickEditBooking({ booking }) {
  const { can } = useAuth();
  const updateBooking = useUpdateBooking();

  const handleQuickEdit = async (field, value) => {
    // Check permission trước khi gọi API
    if (!can.update(RouteModule.Bookings)) {
      toast.error("Bạn không có quyền chỉnh sửa booking");
      return;
    }

    // Optimistic update
    const previousData = booking;

    try {
      await updateBooking.mutateAsync({
        id: booking.id,
        [field]: value
      });
      toast.success("Updated successfully");
    } catch (error) {
      // Rollback nếu lỗi
      toast.error("Update failed");
    }
  };

  return (
    <div>
      {can.update(RouteModule.Bookings) ? (
        <input
          value={booking.notes}
          onChange={(e) => handleQuickEdit("notes", e.target.value)}
          onBlur={handleSave}
        />
      ) : (
        <p className="text-muted-foreground">{booking.notes}</p>
      )}
    </div>
  );
}
```

---

## 🎓 Best Practices

### ✅ DO (Nên làm)

1. **Luôn dùng `AuthLoader.guard()` cho routes**

   ```typescript
   export const clientLoader = () =>
     AuthLoader.guard(RouteModule.Bookings, Permission.Read);
   ```

2. **Dùng `useAuth()` hook trong components**

   ```typescript
   const { can, hasRole } = useAuth();
   ```

3. **Check permission TRƯỚC KHI gọi API**

   ```typescript
   if (!can.delete(RouteModule.Staff)) {
     toast.error("No permission");
     return;
   }
   await deleteStaff(id);
   ```

4. **Ẩn UI elements user không có quyền**

   ```typescript
   {can.update(RouteModule.Invoices) && <Button>Edit</Button>}
   ```

5. **Dùng fallback cho better UX**
   ```typescript
   <ProtectedByRole
     roles={UserRole.Admin}
     fallback={<AccessDenied />}
   >
   ```

### ❌ DON'T (Không nên làm)

1. **Không hardcode role strings**

   ```typescript
   // ❌ WRONG
   if (user.role === "Admin") { ... }

   // ✅ CORRECT
   if (hasRole(UserRole.Admin)) { ... }
   ```

2. **Không tin tưởng frontend-only checks**

   ```typescript
   // ❌ KHÔNG ĐỦ - Backend phải validate lại
   if (can.delete(RouteModule.Staff)) {
     await deleteStaff(id); // Backend cũng phải check permission!
   }
   ```

3. **Không bypass permission system**

   ```typescript
   // ❌ WRONG - Truy cập trực tiếp user.roles
   if (user.roles.includes("Admin")) { ... }

   // ✅ CORRECT - Dùng auth utilities
   if (hasRole(UserRole.Admin)) { ... }
   ```

4. **Không quên xử lý loading state**

   ```typescript
   const { user, isAuthenticated } = useAuth();

   if (!isAuthenticated) {
     return <LoadingSpinner />; // Hoặc redirect
   }
   ```

---

## 📊 Permission Matrix Reference

| Module        | Admin | HotelManager | Accountant | Receptionist | ServiceStaff |
| ------------- | ----- | ------------ | ---------- | ------------ | ------------ |
| **Users**     | Full  | -            | -          | -            | -            |
| **Bookings**  | -     | Read         | -          | Full         | -            |
| **Rooms**     | -     | Full         | -          | Read+Update  | -            |
| **Invoices**  | -     | Read         | Full       | Read+Update  | -            |
| **Staff**     | -     | Full         | Read       | -            | -            |
| **Payroll**   | -     | Read+Execute | Full       | -            | -            |
| **Stock**     | -     | Full         | -          | -            | Read+Create  |
| **Menu**      | -     | Full         | -          | Read+Update  | Create       |
| **Orders**    | -     | Read         | -          | Full         | -            |
| **AuditLogs** | Full  | -            | -          | -            | -            |

**Full** = Read + Create + Update + Delete + Execute

---

## 🚀 Quick Reference

### Import statements

```typescript
// For routes (clientLoader)
import { AuthLoader, RouteModule, Permission } from "~/lib/auth/auth.loader";

// For components
import { useAuth } from "~/lib/auth/components";
import {
  ProtectedByRole,
  ProtectedByModule,
  ProtectedByPermission,
} from "~/lib/auth/components";
import { UserRole, RouteModule, Permission } from "~/lib/auth/roles";
```

### Cheat Sheet

```typescript
// Route protection
export const clientLoader = () => AuthLoader.guard(RouteModule.X, Permission.Y);

// Component permission check
const { can } = useAuth();
{can.update(RouteModule.X) && <Button>Edit</Button>}

// Role check
const { hasRole } = useAuth();
{hasRole(UserRole.Admin) && <AdminPanel />}

// Component wrapper
<ProtectedByPermission module={RouteModule.X} permission={Permission.Y}>
  <SensitiveContent />
</ProtectedByPermission>
```

---

**Tài liệu này được cập nhật:** December 2025  
**Phiên bản:** 1.0.0  
**Tác giả:** NOVA Development Team
