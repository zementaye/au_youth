import { describe, it, expect } from "vitest";
import { canPost, canPostPlatformWide, isDeptAdminOf, type PermissionUser } from "@/lib/permissions";

function user(overrides: Partial<PermissionUser>): PermissionUser {
  return { systemRole: "MEMBER", isPoster: false, departmentId: "dept_it", ...overrides };
}

describe("canPost", () => {
  it("allows the Super Admin", () => {
    expect(canPost(user({ systemRole: "SUPER_ADMIN" }))).toBe(true);
  });

  it("allows a Dept Admin", () => {
    expect(canPost(user({ systemRole: "DEPT_ADMIN" }))).toBe(true);
  });

  it("allows a member who has been granted poster privileges", () => {
    expect(canPost(user({ systemRole: "MEMBER", isPoster: true }))).toBe(true);
  });

  it("denies a plain member without poster privileges", () => {
    expect(canPost(user({ systemRole: "MEMBER", isPoster: false }))).toBe(false);
  });
});

describe("canPostPlatformWide", () => {
  it("allows only the Super Admin", () => {
    expect(canPostPlatformWide(user({ systemRole: "SUPER_ADMIN" }))).toBe(true);
    expect(canPostPlatformWide(user({ systemRole: "DEPT_ADMIN" }))).toBe(false);
    expect(canPostPlatformWide(user({ systemRole: "MEMBER", isPoster: true }))).toBe(false);
  });
});

describe("isDeptAdminOf", () => {
  it("lets the Super Admin manage any department, including null/unassigned", () => {
    const superAdmin = user({ systemRole: "SUPER_ADMIN", departmentId: "dept_it" });
    expect(isDeptAdminOf(superAdmin, "dept_it")).toBe(true);
    expect(isDeptAdminOf(superAdmin, "dept_comms")).toBe(true);
    expect(isDeptAdminOf(superAdmin, null)).toBe(true);
  });

  it("lets a Dept Admin manage only their own department", () => {
    const deptAdmin = user({ systemRole: "DEPT_ADMIN", departmentId: "dept_it" });
    expect(isDeptAdminOf(deptAdmin, "dept_it")).toBe(true);
    expect(isDeptAdminOf(deptAdmin, "dept_comms")).toBe(false);
    expect(isDeptAdminOf(deptAdmin, null)).toBe(false);
  });

  it("denies a plain member regardless of department match", () => {
    const member = user({ systemRole: "MEMBER", departmentId: "dept_it" });
    expect(isDeptAdminOf(member, "dept_it")).toBe(false);
  });

  it("denies a poster who is not a Dept Admin", () => {
    const poster = user({ systemRole: "MEMBER", isPoster: true, departmentId: "dept_it" });
    expect(isDeptAdminOf(poster, "dept_it")).toBe(false);
  });
});
