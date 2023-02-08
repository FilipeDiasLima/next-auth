import { validateUserPermissions } from "@/utils/validateUserPermissions";
import { useAuth } from "./useAuth";

type UseCanParams = {
  permissions?: string[];
  roles?: string[];
};

export function useCan({ permissions, roles }: UseCanParams) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return false;

  const userHasValidPermission = validateUserPermissions({
    user,
    permissions,
    roles,
  });

  return userHasValidPermission;
}
