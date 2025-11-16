import {
  Ban,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Globe,
} from "lucide-react";

import { useRef } from "react";
import { Alert, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useStep } from "~/hooks/use-step";
import { cn, onError } from "~/lib/utils";
import { useCreateBookingStore } from "~/store/create-booking.store";
import { CustomerInfoStep } from "./components/customer-info-step";
import ReviewPaymentStep from "./components/review-payment-step";
import { RoomSelectionStep } from "./components/room-selection-step";
import { ServicesBreakfastStep } from "./components/services-breakfast-step";
import { Link } from "react-router";
import { DASHBOARD } from "~/lib/fe-url";
import { useForm } from "react-hook-form";
import { Form, FormField, FormMessage } from "~/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

const steps = [
  {
    id: 1,
    title: "Loại đặt phòng",
    description: "Chọn nguồn đặt phòng",
  },
  {
    id: 2,
    title: "Thông tin khách & lưu trú",
    description: "Thông tin liên hệ",
  },

  {
    id: 3,
    title: "Chọn phòng",
    description: "Lựa chọn phòng",
  },
  {
    id: 4,
    title: "Bữa sáng & Dịch vụ",
    description: "Dịch vụ bổ sung",
  },
  {
    id: 5,
    title: "Thanh toán",
    description: "Xác nhận và thanh toán",
  },
  {
    id: 6,
    title: "Hoàn tất",
    description: "Đặt phòng thành công",
  },
];

