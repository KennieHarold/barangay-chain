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

export enum UserRole {
  Admin,
  Official,
  Contractor,
  Citizen,
  Guest,
}

export interface Project {
  id: number;
  title: string;
  description: string;
  proposer: Address;
  vendor: Address;
  startDate: bigint;
  endDate: bigint;
  budget: bigint;
  category: Category;
  currentMilestone: number;
  metadataURI: string;
  milestones: Milestone[];
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

export interface EventLog {
  id: string;
  event: string;
  timestamp: Date;
  sender: string;
  details: string;
  txHash: string;
}
