/**
 * Centralized Role Constants for ServiceDesk Pro RBAC
 */
export const ROLES = {
  SYSTEM_ADMIN: 'system_admin',
  IT_MANAGER: 'it_manager',
  TECHNICIAN: 'technician',
  ASSET_MANAGER: 'asset_manager',
  EMPLOYEE: 'employee',
}

export const ROLE_LABELS = {
  [ROLES.SYSTEM_ADMIN]: 'System Administrator',
  [ROLES.IT_MANAGER]: 'IT Manager',
  [ROLES.TECHNICIAN]: 'Support Technician',
  [ROLES.ASSET_MANAGER]: 'Asset Manager',
  [ROLES.EMPLOYEE]: 'Employee',
}

export const ROLE_BADGE_VARIANTS = {
  [ROLES.SYSTEM_ADMIN]: 'danger',
  [ROLES.IT_MANAGER]: 'warning',
  [ROLES.TECHNICIAN]: 'info',
  [ROLES.ASSET_MANAGER]: 'info',
  [ROLES.EMPLOYEE]: 'neutral',
}

/**
 * Checks if a user has a specific role
 */
export function hasRole(user, role) {
  if (!user || !user.role) return false
  return user.role === role
}

/**
 * Checks if a user has at least one of the specified allowed roles
 */
export function hasAnyRole(user, allowedRoles = []) {
  if (!user || !user.role) return false
  if (!allowedRoles || allowedRoles.length === 0) return true
  return allowedRoles.includes(user.role)
}

/**
 * Convenience helper to check if user has elevated management or admin privileges
 */
export function isAdminOrManager(user) {
  return hasAnyRole(user, [ROLES.SYSTEM_ADMIN, ROLES.IT_MANAGER])
}

/**
 * Convenience helper to check if user belongs to IT support staff
 */
export function isStaff(user) {
  return hasAnyRole(user, [ROLES.SYSTEM_ADMIN, ROLES.IT_MANAGER, ROLES.TECHNICIAN, ROLES.ASSET_MANAGER])
}
