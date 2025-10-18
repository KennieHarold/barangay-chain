import { Address } from "viem";
import { useReadContract } from "wagmi";

import { CITIZEN_NFT_ABI } from "@/lib/abi";

const baseContractArgs = {
  address: process.env.CITIZEN_NFT_ADDRESS as Address,
  abi: CITIZEN_NFT_ABI,
};

export function useBalanceOf(account: Address) {
  return useReadContract({
    ...baseContractArgs,
    functionName: "balanceOf",
    args: [account],
    query: {
      enabled: account !== undefined,
    },
  });
}
