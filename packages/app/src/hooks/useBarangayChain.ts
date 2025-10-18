import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { Address } from "viem";

import { BARANGAY_CHAIN_ABI } from "@/lib/abi";
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
