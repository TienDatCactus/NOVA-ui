import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { useState } from "react";

interface RoomTypesBulkActionsProps {
  selectedCount: number;
  onActivate: () => void;
  onDeactivate: () => void;
}

export function RoomTypesBulkActions({
  selectedCount,
  onActivate,
  onDeactivate,
}: RoomTypesBulkActionsProps) {
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{selectedCount} hạng phòng đã chọn</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowActivateDialog(true)}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Kích hoạt
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeactivateDialog(true)}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Vô hiệu hóa
          </Button>
        </div>
      </div>

      <AlertDialog
        open={showActivateDialog}
        onOpenChange={setShowActivateDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kích hoạt hạng phòng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn kích hoạt {selectedCount} hạng phòng đã
              chọn?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onActivate();
                setShowActivateDialog(false);
              }}
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showDeactivateDialog}
        onOpenChange={setShowDeactivateDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vô hiệu hóa hạng phòng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn vô hiệu hóa {selectedCount} hạng phòng đã
              chọn?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDeactivate();
                setShowDeactivateDialog(false);
              }}
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
