import { Settings2 } from "lucide-react";

interface ConfigsLayoutProps {
  children: React.ReactNode;
}

export default function ConfigsLayout({ children }: ConfigsLayoutProps) {
  return (
    <div className="flex h-full flex-col p-4 ">
      <div className="flex-none pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary ring-1 ring-inset ring-primary/10">
            <Settings2 className="h-5 w-5" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Quản lý Cấu hình Hệ thống
            </h1>
            <p className="text-sm text-muted-foreground/80">
              Tùy chỉnh các thông số hoạt động và biến số môi trường
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto container h-full">{children}</div>
      </div>
    </div>
  );
}
