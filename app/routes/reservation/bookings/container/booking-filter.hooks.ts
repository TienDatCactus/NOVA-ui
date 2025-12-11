import { useState } from "react";
import type z from "zod";
import { BookingSchema } from "~/services/api/booking/booking.schema";

const { BookingListItemSchema } = BookingSchema;
type BookingListItem = z.infer<typeof BookingListItemSchema>;

export interface BookingSearchFilters {
  date: Date | undefined;
  searchText: string;
}

const INITIAL_FILTERS: BookingSearchFilters = {
  date: new Date(),
  searchText: "",
};

function useBookingFilters() {
  const [filters, setFilters] = useState<BookingSearchFilters>(INITIAL_FILTERS);

  const filterBookings = (bookings: BookingListItem[] | undefined) => {
    if (!bookings || bookings.length === 0) return bookings;

    return bookings.filter((booking) => {
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const matchesSearch =
          booking.bookingCode?.toLowerCase().includes(searchLower) ||
          booking.customerName?.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      return true;
    });
  };

  const updateFilters = <K extends keyof BookingSearchFilters>(
    key: K,
    value: BookingSearchFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };
  return {
    filters,
    filterBookings,
    updateFilters,
    resetFilters,
  };
}

export default useBookingFilters;
