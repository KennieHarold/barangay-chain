import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  usePublicClient,
} from "wagmi";
import { AbiEvent, Address, PublicClient } from "viem";
import { useQuery } from "@tanstack/react-query";

import {
  BARANGAY_CHAIN_ABI,
  projectCreated,
  milestoneSubmitted,
  milestoneVerified,
  milestoneCompleted,
} from "@/lib/abi";
import { CreateProjectData } from "@/models";
import { roles } from "@/constants/access";

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
      vendor,
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
        vendor,
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

export function useHasRole(role: keyof typeof roles, account: Address) {
  return useReadContract({
    ...baseContractArgs,
    functionName: "hasRole",
    args: [roles[role], account],
    query: {
      enabled: role !== undefined && account !== undefined,
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
    functionName: "getUserMilestoneVerification",
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
