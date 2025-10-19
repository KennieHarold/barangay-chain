"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Address } from "viem";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Alert,
  Divider,
} from "@mui/material";
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Upload as UploadIcon,
} from "@mui/icons-material";

import { Project, MilestoneStatus, UserRole } from "@/models";
import { statusColors, statusLabels } from "@/constants/project";
import { SubmitMilestoneDialog } from "@/components/project/SubmitMilestoneDialog";
import { useHasRole } from "@/hooks/useBarangayChain";
import { useBalanceOf } from "@/hooks/useCitizenNFT";

interface MilestonesTabProps {
  project: Project;
}

export function MilestonesTab({ project }: MilestonesTabProps) {
  const { address } = useAccount();
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState<
    number | null
  >(null);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const { data: isContractor } = useHasRole(
    UserRole.Contractor,
    address as Address
  );
  const { data: isOfficial } = useHasRole(
    UserRole.Official,
    address as Address
  );
  const { data: nftBalance } = useBalanceOf(address as Address);
  const isCitizen = BigInt(nftBalance || 0) > BigInt(0);

  const handleOpenSubmitDialog = (milestoneIndex: number) => {
    setSelectedMilestoneIndex(milestoneIndex);
    setSubmitDialogOpen(true);
  };

  const handleCloseSubmitDialog = () => {
    setSubmitDialogOpen(false);
    setSelectedMilestoneIndex(null);
    setDescription("");
    setFile(null);
  };

  const handleSubmitMilestone = () => {};

  const handleCompleteMilestone = (_milestoneIndex: number) => {};

  const handleVote = (_milestoneIndex: number, _consensus: boolean) => {};

  return (
    <Box>
      {!address && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Connect your wallet to interact with milestones
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {project.milestones.map((milestone, index) => (
          <Card
            key={index}
            variant="outlined"
            sx={{
              borderRadius: 2,
              borderWidth: 2,
              borderColor:
                index === project.currentMilestone ? "primary.main" : "divider",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Milestone {index + 1}
                    {index === project.currentMilestone && (
                      <Chip
                        label="Current"
                        size="small"
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Release: {milestone.releaseBps / 100}% of budget
                  </Typography>
                </Box>
                <Chip
                  label={statusLabels[milestone.status]}
                  sx={{
                    backgroundColor: statusColors[milestone.status],
                    color: "white",
                    fontWeight: "bold",
                  }}
                />
              </Box>

              {milestone?.metadataURI && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Metadata URI: {milestone.metadataURI}
                </Typography>
              )}

              {milestone.status === MilestoneStatus.ForVerification &&
                isCitizen &&
                address && (
                  <Box sx={{ mb: 2 }}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Community Verification
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                      <Button
                        variant="outlined"
                        color="success"
                        startIcon={<ThumbUpIcon />}
                        onClick={() => handleVote(index, true)}
                        disabled={!isCitizen}
                      >
                        Upvote ({milestone.upvotes})
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<ThumbDownIcon />}
                        onClick={() => handleVote(index, false)}
                        disabled={!isCitizen}
                      >
                        Downvote ({milestone.downvotes})
                      </Button>
                    </Box>
                  </Box>
                )}

              {isContractor &&
                index === project.currentMilestone &&
                milestone.status === MilestoneStatus.Pending && (
                  <Box
                    sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
                  >
                    <Button
                      variant="contained"
                      startIcon={<UploadIcon />}
                      onClick={() => handleOpenSubmitDialog(index)}
                    >
                      Submit Milestone
                    </Button>
                  </Box>
                )}

              {isOfficial &&
                milestone.status === MilestoneStatus.ForVerification && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handleCompleteMilestone(index)}
                      fullWidth
                    >
                      Complete Milestone
                    </Button>
                  </Box>
                )}
            </CardContent>
          </Card>
        ))}
      </Box>

      <SubmitMilestoneDialog
        open={submitDialogOpen}
        milestoneIndex={selectedMilestoneIndex}
        description={description}
        file={file}
        onClose={handleCloseSubmitDialog}
        onDescriptionChange={setDescription}
        onFileChange={setFile}
        onSubmit={handleSubmitMilestone}
      />
    </Box>
  );
}
