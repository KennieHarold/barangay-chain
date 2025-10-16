import { EventLog } from "@/models";

export const mockLogs: EventLog[] = [
  {
    id: "1",
    event: "ProjectCreated",
    timestamp: new Date(),
    sender: "0x26919F0772920190d28bF5b0Df7a34bcb2Cfa529",
    details: "Project created and initialized",
    txHash:
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  },
  {
    id: "2",
    event: "MilestoneSubmitted",
    timestamp: new Date(),
    sender: "0x26919F0772920190d28bF5b0Df7a34bcb2Cfa529",
    details: "Milestone 1 submitted for verification",
    txHash:
      "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  },
  {
    id: "3",
    event: "MilestoneVerified",
    timestamp: new Date(),
    sender: "0x1234567890123456789012345678901234567890",
    details: "Milestone 1 verified by citizen - Upvote",
    txHash:
      "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
  },
  {
    id: "4",
    event: "MilestoneCompleted",
    timestamp: new Date(),
    sender: "0x26919F0772920190d28bF5b0Df7a34bcb2Cfa529",
    details: "Milestone 1 completed - Payment released: 25%",
    txHash:
      "0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc",
  },
];
