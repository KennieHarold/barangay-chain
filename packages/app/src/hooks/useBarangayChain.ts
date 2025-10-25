import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  usePublicClient,
  useReadContracts,
} from "wagmi";
import { AbiEvent, Address, PublicClient } from "viem";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  BARANGAY_CHAIN_ABI,
  projectCreated,
  milestoneSubmitted,
  milestoneVerified,
  milestoneCompleted,
} from "@/lib/abi";
import { Contractor, CreateProjectData } from "@/models";
import { useMemo } from "react";
import { pinata } from "@/utils/config";
import { getCidFromUri } from "@/utils/format";

const baseContractArgs = {
  address: process.env.NEXT_PUBLIC_BARANGAY_CHAIN_ADDRESS as Address,
  abi: BARANGAY_CHAIN_ABI,
};

export function useCreateProject() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mutate = (project: CreateProjectData) => {
    const {
      proposer,
      vendorId,
      budget,
      category,
      startDate,
      endDate,
      uri,
      releaseBpsTemplate,
    } = project;

    writeContract({
      ...baseContractArgs,
      functionName: "createProject",
      args: [
        proposer,
        BigInt(vendorId),
        budget,
        category,
        startDate,
        endDate,
        uri,
        releaseBpsTemplate,
      ],
    });
  };

  return { mutate, hash, isPending, isConfirming, isSuccess, error };
}

export function useSubmitMilestone() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mutate = (projectId: number, uri: string) => {
    writeContract({
      ...baseContractArgs,
      functionName: "submitMilestone",
      args: [BigInt(projectId), uri],
    });
  };

  return { mutate, hash, isPending, isConfirming, isSuccess, error };
}

export function useVerifyMilestone() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mutate = (projectId: number, consensus: boolean) => {
    writeContract({
      ...baseContractArgs,
      functionName: "verifyMilestone",
      args: [BigInt(projectId), consensus],
    });
  };

  return { mutate, hash, isPending, isConfirming, isSuccess, error };
}

export function useCompleteMilestone() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mutate = (projectId: number) => {
    writeContract({
      ...baseContractArgs,
      functionName: "completeMilestone",
      args: [BigInt(projectId)],
    });
  };

  return { mutate, hash, isPending, isConfirming, isSuccess, error };
}

export function useProjectInfo(projectId: number) {
  return useReadContract({
    ...baseContractArgs,
    functionName: "projects",
    args: [BigInt(projectId)],
    query: {
      enabled: projectId !== undefined,
    },
  });
}

export function useProjectMilestoneInfo(
  projectId: number,
  milestoneIdx: number
) {
  return useReadContract({
    ...baseContractArgs,
    functionName: "getProjectMilestone",
    args: [BigInt(projectId), milestoneIdx],
    query: {
      enabled: projectId !== undefined && milestoneIdx !== undefined,
    },
  });
}

export function useProjectCounter() {
  return useReadContract({
    ...baseContractArgs,
    functionName: "projectCounter",
    args: [],
  });
}

export function useHasUserVoted(
  projectId: number,
  milestoneIdx: number,
  userAddress: Address
) {
  return useReadContract({
    ...baseContractArgs,
    functionName: "isUserAlreadyVoted",
    args: [BigInt(projectId), milestoneIdx, userAddress],
    query: {
      enabled:
        projectId !== undefined &&
        milestoneIdx !== undefined &&
        userAddress !== undefined,
    },
  });
}

async function fetchEventLogsByType(
  publicClient: PublicClient,
  event: AbiEvent,
  projectId: number
) {
  const latestBlock = await publicClient.getBlock();
  return publicClient.getLogs({
    address: baseContractArgs.address,
    event,
    args: {
      projectId: BigInt(projectId),
    },
    fromBlock: latestBlock.number - BigInt(10000),
    toBlock: "latest",
  });
}

