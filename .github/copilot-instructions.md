# NOVA-UI Project Guide

NOVA-UI is a React-based hotel management system. "NOVA" stands for **N**etwork **O**peration for **V**acation **A**ccommodation.

## Core Stack

- **Framework**: React 19 + React Router 7 (file-based routing)
- **State**: Zustand (persisted) + TanStack Query (server state)
- **Forms**: React Hook Form + Zod validation + `zodResolver`
- **UI**: Shadcn UI (Radix primitives + Tailwind CSS 4)
- **Datetime**: `date-fns` (all datetime operations)
- **API**: Axios (`~/lib/http`) with interceptors for auth/toasts

## UI/UX Design Philosophy

Phần này định nghĩa triết lý thiết kế của chúng ta. Nó trả lời câu hỏi: "Chúng ta có Shadcn và Tailwind, vậy chúng ta _sử dụng_ chúng như thế nào để tạo ra một giao diện đẹp và hiệu quả?"

Triết lý này dựa trên 4 trụ cột:

### 1\. Nền tảng: Sử dụng Hệ thống (Foundation)

**Triết lý:** Không bao giờ dùng các giá trị "magic number". LUÔN LUÔN sử dụng các giá trị đã được định nghĩa trong hệ thống (theme).

- **Spacing (Khoảng cách):** Luôn sử dụng các tiện ích spacing của Tailwind (`p-4`, `m-2`, `gap-8`). Không dùng các giá trị tùy ý như `margin: 10px`. Điều này đảm bảo tính nhất quán (8pt grid).
- **Typography (Kiểu chữ):** Sử dụng các kiểu chữ đã định nghĩa của Shadcn (`h1`, `h2`, `p`, `text-sm`).
- **Colors (Màu sắc):** Nghiêm ngặt tuân thủ bảng màu của theme. Chỉ sử dụng các màu đã định nghĩa (`primary`, `secondary`, `destructive`, `muted`, `card`, `popover`, `background`).

### 2\. Bố cục: Đơn giản & Phân nhóm (Layout)

**Triết lý:** "Thiết kế tốt là thiết kế ít nhất có thể". Giữ giao diện sạch sẽ và tập trung vào nhiệm vụ chính của người dùng.

- **Phân nhóm (Proximity):** Sử dụng khoảng trắng (`gap-4`, `mb-6`) để nhóm các mục liên quan. Ví dụ: một `FormLabel`, `FormControl`, và `FormDescription` phải là một cụm trực quan gắn kết.
- **Tính nhất quán:** Các component tương tự phải có cấu trúc giống hệt nhau. (Triết lý này được thực thi bởi **Mô hình API Service Layer** và **Component-based** của chúng ta).

### 3\. Cảm nhận: Tạo Chiều sâu (Depth & Feel)

**Triết lý:** Thiết kế "phẳng" (flat) thì "nhàm chán" (boring). Phải sử dụng chiều sâu để tạo cảm giác thực tế và thu hút.

- **Tạo Lớp (Layers):** Sử dụng các sắc thái nền để tạo lớp.
  - **Quy tắc chuẩn:** Nền trang (page) chính sử dụng `bg-background` (hoặc `bg-muted`).
  - Các khối nội dung (content) được đặt trên các component có nền `bg-card` (thường là màu trắng) như `Card`, `Popover`, `Dialog`.
- **Đổ bóng (Shadows):**
  - Sử dụng `box-shadow` (ví dụ `shadow-sm`, `shadow-m`, `shadow-l`) để "nâng" (elevate) các yếu tố quan trọng (Card, Button, Dropdown) lên khỏi nền.
  - Điều này tạo ra độ sâu và tập trung sự chú ý của người dùng vào các yếu tố tương tác.

### 4\. Phân cấp: Dẫn dắt Người dùng (Hierarchy)

**Triết lý:** Điều hướng mắt của người dùng một cách có chủ đích. Không phải mọi thứ đều quan trọng như nhau.

- **Nhấn mạnh (Emphasis):** Sử dụng kích thước, độ đậm và màu sắc (`h1`, `h2`, `font-bold`, `text-primary`) cho thông tin quan trọng nhất (Tiêu đề trang, nút CTA chính).
- **Làm mờ (De-emphasis):**
  - **Đây là quy tắc quan trọng nhất:** **Hãy làm cho thông tin phụ trở nên "phụ"**.
  - Sử dụng `text-muted-foreground` (màu xám nhạt) cho các nhãn (label), mô tả (description), và các dữ liệu không quan trọng.
  - Việc này làm cho thông tin chính _tự động_ nổi bật mà không cần phải làm cho nó "to" hoặc "ồn ào" hơn.
    Vai trò: **Design System Architect & Frontend Engineer**

