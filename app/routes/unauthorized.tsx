import { Link } from "react-router";
import { ShieldAlert, Home, ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="pt-12 pb-8">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-6">
                <ShieldAlert className="h-16 w-16 text-destructive" />
              </div>
            </div>

            {/* Error Code */}
            <div>
              <h1 className="text-6xl font-bold text-destructive">403</h1>
              <h2 className="text-2xl font-semibold mt-2">
                Truy cập bị từ chối
              </h2>
              <p className="text-muted-foreground mt-3 text-sm">
                Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị
                viên nếu bạn cho rằng đây là lỗi.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button asChild variant="outline" className="gap-2">
                <Link to="/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại
                </Link>
              </Button>
              <Button asChild className="gap-2">
                <Link to="/">
                  <Home className="h-4 w-4" />
                  Trang chủ
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
