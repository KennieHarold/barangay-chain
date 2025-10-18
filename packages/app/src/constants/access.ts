import { keccak256, toBytes, zeroAddress } from "viem";

export const roles = {
  ADMIN_ROLE: zeroAddress,
  OFFICIAL_ROLE: keccak256(toBytes("OFFICIAL_ROLE")),
  VENDOR_ROLE: keccak256(toBytes("VENDOR_ROLE")),
} as const;