Dưới đây là **NOVA-UI Project Guide** đã được mở rộng — tích hợp phân tích & hướng dẫn sử dụng **shadcn/ui** vào trong tiêu chuẩn của dự án. Mọi phần mới đều nằm trong phần **Shadcn: cách dùng trong NOVA-UI** để dễ tìm.

# NOVA-UI Project Guide

NOVA-UI is a React-based hotel management system. "NOVA" stands for **N**etwork **O**peration for **V**acation **A**ccommodation.

---

## Core Stack

- **Framework**: React 19 + React Router 7 (file-based routing)
- **State**: Zustand (persisted) + TanStack Query (server state)
- **Forms**: React Hook Form + Zod validation + `zodResolver`
- **UI**: Shadcn UI (Radix primitives + Tailwind CSS 4)
- **Datetime**: `date-fns` (all datetime operations)
- **API**: Axios (`~/lib/http`) with interceptors for auth/toasts

---

## UI/UX Design Philosophy

Phần này định nghĩa triết lý thiết kế của chúng ta. Nó trả lời câu hỏi: "Chúng ta có Shadcn và Tailwind, vậy chúng ta _sử dụng_ chúng như thế nào để tạo ra một giao diện đẹp và hiệu quả?"

Triết lý này dựa trên 4 trụ cột:

### 1. Nền tảng: Sử dụng Hệ thống (Foundation)

**Triết lý:** Không bao giờ dùng các giá trị "magic number". LUÔN LUÔN sử dụng các giá trị đã được định nghĩa trong hệ thống (theme).

- **Spacing (Khoảng cách):** Luôn sử dụng các tiện ích spacing của Tailwind (`p-4`, `m-2`, `gap-8`). Không dùng các giá trị tùy ý như `margin: 10px`. Điều này đảm bảo tính nhất quán (8pt grid).
- **Typography (Kiểu chữ):** Sử dụng các kiểu chữ đã định nghĩa của Shadcn (`h1`, `h2`, `p`, `text-sm`).
- **Colors (Màu sắc):** Nghiêm ngặt tuân thủ bảng màu của theme. Chỉ sử dụng các màu đã định nghĩa (`primary`, `secondary`, `destructive`, `muted`, `card`, `popover`, `background`).

### 2. Bố cục: Đơn giản & Phân nhóm (Layout)

**Triết lý:** "Thiết kế tốt là thiết kế ít nhất có thể". Giữ giao diện sạch sẽ và tập trung vào nhiệm vụ chính của người dùng.

- **Phân nhóm (Proximity):** Sử dụng khoảng trắng (`gap-4`, `mb-6`) để nhóm các mục liên quan. Ví dụ: một `FormLabel`, `FormControl`, và `FormDescription` phải là một cụm trực quan gắn kết.
- **Tính nhất quán:** Các component tương tự phải có cấu trúc giống hệt nhau. (Triết lý này được thực thi bởi **Mô hình API Service Layer** và **Component-based** của chúng ta).

### 3. Cảm nhận: Tạo Chiều sâu (Depth & Feel)

**Triết lý:** Thiết kế "phẳng" (flat) thì "nhàm chán" (boring). Phải sử dụng chiều sâu để tạo cảm giác thực tế và thu hút.

- **Tạo Lớp (Layers):** Sử dụng các sắc thái nền để tạo lớp.
  - **Quy tắc chuẩn:** Nền trang (page) chính sử dụng `bg-background` (hoặc `bg-muted`).
  - Các khối nội dung (content) được đặt trên các component có nền `bg-card` (thường là màu trắng) như `Card`, `Popover`, `Dialog`.

- **Đổ bóng (Shadows):**
  - Sử dụng `box-shadow` (ví dụ `shadow-md`, `shadow-lg`) để "nâng" (elevate) các yếu tố quan trọng (Card, Button, Dropdown) lên khỏi nền.
  - Điều này tạo ra độ sâu và tập trung sự chú ý của người dùng vào các yếu tố tương tác.

### 4. Phân cấp: Dẫn dắt Người dùng (Hierarchy)

**Triết lý:** Điều hướng mắt của người dùng một cách có chủ đích. Không phải mọi thứ đều quan trọng như nhau.

