import type { BookingSearchFilters } from "../components/search";
import { useState } from "react";
import type z from "zod";
import { BookingSchema } from "~/services/api/booking/booking.schema";

const { BookingListItemSchema } = BookingSchema;
type BookingListItem = z.infer<typeof BookingListItemSchema>;

const INITIAL_FILTERS: BookingSearchFilters = {
  searchText: "",
  status: "all",
  source: "all",
};

function useSearchBooking(bookings: BookingListItem[] | undefined) {
  const [filters, setFilters] = useState<BookingSearchFilters>(INITIAL_FILTERS);

  const filteredBookings = () => {
    if (!bookings || bookings.length === 0) return bookings;

    return bookings.filter((booking) => {
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const matchesSearch =
          booking.bookingCode?.toLowerCase().includes(searchLower) ||
          booking.customerName?.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      if (filters.status && filters.status !== "all") {
        if (booking.status !== filters.status) return false;
      }

      if (filters.source && filters.source !== "all") {
        if (booking.source !== filters.source) return false;
      }

      return true;
    });
  };

  const handleFiltersChange = (newFilters: BookingSearchFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };
  return {
    filters,
    filteredBookings: filteredBookings(),
    handleFiltersChange,
    handleResetFilters,
  };
}

export default useSearchBooking;
