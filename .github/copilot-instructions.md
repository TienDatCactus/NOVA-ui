# NOVA-UI Project Guide

NOVA-UI is a React-based hotel management system. "NOVA" stands for **N**etwork **O**peration for **V**acation **A**ccommodation.

## Core Stack

- **Framework**: React 19 + React Router 7 (file-based routing)
- **State**: Zustand (persisted) + TanStack Query (server state)
- **Forms**: React Hook Form + Zod validation + `zodResolver`
- **UI**: Shadcn UI (Radix primitives + Tailwind CSS 4)
- **Datetime**: `date-fns` (all datetime operations)
- **API**: Axios (`~/lib/http`) with interceptors for auth/toasts

## Architecture Patterns

### 1. Schema-Driven Development

**All data structures flow from Zod schemas** in `/app/services/schema/`:

```typescript
// Define schema first (booking.schema.ts)
const BookingItemSchema = z.object({
  bookingId: z.string().uuid(),
  bookingCode: z.string(),
  status: z.enum([
    "Confirmed",
    "CheckedIn",
    "CheckedOut",
    "Pending",
    "Cancelled",
  ]),
  // ...
});

// Export as factory function
export default function useBookingSchema() {
  return { BookingItemSchema, BookingListResponseSchema };
}

// Use everywhere - API DTOs (dto.ts)
type BookingItem = z.infer<typeof BookingItemSchema>;

// Use everywhere - Form validation
const form = useForm<z.infer<typeof BookingSchema>>({
  resolver: zodResolver(BookingSchema),
});

// Use everywhere - API response parsing
const data = BookingItemSchema.parse(response.data);
```

**Critical**: Never create manual TypeScript interfaces for API data. Always `z.infer<>` from schemas.

### 2. Container/Presentational Split

Components **must** separate UI from logic:

```
/features/create-booking/
  ├── index.tsx                          # Orchestrator component
  ├── components/                         # Presentational (pure UI)
  │   ├── customer-info-form.tsx
  │   └── booking-confirmation.tsx
  ├── container/                          # Logic hooks (.hooks.ts)
  │   ├── create-booking.hooks.ts         # Main orchestration
  │   └── customer-info-form.hooks.ts     # Component-specific logic
  └── fragments/                          # Small reusable UI pieces
```

**Pattern**: Form component receives `form` prop from parent hook:

```tsx
// Container hook manages form
function useCustomerInfoForm({ form }: { form: UseFormReturn<BookingFormData> }) {
  const { formData } = useCreateBookingStore();
  // Logic: watchers, effects, handlers
  return { contact, setContact, hasContactInfo };
}

// Presentational component receives both
export default function CustomerInfoForm({ form }: { form: UseFormReturn<...> }) {
  const { contact, setContact } = useCustomerInfoForm({ form });
  return <Form {...form}>{/* UI only */}</Form>;
}
```

### 3. Multi-Step Form Pattern

**Three-layer persistence** for complex flows:

```typescript
// 1. Zustand store (/store/create-booking.store.ts)
export const useCreateBookingStore = create<CreateBookingState>()(
  persist(
    (set) => ({
      currentStep: 1,
      formData: { /* default values */ },
      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      updateFormData: (data) => set((state) => ({
        formData: { ...state.formData, ...data }
      })),
    }),
    { name: "create-booking-storage", storage: createJSONStorage(() => localStorage) }
  )
);

// 2. React Hook Form (ephemeral, for validation)
const form = useForm<BookingFormData>({
  resolver: zodResolver(BookingSchema),
  defaultValues: formData, // Load from Zustand on mount
});

// 3. Step navigation in main component
const StepComponents = [
  <CustomerInfoForm form={form} />,
  <RoomSelectionForm form={form} />,
  <BookingConfirmation form={form} />,
];
return StepComponents[currentStep - 1];
```

**Flow**: User edits → Form validates → On "Next", sync to Zustand → Load from Zustand on step change.

### 4. API Service Layer

**Consistent structure** for all services (`/app/services/api/<domain>/`):

```typescript
// index.ts - Service functions
import http from "~/lib/http";
import useBookingSchema from "~/services/schema/booking.schema";
import type { BookingListResponseDto } from "./dto";

const { BookingListResponseSchema } = useBookingSchema();

async function getBookingList(
  params: BookingListParams
): Promise<BookingListResponseDto> {
  try {
    const resp = await http.get(Booking.list, { params });
    return BookingListResponseSchema.parse(resp.data); // Validate response
  } catch (error) {
    return Promise.reject(error);
  }
}

export const BookingService = { getBookingList };

// dto.ts - Type exports (z.infer only)
import type z from "zod";
import useBookingSchema from "~/services/schema/booking.schema";

const { BookingListResponseSchema } = useBookingSchema();
export type BookingListResponseDto = z.infer<typeof BookingListResponseSchema>;

// url.ts - Endpoint paths
export const Booking = {
  list: "/bookings",
  detail: (code: string) => `/bookings/${code}`,
  listByWeek: "/bookings/by-week",
};
```

