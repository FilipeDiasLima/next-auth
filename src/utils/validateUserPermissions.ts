type User = {
  permissions?: string[];
  roles?: string[];
};

type ValidateUserPermissionsParams = {
  user: User;
  permissions?: string[];
  roles?: string[];
};

export function validateUserPermissions({
  user,
  permissions,
  roles,
}: ValidateUserPermissionsParams) {
  if (permissions && permissions?.length > 0) {
    const hasAllPermissions = permissions?.some((permission) => {
      return user.permissions?.includes(permission);
    });

    return hasAllPermissions;
  }

  if (roles && roles?.length > 0) {
    const hasAllRoles = roles?.some((role) => {
      return user.roles?.includes(role);
    });

    return hasAllRoles;
  }

  return false;
}
