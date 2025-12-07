import { useAuthStore } from "~/store/auth.store";
import {
  requireAuth,
  requireRole,
  requireModuleAccess,
  requirePermission,
  guardRoute,
} from "./bouncer";
import { UserRole, RouteModule, Permission } from "./roles";

/**
 * Get current user from auth store (for clientLoader)
 * NOTE: This should be called inside loader, not at module level
 */
export function getCurrentUser() {
  // Use getState() to avoid React context issues in loaders
  return useAuthStore.getState().user;
}

/**
 * Auth loader utilities for React Router clientLoader
 */
export const AuthLoader = {
  /**
   * Require user to be authenticated
   * Usage: export const clientLoader = () => AuthLoader.requireAuth();
   */
  requireAuth: () => {
    const user = getCurrentUser();
    return requireAuth(user);
  },

  /**
   * Require specific role(s)
   * Usage: export const clientLoader = () => AuthLoader.requireRole(UserRole.Admin);
   */
  requireRole: (roles: UserRole | UserRole[]) => {
    const user = getCurrentUser();
    return requireRole(user, roles);
  },

  /**
   * Require module access
   * Usage: export const clientLoader = () => AuthLoader.requireModule(RouteModule.Bookings);
   */
  requireModule: (module: RouteModule) => {
    const user = getCurrentUser();
    return requireModuleAccess(user, module);
  },

  /**
   * Require specific permission
   * Usage: export const clientLoader = () => AuthLoader.requirePermission(RouteModule.Invoices, Permission.Create);
   */
  requirePermission: (module: RouteModule, permission: Permission) => {
    const user = getCurrentUser();
    return requirePermission(user, module, permission);
  },

  /**
   * Combined guard (recommended for most routes)
   * Usage: export const clientLoader = () => AuthLoader.guard(RouteModule.Bookings, Permission.Read);
   */
  guard: (module: RouteModule, permission?: Permission) => {
    const user = getCurrentUser();
    return guardRoute(user, module, permission);
  },

  /**
   * Get current user (no redirect)
   * Usage: export const clientLoader = () => { const user = AuthLoader.getUser(); ... }
   */
  getUser: () => {
    return getCurrentUser();
  },
};

// Re-export for convenience
export { UserRole, RouteModule, Permission };
export * from "./bouncer";
