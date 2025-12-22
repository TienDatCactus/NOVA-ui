import { format, parseISO } from "date-fns";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Skeleton } from "~/components/ui/skeleton";
import { useStaffDetail } from "../container/query.hooks";

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
  const { data: staff, isLoading } = useStaffDetail(staffId || "", {
    enabled: open,
  });
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
              {staff.staffRoleName && (
                <Badge variant="secondary">{staff.staffRoleName}</Badge>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <DetailItem
                label="Số điện thoại"
                value={staff.phoneNumber || "-"}
              />
              <DetailItem label="Email" value={staff.email || "-"} />
              <DetailItem label="Giới tính" value={staff.gender || "-"} />
              <DetailItem
                label="Ngày sinh"
                value={
                  staff.dateOfBirth
                    ? format(parseISO(staff.dateOfBirth), "dd/MM/yyyy")
                    : "-"
                }
              />
              <DetailItem
                label="Số CCCD"
                value={
                  staff.citizenId ? (
                    <span className="font-mono text-sm">{staff.citizenId}</span>
                  ) : (
                    "-"
                  )
                }
              />
              <DetailItem
                label="Ngày bắt đầu làm việc"
                value={
                  staff.startDate
                    ? format(parseISO(staff.startDate), "dd/MM/yyyy")
                    : "-"
                }
              />
              {staff.note && (
                <DetailItem
                  label="Ghi chú"
                  value={staff.note}
                  className="col-span-2"
                />
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Không có dữ liệu</p>
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
