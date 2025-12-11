import type { PropsWithChildren } from "react";

interface StaffRoleLayoutProps extends PropsWithChildren {
  totalRoles: number;
}

export default function StaffRoleLayout({
  totalRoles,
  children,
}: StaffRoleLayoutProps) {
  return (
    <div className="grid gap-6 p-4">
      <div className="flex items-center justify-between">
        <div className="grid gap-2">
          <h1 className="text-3xl font-bold">Chức vụ nhân sự</h1>
          <p className="text-sm text-muted-foreground">
            Tổng{" "}
            <span className="font-semibold text-foreground">{totalRoles}</span>{" "}
            Chức vụ
          </p>
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
