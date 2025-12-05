import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { Barcode, Cog, Hotel, MapPin, Printer, Receipt, X } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { cn, formatMoney } from "~/lib/utils";
import type { POSOrderPrintDataDto } from "~/services/api/orders/dto";

interface PrintPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  printData: POSOrderPrintDataDto | null;
  onPrint: () => void;
}

export default function PrintPreviewDialog({
  open,
  onOpenChange,
  printData,
  onPrint,
}: PrintPreviewDialogProps) {
  if (!printData) return null;

  const handlePrint = () => {
    window.print();
    onPrint();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] p-0 gap-0 overflow-hidden bg-zinc-100/50 border-none shadow-2xl">
        <DialogHeader className="px-4 py-3 bg-white border-b flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-sm font-semibold flex items-center gap-2">
            <Printer className="h-4 w-4 text-muted-foreground" />
            Xem trước bản in
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] w-full px-4 py-6">
          <div className="mx-auto w-full max-w-[320px] bg-white shadow-sm border border-zinc-200 text-zinc-900 text-[13px] leading-relaxed relative">
            <div className="h-1 w-full bg-zinc-50 border-b border-dashed border-zinc-200" />

            <div className="p-5 space-y-4">
              {/* 1. BRAND HEADER */}
              <div className="flex flex-col items-center text-center space-y-1 pb-4 border-b-2 border-zinc-800">
                <div className="h-10 w-10 bg-zinc-900 text-white flex items-center justify-center rounded-sm mb-1">
                  <Hotel className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-wider">
                  NOVA HOTEL
                </h2>
                <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium uppercase tracking-wide">
                  <MapPin className="h-3 w-3" />
                  <span>SAPA, Vietnam</span>
                </div>
              </div>

              {/* 2. META DATA */}
              <div className="space-y-1 pb-4 border-b border-dashed border-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Receipt No.</span>
                  <span className="font-mono font-bold">
                    #{printData.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Date</span>
                  <span className="font-mono">
                    {format(parseISO(printData.createdAt), "dd/MM/yyyy HH:mm", {
                      locale: vi,
                    })}
                  </span>
                </div>
                {printData.customerName && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Guest</span>
                    <span className="font-semibold uppercase truncate max-w-[150px]">
                      {printData.customerName}
                    </span>
                  </div>
                )}
                {printData.roomName && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Room/Table</span>
                    <span className="font-bold">
                      {printData.roomName}{" "}
                      {printData.tableNumber
                        ? `/ ${printData.tableNumber}`
                        : ""}
                    </span>
                  </div>
                )}
              </div>

              {/* 3. ITEMS LIST */}
              <div className="space-y-3 pb-4 border-b-2 border-zinc-800">
                <div className="grid grid-cols-12 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                  <span className="col-span-2">Qty</span>
                  <span className="col-span-6">Item</span>
                  <span className="col-span-4 text-right">Amount</span>
                </div>

                <div className="space-y-2">
                  {printData.items.map((item, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-12 gap-1 items-center"
                    >
                      <span className="col-span-1 font-mono font-bold pt-0.5">
                        {item.quantity}
                      </span>
                      <div className="col-span-7">
                        <p className="font-medium leading-tight">
                          {item.itemName}
                        </p>
                        {item.notes && (
                          <p className="text-[10px] text-zinc-500 italic mt-0.5">
                            Note: {item.notes}
                          </p>
                        )}
                      </div>
                      <span className="col-span-4 text-right font-mono">
                        ---
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. TOTALS */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-lg">TOTAL</span>
                  <span className="font-mono text-xl font-black">
                    {formatMoney(printData.totalAmount).vndFormatted}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 text-center italic pt-2">
                  (Includes VAT & Service Charge)
                </p>
              </div>

              {/* 5. FOOTER & BARCODE */}
              <div className="pt-6 pb-2 flex flex-col items-center space-y-3">
                <Barcode className="h-12 w-full text-zinc-800 opacity-80" />
                <div className="text-center space-y-0.5">
                  <p className="font-bold uppercase text-[10px] tracking-widest">
                    Thank You!
                  </p>
                  <p className="text-[9px] text-zinc-400">
                    Please retain for your records
                  </p>
                </div>
              </div>
            </div>

            {/* Paper Bottom Edge Effect */}
            <div className="h-3 w-full bg-[radial-gradient(circle_at_10px_bottom,transparent_6px,white_6.5px)] bg-[length:20px_10px] bg-repeat-x border-t border-dashed border-zinc-100/50 absolute -bottom-3 left-0" />
          </div>
        </ScrollArea>

        {/* === ACTION FOOTER === */}
        <DialogFooter className="p-4 bg-white border-t sm:justify-between items-center gap-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            In
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
