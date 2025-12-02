import {
  Clock,
  Wifi,
  Droplet,
  Leaf,
  AlertTriangle,
  Flame,
  Bug,
  Star,
  Cable,
  Sparkles,
  Wine,
  UtensilsCrossed,
  Bed,
  Sun,
  Moon,
  Coffee,
  Bath,
  Tv,
  Refrigerator,
  Wind,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/20 to-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-12 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Thông báo lưu trú tại Eco Palms House
          </h1>
          <p className="text-lg opacity-90">
            Hướng dẫn chi tiết để kỳ nghỉ của bạn thật thoải mái và an toàn
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Check-in/Check-out Times */}
        <Card className="shadow-sm border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary" />
              Thời gian
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Sun className="h-5 w-5 text-orange-500 mt-1" />
                <div>
                  <p className="font-semibold">Check-in</p>
                  <p className="text-sm text-muted-foreground">
                    Từ 13:00 (1 giờ chiều)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Moon className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <p className="font-semibold">Check-out</p>
                  <p className="text-sm text-muted-foreground">
                    Trước 11:00 sáng
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Coffee className="h-5 w-5 text-amber-600 mt-1" />
                <div>
                  <p className="font-semibold">Ăn sáng</p>
                  <p className="text-sm text-muted-foreground">
                    7:30 – 9:30 sáng tại nhà hàng
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <UtensilsCrossed className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <p className="font-semibold">Order bữa tối</p>
                  <p className="text-sm text-muted-foreground">Đến 20:30 tối</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wi-Fi Information */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Wifi className="h-6 w-6 text-primary" />
              Thông tin Wi-Fi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Tên mạng:</span>
                <Badge variant="secondary" className="font-mono">
                  Eco Palms House
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Mật khẩu:</span>
                <Badge variant="secondary" className="font-mono">
                  loveeco12
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hot Water Usage */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Droplet className="h-6 w-6 text-blue-500" />
              Sử dụng nước nóng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                1
              </div>
              <p className="text-sm">
                Vặn tay cầm vòi về phía trái và chờ khoảng 3–5 phút.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                2
              </div>
              <p className="text-sm">
                Vào những ngày lạnh, nước nóng có thể chảy chậm hơn một chút,
                mong quý khách kiên nhẫn chờ.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="shadow-sm border-orange-200">
          <CardHeader className="bg-orange-50">
            <CardTitle className="flex items-center gap-3">
              <Leaf className="h-6 w-6 text-green-600" />
              Một vài lưu ý quan trọng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Room Design & Amenities */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Thiết kế & tiện nghi phòng</h4>
              </div>
              <ul className="space-y-2 ml-7 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    Eco Palms House được xây dựng theo phong cách du lịch sinh
                    thái, để quý khách cảm nhận sự yên bình tự nhiên, nên trong
                    phòng không có TV hay tủ lạnh.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    Vui lòng không giặt giũ hay phơi quần áo trong phòng để
                    tránh ẩm mốc và bảo vệ nội thất.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    Xin giữ bean bag luôn khô ráo; nếu bị ướt rất khó làm sạch
                    và có thể phát sinh phí vệ sinh đặc biệt{" "}
                    <strong className="text-destructive">500,000 VND</strong>.
                  </span>
                </li>
              </ul>
            </div>

            <Separator />

            {/* Towels */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Khăn tắm</h4>
              </div>
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-sm space-y-2">
                  <p>
                    Khăn trắng được chuẩn bị riêng cho việc tắm rửa, lau người.
                  </p>
                  <p>
                    Nếu dùng cho mục đích khác (lau sàn, giày dép, thú cưng…),
                    khăn có thể hỏng không thể giặt sạch. Khi đó, chúng tôi buộc
                    phải thu phí thay thế{" "}
                    <strong className="text-destructive">1,000,000 VND</strong>.
                  </p>
                </AlertDescription>
              </Alert>
            </div>

            <Separator />

            {/* Electrical Devices */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Cable className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Thiết bị điện</h4>
              </div>
              <ul className="space-y-2 ml-7 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    Vì lý do an toàn, vui lòng không sử dụng thiết bị điện công
                    suất lớn (như nồi cơm điện, bếp, máy sấy tóc mang theo…).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    Khi ra ngoài, hãy nhớ tắt hết các thiết bị điện để tiết kiệm
                    năng lượng và giữ an toàn.
                  </span>
                </li>
              </ul>
            </div>

            <Separator />

            {/* Fire Safety */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-red-500" />
                <h4 className="font-semibold text-red-600">
                  An toàn phòng cháy
                </h4>
              </div>
              <Alert variant="destructive" className="border-red-200">
                <Shield className="h-4 w-4" />
                <AlertDescription className="text-sm space-y-2">
                  <p>
                    Các bungalow được làm từ vật liệu tự nhiên nên khá nhạy cảm
                    với lửa.
                  </p>
                  <p className="font-semibold">
                    Vì vậy, xin vui lòng không hút thuốc, đốt nến hoặc sử dụng
                    lửa trong phòng.
                  </p>
                  <p>Nếu có sự cố khẩn cấp, hãy báo ngay cho nhân viên.</p>
                </AlertDescription>
              </Alert>
            </div>

            <Separator />

            {/* Food in Room */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Đồ ăn trong phòng</h4>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <p className="text-sm">
                  Vui lòng không mang đồ ăn vào trong phòng. Vụn đồ ăn sẽ thu
                  hút "những vị khách không mời" 🐭. Biết đâu một chú chuột sẽ
                  vào phòng chụp ảnh, trở thành idol, rồi tiếp quản cả thế giới
                  và thống trị vũ trụ 🌌.
                </p>
              </div>
            </div>

            <Separator />

            {/* Insects & Nature */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold">
                  Côn trùng & môi trường tự nhiên
                </h4>
              </div>
              <ul className="space-y-2 ml-7 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    Ở nơi gần gũi thiên nhiên, thỉnh thoảng có thể xuất hiện côn
                    trùng nhỏ.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    Quý khách có thể hạn chế bằng cách đóng cửa và tắt bớt đèn
                    khi không cần thiết.
                  </span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Popular Services */}
        <Card className="shadow-sm border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
              Dịch vụ được khách yêu thích tại Eco Palms House
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {/* Cable Car */}
              <div className="flex items-start gap-4 p-4 bg-background rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                <div className="mt-1 p-2 bg-primary/10 rounded-lg">
                  <Cable className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">
                    Đặt vé cáp treo Fansipan
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Tránh phải xếp hàng, lễ tân sẽ hỗ trợ đặt vé chính thức
                    nhanh chóng.
                  </p>
                </div>
              </div>

              {/* Massage */}
              <div className="flex items-start gap-4 p-4 bg-background rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                <div className="mt-1 p-2 bg-primary/10 rounded-lg">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Massage thư giãn</h4>
                  <p className="text-sm text-muted-foreground">
                    Lựa chọn tuyệt vời sau các chuyến trekking, giúp cơ thể hồi
                    phục nhanh hơn.
                  </p>
                </div>
              </div>

              {/* Happy Hour */}
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="mt-1 p-2 bg-orange-500/10 rounded-lg">
                  <Wine className="h-6 w-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">
                      Happy Hour – Cocktail & Beer
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      15:00 – 18:00
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Tận hưởng khung cảnh hoàng hôn trên thung lũng cùng ưu đãi
                    đặc biệt:
                  </p>
                  <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 rounded-md border border-orange-300">
                    <span className="text-2xl">👉</span>
                    <p className="text-sm font-semibold text-orange-700">
                      Mua 1 tặng 1 cho cocktail & beer trong danh sách menu của
                      chúng tôi
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thank You Note */}
        <Card className="shadow-lg border-primary/30 bg-gradient-to-br from-primary/10 via-background to-green-50">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Leaf className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold">
              Cảm ơn quý khách đã lựa chọn Eco Palms House!
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Chúng tôi mong rằng kỳ nghỉ tại đây sẽ mang lại cho quý khách
              những phút giây thư giãn, gần gũi với thiên nhiên và thật nhiều kỷ
              niệm đáng nhớ 🌿
            </p>
            <div className="pt-4">
              <Badge variant="outline" className="text-sm px-4 py-2">
                Eco-Friendly • Sustainable Tourism • Natural Living
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="bg-muted/30 py-8 px-6 mt-12">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          <p>
            Nếu quý khách cần hỗ trợ thêm, vui lòng liên hệ lễ tân hoặc gọi số
            điện thoại khẩn cấp được cung cấp tại phòng.
          </p>
        </div>
      </div>
    </div>
  );
}
