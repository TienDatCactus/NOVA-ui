import { Link } from "react-router";
import { ShieldAlert, Home, ArrowLeft, Lock } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

export default function Unauthorized() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-muted/30 p-4 overflow-hidden">
      {/* Optional: Subtle background pattern for depth */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>

      <Card className="w-full max-w-md shadow-2xl border-destructive/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex flex-col items-center p-10 text-center">
          {/* Icon with Ring Animation Effect */}
          <div className="relative mb-6 group">
            <div className="absolute inset-0 rounded-full bg-destructive/20 animate-ping opacity-20 duration-1000"></div>
            <div className="relative rounded-full bg-destructive/10 p-4 ring-1 ring-destructive/20">
              <Lock className="h-10 w-10 text-destructive" />
            </div>
          </div>

          {/* Typography */}
          <h1 className="font-mono text-5xl font-bold tracking-tighter text-foreground mb-2">
            403
          </h1>
          <h2 className="text-xl font-semibold tracking-tight">
            Truy cập bị từ chối
          </h2>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed max-w-xs mx-auto">
            Xin lỗi, bạn không có quyền truy cập vào tài nguyên này. Hãy liên hệ
            với quản trị viên hoặc quay lại trang trước.
          </p>

          {/* Action Buttons */}
          <div className="flex w-full flex-col sm:flex-row gap-3 justify-center mt-8">
            <Button asChild variant="outline" className="flex-1">
              <Link to={-1 as any} replace>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Link>
            </Button>
            <Button asChild className="flex-1 shadow-md shadow-primary/20">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Trang chủ
              </Link>
            </Button>
          </div>
        </div>

        {/* Footer decoration */}
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-destructive/40 to-transparent opacity-50" />
      </Card>
    </div>
  );
}
