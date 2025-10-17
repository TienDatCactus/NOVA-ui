import { type ReactNode } from "react";
import SearchRoom from "../fragments/search";

interface BookingViewLayoutProps {
  children: ReactNode;
}

function BookingViewLayout({ children }: BookingViewLayoutProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <SearchRoom />
      </div>

      <div className="bg-white rounded-md shadow">{children}</div>
    </div>
  );
}

export default BookingViewLayout;
