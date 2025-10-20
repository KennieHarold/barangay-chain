import { MilestoneStatus, Project, ProjectOnChain } from "@/models";
import { useProjectInfo, useProjectMilestoneInfo } from "./useBarangayChain";
import { useFetchMetadataQuery } from "./useIPFS";
import { getCidFromUri } from "@/utils/format";

export function useProjectData(id: number): Project | null {
  const { data: project } = useProjectInfo(id);
  const { info } = parseContractArgsToObject(project) ?? {};

  const cid = getCidFromUri(info?.metadataURI || "");
  const { data: rawMetadata } = useFetchMetadataQuery(cid);
  const metadata = rawMetadata?.data?.valueOf() as {
    title: string;
    description: string;
  };

  const { data: milestone0 } = useProjectMilestoneInfo(id, 0);
  const { data: milestone1 } = useProjectMilestoneInfo(id, 1);
  const { data: milestone2 } = useProjectMilestoneInfo(id, 2);

  if (!(info && metadata && milestone0 && milestone1 && milestone2)) {
    return null;
  }

  const {
    proposer,
    vendor,
    startDate,
    endDate,
    budget,
    category,
    currentMilestone,
    metadataURI,
  } = info;

  return {
    id,
    title: metadata.title,
    description: metadata.description,
    proposer,
    vendor,
    startDate,
    endDate,
    budget,
    category,
    currentMilestone,
    metadataURI,
    milestones: [
      {
        upvotes: parseInt(milestone0.upvotes.toString(), 10),
        downvotes: parseInt(milestone0.downvotes.toString(), 10),
        metadataURI: milestone0.metadataURI,
        releaseBps: milestone0.releaseBps,
        index: milestone0.index,
        status: getMilestoneByIndex(milestone0.status),
      },
      {
        upvotes: parseInt(milestone1.upvotes.toString(), 10),
        downvotes: parseInt(milestone1.downvotes.toString(), 10),
        metadataURI: milestone1.metadataURI,
        releaseBps: milestone1.releaseBps,
        index: milestone1.index,
        status: getMilestoneByIndex(milestone1.status),
      },
      {
        upvotes: parseInt(milestone2.upvotes.toString(), 10),
        downvotes: parseInt(milestone2.downvotes.toString(), 10),
        metadataURI: milestone2.metadataURI,
        releaseBps: milestone2.releaseBps,
        index: milestone2.index,
        status: getMilestoneByIndex(milestone2.status),
      },
    ],
  };
}

function parseContractArgsToObject(args: any): { info: ProjectOnChain } | null {
  if (!args) {
    return null;
  }
  return {
    info: {
      proposer: args[0],
      vendor: args[1],
      startDate: args[2],
      endDate: args[3],
      budget: args[4],
      category: args[5],
      currentMilestone: args[6],
      metadataURI: args[7],
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
