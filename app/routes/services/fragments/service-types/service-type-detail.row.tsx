import { Badge } from "~/components/ui/badge";
import type { ServiceTypeItem } from "~/services/api/service-types/dto";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";

interface ServiceTypeDetailRowProps {
  type: ServiceTypeItem;
}

export default function ServiceTypeDetailRow({
  type,
}: ServiceTypeDetailRowProps) {
  return (
    <div className="p-6 bg-muted/30 border-l-4 border-l-primary/20 animate-in slide-in-from-top-2 duration-200">
      {/* Image Gallery */}
      {/* {hasImages && (
        <div className="mb-6">
          <h4 className="font-semibold text-sm mb-3">Hình ảnh</h4>
          <ScrollArea className="w-full whitespace-nowrap rounded-md border">
            <div className="flex gap-4 p-4">
              {type.imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-border flex-shrink-0"
                >
                  <img
                    src={url}
                    alt={`${type.name} - ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = "";
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement!.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                          <svg class="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      `;
                    }}
                  />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )} */}

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
