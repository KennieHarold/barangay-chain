import { Address, zeroAddress } from "viem";

export function getDetailsFromEventName(event: string) {
  switch (event) {
    case "ProjectCreated":
      return "Project created and initialized";
    case "MilestoneSubmitted":
      return "Milestone submitted for verification";
    case "MilestoneVerified":
      return "Milestone verified by citizen";
    case "MilestoneCompleted":
      return "Milestone completed and payment released";
    default:
      return "";
  }
}

export function getEventColor(event: string) {
  switch (event) {
    case "ProjectCreated":
      return "primary";
    case "MilestoneSubmitted":
      return "info";
    case "MilestoneVerified":
      return "success";
    case "MilestoneCompleted":
      return "success";
    default:
      return "default";
  }
}

export function getActorFromEventArgs(event: string, args: any) {
  switch (event) {
    case "ProjectCreated":
      return args?.proposer as Address;
    case "MilestoneSubmitted":
      return args?.vendor as Address;
    case "MilestoneVerified":
      return args?.voter as Address;
    case "MilestoneCompleted":
      return zeroAddress as Address;
    default:
      return zeroAddress as Address;
  }
}
