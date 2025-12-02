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
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";

export default function GuidesPage() {
  const { t } = useTranslation("guides");

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/20 to-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-12 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-lg opacity-90">{t("subtitle")}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {/* Check-in/Check-out Times */}
        <Card className="shadow-sm border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary" />
              {t("times.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Sun className="h-5 w-5 text-orange-500 mt-1" />
                <div>
                  <p className="font-semibold">{t("times.checkin")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("times.checkinTime")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Moon className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <p className="font-semibold">{t("times.checkout")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("times.checkoutTime")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Coffee className="h-5 w-5 text-amber-600 mt-1" />
                <div>
                  <p className="font-semibold">{t("times.breakfast")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("times.breakfastTime")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <UtensilsCrossed className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <p className="font-semibold">{t("times.dinner")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("times.dinnerTime")}
                  </p>
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
              {t("wifi.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">{t("wifi.network")}</span>
                <Badge variant="secondary" className="font-mono">
                  Eco Palms House
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">
                  {t("wifi.password")}
                </span>
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
              {t("hotWater.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                1
              </div>
              <p className="text-sm">{t("hotWater.step1")}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                2
              </div>
              <p className="text-sm">{t("hotWater.step2")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="shadow-sm border-orange-200">
          <CardHeader className="bg-orange-50">
            <CardTitle className="flex items-center gap-3">
              <Leaf className="h-6 w-6 text-green-600" />
              {t("notes.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Room Design & Amenities */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">{t("notes.roomDesign.title")}</h4>
              </div>
              <ul className="space-y-2 ml-7 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{t("notes.roomDesign.ecoStyle")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{t("notes.roomDesign.noLaundry")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    {t("notes.roomDesign.beanBag")}{" "}
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
                <h4 className="font-semibold">{t("notes.towels.title")}</h4>
              </div>
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-sm space-y-2">
                  <p>{t("notes.towels.purpose")}</p>
                  <p>
                    {t("notes.towels.warning")}{" "}
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
                <h4 className="font-semibold">{t("notes.electrical.title")}</h4>
              </div>
              <ul className="space-y-2 ml-7 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{t("notes.electrical.safety")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{t("notes.electrical.turnOff")}</span>
                </li>
              </ul>
            </div>

            <Separator />

            {/* Fire Safety */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-red-500" />
                <h4 className="font-semibold text-red-600">
                  {t("notes.fire.title")}
                </h4>
              </div>
              <Alert variant="destructive" className="border-red-200">
                <Shield className="h-4 w-4" />
                <AlertDescription className="text-sm space-y-2">
                  <p>{t("notes.fire.material")}</p>
                  <p className="font-semibold">{t("notes.fire.warning")}</p>
                  <p>{t("notes.fire.emergency")}</p>
                </AlertDescription>
              </Alert>
            </div>

            <Separator />

            {/* Food in Room */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">{t("notes.food.title")}</h4>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <p className="text-sm">{t("notes.food.warning")}</p>
              </div>
            </div>

            <Separator />

            {/* Insects & Nature */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold">{t("notes.insects.title")}</h4>
              </div>
              <ul className="space-y-2 ml-7 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{t("notes.insects.nature")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{t("notes.insects.prevention")}</span>
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
              {t("services.title")}
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
                    {t("services.cableCar.title")}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t("services.cableCar.description")}
                  </p>
                </div>
              </div>

              {/* Massage */}
              <div className="flex items-start gap-4 p-4 bg-background rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                <div className="mt-1 p-2 bg-primary/10 rounded-lg">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">
                    {t("services.massage")}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t("services.massageDescription")}
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
                      {t("services.happyHour.title")}
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      {t("services.happyHour.time")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t("services.happyHour.description")}
                  </p>
                  <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 rounded-md border border-orange-300">
                    <span className="text-2xl">👉</span>
                    <p className="text-sm font-semibold text-orange-700">
                      {t("services.happyHour.promotion")}
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
            <h3 className="text-2xl font-bold">{t("thanks.title")}</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("thanks.message")}
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
