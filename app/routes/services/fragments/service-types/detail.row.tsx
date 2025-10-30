import { Badge } from "~/components/ui/badge";
import type { ServiceTypeItem } from "~/services/api/service-types/dto";
import { format } from "date-fns";
import { is, vi } from "date-fns/locale";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import Image from "~/components/ui/image";
import { ImageZoom } from "~/components/ui/shadcn-io/image-zoom";
import { useServiceTypeDetails } from "../../container/service-types-query.hooks";

interface ServiceTypeDetailRowProps {
  type: ServiceTypeItem;
}

export default function ServiceTypeDetailRow({
  type,
}: ServiceTypeDetailRowProps) {
  const hasImages = Array.isArray(type.imageUrls) && type.imageUrls.length > 0;
  const { data: detailData, isPending } = useServiceTypeDetails(type.id);

  if (isPending) {
    return <div>Đang tải chi tiết...</div>;
  }
  return (
    <div className="p-6 bg-muted/30 border-l-4 border-l-primary/20 animate-in slide-in-from-top-2 duration-200">
      {hasImages && (
        <div className="mb-6">
          <h4 className="font-semibold text-sm mb-3">Hình ảnh</h4>
          <ScrollArea className="w-full whitespace-nowrap rounded-md border">
            <div className="flex gap-4 p-4">
              {type.imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative rounded-lg overflow-hidden border-2 border-border flex-shrink-0"
                >
                  <ImageZoom>
                    <Image
                      src={url}
                      width={200}
                      height={200}
                      alt={`${type.name} - ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </ImageZoom>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <DetailSection title="Thông tin cơ bản">
            <DetailItem label="Mã loại dịch vụ" value={type.code} />
            <DetailItem label="Tên loại dịch vụ" value={type.name} />
            <DetailItem
              label="Trạng thái"
              value={
                <Badge variant={type.active ? "success" : "secondary"}>
                  {type.active ? "Đang hoạt động" : "Ngưng hoạt động"}
                </Badge>
              }
            />
          </DetailSection>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <DetailSection title="Mô tả">
            <p className="text-sm text-muted-foreground">
              {type.description || "Không có mô tả"}
            </p>
          </DetailSection>

          {type.createdAt && type.updatedAt && (
            <DetailSection title="Thời gian">
              <DetailItem
                label="Ngày tạo"
                value={format(new Date(type.createdAt), "dd/MM/yyyy HH:mm", {
                  locale: vi,
                })}
              />
              <DetailItem
                label="Cập nhật lần cuối"
                value={format(new Date(type.updatedAt), "dd/MM/yyyy HH:mm", {
                  locale: vi,
                })}
              />
            </DetailSection>
          )}
        </div>
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
