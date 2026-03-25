export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface UserPermissions {
  permissions: Permission[];
}

export class PermissionService {
  
  // Role-based permission mapping
  private static readonly ROLE_PERMISSIONS = {
    'ADMIN': [
      'DELETE_USER',
      'VIEW_ALL_USERS', 
      'EDIT_ANY_PORTFOLIO',
      'MANAGE_SYSTEM',
      'VIEW_ADMIN_DASHBOARD'
    ],
    'HR': [
      'VIEW_EMPLOYEES',
      'EDIT_PORTFOLIO',
      'VIEW_HR_DASHBOARD',
      'MANAGE_SKILLS'
    ]
  };

  static getPermissionsForRole(role: string): string[] {
    return this.ROLE_PERMISSIONS[role as keyof typeof this.ROLE_PERMISSIONS] || [];
  }

  static hasPermission(userRole: string, requiredPermission: string): boolean {
    const permissions = this.getPermissionsForRole(userRole);
    return permissions.includes(requiredPermission);
  }

  static hasAnyPermission(userRole: string, requiredPermissions: string[]): boolean {
    const permissions = this.getPermissionsForRole(userRole);
    return requiredPermissions.some(permission => permissions.includes(permission));
  }
}
