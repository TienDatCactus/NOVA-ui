import { Eye, FileDown, Archive, Trash2, MoreHorizontal } from "lucide-react";
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { AuditListItem } from "~/services/api/audit/dto";
import AuditDetailDialog from "./audit-detail.dialog";
import ExportAuditDialog from "./export-audit.dialog";
import ArchiveAuditDialog from "./archive-audit.dialog";
import CleanupAuditDialog from "./cleanup-audit.dialog";

interface AuditLogsActionCellProps {
  audit: AuditListItem;
}

const AuditLogsActionCell: React.FC<AuditLogsActionCellProps> = ({ audit }) => {
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [openArchiveDialog, setOpenArchiveDialog] = useState(false);
  const [openCleanupDialog, setOpenCleanupDialog] = useState(false);

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenDetailDialog(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Xem chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenExportDialog(true)}>
            <FileDown className="mr-2 h-4 w-4" />
            Xuất dữ liệu
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenArchiveDialog(true)}>
            <Archive className="mr-2 h-4 w-4" />
            Lưu trữ
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setOpenCleanupDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Dọn dẹp
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AuditDetailDialog
        open={openDetailDialog}
        onOpenChange={setOpenDetailDialog}
        auditLogId={audit.id}
      />
      <ExportAuditDialog
        open={openExportDialog}
        onOpenChange={setOpenExportDialog}
      />
      <ArchiveAuditDialog
        open={openArchiveDialog}
        onOpenChange={setOpenArchiveDialog}
      />
      <CleanupAuditDialog
        open={openCleanupDialog}
        onOpenChange={setOpenCleanupDialog}
      />
    </div>
  );
};

export default AuditLogsActionCell;
