import { type ReactNode } from "react";
import SearchRoom from "../fragments/search";

interface BookingViewLayoutProps {
  children: ReactNode;
}

function BookingViewLayout({ children }: BookingViewLayoutProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1>Quản lý đặt phòng</h1>
        </div>
        <SearchRoom />
      </div>

      {/* View Content */}
      <div className="bg-white rounded-md shadow">{children}</div>
    </div>
  );
}

export default BookingViewLayout;
