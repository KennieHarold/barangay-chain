import { Address } from "viem";

export enum Category {
  Infrastructure,
  Health,
  Education,
  Environment,
  Livelihood,
  Emergency,
  Administration,
  CommunityEvents,
}

export enum MilestoneStatus {
  Pending,
  ForVerification,
  Done,
}

export interface CreateProjectData {
  proposer: Address;
  vendor: Address;
  budget: bigint;
  category: Category;
  startDate: bigint;
  endDate: bigint;
  uri: string;
  releaseBpsTemplate: number[];
}

export interface Milestone {
  upvotes: number;
  downvotes: number;
  metadataURI: string;
  releaseBps: number;
  index: number;
  status: MilestoneStatus;
}
