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
  vendorId: bigint;
  startDate: bigint;
  endDate: bigint;
  milestoneCount: number;
  advancePayment: bigint;
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
  vendorId: number;
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
  isReleased: boolean;
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

export interface ProjectOnChain {
  proposer: Address;
  vendorId: bigint;
  startDate: bigint;
  endDate: bigint;
  milestoneCount: number;
  advancePayment: bigint;
  budget: bigint;
  category: number;
  currentMilestone: number;
  metadataURI: string;
}

export interface Contractor {
  id: number;
  name: string;
  location: string;
  isWhitelisted: boolean;
  walletAddress: Address;
  totalProjectsDone: bigint;
  totalDisbursement: bigint;
}

export interface ContractorOnchain {
  walletAddress: Address;
  metadataURI: string;
  isWhitelisted: boolean;
  totalProjectsDone: bigint;
  totalDisbursement: bigint;
}
