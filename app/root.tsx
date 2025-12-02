import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigate,
  useNavigation,
  useRouteError,
} from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { Route } from "./+types/root";
import "./index.css";

import { Toaster } from "./components/ui/sonner";
import { SpinnerLoader } from "./features/loading";
import { MapProvider } from "./routes/customer/map/context/map-context";
import "~/lib/i18n"; // Initialize i18n
import "~/lib/i18n/types"; // TypeScript types
export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <MapProvider>{children}</MapProvider>
        <Toaster
          position="top-right"
          richColors // <--- This does the heavy lifting
          closeButton // Adds a small X to close
          theme="system"
          toastOptions={{
            className: "font-sans",
            style: {
              borderRadius: "12px",
            },
          }}
        />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

export default function App() {
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  return (
    <QueryClientProvider client={queryClient}>
      {isNavigating && (
        <SpinnerLoader fullScreen size="lg" text="Đang tải..." />
      )}

      <Outlet />
    </QueryClientProvider>
  );
}

type RouteErrorBoundaryProps = {
  error: any;
};

export function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  let title = "Error - Unknown";
  let message = "An unexpected error has occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    title = error.status === 404 ? "Error - 404" : `Error - ${error.status}`;
    message =
      error.status === 404
        ? "The page you are looking for does not exist."
        : error.statusText || message;
  } else if (error instanceof Error) {
    message = error.message;
    stack = error.stack;
  }

  return (
    <main className="min-h-screen w-full bg-[#0000AA] text-white font-mono flex flex-col items-center justify-center p-4 selection:bg-gray-300 selection:text-[#0000AA]">
      {/* Title Box: Nền xám, chữ xanh */}
      <div className="bg-[#A8A8A8] text-[#0000AA] px-6 py-1 mb-12 font-bold text-xl shadow-sm">
        {title}
      </div>

      {/* Content Container */}
      <div className="max-w-2xl w-full space-y-8 text-lg">
        <p className="mb-6">{message}, to continue:</p>

        <ul className="list-none space-y-2 pl-0">
          <li className="flex items-start gap-2">
            <span>*</span>
            <Link
              to="/"
              className="hover:underline hover:bg-[#0000AA] focus:bg-gray-300 focus:text-[#0000AA] outline-none"
            >
              Return to our homepage.
            </Link>
          </li>
          <li className="flex items-start gap-2">
            <span>*</span>
            <a
              href="mailto:ecopalm@example.com"
              className="hover:underline hover:bg-[#0000AA] focus:bg-gray-300 focus:text-[#0000AA] outline-none"
            >
              Send us an e-mail about this error and try later.
            </a>
          </li>
        </ul>

        {/* Development Stack Trace (Chỉ hiện khi có stack và ở môi trường Dev) */}
        {stack && import.meta.env.DEV && (
          <div className="mt-8 pt-8 border-t border-white/30 text-sm opacity-80">
            <p className="mb-2 font-bold uppercase">
              Technical Information (Dev Only):
            </p>
            <pre className="whitespace-pre-wrap break-words font-mono text-xs">
              {stack}
            </pre>
          </div>
        )}
      </div>

      {/* Footer Links */}
      <div className="mt-24 flex items-center gap-4 text-center text-lg">
        <Button
          variant="link"
          onClick={() => navigate(-1)}
          className="hover:underline text-white"
        >
          revert
        </Button>
        <span>|</span>
        <Button variant="link" className="hover:underline text-white">
          eco palm
        </Button>
      </div>
    </main>
  );
}
