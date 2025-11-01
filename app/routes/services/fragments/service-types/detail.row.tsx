import { Badge } from "~/components/ui/badge";
import type { ServiceTypeItem } from "~/services/api/service-types/dto";
import { format } from "date-fns";
import { is, vi } from "date-fns/locale";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import Image from "~/components/ui/image";
import { ImageZoom } from "~/components/ui/shadcn-io/image-zoom";
import { useServiceTypeDetails } from "../../container/service-types-query.hooks";
import { DetailItem, DetailSection } from "~/components/ui/section-detail";

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
    <div className="p-6 bg-muted/30 border-l-4 border-l-primary/20 animate-in slide-in-from-top-2 duration-200 grid md:grid-cols-3 grid-cols-1 gap-4">
      {hasImages && (
        <div className="mb-6 col-span-1">
          <h4 className="font-semibold text-sm mb-3">Hình ảnh</h4>
          <div className="flex flex-col max-h-[300px] overflow-y-auto gap-4 ">
            {type.imageUrls.map((url, index) => (
              <div
                key={index}
                className="relative rounded-lg overflow-hidden border-2 border-border flex-shrink-0"
              >
                <ImageZoom>
                  <Image
                    src={url}
                    height={200}
                    alt={`${type.name} - ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </ImageZoom>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 col-span-2">
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
