import type { Route } from "./+types/services";
import { useMemo, useState } from "react";
import useServices from "~/features/service-modal/container/useServices";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Loader2,
  Search,
  Package,
  DollarSign,
  FileText,
  Plus,
} from "lucide-react";
import CreateServiceDialog from "./fragments/create-service.dialog";
import {
  useServiceTypes,
  useServicesByType,
} from "./container/useServiceQuery";

export const action = async ({ request, params }: Route.ActionArgs) => {
  return {};
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  return {};
};

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { data: allServices, isPending: isLoadingAll } = useServices({
    includeInactive: true,
  });
  const { data: serviceTypes, isPending: isLoadingTypes } = useServiceTypes();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState<string>("all");

  const { data: servicesByType, isPending: isLoadingByType } =
    useServicesByType(selectedTypeId);

  const displayData = useMemo(() => {
    if (selectedTypeId === "all") {
      return allServices;
    }

    if (servicesByType) {
      const selectedType = serviceTypes?.find((t) => t.id === selectedTypeId);
      return selectedType
        ? [
            {
              serviceTypeId: selectedType.id,
              typeCode: selectedType.code,
              typeName: selectedType.name,
              active: selectedType.active || true,
              items: servicesByType.map((item) => ({
                serviceItemId: item.id,
                code: item.code,
                name: item.name,
                description: item.description,
                unitName: item.unitName,
                basePrice: item.basePrice,
                active: item.active,
              })),
            },
          ]
        : [];
    }

    return [];
  }, [selectedTypeId, allServices, servicesByType, serviceTypes]);

  const filteredServices = useMemo(() => {
    if (!displayData) return displayData;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      return displayData
        .map((serviceType) => ({
          ...serviceType,
          items: serviceType.items.filter(
            (item) =>
              item.name.toLowerCase().includes(term) ||
              item.code.toLowerCase().includes(term) ||
              serviceType.typeName.toLowerCase().includes(term) ||
              item.description?.toLowerCase().includes(term)
          ),
        }))
        .filter((serviceType) => serviceType.items.length > 0);
    }

    return displayData;
  }, [displayData, searchTerm]);

  const totalServices = useMemo(() => {
    return allServices?.reduce((sum, type) => sum + type.items.length, 0) || 0;
  }, [allServices]);

  const activeServices = useMemo(() => {
    return (
      allServices?.reduce(
        (sum, type) => sum + type.items.filter((item) => item.active).length,
        0
      ) || 0
    );
  }, [allServices]);

  const filteredCount = useMemo(() => {
    return (
      filteredServices?.reduce((sum, type) => sum + type.items.length, 0) || 0
    );
  }, [filteredServices]);

  const isPending =
    isLoadingAll ||
    isLoadingTypes ||
    (selectedTypeId !== "all" && isLoadingByType);

  if (isPending && !allServices) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý dịch vụ
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý danh sách dịch vụ và tiện ích của khách sạn
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            <Package className="mr-1 h-3 w-3" />
            {totalServices} dịch vụ
          </Badge>
          <Badge
            variant="outline"
            className="text-sm bg-green-50 text-green-700 border-green-200"
          >
            {activeServices} hoạt động
          </Badge>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo dịch vụ
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, mã dịch vụ, loại dịch vụ hoặc mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </div>

        <div>
          <Select value={selectedTypeId} onValueChange={setSelectedTypeId}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Chọn loại dịch vụ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Tất cả dịch vụ</span>
                  <Badge variant="secondary" className="ml-2">
                    {totalServices}
                  </Badge>
                </div>
              </SelectItem>
              {serviceTypes?.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  <div className="flex items-center gap-2">
                    <span>{type.name}</span>
                    <Badge variant="secondary" className="ml-2">
                      {
                        allServices?.find((s) => s.serviceTypeId === type.id)
                          ?.items.length || 0
                      }
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {searchTerm && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            Tìm thấy {filteredCount} kết quả
          </Badge>
        </div>
      )}

      {isPending && selectedTypeId !== "all" ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filteredServices && filteredServices.length > 0 ? (
        <div className="space-y-6">
          {filteredServices.map((serviceType) => (
            <Card key={serviceType.serviceTypeId}>
              <CardHeader className="bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {serviceType.typeName}
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        ({serviceType.typeCode})
                      </span>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {serviceType.items.length} dịch vụ trong danh mục
                    </CardDescription>
                  </div>
                  <Badge
                    variant={serviceType.active ? "default" : "secondary"}
                    className={
                      serviceType.active
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : ""
                    }
                  >
                    {serviceType.active ? "Hoạt động" : "Ngưng"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {serviceType.items.map((item) => (
                    <Card
                      key={item.serviceItemId}
                      className="hover:shadow-md transition-shadow border-muted"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base line-clamp-1">
                              {item.name}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1">
                              <FileText className="h-3 w-3" />
                              {item.code}
                            </CardDescription>
                          </div>
                          <Badge
                            variant={item.active ? "default" : "secondary"}
                            className={
                              item.active
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : ""
                            }
                          >
                            {item.active ? "Hoạt động" : "Ngưng"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between py-2 border-t">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Package className="h-3.5 w-3.5" />
                            {item.unitName}
                          </span>
                          <span className="font-semibold text-primary flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {item.basePrice.toLocaleString("vi-VN")}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="rounded-full bg-muted p-3">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
              <p className="text-lg font-medium">
                {searchTerm
                  ? "Không tìm thấy kết quả"
                  : "Không có dữ liệu dịch vụ"}
              </p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {searchTerm
                  ? "Thử tìm kiếm với từ khóa khác hoặc chọn loại dịch vụ khác"
                  : "Hiện tại chưa có dịch vụ nào trong danh mục này"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <CreateServiceDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
    </div>
  );
}
