"use client";

import { useRouter } from "next/navigation";
import { formatUnits, zeroAddress } from "viem";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
} from "@mui/material";

import { statusColors, statusLabels } from "@/constants/project";
import { formatDate, getCidFromUri, shortenAddress } from "@/utils/format";
import { useProjectData } from "@/hooks/useProjectData";
import { MilestoneStatus } from "@/models";
import { useFetchVendorInfo } from "@/hooks/useBarangayChain";
import { useFetchMetadataQuery } from "@/hooks/useIPFS";

interface ProjectCardProps {
  projectId: number;
}

export function ProjectCard({ projectId }: ProjectCardProps) {
  const router = useRouter();
  const { project } = useProjectData(projectId);
  const { data: vendor } = useFetchVendorInfo(Number(project.vendorId));

  const cid = getCidFromUri(vendor?.[1] || "");
  const { data: rawMetadata } = useFetchMetadataQuery(cid);
  const metadata = rawMetadata?.data?.valueOf() as {
    name: string;
    location: string;
  };

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
        cursor: "pointer",
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
              color: currentMilestone.status === MilestoneStatus.Pending ? "#000" : "white",
            }}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Budget
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {formatUnits(project.budget, 6)} PYUSD
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
              sx={{
                flexGrow: 1,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#E0E0E0",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#C77DFF",
                },
              }}
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
            Contractor: {metadata?.name || ""}
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
