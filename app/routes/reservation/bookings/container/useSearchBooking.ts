import useBookingSchema from "~/services/schema/booking.schema";
import type { BookingSearchFilters } from "../fragments/search";
import { useState } from "react";
import type z from "zod";

const { BookingItemSchema } = useBookingSchema();
type BookingItem = z.infer<typeof BookingItemSchema>;

const INITIAL_FILTERS: BookingSearchFilters = {
  searchText: "",
  status: "all",
  source: "all",
  roomType: "all",
};

function useSearchBooking(bookings: BookingItem[] | undefined) {
  const [filters, setFilters] = useState<BookingSearchFilters>(INITIAL_FILTERS);

  const filteredBookings = () => {
    if (!bookings || bookings.length === 0) return bookings;

    return bookings.filter((booking) => {
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const matchesSearch =
          booking.bookingCode?.toLowerCase().includes(searchLower) ||
          booking.customerName?.toLowerCase().includes(searchLower) ||
          booking.customerPhone?.toLowerCase().includes(searchLower) ||
          booking.customerEmail?.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      if (filters.status && filters.status !== "all") {
        if (booking.status !== filters.status) return false;
      }

      if (filters.source && filters.source !== "all") {
        if (booking.source !== filters.source) return false;
      }

      if (filters.roomType && filters.roomType !== "all") {
        const hasRoomType = booking.rooms?.some(
          (room) => room.roomTypeName === filters.roomType
        );
        if (!hasRoomType) return false;
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
