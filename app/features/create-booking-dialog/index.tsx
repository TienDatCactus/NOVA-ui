import BookingFlow from "./components/booking-flow";

interface CreateBookingDialogProps {
  onComplete?: () => void;
}

export default function CreateBookingDialog({
  onComplete,
}: CreateBookingDialogProps) {
  return <BookingFlow onComplete={onComplete} />;
}
