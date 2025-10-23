"use client";

import { Address } from "viem";
import { Box, Button, Alert, Divider, Typography } from "@mui/material";
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
} from "@mui/icons-material";

import { Project } from "@/models";
import { useHasUserVoted } from "@/hooks/useBarangayChain";

interface VotingSectionProps {
  projectId: number;
  milestoneIndex: number;
  milestone: Project["milestones"][0];
  userAddress: Address;
  isVerifyingMilestone: boolean;
  onVerify: (consensus: boolean) => void;
}

export function VotingSection({
  projectId,
  milestoneIndex,
  milestone,
  userAddress,
  isVerifyingMilestone,
  onVerify,
}: VotingSectionProps) {
  const { data: hasVoted } = useHasUserVoted(
    projectId,
    milestoneIndex,
    userAddress
  );

  return (
    <Box sx={{ mb: 2 }}>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2" gutterBottom>
        Community Verification
      </Typography>
      {hasVoted && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You have already voted on this milestone
        </Alert>
      )}
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <Button
          variant="outlined"
          color="success"
          startIcon={<ThumbUpIcon />}
          onClick={() => onVerify(true)}
          disabled={hasVoted || isVerifyingMilestone}
          sx={{
            "&.Mui-disabled": {
              borderColor: "success.main",
              color: "success.main",
              opacity: 0.8,
            },
          }}
        >
          {isVerifyingMilestone ? "Voting..." : `Upvote (${milestone.upvotes})`}
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<ThumbDownIcon />}
          onClick={() => onVerify(false)}
          disabled={hasVoted || isVerifyingMilestone}
          sx={{
            "&.Mui-disabled": {
              borderColor: "error.main",
              color: "error.main",
              opacity: 0.8,
            },
          }}
        >
          {isVerifyingMilestone
            ? "Voting..."
            : `Downvote (${milestone.downvotes})`}
        </Button>
      </Box>
    </Box>
  );
}
