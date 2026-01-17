import { Download, FileText, Loader2, Plus, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import type { BookingDocumentItemDto } from "~/services/api/guest-documents/dto";
import {
  useDeleteDocumentMutation,
  useExportGuestDocumentsByBookingMutation,
} from "../container/container";
import { useGetBookingDocumentsQuery } from "../container/query";
import DocumentCard from "./document-card";
import DocumentEditDialog from "./document-edit-dialog";
import DocumentScanDialog from "./document-scan-dialog";

interface GuestDocumentsSectionProps {
  bookingId: string;
  customerId: string;
  adultsAmount: number;
  checkinDate: string;
  checkoutDate: string;
  canEdit?: boolean;
}

export default function GuestDocumentsSection({
  bookingId,
  customerId,
  adultsAmount,
  canEdit = true,
}: GuestDocumentsSectionProps) {
  const [viewDocument, setViewDocument] =
    useState<BookingDocumentItemDto | null>(null);
  const [editDocument, setEditDocument] =
    useState<BookingDocumentItemDto | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [scanDialogOpen, setScanDialogOpen] = useState(false);

  // Queries & Mutations
  const {
    data: documents,
    isPending,
    refetch,
  } = useGetBookingDocumentsQuery(bookingId);
  const deleteMutation = useDeleteDocumentMutation();
  const exportByBookingMutation = useExportGuestDocumentsByBookingMutation();

  const handleExportByBooking = async () => {
    try {
      const blob: any = await exportByBookingMutation.mutateAsync(bookingId);
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `guest-documents-booking-${bookingId}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;

    try {
      await deleteMutation.mutateAsync(documentToDelete);
      toast.success("Đã xóa giấy tờ thành công");
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    } catch (error) {
      toast.error("Xóa giấy tờ thất bại");
    }
  };

  const handleDeleteClick = (documentId: string) => {
    setDocumentToDelete(documentId);
    setDeleteDialogOpen(true);
  };

  const isDocumentsIncomplete = (documents?.length || 0) < adultsAmount;

  return (
    <>
      <Card className="bg-background hover:border-primary border shadow-sm">
        <div className="px-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  Giấy tờ tùy thân
                </h3>
                <Badge
                  variant={isDocumentsIncomplete ? "outline" : "default"}
                  className={
                    isDocumentsIncomplete
                      ? "text-amber-600 border-amber-300"
                      : "bg-green-600"
                  }
                >
                  {documents?.length || 0} / {adultsAmount}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {isDocumentsIncomplete
                  ? `Thiếu ${adultsAmount - (documents?.length || 0)} giấy tờ`
                  : "Đầy đủ giấy tờ cho tất cả khách"}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={handleExportByBooking}
                disabled={
                  exportByBookingMutation.isPending ||
                  !documents ||
                  documents.length === 0
                }
              >
                {exportByBookingMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Tải về XML (Booking)
              </Button>

              {canEdit && (
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => setScanDialogOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Thêm giấy tờ
                </Button>
              )}
            </div>
          </div>

          {/* Warning if incomplete */}
          {isDocumentsIncomplete && (
            <Alert className="mb-4 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                Thiếu giấy tờ cho {adultsAmount - (documents?.length || 0)}{" "}
                khách. Vui lòng upload đầy đủ trước khi check-in.
              </AlertDescription>
            </Alert>
          )}

          {/* Documents List */}
          {isPending ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : documents && documents.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto">
              <div className="space-y-3">
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onView={setViewDocument}
                    onEdit={setEditDocument}
                    onDelete={canEdit ? handleDeleteClick : undefined}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <h4 className="text-sm font-semibold text-muted-foreground">
                Chưa có giấy tờ nào
              </h4>
              <p className="text-xs text-muted-foreground/60 max-w-xs mt-1">
                Upload passport hoặc CMND/CCCD để chuẩn bị check-in
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* View Document Dialog */}
      <Dialog
        open={!!viewDocument}
        onOpenChange={(open) => !open && setViewDocument(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết giấy tờ tùy thân</DialogTitle>
            <DialogDescription>
              {viewDocument?.documentType === "Passport"
                ? "Thông tin Passport"
                : "Thông tin CMND/CCCD"}
            </DialogDescription>
          </DialogHeader>

          {viewDocument && (
            <div className="space-y-4">
              {/* Document Image */}
              {viewDocument.scannedImagePath && (
                <div className="border rounded-lg overflow-hidden bg-muted/20">
                  <img
                    src={viewDocument.scannedImagePath}
                    alt="Scanned document"
                    className="w-full h-auto max-h-[300px] object-contain"
                  />
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Họ và tên:</span>
                  <p className="font-medium">{viewDocument.fullName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Số giấy tờ:</span>
                  <p className="font-medium font-mono">
                    {viewDocument.documentNumber ||
                      viewDocument.idCardNumber ||
                      "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Ngày sinh:</span>
                  <p className="font-medium">{viewDocument.dateOfBirth}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Giới tính:</span>
                  <p className="font-medium">{viewDocument.gender}</p>
                </div>
                {viewDocument.nationality && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Quốc t적:</span>
                    <p className="font-medium">{viewDocument.nationality}</p>
                  </div>
                )}
                {viewDocument.address && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Địa chỉ:</span>
                    <p className="font-medium">{viewDocument.address}</p>
                  </div>
                )}
                {viewDocument.dateOfIssue && (
                  <div>
                    <span className="text-muted-foreground">Ngày cấp:</span>
                    <p className="font-medium">{viewDocument.dateOfIssue}</p>
                  </div>
                )}
                {viewDocument.dateOfExpire && (
                  <div>
                    <span className="text-muted-foreground">Ngày hết hạn:</span>
                    <p className="font-medium">{viewDocument.dateOfExpire}</p>
                  </div>
                )}
                {viewDocument.note && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Ghi chú:</span>
                    <p className="font-medium italic">{viewDocument.note}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDocument(null)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa giấy tờ</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa giấy tờ này? Hành động này không thể
              hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Scan Dialog */}
      <DocumentScanDialog
        open={scanDialogOpen}
        onOpenChange={setScanDialogOpen}
        bookingId={bookingId}
        customerId={customerId}
        onSuccess={() => {
          refetch();
        }}
      />

      {/* Document Edit Dialog */}
      <DocumentEditDialog
        open={!!editDocument}
        onOpenChange={(open) => !open && setEditDocument(null)}
        document={editDocument}
        onSuccess={() => {
          refetch();
        }}
      />
    </>
  );
}
