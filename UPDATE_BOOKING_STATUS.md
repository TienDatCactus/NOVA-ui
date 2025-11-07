# Update Booking Status Feature

## Tổng quan

Tính năng cho phép cập nhật trạng thái booking trực tiếp trên danh sách booking, tương tự như cách cập nhật trạng thái room.

## API Endpoint

- **Endpoint**: `POST /api/Bookings/update-status`
- **Request Body**:
  ```json
  {
    "bookingId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "newStatus": "Pending"
  }
  ```
- **Response**: Status 200 OK

## Các trạng thái Booking

| English Status | Tiếng Việt    | Màu sắc UI |
| -------------- | ------------- | ---------- |
| Pending        | Chờ xử lý     | Orange     |
| Confirmed      | Đã xác nhận   | Blue       |
| CheckedIn      | Đã nhận phòng | Green      |
| InHouse        | Đang ở        | Emerald    |
| CheckedOut     | Đã trả phòng  | Gray       |
| Cancelled      | Đã hủy        | Red        |

## Files đã thay đổi

### 1. `app/services/types/booking.types.ts`

- Thêm `BookingStatusEnum` để map từ tiếng Anh sang tiếng Việt
- Thêm type `BookingStatus` để đảm bảo type-safety

```typescript
export const BookingStatusEnum = {
  Pending: "Chờ xử lý",
  Confirmed: "Đã xác nhận",
  CheckedIn: "Đã nhận phòng",
  InHouse: "Đang ở",
  CheckedOut: "Đã trả phòng",
  Cancelled: "Đã hủy",
} as const;

export type BookingStatus = keyof typeof BookingStatusEnum;
```

### 2. `app/services/url.ts`

- Thêm endpoint `updateStatus` vào object `Booking`

```typescript
const Booking = {
  // ... existing endpoints
  updateStatus: "Bookings/update-status",
};
```

### 3. `app/services/api/booking/index.ts`

- Thêm function `updateBookingStatus` để gọi API
- Export function trong `BookingService`

```typescript
async function updateBookingStatus(data: {
  bookingId: string;
  newStatus: string;
}): Promise<void> {
  try {
    await http.post(Booking.updateStatus, data);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}
```

### 4. `app/routes/reservation/bookings/container/booking-mutation.hooks.ts`

- Thêm hook `useUpdateBookingStatus` sử dụng TanStack Query mutation
- Tự động invalidate cache sau khi update thành công

```typescript
function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { bookingId: string; newStatus: string }) =>
      await BookingService.updateBookingStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
```

### 5. `app/routes/reservation/bookings/fragments/status.cell.tsx` (NEW)

- Component presentational để hiển thị select dropdown status
- Tương tự như `RoomStatusCell` component
- Tự động apply màu sắc theo status hiện tại

**Features:**

- Disabled khi đang update (isPending)
- Màu sắc động theo status
- Focus states với ring effect
- Icon SVG cùng màu với border/background

### 6. `app/routes/reservation/bookings/components/booking-list/columns.tsx`

- Import `BookingStatusCell` component
- Thay thế `Badge` component bằng `BookingStatusCell` ở cột "Trạng thái"

```typescript
{
  accessorKey: "status",
  header: "Trạng thái",
  cell: ({ row }) => {
    return <BookingStatusCell booking={row.original} />;
  },
},
```

## Cách sử dụng

1. Mở trang danh sách booking (`/reservation/bookings/list`)
2. Tại cột "Trạng thái", click vào select dropdown
3. Chọn trạng thái mới từ danh sách
4. Status sẽ được cập nhật ngay lập tức
5. Danh sách booking tự động refresh

## Design System Compliance

✅ **Foundation**: Sử dụng color tokens từ theme (border-_, bg-_, text-\*)  
✅ **Layout**: Consistent spacing và structure  
✅ **Depth**: Shadow và layering với `shadow-none` cho select  
✅ **Hierarchy**: Màu sắc rõ ràng cho từng status

## Testing Checklist

- [ ] Kiểm tra API response khi update status
- [ ] Kiểm tra UI disabled state khi đang update
- [ ] Kiểm tra màu sắc hiển thị đúng cho từng status
- [ ] Kiểm tra danh sách refresh sau khi update
- [ ] Kiểm tra error handling khi API fail
- [ ] Kiểm tra accessibility (keyboard navigation, screen reader)

## Notes

- Component tuân thủ pattern **Container/Presentational**:
  - `status.cell.tsx` là presentational component
  - `booking-mutation.hooks.ts` chứa business logic
- Sử dụng **Schema-Driven Development**:
  - `BookingListItemSchema` để type-safe data
  - `BookingStatusEnum` để map status

- **No Data Normalization**: Giữ nguyên cấu trúc API response