export function useFetchProjectEventLogs(projectId: number) {
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ["projectEventLogs", projectId],
    queryFn: async () => {
      if (!publicClient) {
        throw new Error("Public client not available");
      }
      const [
        projectCreatedLogs,
        milestoneSubmittedLogs,
        milestoneVerifiedLogs,
        milestoneCompletedLogs,
      ] = await Promise.all([
        fetchEventLogsByType(publicClient, projectCreated, projectId),
        fetchEventLogsByType(publicClient, milestoneSubmitted, projectId),
        fetchEventLogsByType(publicClient, milestoneVerified, projectId),
        fetchEventLogsByType(publicClient, milestoneCompleted, projectId),
      ]);

      const logs = [
        ...projectCreatedLogs,
        ...milestoneSubmittedLogs,
        ...milestoneVerifiedLogs,
        ...milestoneCompletedLogs,
      ].sort((a, b) => Number(a.blockNumber) - Number(b.blockNumber));

      const logsWithTimestamps = await Promise.all(
        logs.map(async (log) => {
          const block = await publicClient.getBlock({
            blockNumber: log.blockNumber,
          });
          return {
            ...log,
            timestamp: new Date(Number(block.timestamp) * 1000),
          };
        })
      );

      return logsWithTimestamps;
    },
    enabled: !!publicClient && projectId !== undefined,
  });
}

export function useFetchAmountFundsReleased(projectId: number) {
  return useReadContract({
    ...baseContractArgs,
    functionName: "amountFundsReleased",
    args: [BigInt(projectId)],
    query: {
      enabled: projectId !== undefined,
    },
  });
}

export function useBlockTimestamp() {
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ["blockTimestamp"],
    queryFn: async () => {
      if (!publicClient) {
        throw new Error("Public client not available");
      }
      const block = await publicClient.getBlock();
      return block.timestamp;
    },
    enabled: !!publicClient,
    refetchInterval: 12000,
  });
}

export function useVendorCounter() {
  return useReadContract({
    ...baseContractArgs,
    functionName: "vendorCounter",
    args: [],
  });
}

export function useFetchVendorInfo(vendorId: number) {
  return useReadContract({
    ...baseContractArgs,
    functionName: "vendors" as const,
    args: [BigInt(vendorId)],
    query: {
      enabled: typeof vendorId === "number" && vendorId > 0,
    },
  });
}

export function useFetchVendorsList(): {
  data: Contractor[];
  total: number;
  isLoading: boolean;
  isFetched: boolean;
} {
  const {
    data: length,
    isLoading: isVendorCounterLoading,
    isFetched: isVendorCounterFetched,
  } = useVendorCounter();
  const queryClient = useQueryClient();

  const contracts = useMemo(() => {
    return Array.from({ length: Number(length || 0) }, (_, i) => ({
      ...baseContractArgs,
      functionName: "vendors" as const,
      args: [BigInt(i + 1)] as const,
    }));
  }, [length]);

  const {
    data,
    isLoading: isLoadingContracts,
    isFetched: isContractsFetched,
  } = useReadContracts({
    contracts: contracts,
  });
  const ipfsQueries = useQueries({
    queries:
      data?.map(({ result }) => ({
        queryKey: [
          "contractorMetadata",
          "walletAddress",
          result?.[0],
          "uri",
          result?.[1],
        ],
        queryFn: () =>
          pinata.gateways.public.get(getCidFromUri(result?.[1] || "")),
      })) || [],
  });

  // No vendors yet
  if (!length) {
    return {
      data: [],
      total: 0,
      isLoading: isVendorCounterLoading,
      isFetched: isVendorCounterFetched,
    };
  }

  const allVendorsLoaded =
    data &&
    data.length === Number(length || 0) &&
    data.every((result) => result.status === "success") &&
    ipfsQueries.every((result) => result.isSuccess);

  const isLoading =
    isVendorCounterLoading ||
    isLoadingContracts ||
    ipfsQueries.every((result) => result.isLoading);

  const isFetched =
    isVendorCounterFetched ||
    isContractsFetched ||
    ipfsQueries.every((result) => result.isFetched);

  if (!allVendorsLoaded) {
    return {
      data: [],
      total: 0,
      isLoading,
      isFetched,
    };
  }

  const vendors: Contractor[] = data.map(({ result }, index) => {
    const queryData = queryClient.getQueryData([
      "contractorMetadata",
      "walletAddress",
      result?.[0],
      "uri",
      result?.[1],
    ]) as { data: { name: string; location: string } };
    return {
      id: index + 1,
      name: queryData?.data?.name || "",
      location: queryData?.data?.location || "",
      walletAddress: result[0] as Address,
      isWhitelisted: result[2],
      totalProjectsDone: result[3],
      totalDisbursement: result[4],
    };
  });

  return {
    data: vendors,
    total: Number(length),
    isLoading,
    isFetched,
  };
}

export function useAddVendor() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mutate = (walletAddress: Address, uri: string) => {
    writeContract({
      ...baseContractArgs,
      functionName: "addVendor",
      args: [walletAddress, uri],
    });
  };

  return { mutate, hash, isPending, isConfirming, isSuccess, error };
}