- **Nhấn mạnh (Emphasis):** Sử dụng kích thước, độ đậm và màu sắc (`h1`, `h2`, `font-bold`, `text-primary`) cho thông tin quan trọng nhất (Tiêu đề trang, nút CTA chính).
- **Làm mờ (De-emphasis):**
  - **Đây là quy tắc quan trọng nhất:** **Hãy làm cho thông tin phụ trở nên "phụ"**.
  - Sử dụng `text-muted-foreground` (màu xám nhạt) cho các nhãn (label), mô tả (description), và các dữ liệu không quan trọng.
  - Việc này làm cho thông tin chính _tự động_ nổi bật mà không cần phải làm cho nó "to" hoặc "ồn ào" hơn.

---

## Design System & Styling

### Color System

NOVA-UI sử dụng hệ thống màu dựa trên HSL với hỗ trợ dark mode. Tất cả màu sắc được định nghĩa trong `app/index.css` và ánh xạ qua CSS variables.

#### Light Mode Colors

```css
--hu-background: 0, 0%, 100%; /* White background */
--hu-foreground: 0, 0%, 14%; /* Almost black text */
--hu-card: 0, 0%, 99%; /* Off-white card */
--hu-primary: 235, 100%, 60%; /* Blue primary */
--hu-secondary: 0, 0%, 97%; /* Light gray */
--hu-muted: 0, 0%, 97%; /* Muted background */
--hu-muted-foreground: 0, 0%, 56%; /* Muted text */
--hu-accent: 0, 0%, 96%; /* Accent background */
--hu-destructive: 9, 96%, 47%; /* Red for errors */
--hu-border: 0, 0%, 92%; /* Border color */
```

#### Dark Mode Colors

```css
--hu-background: 0, 0%, 7%; /* Near black */
--hu-foreground: 0, 0%, 100%; /* White text */
--hu-card: 0, 0%, 9%; /* Dark card */
--hu-primary: 235, 100%, 60%; /* Same blue */
--hu-secondary: 0, 0%, 15%; /* Dark gray */
--hu-muted: 0, 0%, 15%; /* Dark muted */
--hu-muted-foreground: 0, 0%, 71%; /* Light muted text */
```

#### Usage in Components

```tsx
// ✅ CORRECT: Use semantic color tokens
<div className="bg-background text-foreground">
<Card className="bg-card border-border">
<Button className="bg-primary text-primary-foreground">
<p className="text-muted-foreground">

// ❌ WRONG: Don't use arbitrary colors
<div className="bg-white text-black">
<div style={{ backgroundColor: '#f5f5f5' }}>
```

### Typography System

#### Font Families

```css
--font-sans: Inter, system-ui, sans-serif;
--font-serif: "Source Serif 4", Georgia, serif;
--font-mono: "IBM Plex Mono", monospace;
```

#### Font Usage

- **Sans (Inter)**: Giao diện chính, UI components, body text
- **Serif**: Tiêu đề trang quan trọng, landing pages
- **Mono**: Code snippets, booking codes, IDs

#### Text Sizes (Tailwind classes)

```tsx
text-xs    // 12px - Labels, metadata
text-sm    // 14px - Body text, form fields
text-base  // 16px - Default paragraph
text-lg    // 18px - Section headings
text-xl    // 20px - Page titles
text-2xl   // 24px - Major headings
```

### Shadow System

NOVA-UI có 3 cấp độ shadow tùy chỉnh cho độ sâu UI:

#### Small Shadow (`shadow-sm`)

**Usage**: Cards nhỏ, list items, buttons

```css
box-shadow:
  inset 0 1px 2px #ffffff30,
  /* top highlight */ 0 1px 2px #00000030,
  /* dark edge */ 0 2px 4px #00000015; /* soft shadow */
```

```tsx
<Card className="shadow-sm">...</Card>
```

#### Medium Shadow (`shadow-m`)

**Usage**: Dialogs, popovers, dropdown menus

```css
box-shadow:
  inset 0 1px 2px #ffffff50,
  /* brighter highlight */ 0 2px 4px #00000030,
  /* darker edge */ 0 4px 8px #00000015; /* deeper shadow */
```

```tsx
<Dialog className="shadow-m">...</Dialog>
```

#### Large Shadow (`shadow-l`)

**Usage**: Modals quan trọng, floating panels

```css
box-shadow:
  inset 0 1px 2px #ffffff70,
  /* strongest highlight */ 0 4px 6px #00000030,
  /* strong edge */ 0 6px 10px #00000015; /* deepest shadow */
```

```tsx
<div className="shadow-l">...</div>
```

### Border Radius

```css
--radius: 0.375rem; /* 6px - Default */
--card-radius: 1rem; /* 16px - Card radius */
```

#### Tailwind Classes

