import { Badge } from "~/components/ui/badge";
import { formatMoney } from "~/lib/utils";
import type { ServiceItem } from "~/services/api/services/dto";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface ServiceDetailRowProps {
  service: ServiceItem;
}

export default function ServiceDetailRow({ service }: ServiceDetailRowProps) {
  return (
    <div className="grid grid-cols-2 gap-6 p-6 bg-muted/30 border-l-4 border-l-primary/20 animate-in slide-in-from-top-2 duration-200">
      {/* Left Column */}
      <div className="space-y-4">
        <DetailSection title="Thông tin cơ bản">
          <DetailItem label="Mã dịch vụ" value={service.code} />
          <DetailItem
            label="Loại dịch vụ"
            value={(service as any).serviceTypeName || "—"}
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
          <DetailItem label="Đơn vị tính" value={service.unitName} />
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

// Helper components
function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
