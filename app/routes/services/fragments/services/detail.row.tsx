import { Badge } from "~/components/ui/badge";
import { formatMoney } from "~/lib/utils";
import type { ServiceItem } from "~/services/api/services/dto";
import { useServiceDetail } from "../../container/service-query.hooks";
import { DetailItem, DetailSection } from "~/components/ui/section-detail";

interface ServiceDetailRowProps {
  service: ServiceItem;
}

export default function ServiceDetailRow({ service }: ServiceDetailRowProps) {
  const { data: serviceItemDetail } = useServiceDetail(service.serviceItemId);
  return (
    <div className="grid grid-cols-2 gap-6 p-6 bg-muted/30 border-l-4 border-l-primary/20 animate-in slide-in-from-top-2 duration-200">
      <div className="space-y-4">
        <DetailSection title="Thông tin cơ bản">
          <DetailItem label="Mã dịch vụ" value={service.code} />
          <DetailItem
            label="Loại dịch vụ"
            value={serviceItemDetail?.serviceTypeName || "—"}
          />
          <DetailItem label="Đơn vị tính" value={service.unitName} />
          <DetailItem
            label="Trạng thái"
            value={
              <Badge variant={service.active ? "success" : "secondary"}>
                {service.active ? "Đang hoạt động" : "Ngưng hoạt động"}
              </Badge>
            }
          />
        </DetailSection>
      </div>

      {/* Right Column */}
      <div className="space-y-4">
        <DetailSection title="Giá & Đơn vị">
          <DetailItem
            label="Đơn giá"
            value={
              <span className="font-semibold text-primary">
                {formatMoney(service.basePrice).vndFormatted}
              </span>
            }
          />
        </DetailSection>

        <DetailSection title="Mô tả">
          <p className="text-sm text-muted-foreground">
            {service.description || "Không có mô tả"}
          </p>
        </DetailSection>

        {/* {service.createdAt && (
          <DetailSection title="Thời gian">
            <DetailItem
              label="Ngày tạo"
              value={format(new Date(service.createdAt), "dd/MM/yyyy HH:mm", {
                locale: vi,
              })}
            />
            {service.updatedAt && (
              <DetailItem
                label="Cập nhật lần cuối"
                value={format(new Date(service.updatedAt), "dd/MM/yyyy HH:mm", {
                  locale: vi,
                })}
              />
            )}
          </DetailSection>
        )} */}
      </div>
    </div>
  );
}
