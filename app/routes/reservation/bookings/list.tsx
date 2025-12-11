import { format } from "date-fns";
import { useState } from "react";
import { BookingGridView } from "./components/booking-grid-view";
import BookingList from "./components/booking-list";
import useSearchBooking from "./container/booking-filter.hooks";
import { useBookings } from "./container/booking-query.hooks";
import BookingViewLayout from "./layouts/booking-view.layout";
import type { Route } from "./+types/list";
import useBookingFilters from "./container/booking-filter.hooks";
import { AuthLoader, RouteModule, Permission } from "~/lib/auth/auth.loader";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Đặt Phòng - NOVA Hotel Management" },
    { name: "description", content: "Quản lý đặt phòng và phòng trống" },
  ];
}

export const clientLoader = () =>
  AuthLoader.guard(RouteModule.Bookings, Permission.Read);

type ViewMode = "grid" | "list";

export default function Component({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const { filters, filterBookings, updateFilters, resetFilters } =
    useBookingFilters();
  const { data, isPending, refetch } = useBookings(
    filters.date ? { date: format(filters.date, "yyyy-MM-dd") } : undefined
  );
  const filteredBookings = filterBookings(data);

  return (
    <BookingViewLayout
      filters={filters}
      updateFilters={updateFilters}
      resetFilters={resetFilters}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
    >
      {viewMode === "grid" ? (
        <BookingGridView
          bookings={filteredBookings}
          isLoading={isPending}
          refetch={refetch}
        />
      ) : (
        <BookingList
          bookings={filteredBookings}
          isLoading={isPending}
          refetch={refetch}
        />
      )}
    </BookingViewLayout>
  );
}
