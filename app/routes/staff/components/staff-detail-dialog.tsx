import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { StaffService } from "~/services/api/staff";
import type { StaffDetailItem } from "~/services/api/staff/dto";
import { format, parseISO } from "date-fns";
import { formatMoney } from "~/lib/utils";
import { toast } from "sonner";

interface StaffDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffId: string;
}

export default function StaffDetailDialog({
  open,
  onOpenChange,
  staffId,
}: StaffDetailDialogProps) {
  const [staff, setStaff] = useState<StaffDetailItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && staffId) {
      setIsLoading(true);
      StaffService.getStaffById(staffId)
        .then((response) => {
          setStaff(response.data);
        })
        .catch((error) => {
          console.error("Error fetching staff detail:", error);
          toast.error("Không thể tải thông tin nhân sự");
          onOpenChange(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, staffId, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết nhân sự</DialogTitle>
          <DialogDescription>
            Thông tin đầy đủ về nhân sự trong hệ thống
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : staff ? (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold">{staff.fullName}</h3>
                <p className="text-sm text-muted-foreground font-mono">
                  {staff.code}
                </p>
              </div>
              <Badge variant={staff.active ? "default" : "secondary"}>
                {staff.active ? "Đang làm việc" : "Đã nghỉ việc"}
              </Badge>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Chức vụ" value={staff.position} />
              <DetailItem label="Phòng ban" value={staff.department} />
              <DetailItem
                label="Số điện thoại"
                value={staff.phoneNumber || "-"}
              />
              <DetailItem label="Email" value={staff.email || "-"} />
              <DetailItem
                label="Lương cơ bản"
                value={
                  staff.baseSalary
                    ? formatMoney(staff.baseSalary).vndFormatted
                    : "-"
                }
              />
              <DetailItem
                label="Ngày vào làm"
                value={
                  staff.hireDate
                    ? format(parseISO(staff.hireDate), "dd/MM/yyyy")
                    : "-"
                }
              />
              <DetailItem
                label="User ID"
                value={
                  staff.userId ? (
                    <span className="font-mono text-xs">{staff.userId}</span>
                  ) : (
                    "-"
                  )
                }
                className="col-span-2"
              />
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            Không có dữ liệu
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-sm font-medium text-muted-foreground mb-1">
        {label}
      </dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}
