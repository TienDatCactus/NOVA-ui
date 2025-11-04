# NOVA-UI Project Index

**NOVA** stands for **Network Operation for Vacation Accommodation** - A React-based hotel management system.

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Core Architecture](#core-architecture)
5. [API Services](#api-services)
6. [Routes & Features](#routes--features)
7. [Components](#components)
8. [State Management](#state-management)
9. [Utilities & Helpers](#utilities--helpers)
10. [Configuration Files](#configuration-files)

---

## Project Overview

NOVA-UI is a comprehensive hotel management system built with modern React patterns. It follows a schema-driven development approach with strict separation of concerns between UI, business logic, and data layers.

### Key Principles
- **Schema-Driven Development**: All data structures flow from Zod schemas
- **Container/Presentational Split**: Separation of UI from business logic
- **No Data Normalization**: API response shapes preserved as-is
- **Design System**: Shadcn UI + Tailwind CSS 4 with strict design tokens
- **Vietnamese UI**: All user-facing text in Vietnamese

---

## Technology Stack

### Core Framework
- **React 19** - UI library
- **React Router 7** - File-based routing with SSR support
- **TypeScript 5.8** - Type safety

### State Management
- **Zustand** - Client state (with persistence)
- **TanStack Query v5** - Server state management

### Forms & Validation
- **React Hook Form** - Form state management
- **Zod v4** - Schema validation
- **@hookform/resolvers** - Zod resolver integration

### UI Framework
- **Shadcn UI** - Component library (Radix primitives + Tailwind)
- **Tailwind CSS 4** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Framer Motion** - Animations

### API & HTTP
- **Axios** - HTTP client with interceptors
- **Custom http.ts** - Centralized API client with auth/toast handling

### Utilities
- **date-fns v4** - Date manipulation
- **clsx + tailwind-merge** - Class name utilities
- **Sonner** - Toast notifications

### Development Tools
- **Vite 6** - Build tool
- **@react-router/dev** - React Router dev server
- **TypeScript** - Type checking

---

## Project Structure

```
app/
├── assets/              # Static assets (fonts, images)
├── components/          # Reusable UI components
│   ├── layouts/        # Layout components (header, sidebar, sections)
│   └── ui/             # Shadcn UI components + custom UI
├── context/             # React contexts (sidebar, etc.)
├── features/            # Feature-specific components
│   ├── loading/        # Global loading component
│   └── order-dialog/   # Order dialog feature
├── hooks/               # Shared React hooks
├── layouts/             # Route layouts (auth, dashboard)
├── lib/                 # Core utilities and configurations
│   ├── constants.tsx   # App constants (nav items, configs)
│   ├── fe-url.ts       # Frontend route URLs
│   ├── http.ts         # Axios instance with interceptors
│   ├── storage.ts      # LocalStorage utilities
│   └── utils.ts        # Utility functions
├── routes/              # Feature routes (file-based routing)
│   ├── auth/           # Authentication routes
│   ├── customers/      # Customer management
│   ├── invoices/       # Invoice management
│   ├── menu/           # Menu management
│   ├── pos-orders/     # Point of Sale orders
│   ├── reservation/    # Booking/reservation management
│   ├── rooms/          # Room management
│   ├── services/       # Service management
│   └── units/          # Unit management
├── services/            # API services layer
│   ├── api/            # API service functions organized by domain
│   ├── schema/         # Shared Zod schemas
│   ├── types/          # TypeScript types (inferred from schemas)
│   └── url.ts          # API endpoint URLs
├── store/               # Zustand stores
│   ├── auth.store.ts   # Authentication state
│   └── create-booking.store.ts  # Multi-step booking form state
├── root.tsx             # Root component with providers
└── routes.ts            # Route configuration

public/                  # Public assets
```

---

## Core Architecture

### 1. Schema-Driven Development

All data structures originate from Zod schemas in `/app/services/schema/` and `/app/services/api/<domain>/<domain>.schema.ts`.

**Pattern:**
```typescript
// 1. Define schema
const BookingSchema = z.object({ ... });

// 2. Export types (z.infer)
type Booking = z.infer<typeof BookingSchema>;

// 3. Use in API services (validation)
const data = BookingSchema.parse(response.data);

// 4. Use in forms
const form = useForm({
  resolver: zodResolver(BookingSchema)
});
```

### 2. Container/Presentational Split

**Structure:**
```
/routes/<feature>/
  ├── index.tsx              # Main route component
  ├── components/            # Presentational (pure UI)
  ├── container/             # Logic hooks (.hooks.ts)
  └── fragments/             # Small reusable UI pieces
```

**Pattern:**
- Container hooks manage business logic, API calls, form state
- Presentational components receive props and render UI
- Fragments are small, reusable UI pieces

### 3. API Service Layer

**Structure for each domain:**
```
/app/services/api/<domain>/
  ├── index.ts       # Service functions
  ├── dto.ts         # Type exports (z.infer only)
  └── <domain>.schema.ts  # Zod schemas
```

**Pattern:**
```typescript
// index.ts - Service functions
async function getBookingList(params): Promise<BookingListResponseDto> {
  const resp = await http.get(Booking.list, { params });
  return BookingListResponseSchema.parse(resp.data);
}

// dto.ts - Type exports
type BookingListResponseDto = z.infer<typeof BookingListResponseSchema>;
```

### 4. TanStack Query Hooks

**Location:** `/routes/<feature>/container/<feature>.hooks.ts`

**Pattern:**
```typescript
function useBookings(params?: BookingListParams) {
  return useQuery({
    queryKey: ["bookings", params],
    queryFn: async () => await BookingService.getBookingList(params || {}),
    staleTime: 5 * 60 * 1000,
  });
}
```

---

## API Services

### Service Domains

All services follow the same structure: `index.ts` (functions), `dto.ts` (types), `<domain>.schema.ts` (schemas).

#### Authentication (`/app/services/api/auth/`)
- `login()` - User authentication
- `logout()` - Clear storage
- `forgotPassword()` - Password reset request
- `resetPassword()` - Password reset
- `refresh()` - Token refresh
- `revoke()` - Token revocation

#### Booking (`/app/services/api/booking/`)
- `getBookingList()` - List bookings with filters
- `getBookingListByWeek()` - Weekly booking view
- `getBookingDetail()` - Booking details by ID/code
- `staffCreateBooking()` - Create new booking
- `staffUpdateBookingDetail()` - Update booking
- `staffChangeRoom()` - Change booking room
- `staffCancelBooking()` - Cancel booking
- `staffBookingPricePreview()` - Price calculation preview
- `getBookingOTA()` - OTA information

#### Rooms (`/app/services/api/rooms/`)
- `list()` - List all rooms
- `detail(id)` - Room details
- `create()` - Create room
- `update(id)` - Update room
- `delete(id)` - Delete room
- `updateStatus()` - Update room status
- `getAvailableRoomsInternal()` - Available rooms with details
- `bookingHistory(id)` - Room booking history

#### Room Types (`/app/services/api/room-types/`)
- `list()` - List room types
- `detail(id)` - Room type details
- `create()` - Create room type
- `update(id)` - Update room type
- `delete(id)` - Delete room type

#### Services (`/app/services/api/services/`)
- `list()` - List services
- `detail(id)` - Service details
- `create()` - Create service
- `update(id)` - Update service
- `delete(id)` - Delete service
- `byServiceType(serviceTypeId)` - Services by type

#### Service Types (`/app/services/api/service-types/`)
- `list()` - List service types
- `detail(id)` - Service type details
- `create()` - Create service type
- `update(id)` - Update service type
- `delete(id)` - Delete service type

#### Menu (`/app/services/api/menu/`)
- `list()` - List menu items
- `detail(id)` - Menu item details
- `create()` - Create menu item
- `update(id)` - Update menu item
- `delete(id)` - Delete menu item
- `listByCategory(categoryId)` - Menu items by category

#### Menu Categories (`/app/services/api/menu-category/`)
- `list()` - List categories
- `detail(id)` - Category details
- `create()` - Create category
- `update(id)` - Update category
- `delete(id)` - Delete category

#### Units (`/app/services/api/units/`)
- `list()` - List units
- `detail(id)` - Unit details
- `create()` - Create unit
- `update(id)` - Update unit
- `delete(id)` - Delete unit

#### Customers (`/app/services/api/customer/`)
- `list()` - List customers
- `detail(id)` - Customer details
- `create()` - Create customer
- `update(id)` - Update customer
- `roles()` - Get available roles
- `lock(id)` - Lock user
- `unlock(id)` - Unlock user
- `assignRoles(id)` - Assign roles
- `removeRoles(id)` - Remove roles

#### Orders (POS) (`/app/services/api/order/`)
- `createPOS()` - Create POS order
- `addItemsToPOS(id)` - Add items to order
- `deleteItemFromPOS(orderId, itemId)` - Remove item
- `cancelPOSOrder(id)` - Cancel order
- `completePOSOrder(id)` - Complete order
- `detailPOS(id)` - Order details
- `listPOSbyInvoice(invoiceId)` - Orders by invoice
- `printPOSorder(id)` - Print order data

#### Invoices (`/app/services/api/invoices/`)
- `create()` - Create invoice
- `addItems(id)` - Add items to invoice
- `addCustomItems(id)` - Add custom items
- `markPaid(id)` - Mark as paid
- `void(id)` - Void invoice
- `detail(id)` - Invoice details
- `listByBooking(bookingRoomId)` - Invoices by booking

#### Reports (`/app/services/api/reports/`)
- `reservationReports(fromDate, toDate)` - Daily booking dashboard

### API URL Configuration

**File:** `/app/services/url.ts`

All API endpoints are centralized here. Organized by domain (Auth, Booking, Rooms, etc.).

---

## Routes & Features

### Route Configuration

**File:** `/app/routes.ts`

Uses React Router 7 file-based routing with layout nesting.

### Route Structure

#### Authentication Routes (`/auth/*`)
- **Layout:** `layouts/auth.layout.tsx`
- **Routes:**
  - `/auth/login` - Login page
  - `/auth/forgot-password` - Password reset request
  - `/auth/reset-password` - Password reset

#### Dashboard Routes (`/dashboard/*`)
- **Layout:** `layouts/dashboard.layout.tsx`
- **Features:**

##### Reservation (`/dashboard/reservation/*`)
- **Index:** `/dashboard/reservation` - Reports dashboard
- **Bookings:**
  - `/dashboard/reservation/bookings/grid` - Grid/scheduler view
  - `/dashboard/reservation/bookings/list` - List view
  - `/dashboard/reservation/bookings/detail/:bookingId` - Booking details
- **New Booking:** `/dashboard/reservation/new-booking` - Multi-step booking form
- **Invoices:** `/dashboard/reservation/invoices` - Reservation invoices

##### Rooms (`/dashboard/rooms/*`)
- **Index:** `/dashboard/rooms` - Rooms list
- **Types:** `/dashboard/rooms/types` - Room types management
- **Prices:** `/dashboard/rooms/prices` - Room pricing

##### Services (`/dashboard/services/*`)
- **Index:** `/dashboard/services` - Services list
- **Types:** `/dashboard/services/types` - Service types
- **Menu:** `/dashboard/services/menu` - Menu items
- **Menu Categories:** `/dashboard/services/menu-categories` - Menu categories

##### POS Orders (`/dashboard/pos-orders/*`)
- **Index:** `/dashboard/pos-orders` - POS orders list

##### Other Dashboard Routes
- `/dashboard/units` - Units management
- `/dashboard/invoices` - General invoices
- `/dashboard/customers` - Customer management

### Feature Organization

Each route follows this structure:

```
/routes/<feature>/
├── <feature>.tsx              # Main route component
├── components/                # Presentational components
│   ├── <feature>-list/        # List components
│   │   ├── columns.tsx        # Table column definitions
│   │   ├── data-table.tsx    # DataTable wrapper
│   │   └── index.tsx          # List view
│   └── <action>.dialog.tsx    # Dialog components
├── container/                 # Business logic hooks
│   ├── <feature>-query.hooks.ts    # TanStack Query hooks
│   ├── <feature>-mutation.hooks.ts # Mutation hooks
│   └── <feature>-filter.hooks.ts   # Filter logic
├── fragments/                 # Reusable UI fragments
│   ├── actions.cell.tsx       # Action buttons cell
│   ├── command-bar.tsx       # Command/search bar
│   └── detail.row.tsx        # Detail view row
└── layouts/                   # Feature-specific layouts
    └── <feature>-view.layout.tsx
```

---

## Components

### Layout Components (`/app/components/layouts/`)

#### Headers
- `headers/header.dashboard.tsx` - Dashboard header with navigation

#### Sidebar
- `side-bar/dashboard/` - Dashboard sidebar with navigation items
  - `side-bar.dashboard.tsx` - Main sidebar component
  - Additional sidebar components

#### Sections
- `sections/index.tsx` - Section layout wrapper

### UI Components (`/app/components/ui/`)

All Shadcn UI components plus custom components:

#### Form Components
- `button.tsx` - Button component
- `input.tsx` - Input field
- `textarea.tsx` - Textarea
- `select.tsx` - Select dropdown
- `checkbox.tsx` - Checkbox
- `radio-group.tsx` - Radio group
- `switch.tsx` - Toggle switch
- `form.tsx` - Form wrapper with React Hook Form
- `label.tsx` - Form label
- `date-picker.tsx` - Date picker
- `calendar.tsx` - Calendar component
- `input-otp.tsx` - OTP input

#### Display Components
- `card.tsx` - Card container
- `table.tsx` - Data table
- `badge.tsx` - Badge/tag
- `avatar.tsx` - Avatar
- `image.tsx` - Image component
- `skeleton.tsx` - Loading skeleton
- `empty.tsx` - Empty state
- `progress.tsx` - Progress bar
- `chart.tsx` - Chart component

#### Overlay Components
- `dialog.tsx` - Modal dialog
- `sheet.tsx` - Side sheet
- `drawer.tsx` - Drawer
- `popover.tsx` - Popover
- `tooltip.tsx` - Tooltip
- `alert-dialog.tsx` - Alert dialog
- `dropdown-menu.tsx` - Dropdown menu

#### Navigation Components
- `tabs.tsx` - Tabs
- `navigation-menu.tsx` - Navigation menu
- `sidebar.tsx` - Sidebar component
- `breadcrumb.tsx` - Breadcrumb navigation

#### Feedback Components
- `alert.tsx` - Alert message
- `alert-changes.tsx` - Change alert
- `sonner.tsx` - Toast notifications (Sonner)

#### Other Components
- `command.tsx` - Command palette
- `collapsible.tsx` - Collapsible section
- `separator.tsx` - Divider
- `divider.tsx` - Divider
- `scroll-area.tsx` - Scrollable area
- `slider.tsx` - Range slider
- `stepper.tsx` - Multi-step indicator
- `carousel.tsx` - Carousel
- `kbd.tsx` - Keyboard shortcut display

#### Custom Shadcn Extensions (`/app/components/ui/shadcn-io/`)
- `button-group/` - Button group
- `dropzone/` - File dropzone
- `image-zoom/` - Image zoom
- `minimal-tiptap/` - Rich text editor
- `spinner/` - Loading spinner

### Feature Components

#### Order Dialog (`/app/features/order-dialog/`)
- Dialog for managing orders with menu/service selection
- Components: menu-list, order-detail, service-list
- Fragments: filter-menu.bar, filter-service.bar, menu.card, service.card, order-item-wrapper, order-item.card

#### Loading (`/app/features/loading/`)
- Global loading indicator component

---

## State Management

### Zustand Stores (`/app/store/`)

#### Authentication Store (`auth.store.ts`)
```typescript
interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}
```
- Persisted to localStorage
- Stores current user information

#### Create Booking Store (`create-booking.store.ts`)
```typescript
interface CreateBookingState {
  data: Partial<CreateBookingInput>;
  currentStep: number;
  setData: (data: Partial<CreateBookingInput>) => void;
  setStep: (step: number) => void;
  reset: () => void;
}
```
- Persisted to localStorage (with serviceOrder excluded)
- Manages multi-step booking form state

### TanStack Query

Used for all server state management. Query hooks located in `/routes/<feature>/container/`.

**Pattern:**
- Query hooks: `use<Feature>.hooks.ts`
- Mutation hooks: `use<Feature>Mutation.hooks.ts`
- Filter hooks: `use<Feature>Filter.hooks.ts`

### React Context

#### Sidebar Context (`/app/context/sidebar.context.tsx`)
- Manages sidebar mode (compact/expanded)
- Provides toggle functionality

---

## Utilities & Helpers

### Core Utilities (`/app/lib/utils.ts`)

**Styling:**
- `cn(...inputs)` - Merge Tailwind classes (clsx + tailwind-merge)

**Date Utilities:**
- `parseDateYMD(s)` - Parse YYYY-MM-DD string to Date
- `startOfLocalDay(date)` - Get start of day
- `addDays(d, n)` - Add days to date
- `daysBetweenFloor(a, b)` - Calculate days between dates
- `toYMD(d)` - Convert date to YYYY-MM-DD string
- `useCalculateNights({ checkinDate, checkoutDate })` - Calculate nights

**Money Formatting:**
- `formatMoney(amount)` - Returns `{ usdFormatted, vndFormatted }`

**File Utilities:**
- `formatFileSize(bytes)` - Format file size (B, KB, MB)

**HTML Utilities:**
- `stripHtml(html)` - Strip HTML tags from string

**Form Utilities:**
- `onError(errors)` - Form validation error handler
- `handleLimitInput(e)` - Limit numeric input range

**Routing:**
- `withPrefix(prefix, routes)` - Add prefix to route object

### Constants (`/app/lib/constants.tsx`)

**Navigation:**
- `NAV_ITEMS` - Main navigation items
- `DASHBOARD_ITEMS_RECEPTIONIST` - Dashboard menu items
- `SUB_DASHBOARD_ITEMS` - Secondary dashboard items
- `TOP_NAV_CONFIG` - Top navigation config by route
  - `RESERVATION_TOP_NAV_ITEMS`
  - `ROOMS_TOP_NAV_ITEMS`
  - `SERVICES_TOP_NAV_ITEMS`
  - `POS_ORDERS_TOP_NAV_ITEMS`
  - `INVOICES_TOP_NAV_ITEMS`

**Service Categories:**
- `SERVICE_CATEGORIES` - Service type categories

**Room Scheduler Constants:**
- `ROOM_COUNT` - Number of rooms
- `DAYS_COUNT` - Days in view
- `SUBS_PER_DAY` - Sub-columns per day
- `headerRows` - Header row count
- `rowHeight` - Row height in pixels
- `firstColWidth` - First column width
- `totalSubCols` - Total sub-columns

**Time Constants:**
- `CHECK_IN_TIME` - Default check-in time
- `CHECK_OUT_TIME` - Default check-out time

### Frontend URLs (`/app/lib/fe-url.ts`)

- `AUTH` - Authentication routes
- `DASHBOARD` - Dashboard routes

### Storage (`/app/lib/storage.ts`)

**Storage Keys:**
- `STORAGE.TOKEN` - Access token
- `STORAGE.REFRESH_TOKEN` - Refresh token

**Functions:**
- `getStorage(name)` - Get from localStorage
- `setStorage(name, value)` - Set to localStorage
- `deleteStorage(name)` - Delete from localStorage
- `clearStorage()` - Clear all storage

### HTTP Client (`/app/lib/http.ts`)

**Features:**
- Axios instance with base URL from `VITE_API_URL`
- Request interceptor: Adds Authorization header from storage
- Response interceptor:
  - Auto-toast success/error messages
  - Token refresh on 401 errors
  - Queue management for concurrent requests
  - Auto-logout on refresh failure

---

## Configuration Files

### Root Configuration

#### `package.json`
- Project name: `trvlr-ui`
- Scripts:
  - `dev` - Start dev server
  - `host` - Start with network access
  - `build` - Production build
  - `start` - Serve production build
  - `typecheck` - TypeScript check + route typegen
  - `test` - Run tests (Vitest)

#### `tsconfig.json`
- Target: ES2022
- Module: ES2022
- JSX: react-jsx
- Path alias: `~/*` → `./app/*`
- Strict mode enabled

#### `vite.config.ts`
- Plugins: Tailwind CSS, React Router, TypeScript paths
- Build tool configuration

#### `react-router.config.ts`
- SSR enabled by default
- Prerender routes: `/auth/login`, `/services`

#### `components.json`
- Shadcn UI configuration
- Style: "new-york"
- Tailwind CSS variables enabled
- Component aliases configured

### Environment Variables

**Required:**
- `VITE_API_URL` - Backend API base URL

### Type Generation

React Router 7 auto-generates route types. Import as:
```typescript
import type { Route } from "./+types/<route-name>";
```

---

## Design System

### UI/UX Philosophy

Based on 4 pillars (from `.github/copilot-instructions.md`):

1. **Foundation**: Use system values (Tailwind spacing, typography, colors)
2. **Layout**: Simple & grouped (proximity, consistency)
3. **Depth**: Layers and shadows for visual hierarchy
4. **Hierarchy**: Emphasis and de-emphasis (use `text-muted-foreground` for secondary info)

### Design Tokens

- **Colors**: `primary`, `secondary`, `destructive`, `muted`, `card`, `popover`, `background`
- **Spacing**: Tailwind spacing scale (8pt grid)
- **Typography**: Shadcn typography system

### Component Customization

- Shadcn components copied into repo (not runtime imports)
- Custom variants via `Nova<Component>` wrappers
- All components accept `className` and forward refs

---

## Development Workflow

### Commands

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run host         # Start with network access
npm run typecheck    # Validate TypeScript + route typegen
npm run build        # Production build
npm run start        # Serve production build
npm run test         # Run tests
```

### File Naming Conventions

- **Components**: PascalCase (`CustomerInfoForm.tsx`)
- **Hooks**: camelCase with `.hooks.ts` suffix (`useBookings.hooks.ts`)
- **Utils**: camelCase (`.ts`)
- **Constants**: UPPER_SNAKE_CASE in `constants.tsx`

### Code Organization

- **Container/Presentational**: Logic in hooks, UI in components
- **Schema-First**: Define Zod schemas before types
- **No Normalization**: Preserve API response shapes
- **Type Safety**: All types from `z.infer<>`

---

## Key Patterns

### Multi-Step Form Pattern

Three-layer persistence:
1. Zustand store (persisted)
2. React Hook Form (ephemeral, validation)
3. Step navigation in component

### Error Handling

- API errors auto-toast via `http.ts` interceptor
- Manual error handling: catch + log (already toasted)

### Date Handling

- **API format**: `yyyy-MM-dd` or `yyyy/MM/dd`
- **Display**: `date-fns` `format()` with Vietnamese locale
- Use `toYMD()` utility for API params

### Form Validation

- React Hook Form + Zod + `zodResolver`
- Error messages auto-displayed via Shadcn Form components
- Custom error handler: `onError()` utility

---

## Additional Notes

- **Language**: All UI text in Vietnamese
- **Accessibility**: Radix primitives provide ARIA/keyboard support
- **Performance**: TanStack Query caching (5min staleTime)
- **Persistence**: Zustand stores persist to localStorage
- **SSR**: Enabled by default, can disable in `react-router.config.ts`

---

## Project Status

This index reflects the current state of the NOVA-UI project. For detailed implementation patterns, refer to `.github/copilot-instructions.md`.

Last Updated: Generated from project structure analysis

