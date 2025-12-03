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
  CableCar,
  Shield,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import Image from "~/components/ui/image";

export default function GuidesPage() {
  const { t } = useTranslation("guides");

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans">
      {/* --- HERO SECTION --- */}
      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
        {/* Placeholder: Sapa Rice Terraces */}
        <Image
          src="https://images.unsplash.com/photo-1531213203257-16afb0eac5d6?q=80&w=2836&auto=format&fit=crop"
          alt="Sapa Landscape"
          className="w-full h-full object-cover filter brightness-[0.85]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white">
          <div className="max-w-4xl mx-auto space-y-4">
            <Badge className="bg-emerald-600/90 hover:bg-emerald-700 text-white border-none backdrop-blur-md px-3 py-1 text-sm font-light tracking-widest uppercase">
              Eco Palms House
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              {t("title") || "Sổ tay Lưu trú"}
            </h1>
            <p className="text-lg md:text-xl text-stone-200 max-w-2xl font-light">
              {t("subtitle") ||
                "Hòa mình vào thiên nhiên Sapa với những lưu ý nhỏ để kỳ nghỉ trọn vẹn."}
            </p>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 -mt-10 relative z-10">
        {/* 1. KEY INFO ROW (Time & Wifi) */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Time Schedule */}
          <Card className="md:col-span-2 shadow-xl shadow-stone-200/50 border-none bg-white/95 backdrop-blur">
            <CardHeader className="pb-2 border-b border-stone-100">
              <CardTitle className="flex items-center gap-2 text-emerald-800">
                <Clock className="h-5 w-5" />
                {t("times.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <TimeItem
                  icon={<Sun className="h-5 w-5 text-amber-500" />}
                  label={t("times.checkin")}
                  value={t("times.checkinTime")}
                />
                <TimeItem
                  icon={<Moon className="h-5 w-5 text-indigo-500" />}
                  label={t("times.checkout")}
                  value={t("times.checkoutTime")}
                />
              </div>
              <div className="space-y-4 sm:border-l sm:border-stone-100 sm:pl-6">
                <TimeItem
                  icon={<Coffee className="h-5 w-5 text-emerald-700" />}
                  label={t("times.breakfast")}
                  value={t("times.breakfastTime")}
                />
                <TimeItem
                  icon={
                    <UtensilsCrossed className="h-5 w-5 text-emerald-700" />
                  }
                  label={t("times.dinner")}
                  value={t("times.dinnerTime")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Wifi Card (Vertical) */}
          <Card className="shadow-xl shadow-stone-200/50 border-none bg-emerald-900 text-white flex flex-col justify-center overflow-hidden relative">
            {/* Abstract Pattern overlay */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />

            <CardContent className="p-8 text-center space-y-6 relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm">
                <Wifi className="h-8 w-8" />
              </div>
              <div>
                <p className="text-emerald-200 text-sm font-medium uppercase tracking-wider mb-1">
                  Network
                </p>
                <p className="text-xl font-semibold">Eco Palms House</p>
              </div>
              <div className="bg-white/10 p-3 rounded-lg border border-white/10">
                <p className="text-emerald-200 text-xs font-medium uppercase tracking-wider mb-1">
                  Password
                </p>
                <p className="text-2xl font-mono tracking-widest font-bold">
                  loveeco12
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2. MASONRY GRID FOR RULES & INFO */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {/* COL 1: Essentials */}
          <div className="space-y-6">
            {/* Hot Water */}
            <InfoCard
              icon={<Droplet className="text-sky-500" />}
              title={t("hotWater.title")}
            >
              <div className="relative rounded-lg overflow-hidden mb-4 h-32">
                {/* Placeholder: Bathroom/Water */}
                <Image
                  src="https://images.unsplash.com/photo-1584622050111-993a426fbf0a?q=80&w=2940&auto=format&fit=crop"
                  className="w-full h-full object-cover"
                  alt="Bathroom"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>
              <div className="space-y-3 text-sm text-stone-600">
                <Step number="1" text={t("hotWater.step1")} />
                <Step number="2" text={t("hotWater.step2")} />
              </div>
            </InfoCard>

            {/* Towels (Warning) */}
            <Card className="border-amber-200 bg-amber-50/50 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-800 flex items-center gap-2 text-base">
                  <Bath className="h-5 w-5" /> {t("notes.towels.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert variant={"warning"}>
                  <AlertTriangle className="h-4 w-4 " />
                  <AlertTitle>{t("notes.towels.purpose")}</AlertTitle>
                  <AlertDescription className="font-medium ">
                    {t("notes.towels.warning")}
                    <strong className="text-red-600">1,000,000 VND</strong>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* COL 2: Nature & Room */}
          <div className="space-y-6">
            {/* Room Design */}
            <InfoCard
              icon={<Leaf className="text-emerald-600" />}
              title={t("notes.roomDesign.title")}
            >
              <ul className="space-y-3 text-sm text-stone-600">
                <BulletItem text={t("notes.roomDesign.ecoStyle")} />
                <BulletItem text={t("notes.roomDesign.noLaundry")} />
                <BulletItem
                  text={
                    <span>
                      {t("notes.roomDesign.beanBag")}{" "}
                      <strong className="text-red-600">500,000 VND</strong>
                    </span>
                  }
                />
              </ul>
            </InfoCard>

            {/* Food Rule with Image */}
            <Card className="overflow-hidden border-none shadow-md">
              <div className="h-32 bg-stone-200 relative">
                {/* Placeholder: Cozy room interior */}
                <Image
                  src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2940&auto=format&fit=crop"
                  className="w-full h-full object-cover"
                  alt="Room Interior"
                />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <UtensilsCrossed className="h-5 w-5 text-stone-500" />
                  {t("notes.food.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="">
                  <Bug className="h-4 w-4 text-stone-600" />
                  <AlertDescription className="text-stone-600 text-sm">
                    {t("notes.food.warning")}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Fire Safety */}
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <Flame className="h-4 w-4" />
              <AlertTitle className="font-bold text-sm mb-1">
                {t("notes.fire.title")}
              </AlertTitle>
              <AlertDescription className="text-xs opacity-90 leading-relaxed">
                {t("notes.fire.warning")}
              </AlertDescription>
            </Alert>
          </div>

          {/* COL 3: Services (Darker/Different tone for contrast) */}
          <div className="space-y-6">
            <div className="bg-emerald-50 rounded-2xl p-6 space-y-6 border border-emerald-100">
              <h3 className="font-bold text-emerald-900 flex items-center gap-2 text-lg">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                {t("services.title")}
              </h3>

              <ServiceItem
                icon={<CableCar className="h-5 w-5 text-white" />}
                title={t("services.cableCar.title")}
                desc={t("services.cableCar.description")}
                color="bg-sky-500"
              />

              {/* Massage */}
              <ServiceItem
                icon={<Sparkles className="h-5 w-5 text-white" />}
                title={t("services.massage")}
                desc={t("services.massageDescription")}
                color="bg-purple-500"
              />

              {/* Happy Hour Banner */}
              <div className="relative rounded-xl overflow-hidden text-white mt-4 group cursor-default">
                <Image
                  src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2940&auto=format&fit=crop"
                  className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                  alt="Cocktail"
                />
                <div className="absolute inset-0 bg-orange-900/60 mix-blend-multiply" />
                <div className="relative p-4">
                  <div className="flex justify-between items-start">
                    <Wine className="h-6 w-6 text-orange-200" />
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none">
                      15:00 - 18:00
                    </Badge>
                  </div>
                  <h4 className="font-bold mt-2 text-lg">
                    {t("services.happyHour.title")}
                  </h4>
                  <p className="text-orange-100 text-xs mt-1 leading-snug">
                    {t("services.happyHour.description")}
                  </p>
                  <div className="mt-3 inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-semibold border border-white/30">
                    {t("services.happyHour.promotion")}
                  </div>
                </div>
              </div>
            </div>

            {/* Electrical */}
            <InfoCard
              icon={<Cable className="text-stone-500" />}
              title={t("notes.electrical.title")}
            >
              <ul className="space-y-3 text-sm text-stone-600">
                <BulletItem text={t("notes.electrical.safety")} />
                <BulletItem text={t("notes.electrical.turnOff")} />
              </ul>
            </InfoCard>
          </div>
        </div>

        {/* --- FOOTER --- */}
        <div className="mt-16 text-center space-y-6 pb-8">
          <Separator className="max-w-xs mx-auto bg-stone-200" />
          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-bold text-emerald-900">
              {t("thanks.title")}
            </h3>
            <p className="text-stone-500 max-w-lg mx-auto leading-relaxed">
              {t("thanks.message")}
            </p>
          </div>
          <div className="flex justify-center gap-2">
            <Badge
              variant="outline"
              className="border-stone-300 text-stone-500 font-normal"
            >
              Eco-Friendly
            </Badge>
            <Badge
              variant="outline"
              className="border-stone-300 text-stone-500 font-normal"
            >
              Sustainable
            </Badge>
            <Badge
              variant="outline"
              className="border-stone-300 text-stone-500 font-normal"
            >
              Sapa, Vietnam
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- SUB-COMPONENTS FOR CLEANER CODE --- */

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-none shadow-md shadow-stone-100 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-stone-800">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function TimeItem({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 p-1.5 bg-stone-50 rounded-md border border-stone-100 shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-sm text-stone-800">{label}</p>
        <p className="text-sm text-stone-500 font-medium">{value}</p>
      </div>
    </div>
  );
}

function BulletItem({ text }: { text: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="text-emerald-500 mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
      <span className="leading-relaxed">{text}</span>
    </li>
  );
}

function Step({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[10px] font-bold text-sky-700">
        {number}
      </div>
      <p className="leading-snug">{text}</p>
    </div>
  );
}

function ServiceItem({
  icon,
  title,
  desc,
  color,
}: {
  icon: any;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <div className="flex gap-4">
      <div
        className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center shadow-sm shrink-0",
          color
        )}
      >
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-stone-800 text-sm">{title}</h4>
        <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
