import { Settings2 } from "lucide-react";

interface ConfigsLayoutProps {
  children: React.ReactNode;
}

export default function ConfigsLayout({ children }: ConfigsLayoutProps) {
  return (
    <div className="flex h-full flex-col p-4 ">
      <div className="flex-none pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Quản lý Cấu hình Hệ thống
          </h1>
          <p className="text-sm text-muted-foreground/80">
            Tùy chỉnh các thông số hoạt động và biến số môi trường
          </p>
        </div>
      </div>

      <main>{children}</main>
    </div>
  );
}
