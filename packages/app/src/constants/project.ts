import { Category, MilestoneStatus } from "@/models";

export const categoryColors: Record<Category, string> = {
  [Category.Infrastructure]: "#2196F3",
  [Category.Health]: "#F44336",
  [Category.Education]: "#9C27B0",
  [Category.Environment]: "#4CAF50",
  [Category.Livelihood]: "#FF9800",
  [Category.Emergency]: "#E91E63",
  [Category.Administration]: "#607D8B",
  [Category.CommunityEvents]: "#00BCD4",
};

export const categoryLabels: Record<Category, string> = {
  [Category.Infrastructure]: "Infrastructure",
  [Category.Health]: "Health",
  [Category.Education]: "Education",
  [Category.Environment]: "Environment",
  [Category.Livelihood]: "Livelihood",
  [Category.Emergency]: "Emergency",
  [Category.Administration]: "Administration",
  [Category.CommunityEvents]: "Community Events",
};

export const statusColors: Record<MilestoneStatus, string> = {
  [MilestoneStatus.Done]: "#4CAF50",
  [MilestoneStatus.ForVerification]: "#FF9800",
  [MilestoneStatus.Pending]: "#9E9E9E",
};

export const statusLabels: Record<MilestoneStatus, string> = {
  [MilestoneStatus.Done]: "Done",
  [MilestoneStatus.ForVerification]: "Verifying",
  [MilestoneStatus.Pending]: "Pending",
};
