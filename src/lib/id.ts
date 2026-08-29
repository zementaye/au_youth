import { randomUUID, randomBytes } from "crypto";

export function newId(prefix: string) {
  return `${prefix}_${randomUUID()}`;
}

export function newToken() {
  return randomBytes(24).toString("hex");
}