```tsx
rounded-none  // 0px
rounded-sm    // 2px
rounded-md    // 6px (default)
rounded-lg    // 8px
rounded-xl    // 12px
rounded-2xl   // 16px (cards)
rounded-full  // 9999px (avatars, badges)
```

### Spacing System

Dựa trên 8pt grid system (0.25rem = 4px).

```tsx
gap - 1; // 4px
gap - 2; // 8px
gap - 3; // 12px
gap - 4; // 16px - Most common
gap - 6; // 24px - Section spacing
gap - 8; // 32px - Page spacing
gap - 12; // 48px - Major sections
```

### Sidebar Theme

```css
/* Light Mode */
--sidebar: oklch(0.985 0 0); /* Almost white */
--sidebar-foreground: oklch(0.145 0 0); /* Dark text */
--sidebar-primary: oklch(0.205 0 0); /* Dark primary */
--sidebar-accent: oklch(0.97 0 0); /* Light accent */
--sidebar-border: oklch(0.922 0 0); /* Light border */

/* Dark Mode */
--sidebar: oklch(0.205 0 0); /* Dark bg */
--sidebar-foreground: oklch(0.985 0 0); /* Light text */
--sidebar-primary: oklch(0.488 0.243 264.376); /* Blue primary */
--sidebar-accent: oklch(0.269 0 0); /* Darker accent */
```

### Chart Colors

Dùng cho biểu đồ và data visualization:

```css
--chart-1: hsl(235, 100%, 60%); /* Primary blue */
--chart-2: hsl(230, 85%, 63%); /* Light blue */
--chart-3: hsl(225, 60%, 55%); /* Medium blue */
--chart-4: hsl(240, 50%, 58%); /* Purple-blue */
--chart-5: hsl(250, 45%, 52%); /* Purple */
```

### Scrollbar Styling

Custom scrollbar cho consistent UX:

```css
/* Webkit browsers (Chrome, Safari, Edge) */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 5px;
}
::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
}
```

### Animation Utilities

#### Shimmer Effect (for buttons)

```css
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
```

**Usage**: Loading states, skeleton screens

```tsx
<div className="relative overflow-hidden">
  <div className="animate-shimmer">...</div>
</div>
```

### Best Practices

1. **Always use design tokens** - Never hardcode colors/spacing

   ```tsx
   // ✅ CORRECT
   <div className="p-4 gap-6 bg-card text-foreground shadow-sm">

   // ❌ WRONG
   <div style={{ padding: '16px', gap: '24px', background: '#fff' }}>
   ```

2. **Layering with shadows**

   ```tsx
   // Page background
   <div className="bg-muted">
     // Content cards (elevated)
     <Card className="bg-card shadow-sm">
       // Interactive elements (more elevated)
       <Popover className="shadow-m">
   ```

3. **Consistent spacing**

   ```tsx
   // Form spacing pattern
   <form className="space-y-6">        // Form sections
     <div className="space-y-4">       // Field groups
       <div className="space-y-2">     // Label + Input
   ```

4. **Typography hierarchy**
   ```tsx
   <h1 className="text-2xl font-bold text-foreground">Main Title</h1>
   <h2 className="text-lg font-semibold text-foreground">Section</h2>
   <p className="text-sm text-muted-foreground">Description</p>
   ```

---

## Shadcn: cách dùng trong NOVA-UI (integrated guidance)

> Mục tiêu: sử dụng shadcn/ui như **open-code design system** — tận dụng Radix behaviors + Tailwind visuals — đồng thời duy trì tính bền vững, governance và tương thích với các patterns NOVA (Zod schemas, container/presentational, no-normalization).

### Tổng quan ngắn

- **Mô hình phân phối:** copy source components vào repo (không import binary runtime).
- **Building blocks:** Radix cung cấp primitives accessible; shadcn đóng gói thin wrappers + Tailwind classes.
- **Triết lý áp dụng:** ownership — code là của dự án; chỉnh sửa thoải mái; nhưng kèm theo trách nhiệm duy trì.

### Quy tắc áp dụng cho NOVA-UI

1. **Chỉ chọn những component cần thiết**
   - Ban đầu copy: `Button`, `Input`, `Dialog`, `Popover`, `Checkbox`, `Radio`, `Select`, `Card`, `Toast`, `Tooltip`.
   - Lý do: cover core interactions; tránh bloat.

2. **Luôn map className vào cn() và tokens của NOVA**
   - Không sửa trực tiếp class base của shadcn. Thay vào đó, wrap component nếu cần variant đặc thù.
   - Ví dụ: `export function NovaButton(props: ButtonProps) { return <Button {...props} className={cn("rounded-md shadow-sm", props.className)} /> }`

