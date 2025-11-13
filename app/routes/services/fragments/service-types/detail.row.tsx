import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "~/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import Image from "~/components/ui/image";
import { DetailItem, DetailSection } from "~/components/ui/section-detail";
import { ImageZoom } from "~/components/ui/shadcn-io/image-zoom";
import type { ServiceTypeItem } from "~/services/api/service-types/dto";
import { useServiceTypeDetails } from "../../container/service-types/query.hooks";

interface ServiceTypeDetailRowProps {
  type: ServiceTypeItem;
}

export default function ServiceTypeDetailRow({
  type,
}: ServiceTypeDetailRowProps) {
  const hasImages = Array.isArray(type.images) && type.images.length > 0;
  const { data: detailData, isPending } = useServiceTypeDetails(type.id);

  if (isPending) {
    return <div>Đang tải chi tiết...</div>;
  }
  return (
    <div className="p-6 bg-muted/30 border-l-4 border-l-primary/20  gap-4 flex">
      {hasImages && (
        <div className="mb-6 w-80">
          <h4 className="font-semibold text-sm mb-3">Hình ảnh</h4>
          <div className="flex flex-col max-h-[300px] overflow-y-auto gap-4 ">
            <div className="max-h-[400px] grid place-items-center overflow-y-auto">
              <Carousel>
                <CarouselContent className="w-60 h-fit">
                  {type.images?.map((img, index) => (
                    <CarouselItem key={index}>
                      <div className="p-1">
                        <ImageZoom>
                          <Image
                            src={img.url}
                            height={200}
                            width={200}
                            alt={`${type.name} - ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </ImageZoom>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 col-span-2">
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
            <div className="text-sm text-muted-foreground text-wrap">
              {type.description || "Không có mô tả"}
            </div>
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
