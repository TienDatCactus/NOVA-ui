import { Badge } from "~/components/ui/badge";
import { formatMoney } from "~/lib/utils";
import type { ServiceItem } from "~/services/api/services/dto";
import { DetailItem, DetailSection } from "~/components/ui/section-detail";
import { useServiceDetail } from "../../container/services/query.hooks";
import type { type } from "os";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "~/components/ui/carousel";
import { ImageZoom } from "~/components/ui/shadcn-io/image-zoom";
import Image from "~/components/ui/image";

interface ServiceDetailRowProps {
  service: ServiceItem;
}

export default function ServiceDetailRow({ service }: ServiceDetailRowProps) {
  const hasImages =
    Array.isArray(service.imageUrls) && service.imageUrls.length > 0;
  const { data: serviceItemDetail } = useServiceDetail(service.serviceItemId);
  return (
    <div className="grid md:grid-cols-3 grid-cols-1 gap-6 p-6 border-l-4 border-l-primary/20 ">
      {hasImages && (
        <div className="mb-6 col-span-1">
          <h4 className="font-semibold text-sm mb-3">Hình ảnh</h4>
          <div className="flex flex-col max-h-[300px] overflow-y-auto gap-4 ">
            <div className="max-h-[400px] grid place-items-center overflow-y-auto">
              <Carousel className="w-fit">
                <CarouselContent>
                  {service.imageUrls?.map((img, index) => (
                    <CarouselItem key={index}>
                      <div className="p-1">
                        <ImageZoom>
                          <Image
                            src={img}
                            height={200}
                            width={200}
                            alt={`${service.name} - ${index + 1}`}
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
      </div>

      {/* Right Column */}
      <div className="space-y-4">
        <DetailSection title="Mô tả">
          <p className="text-sm text-muted-foreground text-wrap">
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
