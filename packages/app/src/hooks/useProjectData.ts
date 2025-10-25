import { useMemo } from "react";
import { Address, zeroAddress } from "viem";
import { useReadContracts } from "wagmi";

import { Category, MilestoneStatus, Project, ProjectOnChain } from "@/models";
import { useFetchMetadataQuery } from "./useIPFS";
import { getCidFromUri } from "@/utils/format";
import { BARANGAY_CHAIN_ABI } from "@/lib/abi";
import { useProjectInfo } from "./useBarangayChain";

const baseContractArgs = {
  address: process.env.NEXT_PUBLIC_BARANGAY_CHAIN_ADDRESS as Address,
  abi: BARANGAY_CHAIN_ABI,
};

export function useProjectData(id: number): {
  project: Project;
  refetchAll: () => Promise<void>;
} {
  const { data: project, refetch: refetchProjectInfo } = useProjectInfo(id);
  const { info } = parseContractArgsToObject(project) ?? {};

  const {
    proposer = zeroAddress,
    vendorId = BigInt(0),
    startDate = BigInt(0),
    endDate = BigInt(0),
    milestoneCount = 0,
    advancePayment = BigInt(0),
    budget = BigInt(0),
    category = 0,
    currentMilestone = 0,
    metadataURI = "",
  } = info ?? {};

  const cid = getCidFromUri(metadataURI || "");
  const { data: rawMetadata } = useFetchMetadataQuery(cid);
  const metadata = rawMetadata?.data?.valueOf() as {
    title: string;
    description: string;
  };

  const milestoneContracts = useMemo(() => {
    if (!milestoneCount) {
      return [];
    }
    return Array.from({ length: milestoneCount }, (_, i) => ({
      ...baseContractArgs,
      functionName: "getProjectMilestone" as const,
      args: [BigInt(id), i] as const,
    }));
  }, [id, milestoneCount]);

  const { data: milestonesData, refetch: refetchMilestones } = useReadContracts(
    {
      contracts: milestoneContracts,
      query: {
        enabled: !!info?.milestoneCount && id !== undefined,
      },
    }
  );

  const refetchAll = async () => {
    await refetchProjectInfo();
    await refetchMilestones();
  };

  const allMilestonesLoaded =
    milestonesData &&
    milestonesData.length === milestoneCount &&
    milestonesData.every((result) => result.status === "success");

  if (!(metadata && allMilestonesLoaded)) {
    return {
      project: {
        id: 0,
        title: "",
        description: "",
        proposer: zeroAddress,
        vendorId: BigInt(0),
        startDate: BigInt(0),
        endDate: BigInt(0),
        milestoneCount: 0,
        advancePayment: BigInt(0),
        budget: BigInt(0),
        category: Category.Infrastructure,
        currentMilestone: 0,
        metadataURI: "",
        milestones: [],
      },
      refetchAll,
    };
  }

  const milestones = milestonesData.map((result) => {
    const data = result.result!;
    return {
      upvotes: parseInt(data.upvotes.toString(), 10),
      downvotes: parseInt(data.downvotes.toString(), 10),
      metadataURI: data.metadataURI,
      releaseBps: data.releaseBps,
      index: data.index,
      isReleased: data.isReleased,
      status: getMilestoneByIndex(data.status),
    };
  });

  return {
    project: {
      id,
      title: metadata.title,
      description: metadata.description,
      proposer,
      vendorId,
      startDate,
      endDate,
      milestoneCount,
      advancePayment,
      budget,
      category,
      currentMilestone,
      metadataURI,
      milestones,
    },
    refetchAll,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseContractArgsToObject(args: any): { info: ProjectOnChain } | null {
  if (!args) {
    return null;
  }
  return {
    info: {
      proposer: args[0],
      startDate: args[1],
      endDate: args[2],
      milestoneCount: Number(args[3]),
      vendorId: args[4],
      advancePayment: args[5],
      budget: args[6],
      category: args[7],
      currentMilestone: args[8],
      metadataURI: args[9],
    },
  };
}

function getMilestoneByIndex(index: number) {
  switch (index) {
    case 0:
      return MilestoneStatus.Pending;
    case 1:
      return MilestoneStatus.ForVerification;
    case 2:
      return MilestoneStatus.Done;
    default:
      return MilestoneStatus.Pending;
  }
}
