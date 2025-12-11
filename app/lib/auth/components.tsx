import type { ReactNode } from "react";
import { useAuthStore } from "~/store/auth.store";
import { Can, canAccessModule, hasAnyRole, hasRole } from "~/lib/auth/bouncer";
import { UserRole, RouteModule, Permission } from "~/lib/auth/roles";

/**
 * Component wrapper: Only render children if user has required role(s)
 */
interface ProtectedByRoleProps {
  roles: UserRole | UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedByRole({
  roles,
  children,
  fallback = null,
}: ProtectedByRoleProps) {
  const user = useAuthStore((s) => s.user);
  const requiredRoles = Array.isArray(roles) ? roles : [roles];

  if (!hasAnyRole(user, requiredRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Component wrapper: Only render children if user can access module
 */
interface ProtectedByModuleProps {
  module: RouteModule;
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedByModule({
  module,
  children,
  fallback = null,
}: ProtectedByModuleProps) {
  const user = useAuthStore((s) => s.user);

  if (!canAccessModule(user, module)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Component wrapper: Only render children if user has specific permission
 */
interface ProtectedByPermissionProps {
  module: RouteModule;
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedByPermission({
  module,
  permission,
  children,
  fallback = null,
}: ProtectedByPermissionProps) {
  const user = useAuthStore((s) => s.user);

  const hasPermissionCheck = Can[permission](user, module);

  if (!hasPermissionCheck) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * HOC: Wrap component with role protection
 */
export function withRoleProtection<P extends object>(
  Component: React.ComponentType<P>,
  roles: UserRole | UserRole[],
  fallback?: ReactNode
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedByRole roles={roles} fallback={fallback}>
        <Component {...props} />
      </ProtectedByRole>
    );
  };
}

/**
 * Hook: Get current user with role checks
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);

  return {
    user,
    isAuthenticated: !!user,
    hasRole: (role: UserRole) => hasRole(user, role),
    hasAnyRole: (roles: UserRole[]) => hasAnyRole(user, roles),
    canAccess: (module: RouteModule) => canAccessModule(user, module),
    can: {
      read: (module: RouteModule) => Can.read(user, module),
      create: (module: RouteModule) => Can.create(user, module),
      update: (module: RouteModule) => Can.update(user, module),
      delete: (module: RouteModule) => Can.delete(user, module),
      execute: (module: RouteModule) => Can.execute(user, module),
    },
  };
}
