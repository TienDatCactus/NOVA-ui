import { Button } from "~/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import InvoiceDetailTab from "../fragments/detail.tab";

interface InvoiceDetailDialogProps {
  invoiceId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function InvoiceDetailDialog({ invoiceId, open, onOpenChange }: InvoiceDetailDialogProps) {
  return (
    <DialogContent className="max-w-4xl" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
      <DialogHeader>
        <DialogTitle>Thông tin hóa đơn</DialogTitle>
      </DialogHeader>

      <Tabs defaultValue="detail">
        <TabsList>
          <TabsTrigger value="detail">Thông tin</TabsTrigger>
          <TabsTrigger value="items">Lịch sử thanh toán</TabsTrigger>
        </TabsList>
        <TabsContent value="detail">
          <InvoiceDetailTab invoiceId={invoiceId} />
        </TabsContent>
        <TabsContent value="items">
          <InvoiceDetailTab invoiceId={invoiceId} />
        </TabsContent>
      </Tabs>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange?.(false)}>Thoát</Button>
      </DialogFooter>
    </DialogContent>
  );
}

export default InvoiceDetailDialog;
