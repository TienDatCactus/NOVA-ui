# NOVA-UI Project Guide

## Architecture Overview

NOVA-UI is a React-based hotel management system built with React Router 7, Zustand for state management, and Shadcn UI components. The name NOVA stands for "Network Operation for Vacation Accommodation."

### Core Technology Stack

- **Framework**: React 19 with React Router 7
- **State Management**: Zustand with persistence middleware
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Shadcn UI (Radix UI + Tailwind CSS)
- **Data Fetching**: TanStack Query (React Query)
- **Styling**: Tailwind CSS 4

## Project Structure

### Key Directories

- `/app`: Main application code
  - `/components`: Reusable UI components
    - `/layouts`: Page layout components
    - `/ui`: Shadcn UI components
  - `/features`: Feature-based modules (booking, scheduler, etc.)
  - `/routes`: Route components organized by feature
  - `/services`: API services, schemas, and types
  - `/store`: Zustand stores
  - `/lib`: Utility functions and constants

### Component Pattern

Components follow a container/presentational pattern:

- Presentational components (`components/` or feature root) handle UI rendering
- Container components (`container/` directories) handle logic and state
- Custom hooks (with `.hooks.ts` suffix) encapsulate component logic

Example:

```tsx
// Feature component usage
<CustomerInfoForm form={createBookingForm} />;

// Custom hook in container/
function useCreateBooking({ close }: { close?: () => void }) {
  // Logic and state management
}
```

### Form Handling Pattern

Forms use React Hook Form with Zod validation:

1. Define schemas in `/services/schema/`
2. Create custom hooks that handle form validation
3. Implement multi-step forms with Zustand for persistent state

Example workflow in `create-booking`:

```tsx
// Form creation and validation
const form = useForm<z.infer<typeof BookingSchema>>({
  resolver: zodResolver(BookingSchema),
  defaultValues: formData,
});

// Form submission logic
const handleNext = async () => {
  const currentFormData = form.getValues();
  // Validation logic using Zod schemas
};
```

## Data Flow

1. **API Services**: Use `http.ts` axios instance with interceptors
2. **State Management**: Zustand stores in `/store` directory with persistence
3. **Form Data**: Validated with Zod schemas in `/services/schema`

## Common Patterns

### API Requests

```typescript
// Use the http instance for API calls
import http from "~/lib/http";
const response = await http.get("/endpoint");
```

### Store Usage

```typescript
// Access and update Zustand store
const { currentStep, nextStep, updateFormData } = useCreateBookingStore();
```

### Multi-step Forms

The project uses a common pattern for multi-step forms:

1. Define step components
2. Use Zustand for tracking current step
3. Validate each step with specific schemas
4. Persist form data between steps

## Development Workflow

1. Run `npm run dev` to start the development server
2. Run `npm run typecheck` to check TypeScript types
3. Use TanStack Query DevTools for debugging API requests

## UI Component Conventions

1. Use Shadcn UI components from `~/components/ui`
2. Follow the variant pattern for component styling
3. Use Tailwind utility classes and `cn()` for conditional classes

## i18n Conventions

Most UI text is in Vietnamese. When adding new UI components, follow existing language patterns.
