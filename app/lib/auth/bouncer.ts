import { redirect } from "react-router";
import type { User } from "~/store/auth.store";
import {
  UserRole,
  RouteModule,
  Permission,
  MODULE_PERMISSIONS,
  ROLE_HIERARCHY,
  ROLE_LABELS,
} from "./roles";

/**
 * Check if user has a specific role
 */
export function hasRole(user: User | null, role: UserRole): boolean {
  if (!user || !user.roles) return false;
  return user.roles.includes(role);
}

/**
 * Check if user has ANY of the specified roles
 */
export function hasAnyRole(user: User | null, roles: UserRole[]): boolean {
  if (!user || !user.roles) return false;
  return roles.some((role) => user.roles!.includes(role));
}

/**
 * Check if user has ALL of the specified roles
 */
export function hasAllRoles(user: User | null, roles: UserRole[]): boolean {
  if (!user || !user.roles) return false;
  return roles.every((role) => user.roles!.includes(role));
}

/**
 * Get user's highest role (based on hierarchy)
 */
export function getHighestRole(user: User | null): UserRole | null {
  if (!user || !user.roles || user.roles.length === 0) return null;

  return user.roles.reduce<UserRole | null>((highest, current) => {
    const currentRole = current as UserRole;
    if (!highest) return currentRole;
    const highestRole = highest as UserRole;
    return ROLE_HIERARCHY[currentRole] > ROLE_HIERARCHY[highestRole]
      ? currentRole
      : highestRole;
  }, null);
}

/**
 * Check if user can access a specific module
 */
export function canAccessModule(
  user: User | null,
  module: RouteModule
): boolean {
  if (!user || !user.roles) return false;

  const modulePermissions = MODULE_PERMISSIONS[module];
  if (!modulePermissions) return false;

  // Check if user has any role that grants access to this module
  return user.roles.some(
    (role) => modulePermissions[role as UserRole] !== undefined
  );
}

/**
 * Check if user has a specific permission for a module
 */
export function hasPermission(
  user: User | null,
  module: RouteModule,
  permission: Permission
): boolean {
  if (!user || !user.roles) return false;

  const modulePermissions = MODULE_PERMISSIONS[module];
  if (!modulePermissions) return false;

  return user.roles.some((role) => {
    const permissions = modulePermissions[role as UserRole];
    return permissions?.includes(permission) ?? false;
  });
}

/**
 * Get all permissions for a user in a module
 */
export function getUserPermissions(
  user: User | null,
  module: RouteModule
): Permission[] {
  if (!user || !user.roles) return [];

  const modulePermissions = MODULE_PERMISSIONS[module];
  if (!modulePermissions) return [];

  const allPermissions = new Set<Permission>();

  user.roles.forEach((role) => {
    const permissions = modulePermissions[role as UserRole];
    if (permissions) {
      permissions.forEach((p) => allPermissions.add(p));
    }
  });

  return Array.from(allPermissions);
}

/**
 * Check if user can perform CRUD operations
 */
export const Can = {
  read: (user: User | null, module: RouteModule) =>
    hasPermission(user, module, Permission.Read),

  create: (user: User | null, module: RouteModule) =>
    hasPermission(user, module, Permission.Create),

  update: (user: User | null, module: RouteModule) =>
    hasPermission(user, module, Permission.Update),

  delete: (user: User | null, module: RouteModule) =>
    hasPermission(user, module, Permission.Delete),

  execute: (user: User | null, module: RouteModule) =>
    hasPermission(user, module, Permission.Execute),
};

/**
 * Route guard: Require authentication
 * Throws redirect to login if not authenticated
 */
export function requireAuth(user: User | null, loginPath = "/auth/login") {
  if (!user) {
    throw redirect(loginPath);
  }
  return user;
}

/**
 * Route guard: Require specific role(s)
 * Throws redirect to unauthorized page if user doesn't have required role
 */
export function requireRole(
  user: User | null,
  roles: UserRole | UserRole[],
  unauthorizedPath = "/unauthorized"
) {
  requireAuth(user); // First check authentication

  const requiredRoles = Array.isArray(roles) ? roles : [roles];

  if (!hasAnyRole(user, requiredRoles)) {
    throw redirect(unauthorizedPath);
  }

  return user;
}

/**
 * Route guard: Require module access
 * Throws redirect if user cannot access the module
 */
export function requireModuleAccess(
  user: User | null,
  module: RouteModule,
  unauthorizedPath = "/unauthorized"
) {
  requireAuth(user);

  if (!canAccessModule(user, module)) {
    throw redirect(unauthorizedPath);
  }

  return user;
}

/**
 * Route guard: Require specific permission
 * Throws redirect if user doesn't have the required permission
 */
export function requirePermission(
  user: User | null,
  module: RouteModule,
  permission: Permission,
  unauthorizedPath = "/unauthorized"
) {
  requireAuth(user);

  if (!hasPermission(user, module, permission)) {
    throw redirect(unauthorizedPath);
  }

  return user;
}

/**
 * Combined guard: Require auth + module access + specific permission
 */
export function guardRoute(
  user: User | null,
  module: RouteModule,
  permission?: Permission
) {
  requireAuth(user);
  requireModuleAccess(user, module);

  if (permission) {
    requirePermission(user, module, permission);
  }

  return user;
}

/**
 * Get user info for display
 */
export function getUserInfo(user: User | null) {
  if (!user) return null;

  const highestRole = getHighestRole(user);

  return {
    id: user.id,
    userName: user.userName,
    fullName: user.fullName || user.userName,
    roles: user.roles || [],
    highestRole,
    highestRoleLabel: highestRole ? ROLE_LABELS[highestRole] : null,
    isAdmin: hasRole(user, UserRole.Admin),
    isHotelManager: hasRole(user, UserRole.HotelManager),
    isAccountant: hasRole(user, UserRole.Accountant),
    isReceptionist: hasRole(user, UserRole.Receptionist),
    isServiceStaff: hasRole(user, UserRole.ServiceStaff),
  };
}
