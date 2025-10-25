"use client";

import { formatUnits } from "viem";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  LinearProgress,
} from "@mui/material";

import { Project, MilestoneStatus } from "@/models";
import { formatDate, getCidFromUri, shortenAddress } from "@/utils/format";
import {
  statusColors,
  statusLabels,
  categoryLabels,
} from "@/constants/project";
import { useFetchVendorInfo } from "@/hooks/useBarangayChain";
import { useFetchMetadataQuery } from "@/hooks/useIPFS";

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const { data: vendor } = useFetchVendorInfo(Number(project.vendorId));

  const cid = getCidFromUri(vendor?.[1] || "");
  const { data: rawMetadata } = useFetchMetadataQuery(cid);
  const metadata = rawMetadata?.data?.valueOf() as {
    name: string;
    location: string;
  };

  const currentMilestone = project.milestones[project.currentMilestone];
  const completedMilestones = project.milestones.filter(
    (m) => m.status === MilestoneStatus.Done
  ).length;
  const progress = (completedMilestones / project.milestones.length) * 100;

  return (
    <Paper elevation={2} sx={{ p: 4, borderRadius: "1em" }}>
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Typography variant="h4" component="h1" fontWeight="bold">
            {project.title}
          </Typography>
          <Chip
            label={
              statusLabels[currentMilestone?.status || MilestoneStatus.Pending]
            }
            sx={{
              backgroundColor:
                statusColors[
                  currentMilestone?.status || MilestoneStatus.Pending
                ],
              color: "white",
              fontWeight: "bold",
            }}
          />
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {project.description}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Budget
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {formatUnits(project.budget, 6)} PYUSD
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Category
            </Typography>
            <Typography variant="h6">
              {categoryLabels[project.category]}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Start Date
            </Typography>
            <Typography variant="h6">
              {formatDate(project.startDate)}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              End Date
            </Typography>
            <Typography variant="h6">{formatDate(project.endDate)}</Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Proposer
            </Typography>
            <Typography variant="body1" fontFamily="monospace">
              {project.proposer}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Contractor
            </Typography>
            <Typography variant="body1" fontFamily="monospace">
              {`${metadata?.name} (${shortenAddress(vendor?.[0] || "0x")})`}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Overall Progress
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight="bold"
              >
                {completedMilestones}/{project.milestones.length} Milestones
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
