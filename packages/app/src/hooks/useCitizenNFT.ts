import { Address, isAddress } from "viem";
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { CITIZEN_NFT_ABI } from "@/lib/abi";

const baseContractArgs = {
  address: process.env.NEXT_PUBLIC_CITIZEN_NFT_ADDRESS as Address,
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

export function useMint() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mutate = (to: Address, uri: string) => {
    writeContract({
      ...baseContractArgs,
      functionName: "safeMint",
      args: [to, uri],
    });
  };

  return { mutate, hash, isPending, isConfirming, isSuccess, error };
}

export function useTokenUri(tokenId: number) {
  return useReadContract({
    ...baseContractArgs,
    functionName: "tokenURI",
    args: [BigInt(tokenId)],
    query: {
      enabled: tokenId !== undefined && typeof tokenId === "number",
    },
  });
}

export function useTokenOfOwnerByIndex(address: Address, index: number) {
  return useReadContract({
    ...baseContractArgs,
    functionName: "tokenOfOwnerByIndex",
    args: [address, BigInt(index)],
    query: {
      enabled:
        index !== undefined && typeof index === "number" && isAddress(address),
    },
  });
}
