import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
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

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "./components/ui/sonner";
import { SpinnerLoader } from "./features/loading";
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
        {children}
        <Toaster position="top-right" />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
const queryClient = new QueryClient();

export default function App() {
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
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

export function ErrorBoundary({ error }: RouteErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404 Not Found" : "Error";
    details =
      error.status === 404
        ? "The page you're looking for doesn't exist."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="flex min-h-screen overflow-auto w-full items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5 text-2xl text-destructive">
            <AlertTriangle className="h-7 w-7" />
            <span>{message}</span>
          </CardTitle>
          <CardDescription className="pt-2 text-base">
            {details}
          </CardDescription>
        </CardHeader>

        {stack && (
          <CardContent className="space-y-4">
            <h3 className="font-semibold text-muted-foreground">
              Stack Trace (Development Only)
            </h3>
            <pre className="w-full overflow-x-auto rounded-md bg-secondary p-4 text-sm text-secondary-foreground">
              <code className="line-clamp-6">{stack}</code>
            </pre>
          </CardContent>
        )}

        <CardFooter>
          <Button asChild className="w-full">
            <a href="/">Go Back Home</a>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
