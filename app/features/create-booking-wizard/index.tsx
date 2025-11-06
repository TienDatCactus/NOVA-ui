import {
  ChevronLeft,
  ChevronRight,
  Check,
  Building2,
  Globe,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { useStep } from "~/hooks/use-step";
import { useCreateBookingStore } from "~/store/create-booking.store";
import { CustomerInfoStep } from "./components/customer-info-step";
import { StayDetailsStep } from "./components/stay-details-step";
import { RoomSelectionStep } from "./components/room-selection-step";
import { ServicesBreakfastStep } from "./components/services-breakfast-step";
import ReviewPaymentStep from "./components/review-payment-step";
import { useRef } from "react";

const steps = [
  {
    id: 1,
    title: "Loại đặt phòng",
    description: "Chọn nguồn đặt phòng",
  },
  {
    id: 2,
    title: "Thông tin khách",
    description: "Thông tin liên hệ",
  },
  {
    id: 3,
    title: "Chi tiết lưu trú",
    description: "Ngày và số lượng khách",
  },
  {
    id: 4,
    title: "Chọn phòng",
    description: "Lựa chọn phòng",
  },
  {
    id: 5,
    title: "Bữa sáng & Dịch vụ",
    description: "Dịch vụ bổ sung",
  },
  {
    id: 6,
    title: "Thanh toán",
    description: "Xác nhận và thanh toán",
  },
  {
    id: 7,
    title: "Hoàn tất",
    description: "Đặt phòng thành công",
  },
];

export default function BookingFlow() {
  const [currentStep, { goToNextStep, goToPrevStep }] = useStep(7);
  const { data: bookingData, setData } = useCreateBookingStore();
  const customerInfoFormRef = useRef<HTMLFormElement>(null);
  const stayDetailsFormRef = useRef<HTMLFormElement>(null);
  const roomSelectionFormRef = useRef<HTMLFormElement>(null);
  const servicesBreakfastFormRef = useRef<HTMLFormElement>(null);
  const reviewPaymentFormRef = useRef<HTMLFormElement>(null);

  const handleNext = () => {
    if (currentStep === 2 && customerInfoFormRef.current) {
      customerInfoFormRef.current.requestSubmit();
      return;
    }
    // For step 3, trigger form submission
    if (currentStep === 3 && stayDetailsFormRef.current) {
      stayDetailsFormRef.current.requestSubmit();
      return;
    }
    // For step 4, trigger form submission
    if (currentStep === 4 && roomSelectionFormRef.current) {
      roomSelectionFormRef.current.requestSubmit();
      return;
    }
    // For step 5, trigger form submission
    if (currentStep === 5 && servicesBreakfastFormRef.current) {
      servicesBreakfastFormRef.current.requestSubmit();
      return;
    }
    // For step 6, trigger form submission to create booking
    if (currentStep === 6 && reviewPaymentFormRef.current) {
      reviewPaymentFormRef.current.requestSubmit();
      return;
    }
    goToNextStep();
  };

  const handlePrevious = () => {
    goToPrevStep();
  };

  const updateBookingData = (field: string, value: any) => {
    setData({ [field]: value });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Chọn loại đặt phòng</CardTitle>
              <CardDescription>
                Vui lòng chọn nguồn đặt phòng của khách hàng
              </CardDescription>
            </CardHeader>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card
                className={cn(
                  "cursor-pointer transition-all ",
                  bookingData.bookingType === "Direct"
                    ? "bg-muted border-primary ring-2 ring-primary"
                    : "border-gray-200 hover:shadow-md"
                )}
                onClick={() => updateBookingData("bookingType", "Direct")}
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
                      Khách hàng đặt trực tiếp tại khách sạn hoặc qua điện thoại
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={cn(
                  "cursor-pointer transition-all",
                  bookingData.bookingType === "OTA"
                    ? "bg-muted border-primary ring-2 ring-primary"
                    : "border-card hover:shadow-md"
                )}
                onClick={() => updateBookingData("bookingType", "OTA")}
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
            </div>
          </div>
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
              <CardTitle>Chi tiết lưu trú</CardTitle>
              <CardDescription>
                Chọn ngày nhận/trả phòng và số lượng khách
              </CardDescription>
            </CardHeader>
            <StayDetailsStep
              onNext={goToNextStep}
              formRef={stayDetailsFormRef}
            />
          </div>
        );

      case 4:
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

      case 5:
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

      case 6:
        return (
          <ReviewPaymentStep onNext={goToNextStep} ref={reviewPaymentFormRef} />
        );

      case 7:
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
      <Card className="w-full max-w-4xl bg-white shadow-lg ">
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

        <CardContent className="p-6 md:px-8">{renderStepContent()}</CardContent>
        <CardFooter className="mt-8 flex items-center justify-between border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Quay lại</span>
          </Button>

          {currentStep < 7 ? (
            <Button onClick={handleNext}>
              <span>
                {currentStep === 6 ? "Xác nhận đặt phòng" : "Tiếp theo"}
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline">Hủy</Button>
              <Button
                onClick={() => {
                  useCreateBookingStore.getState().reset();
                  window.location.reload();
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
