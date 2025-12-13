import { AlertCircle, CheckCircle2, Info, Palette } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";

export default function ColorSystemShowcase() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Palette className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold">NOVA Design System</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hệ thống màu semantic tokens được thiết kế cho NOVA-UI. Tất cả màu
            sắc tự động hỗ trợ Light/Dark mode.
          </p>
        </div>

        <Separator />

        {/* Base Colors Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Base Colors</h2>
            <p className="text-muted-foreground">
              Màu nền và chữ cơ bản của ứng dụng. Sử dụng cho toàn bộ background
              và text chính.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="overflow-hidden">
              <div className="h-32 bg-background border-2 border-border flex items-center justify-center">
                <span className="text-foreground font-semibold">
                  bg-background
                </span>
              </div>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Nền chính của trang. Thường là trắng (light mode) hoặc đen
                  (dark mode).
                </p>
                <code className="text-xs bg-muted px-2 py-1 rounded mt-2 block">
                  className="bg-background"
                </code>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="h-32 bg-background border-2 border-border flex items-center justify-center">
                <span className="text-foreground font-bold text-xl">
                  text-foreground
                </span>
              </div>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Màu chữ chính, tương phản cao với background.
                </p>
                <code className="text-xs bg-muted px-2 py-1 rounded mt-2 block">
                  className="text-foreground"
                </code>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Card Colors Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Card Colors</h2>
            <p className="text-muted-foreground">
              Màu cho các thẻ nội dung, tạo độ sâu và phân tầng UI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card text-card-foreground shadow-s">
              <CardHeader>
                <CardTitle>Card Component</CardTitle>
                <CardDescription>
                  Sử dụng bg-card và text-card-foreground
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">
                  Card thường được đặt trên background để tạo độ sâu. Nền card
                  nhẹ hơn background một chút.
                </p>
                <code className="text-xs bg-muted px-2 py-1 rounded block">
                  className="bg-card text-card-foreground"
                </code>
              </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground shadow-m">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
                <CardDescription>
                  Card với shadow lớn hơn (shadow-m)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">
                  Sử dụng shadow để tạo mức độ ưu tiên. Card quan trọng hơn dùng
                  shadow-m hoặc shadow-l.
                </p>
                <code className="text-xs bg-muted px-2 py-1 rounded block">
                  className="shadow-m"
                </code>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Interactive Colors Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Interactive Colors</h2>
            <p className="text-muted-foreground">
              Màu cho các thành phần tương tác: buttons, links, active states.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Primary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Primary</CardTitle>
                <CardDescription>
                  CTA chính, hành động quan trọng nhất
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-primary text-primary-foreground">
                  Primary Button
                </Button>
                <div className="p-4 bg-primary text-primary-foreground rounded-lg text-center">
                  Primary Background
                </div>
                <code className="text-xs bg-muted px-2 py-1 rounded block">
                  bg-primary text-primary-foreground
                </code>
              </CardContent>
            </Card>

            {/* Secondary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Secondary</CardTitle>
                <CardDescription>
                  Hành động phụ, ít quan trọng hơn primary
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="secondary" className="w-full">
                  Secondary Button
                </Button>
                <div className="p-4 bg-secondary text-secondary-foreground rounded-lg text-center">
                  Secondary Background
                </div>
                <code className="text-xs bg-muted px-2 py-1 rounded block">
                  bg-secondary text-secondary-foreground
                </code>
              </CardContent>
            </Card>

            {/* Accent */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Accent</CardTitle>
                <CardDescription>
                  Nhấn mạnh, highlight, hover states
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full hover:bg-accent">
                  Hover Me (Accent)
                </Button>
                <div className="p-4 bg-accent text-accent-foreground rounded-lg text-center">
                  Accent Background
                </div>
                <code className="text-xs bg-muted px-2 py-1 rounded block">
                  bg-accent text-accent-foreground
                </code>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Utility Colors Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Utility Colors</h2>
            <p className="text-muted-foreground">
              Màu tiện ích cho các trạng thái đặc biệt: muted (phụ), destructive
              (lỗi/xóa).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Muted */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Muted</CardTitle>
                <CardDescription>Thông tin phụ, ít quan trọng</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 bg-muted text-muted-foreground rounded-lg">
                  <p className="font-semibold mb-2">Muted Background</p>
                  <p className="text-sm">
                    Sử dụng cho nền phụ, metadata, labels, descriptions.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-foreground font-semibold">
                    Title (foreground)
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Description text (muted-foreground) - ít nổi bật hơn
                  </p>
                </div>
                <code className="text-xs bg-muted px-2 py-1 rounded block">
                  bg-muted text-muted-foreground
                </code>
              </CardContent>
            </Card>

            {/* Destructive */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Destructive</CardTitle>
                <CardDescription>
                  Cảnh báo, lỗi, hành động nguy hiểm
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Không thể kết nối đến server.
                  </AlertDescription>
                </Alert>
                <code className="text-xs bg-muted px-2 py-1 rounded block">
                  bg-destructive text-destructive-foreground
                </code>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Form & Layout Colors Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Form & Layout Colors</h2>
            <p className="text-muted-foreground">
              Màu cho form inputs, borders, focus rings, và layout dividers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Border & Input */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Border & Input</CardTitle>
                <CardDescription>
                  Đường viền, phân cách, và input fields
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="demo-input">Email</Label>
                  <Input
                    id="demo-input"
                    type="email"
                    placeholder="name@example.com"
                    className="bg-input border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    border-border và bg-input
                  </p>
                </div>

                <Separator className="border-border" />

                <div className="space-y-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded block">
                    border-border
                  </code>
                  <code className="text-xs bg-muted px-2 py-1 rounded block">
                    bg-input
                  </code>
                </div>
              </CardContent>
            </Card>

            {/* Focus Ring */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Focus Ring</CardTitle>
                <CardDescription>Focus state cho accessibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="focus-demo">
                    Click vào input để thấy ring
                  </Label>
                  <Input
                    id="focus-demo"
                    placeholder="Focus để thấy ring màu..."
                    className="focus-visible:ring-ring"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    ring-ring xuất hiện khi focus
                  </p>
                </div>

                <Button
                  variant="outline"
                  className="w-full focus-visible:ring-ring"
                >
                  Focus vào button này
                </Button>

                <code className="text-xs bg-muted px-2 py-1 rounded block">
                  focus-visible:ring-ring
                </code>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Additional Examples */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Ví dụ tổng hợp</h2>
            <p className="text-muted-foreground">
              Kết hợp nhiều tokens trong các component thực tế.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alert Examples */}
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>
                  Alert mặc định dùng bg-background và border-border.
                </AlertDescription>
              </Alert>

              <Alert className="bg-accent text-accent-foreground border-accent">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Custom alert với accent color để hiển thị thành công.
                </AlertDescription>
              </Alert>
            </div>

            {/* Badge Examples */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Badge Variants</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge className="bg-accent text-accent-foreground">
                    Accent
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  Status Card
                </p>
                <p className="text-xs text-muted-foreground">
                  Kết hợp muted background với foreground text để tạo độ sâu.
                </p>
                <div className="flex gap-2 pt-2">
                  <Badge variant="outline">Active</Badge>
                  <Badge variant="secondary">Processing</Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Separator />

        <footer className="text-center py-8 text-muted-foreground text-sm">
          <p>NOVA Design System • Semantic Color Tokens</p>
          <p className="mt-2">
            Tất cả màu tự động thích ứng với Light/Dark mode thông qua CSS
            variables
          </p>
        </footer>
      </div>
    </div>
  );
}
