import { Button } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Ban,
  CheckCircle,
  Printer,
  CreditCard,
  Plus,
  MoreVertical,
  Clock,
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrderSchema } from "~/services/api/orders/order.schema";
import type { z } from "zod";
import {
  useCancelOrder,
  useCompleteOrder,
  usePayNow,
  usePrintOrder,
  useAddItemToOrder,
  useUpdateScheduledTime,
} from "../../container/menu-order/mutation.hooks";
import PrintPreviewDialog from "./print-preview.dialog";
import AddMenuItemDialog from "./add-menu-item.dialog";
import UpdateScheduleDialog from "./update-schedule.dialog";
import type { POSOrderPrintDataDto } from "~/services/api/orders/dto";

const { POSOrderPayNowRequestSchema } = OrderSchema;

type PaymentFormData = z.infer<typeof POSOrderPayNowRequestSchema>;

interface OrderActionsProps {
  orderId: string;
  status: "Open" | "Completed" | "Cancelled";
  totalAmount: number;
  currentScheduledTime?: string | null;
}

export default function OrderActions({
  orderId,
  status,
  totalAmount,
  currentScheduledTime,
}: OrderActionsProps) {
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [printData, setPrintData] = useState<POSOrderPrintDataDto | null>(null);

  // Payment form
  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(POSOrderPayNowRequestSchema),
    defaultValues: {
      paymentMethod: "Cash",
      paidAmount: totalAmount,
      transactionReference: "",
    },
  });

  const { mutate: onPayNow } = usePayNow();
  const { mutate: onPrint, isPending: isPrintLoading } = usePrintOrder();
  const { mutate: onCancel } = useCancelOrder();
  const { mutate: onComplete } = useCompleteOrder();
  const { mutate: onAddItem, isPending: isAddingItem } = useAddItemToOrder();
  const { mutate: onUpdateSchedule, isPending: isUpdatingSchedule } =
    useUpdateScheduledTime();

  const handlePayNow = (data: PaymentFormData) => {
    onPayNow(
      {
        orderId,
        data,
      },
      {
        onSuccess: () => {
          setIsPayDialogOpen(false);
          paymentForm.reset();
        },
      }
    );
  };

  const handlePrintClick = () => {
    onPrint(orderId, {
      onSuccess: (data) => {
        setPrintData(data);
        setIsPrintDialogOpen(true);
      },
    });
  };

  const handleAddItem = (
    menuItemId: string,
    quantity: number,
    unitPrice: number
  ) => {
    onAddItem(
      {
        orderId,
        menuItemId,
        quantity,
        unitPrice,
      },
      {
        onSuccess: () => {
          setIsAddItemDialogOpen(false);
        },
      }
    );
  };

  const handleUpdateSchedule = (scheduledAt: Date) => {
    onUpdateSchedule(
      {
        orderId,
        scheduledAt,
      },
      {
        onSuccess: () => {
          setIsScheduleDialogOpen(false);
        },
      }
    );
  };

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Print - Available for all orders */}
        <Button
          size="sm"
          variant="outline"
          onClick={handlePrintClick}
          disabled={isPrintLoading}
        >
          <Printer className="w-4 h-4 mr-2" />
          {isPrintLoading ? "Đang tải..." : "In"}
        </Button>

        {/* Actions for Open orders only */}
        {status === "Open" && (
          <>
            {/* Add Items Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAddItemDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Thêm món
            </Button>

            {/* Update Schedule Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsScheduleDialogOpen(true)}
              disabled={isUpdatingSchedule}
            >
              <Clock className="w-4 h-4 mr-2" />
              {isUpdatingSchedule ? "Đang cập nhật..." : "Đổi giờ"}
            </Button>

            {/* Pay Now Dialog */}
            <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="default">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Thanh toán ngay
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Thanh toán đơn hàng ngay</DialogTitle>
                </DialogHeader>
                <Form {...paymentForm}>
                  <form
                    onSubmit={paymentForm.handleSubmit(handlePayNow)}
                    className="space-y-4 py-4"
                  >
                    <FormField
                      control={paymentForm.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phương thức</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn phương thức" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Cash">Tiền mặt</SelectItem>
                              <SelectItem value="Card">Thẻ</SelectItem>
                              <SelectItem value="BankTransfer">
                                Chuyển khoản
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={paymentForm.control}
                      name="paidAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số tiền</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={paymentForm.control}
                      name="transactionReference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mã giao dịch</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Nhập mã giao dịch (nếu có)"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsPayDialogOpen(false)}
                      >
                        Hủy
                      </Button>
                      <Button type="submit">Xác nhận</Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            {/* Complete Order */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="success-outline">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Hoàn thành
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hoàn thành đơn hàng?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Xác nhận rằng tất cả các món đã được phục vụ và đơn hàng đã
                    hoàn tất.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onComplete(orderId)}>
                    Xác nhận
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Cancel Order */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive-outline">
                  <Ban className="w-4 h-4 mr-2" />
                  Hủy đơn
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hủy đơn hàng?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Hành động này không thể hoàn tác. Đơn hàng sẽ bị hủy và
                    không thể sửa đổi.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Quay lại</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onCancel(orderId)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Hủy đơn
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}

        {/* Update Schedule for Completed orders */}
        {status === "Completed" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsScheduleDialogOpen(true)}
            disabled={isUpdatingSchedule}
          >
            <Clock className="w-4 h-4 mr-2" />
            {isUpdatingSchedule ? "Đang cập nhật..." : "Đổi giờ"}
          </Button>
        )}
      </div>

      {/* Print Preview Dialog */}
      <PrintPreviewDialog
        open={isPrintDialogOpen}
        onOpenChange={setIsPrintDialogOpen}
        printData={printData}
        onPrint={() => setIsPrintDialogOpen(false)}
      />

      {/* Add Menu Item Dialog */}
      <AddMenuItemDialog
        open={isAddItemDialogOpen}
        onOpenChange={setIsAddItemDialogOpen}
        onConfirm={handleAddItem}
        isAdding={isAddingItem}
      />

      {/* Update Schedule Dialog */}
      <UpdateScheduleDialog
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
        onConfirm={handleUpdateSchedule}
        currentScheduledTime={currentScheduledTime}
      />
    </>
  );
}
