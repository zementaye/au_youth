export type SystemRole = "SUPER_ADMIN" | "DEPT_ADMIN" | "POSTER" | "MEMBER";

export type PermissionUser = {
  systemRole: SystemRole;
  isPoster: boolean;
  departmentId: string | null;
};

export function canPost(user: PermissionUser) {
  return user.systemRole === "SUPER_ADMIN" || user.systemRole === "DEPT_ADMIN" || user.isPoster;
}

export function canPostPlatformWide(user: PermissionUser) {
  return user.systemRole === "SUPER_ADMIN";
}

export function isDeptAdminOf(user: PermissionUser, departmentId: string | null) {
  return (
    user.systemRole === "SUPER_ADMIN" ||
    (user.systemRole === "DEPT_ADMIN" && user.departmentId === departmentId)
  );
}