### 5. TanStack Query Hooks

**One hook per query** in `/routes/<feature>/container/`:

```typescript
// useBookings.ts
import { useQuery } from "@tanstack/react-query";
import { BookingService } from "~/services/api/booking";

function useBookings(params?: BookingListParams) {
  return useQuery({
    queryKey: ["bookings", params], // Include params for cache granularity
    queryFn: async () => await BookingService.getBookingList(params || {}),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}
```

**Usage in component**:

```tsx
const { data, isPending, refetch } = useBookings({ date: "2025/10/18" });
```

### 6. NO Data Normalization

**Critical constraint**: API response shapes must be preserved as-is:

```typescript
// ✅ CORRECT: Use API structure directly
type RoomSchedulerData = z.infer<typeof BookingItemByWeekSchema>;
// Schema: { roomId, roomName, bookings: [{ bookingId, status, ... }] }

const displayBookings = useMemo(() => {
  roomsData.forEach((room) => {
    room.bookings.forEach((booking) => {
      // Work with nested structure directly
    });
  });
}, [roomsData]);

// ❌ WRONG: Do not flatten or transform
const flatBookings = roomsData.flatMap((room) =>
  room.bookings.map((b) => ({ ...b, roomId: room.roomId }))
); // This breaks data integrity
```

**Why**: Preserving API structure ensures data consistency, simplifies debugging, and avoids transformation bugs.

## Key Conventions

### Date Formatting

- **API date parameters**: `yyyy/MM/dd` (e.g., `"2025/10/14"`)
- **Display dates**: Use `date-fns` `format()` with Vietnamese locale
- **Date parsing**: Use `parseISO()` for ISO strings, `parseDateYMD()` for `yyyy-MM-dd`

```typescript
import { format, parseISO } from "date-fns";

// For API calls
weekStart: format(currentWeekStart, "yyyy/MM/dd");

// For display
format(parseISO(booking.segmentFrom), "dd/MM/yyyy HH:mm");
```

### UI Component Styling

Use `cn()` utility (tailwind-merge + clsx) for conditional classes:

```tsx
import { cn } from "~/lib/utils";

<div
  className={cn(
    "base-class",
    { "conditional-class": isActive },
    variant === "primary" && "primary-styles"
  )}
/>;
```

### Language

All UI text in **Vietnamese**. Follow existing patterns:

```tsx
<Button>Tiếp theo</Button> // Next
<FormLabel>Họ và tên</FormLabel> // Full name
```

## Development Workflow

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run host         # Start with network access
npm run typecheck    # Validate TypeScript (includes route typegen)
npm run build        # Production build
```

**Route typing**: React Router 7 auto-generates types. Import as:

```typescript
import type { Route } from "./+types/login";

export const loader = async ({ request, params }: Route.LoaderArgs) => {};
export default function Component({ loaderData }: Route.ComponentProps) {}
```

## Common Utilities

```typescript
// ~/lib/utils.ts
cn(...classes); // Merge Tailwind classes
formatMoney(amount); // { usdFormatted, vndFormatted }
parseDateYMD("2025-10-14"); // Parse yyyy-MM-dd to Date
daysBetweenFloor(date1, date2); // Days difference

// ~/lib/constants.tsx
NAV_ITEMS; // Sidebar navigation config
(BOOKING_CHANNEL, ROOM_TYPE); // Enums for dropdowns
```

## File Naming

- Components: PascalCase (`CustomerInfoForm.tsx`)
- Hooks: camelCase with `.hooks.ts` suffix (`useBookings.hooks.ts`)
- Utils: camelCase (`.ts`)
- Constants: UPPER_SNAKE_CASE in `constants.tsx`

## Error Handling

API errors auto-toast via `http.ts` interceptor:

```typescript
// http.ts response interceptor
if (!success) {
  toast.error(message || "Có lỗi xảy ra. Vui lòng thử lại.");
}
```

Manual error handling:

```tsx
try {
  await BookingService.create(data);
  toast.success("Đặt phòng thành công");
} catch (error) {
  // Already toasted by interceptor
  console.error(error);
}
```
