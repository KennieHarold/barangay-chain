import { UserRole } from "@/models";

export const roles = {
  [UserRole.Admin]: BigInt(0),
  [UserRole.Official]: BigInt(1),
} as const;
