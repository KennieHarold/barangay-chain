import { Category, MilestoneStatus } from "@/models";

export const categoryColors: Record<Category, string> = {
  [Category.Infrastructure]: "#4D96FF",
  [Category.Health]: "#FF6B6B",
  [Category.Education]: "#C77DFF",
  [Category.Environment]: "#6BCB77",
  [Category.Livelihood]: "#FFC107",
  [Category.Emergency]: "#FF8C42",
  [Category.Administration]: "#9D84B7",
  [Category.CommunityEvents]: "#FF85A2",
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
  [MilestoneStatus.Done]: "#6BCB77",
  [MilestoneStatus.ForVerification]: "#FF8C42",
  [MilestoneStatus.Pending]: "#FFC107",
};

export const statusLabels: Record<MilestoneStatus, string> = {
  [MilestoneStatus.Done]: "Done",
  [MilestoneStatus.ForVerification]: "Verifying",
  [MilestoneStatus.Pending]: "Pending",
};