3. **Accessibility first**
   - Dùng primitives của Radix giữ sẵn aria/keyboard. Khi custom, preserve aria attributes và keyboard behavior.

4. **Theming và Design Tokens**
   - Dùng CSS variables + Tailwind config để map tokens NOVA → shadcn.
   - Không override token ở nhiều nơi; thay đổi token tập trung trong `tailwind.config.ts` và `src/styles/variables.css`.

5. **Ownership & Update Policy** (bắt buộc)
   - Khi cập nhật shadcn (mẫu mới): tạo PR "shadcn-upgrade" chứa diff component files.
   - Checklist PR: visual-regression test (Chromatic / Percy / jest-image-snapshot), accessibility smoke test, run typecheck.
   - Ghi chú: không auto-merge; review UI owner + frontend lead.

6. **Component API standard** (NOVA conventions)
   - Mỗi component copy vào `src/components/ui/<component>/index.tsx`.
   - Export default presentational + `Nova<Comp>` thin wrapper để enforce project-level variants.
   - All components accept `className` & forwardRef.

7. **Scope of customization**
   - Core components (Button/Input/Select) → keep stable, version in repo.
   - Feature-specific components (BookingCard, RoomSchedulerTile) → built on top of core, owned by feature team.

8. **Integration with existing patterns**
   - Shadcn components used as presentational layer in container/presentational split.
   - Form components wired with React Hook Form + zodResolver. Example:

```tsx
// customer-info.form.tsx (presentational)
export default function CustomerInfoForm({
  form,
}: {
  form: UseFormReturn<CustomerInfo>;
}) {
  return (
    <Form {...form}>
      <FormField name="fullName">
        <FormLabel>Họ và tên</FormLabel>
        <FormControl>
          <Input {...form.register("fullName")} />
        </FormControl>
        <FormDescription>Vui lòng ghi đúng họ tên</FormDescription>
      </FormField>
    </Form>
  );
}
```

---

## Architecture Patterns

### 1\. Schema-Driven Development

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
  ]), // ...
});

// Export as factory function
export const BookingSchema = {
  BookingItemSchema,
  BookingListResponseSchema,
};

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

### 2\. Container/Presentational Split

Components **must** separate UI from logic:

```
/features/create-booking/
  ├── index.tsx                          # Orchestrator component
  ├── components/                         # Presentational (pure UI)
  │   ├── customer-info-form.tsx
  │   └── booking-confirmation.tsx
  ├── container/                          # Logic hooks (.hooks.ts)
  │   ├── create-booking.hooks.ts         # Main orchestration
  │   └── customer-info-form.hooks.ts     # Component-specific logic
  └── fragments/                          # Small reusable UI pieces
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

### 3\. Multi-Step Form Pattern

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

### 4\. API Service Layer

**Consistent structure** for all services (`/app/services/api/<domain>/`):

```typescript
// index.ts - Service functions
import http from "~/lib/http";
import { BookingSchema } from "~/services/schema/booking.schema";
import type { BookingListResponseDto } from "./dto";

const { BookingListResponseSchema } = BookingSchema;

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
import { BookingSchema } from "~/services/schema/booking.schema";

const { BookingListResponseSchema } = BookingSchema();
export type BookingListResponseDto = z.infer<typeof BookingListResponseSchema>;

// url.ts - Endpoint paths
export const Booking = {
  list: "/bookings",
  detail: (code: string) => `/bookings/${code}`,
  listByWeek: "/bookings/by-week",
};
```

### 5\. TanStack Query Hooks

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

### 6\. NO Data Normalization

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

- **API date parameters**: `yyyy-MM-dd` (e.g., `"2025-10-14"`)
- **Display dates**: Use `date-fns` `format()` with Vietnamese locale

<!-- end list -->

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
npm run dev          # Start dev server (http://localhost:5173)
npm run host         # Start with network access
npm run typecheck    # Validate TypeScript (includes route typegen)
npm run build        # Production build
```

**Route typing**: React Router 7 auto-generates types. Import as:

```typescript
import type { Route } from "./+types/login";

export const clientLoader = async ({ request, params }: Route.LoaderArgs) => {};
export default function Component({ loaderData }: Route.ComponentProps) {}
```

## Common Utilities

```typescript
// ~/lib/utils.ts
cn(...classes); // Merge Tailwind classes
formatMoney(amount); // { usdFormatted, vndFormatted }
daysBetweenFloor(date1, date2); // Days difference

// ~/lib/constants.tsx
NAV_ITEMS; // Sidebar navigation config
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
