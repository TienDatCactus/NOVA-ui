interface BookingListProps {}

function BookingList({
  bookings = [],
  isLoading = false,
  refetch,
}: BookingListProps) {}

export default BookingList;
