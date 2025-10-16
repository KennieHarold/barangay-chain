import { Address } from "viem";

export const formatDate = (timestamp: bigint): string => {
  return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const shortenAddress = (address: Address): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