export default function BookingFlow() {
  const [currentStep, { goToNextStep, goToPrevStep }] = useStep(7);
  const { data: bookingData, setData } = useCreateBookingStore();
  const bookingTypeForm = useForm({
    resolver: zodResolver(
      z.object({
        bookingType: z
          .enum(["Direct", "OTA", "RoomBlock"], "Vui lòng chọn loại đặt phòng")
          .optional(),
      })
    ),
    defaultValues: {
      bookingType: bookingData.bookingType || undefined,
    },
  });
  const customerInfoFormRef = useRef<HTMLFormElement>(null);
  const roomSelectionFormRef = useRef<HTMLFormElement>(null);
  const servicesBreakfastFormRef = useRef<HTMLFormElement>(null);
  const reviewPaymentFormRef = useRef<HTMLFormElement>(null);
  const handleNext = () => {
    // For step 1, validate booking type selection
    if (currentStep === 1) {
      bookingTypeForm.handleSubmit(() => {
        updateBookingData(
          "bookingType",
          bookingTypeForm.getValues().bookingType
        );
        goToNextStep();
      }, onError)();
      if (!bookingData.bookingType) {
        return; // Don't proceed if no booking type selected
      }
    }
    if (currentStep === 2 && customerInfoFormRef.current) {
      customerInfoFormRef.current.requestSubmit();
      return;
    }

    // For step 4 (room selection), skip to step 6 for RoomBlock
    if (currentStep === 3 && roomSelectionFormRef.current) {
      roomSelectionFormRef.current.requestSubmit();
      return;
    }
    // For step 5 (services), trigger form submission for normal bookings
    // RoomBlock will skip this step entirely
    if (currentStep === 4 && servicesBreakfastFormRef.current) {
      servicesBreakfastFormRef.current.requestSubmit();
      return;
    }
    // For step 6, trigger form submission to create booking
    if (currentStep === 5 && reviewPaymentFormRef.current) {
      reviewPaymentFormRef.current.requestSubmit();
      return;
    }
    goToNextStep();
  };

  const handlePrevious = () => {
    const isRoomBlock = bookingData.bookingType === "RoomBlock";

    // Skip services step when going back from review for RoomBlock
    if (currentStep === 5 && isRoomBlock) {
      goToPrevStep(); // Go to step 4
      goToPrevStep(); // Go to step 3 (room selection)
      return;
    }

    goToPrevStep();
  };

  const updateBookingData = (field: string, value: any) => {
    setData({ [field]: value });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Form {...bookingTypeForm}>
            <form className="space-y-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Chọn loại đặt phòng</CardTitle>
                <CardDescription>
                  Vui lòng chọn nguồn đặt phòng của khách hàng
                </CardDescription>
              </CardHeader>

              <FormField
                control={bookingTypeForm.control}
                name="bookingType"
                render={({ field }) => (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Direct */}
                    <Card
                      className={cn(
                        "cursor-pointer transition-all h-fit p-0",
                        field.value === "Direct"
                          ? "bg-muted border-primary ring-2 ring-primary"
                          : "border-gray-200 hover:shadow-md"
                      )}
                      onClick={() => field.onChange("Direct")}
                    >
                      <CardContent className="flex items-start space-x-4 p-6">
                        <div className="flex-shrink-0">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <Building2 className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        <div>
                          <h3 className="mb-1 font-semibold text-foreground">
                            Đặt phòng trực tiếp
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            Khách hàng đặt trực tiếp tại khách sạn hoặc qua điện
                            thoại
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* OTA */}
                    <Card
                      className={cn(
                        "cursor-pointer transition-all h-fit p-0",
                        field.value === "OTA"
                          ? "bg-muted border-primary ring-2 ring-primary"
                          : "border-gray-200 hover:shadow-md"
                      )}
                      onClick={() => field.onChange("OTA")}
                    >
                      <CardContent className="flex items-start space-x-4 p-6">
                        <div className="flex-shrink-0">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <Globe className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        <div>
                          <h3 className="mb-1 font-semibold text-foreground">
                            Đặt qua OTA
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            Booking.com, Agoda, Expedia, Traveloka, v.v.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Room Block */}
                    <Card
                      className={cn(
                        "cursor-pointer transition-all h-fit p-0",
                        field.value === "RoomBlock"
                          ? "bg-muted border-destructive ring-2 ring-destructive"
                          : "border-gray-200 hover:shadow-md"
                      )}
                      onClick={() => field.onChange("RoomBlock")}
                    >
                      <CardContent className="flex items-start space-x-4 p-6">
                        <div className="flex-shrink-0">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
                            <Ban className="h-6 w-6 text-destructive" />
                          </div>
                        </div>
                        <div>
                          <h3 className="mb-1 font-semibold text-foreground">
                            Room Block
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            Khóa phòng để bảo trì, sửa chữa hoặc các mục đích
                            nội bộ
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              />

              <FormMessage />
              {!bookingTypeForm.formState.errors && (
                <Alert variant={"destructive"}>
                  <CircleAlert className="h-4 w-4" />
                  <AlertTitle>
                    {bookingTypeForm.formState.errors ||
                      "Vui lòng chọn loại đặt phòng để tiếp tục."}
                  </AlertTitle>
                </Alert>
              )}
            </form>
          </Form>
        );

      case 2:
        return (
          <div className="space-y-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Thông tin khách hàng</CardTitle>
              <CardDescription>
                Nhập thông tin liên hệ của khách hàng
              </CardDescription>
            </CardHeader>
            <CustomerInfoStep
              onNext={goToNextStep}
              formRef={customerInfoFormRef}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Chọn phòng</CardTitle>
              <CardDescription>
                Lựa chọn phòng phù hợp cho kỳ nghỉ
              </CardDescription>
            </CardHeader>
            <RoomSelectionStep
              onNext={goToNextStep}
              formRef={roomSelectionFormRef}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Bữa sáng & Dịch vụ</CardTitle>
              <CardDescription>
                Thêm bữa sáng và các dịch vụ bổ sung
              </CardDescription>
            </CardHeader>
            <ServicesBreakfastStep
              onNext={goToNextStep}
              formRef={servicesBreakfastFormRef}
            />
          </div>
        );

      case 5:
        return (
          <ReviewPaymentStep onNext={goToNextStep} ref={reviewPaymentFormRef} />
        );

      case 6:
        return (
          <div className="space-y-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Đặt phòng thành công!</CardTitle>
              <CardDescription>
                Đơn đặt phòng đã được tạo thành công
              </CardDescription>
            </CardHeader>

            <div className="space-y-4 text-center py-8">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <p className="text-gray-700">
                Đơn đặt phòng của bạn đã được tạo thành công. Bạn có thể xem chi
                tiết hoặc tạo đơn đặt phòng mới.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-full items-center justify-center p-4">
      <Card className="w-full max-w-6xl bg-white shadow-md ">
        <CardHeader className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step) => (
              <div
                key={step.id}
                className="relative flex flex-1 flex-col items-center"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-300",
                    currentStep > step.id
                      ? "bg-primary text-primary-foreground"
                      : currentStep === step.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-gray-200 text-gray-600"
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <div
                  className={cn(
                    "mt-2 text-center text-xs font-medium max-md:hidden",
                    currentStep >= step.id ? "text-gray-800" : "text-gray-500"
                  )}
                >
                  {step.title}
                </div>
                {step.id < steps.length && (
                  <div
                    className={cn(
                      "absolute top-5 left-[calc(50%+20px)] h-0.5 w-[calc(100%-40px)] -translate-y-1/2 bg-gray-200 transition-colors duration-300",
                      currentStep > step.id && "bg-primary"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-6 md:px-8 ">
          {renderStepContent()}
        </CardContent>
        <CardFooter className="mt-8 flex gap-4 items-center justify-end border-t">
          {currentStep > 1 && currentStep < 6 && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Quay lại</span>
            </Button>
          )}
          {currentStep < 6 ? (
            <Button onClick={handleNext}>
              <span>
                {currentStep === 5 ? "Xác nhận đặt phòng" : "Tiếp theo"}
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant={"outline"} asChild>
                <Link to={DASHBOARD.bookings.list}>Tạo đặt phòng mới</Link>
              </Button>

              <Button
                onClick={() => {
                  useCreateBookingStore.getState().reset();
                }}
              >
                Tạo đặt phòng mới
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
