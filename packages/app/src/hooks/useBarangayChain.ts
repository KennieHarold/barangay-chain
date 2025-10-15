import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { BARANGAY_CHAIN_ABI } from "@/lib/abi";
import { CreateProjectData } from "@/models";
import { Address } from "viem";

const baseContractArgs = {
  address: process.env.BARANGAY_CHAIN_ADDRESS as Address,
  abi: BARANGAY_CHAIN_ABI,
};

export function useCreateProject(project: CreateProjectData) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

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

  return { hash, isPending, isConfirming, isSuccess, error };
}

export function useSubmitMilestone(projectId: string, uri: string) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  writeContract({
    ...baseContractArgs,
    functionName: "submitMilestone",
    args: [BigInt(projectId), uri],
  });

  return { hash, isPending, isConfirming, isSuccess, error };
}

export function useVerifyMilestone(projectId: string, consensus: boolean) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  writeContract({
    ...baseContractArgs,
    functionName: "verifyMilestone",
    args: [BigInt(projectId), consensus],
  });

  return { hash, isPending, isConfirming, isSuccess, error };
}

export function useCompleteMilestone(projectId: string) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  writeContract({
    ...baseContractArgs,
    functionName: "completeMilestone",
    args: [BigInt(projectId)],
  });

  return { hash, isPending, isConfirming, isSuccess, error };
}

export function useProjectInfo(projectId: string) {
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
  projectId: string,
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
