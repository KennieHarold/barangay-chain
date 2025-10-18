import { UserRole } from "@/models";
import { keccak256, toBytes } from "viem";

export const roles = {
  [UserRole.Admin]:
    "0x0000000000000000000000000000000000000000000000000000000000000000",
  [UserRole.Official]: keccak256(toBytes("OFFICIAL_ROLE")),
  [UserRole.Contractor]: keccak256(toBytes("VENDOR_ROLE")),
} as const;
