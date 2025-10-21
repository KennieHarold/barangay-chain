"use client";

import { useRouter } from "next/navigation";
import { formatEther, zeroAddress } from "viem";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
} from "@mui/material";

import { statusColors, statusLabels } from "@/constants/project";
import { formatDate, shortenAddress } from "@/utils/format";
import { useProjectData } from "@/hooks/useProjectData";
import { MilestoneStatus } from "@/models";

interface ProjectCardProps {
  projectId: number;
}

export function ProjectCard({ projectId }: ProjectCardProps) {
  const router = useRouter();
  const { project } = useProjectData(projectId);

  const currentMilestone =
    project?.milestones && typeof project?.currentMilestone === "number"
      ? project.milestones[project.currentMilestone]
      : null;

  const completedMilestones = project?.milestones.filter(
    (m) => m.status === MilestoneStatus.Done
  ).length;

  const progress =
    project?.milestones && completedMilestones
      ? (completedMilestones / project?.milestones.length) * 100
      : 0;

  const handleViewDetails = () => {
    router.push(`/projects/${projectId}`);
  };

  if (
    !(
      project.proposer !== zeroAddress &&
      currentMilestone &&
      typeof completedMilestones === "number" &&
      typeof progress === "number"
    )
  ) {
    return <></>;
  }

  return (
    <Card
      onClick={handleViewDetails}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
        cursor: "pointer",
        borderRadius: "1em",
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box
          gap={2}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Typography variant="h6" component="div" fontWeight="bold">
            {project.title}
          </Typography>
          <Chip
            label={statusLabels[currentMilestone.status]}
            size="small"
            sx={{
              backgroundColor: statusColors[currentMilestone.status],
              color: "white",
            }}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Budget
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {formatEther(project.budget)} PYUSD
          </Typography>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Progress
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" color="text.secondary">
              {completedMilestones}/{project.milestones.length}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Proposer: {shortenAddress(project.proposer)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vendor: {shortenAddress(project.vendor)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {formatDate(project.startDate)} - {formatDate(project.endDate)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
