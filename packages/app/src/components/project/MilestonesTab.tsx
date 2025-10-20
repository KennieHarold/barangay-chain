"use client";

import { useCallback, useEffect, useState } from "react";
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
} from "@mui/material";
import { Upload as UploadIcon } from "@mui/icons-material";
import { enqueueSnackbar } from "notistack";

import { Project, MilestoneStatus, UserRole } from "@/models";
import { statusColors, statusLabels } from "@/constants/project";
import { SubmitMilestoneDialog } from "@/components/project/SubmitMilestoneDialog";
import { MilestoneMetadata } from "@/components/project/MilestoneMetadata";
import { VotingSection } from "@/components/project/VotingSection";
import {
  useCompleteMilestone,
  useHasRole,
  useSubmitMilestone,
  useVerifyMilestone,
} from "@/hooks/useBarangayChain";
import { useBalanceOf } from "@/hooks/useCitizenNFT";
import { useUploadImageMutation, useUploadJsonMutation } from "@/hooks/useIPFS";
import { shortenAddress } from "@/utils/format";

interface MilestonesTabProps {
  project: Project;
}

enum MilestoneAction {
  Submit,
  Complete,
  Verify,
}

export function MilestonesTab({ project }: MilestonesTabProps) {
  const { address } = useAccount();
  const { mutateAsync: uploadImageMutate, isPending: isUploadingImage } =
    useUploadImageMutation();
  const { mutateAsync: uploadJsonMutate, isPending: isUploadingJson } =
    useUploadJsonMutation();
  const {
    mutate: submitMutate,
    hash: submitHash,
    isSuccess: isSuccessfullySubmitted,
    isPending: isSubmittingMilestone,
  } = useSubmitMilestone();
  const {
    mutate: verifyMutate,
    hash: verifyHash,
    isSuccess: isSuccessfullyVerified,
    isPending: isVerifyingMilestone,
  } = useVerifyMilestone();
  const {
    mutate: completeMutate,
    hash: completeHash,
    isSuccess: isSuccessfullyCompleted,
    isPending: isCompletingMilestone,
  } = useCompleteMilestone();

  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState<
    number | null
  >(null);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [action, setAction] = useState<MilestoneAction | null>(null);

  const isContractor = address === project.vendor;
  const { data: isOfficial } = useHasRole(
    UserRole.Official,
    address as Address
  );
  const { data: nftBalance } = useBalanceOf(address as Address);
  const isCitizen = BigInt(nftBalance || 0) > BigInt(0);

  const isSubmitMilestoneLoading =
    isUploadingImage || isUploadingJson || isSubmittingMilestone;

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

  const handleSubmitMilestone = async () => {
    try {
      if (!file || !description) {
        throw new Error("Some fields are not completed");
      }

      const imageUrl = await uploadImageMutate(file);
      const metadataUrl = await uploadJsonMutate({
        description,
        imageUrl,
      });
      setAction(MilestoneAction.Submit);
      submitMutate(project.id, metadataUrl);
    } catch (error) {
      console.error(error);
      enqueueSnackbar({
        message: `Error submitting milestone: ${error}`,
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    }
  };

  const handleVerify = (consensus: boolean) => {
    try {
      setAction(MilestoneAction.Verify);
      verifyMutate(project.id, consensus);
    } catch (error) {
      console.error(error);
      enqueueSnackbar({
        message: `Error verifying milestone: ${error}`,
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    }
  };

  const handleCompleteMilestone = () => {
    try {
      setAction(MilestoneAction.Complete);
      completeMutate(project.id);
    } catch (error) {
      console.error(error);
      enqueueSnackbar({
        message: `Error completing milestone: ${error}`,
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    }
  };

  const afterAction = useCallback(
    (hash: Address) => {
      const message =
        action === MilestoneAction.Submit
          ? "submitted"
          : action === MilestoneAction.Verify
          ? "verified"
          : action === MilestoneAction.Complete
          ? "completed"
          : "";

      if (message && action) {
        enqueueSnackbar({
          message: `Successfully ${message} milestone with transaction hash: ${shortenAddress(
            hash
          )}`,
          variant: "success",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        });
      }
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    [action]
  );

  useEffect(() => {
    if (submitHash && isSuccessfullySubmitted) {
      handleCloseSubmitDialog();
      afterAction(submitHash);
    }
  }, [submitHash, isSuccessfullySubmitted, afterAction]);

  useEffect(() => {
    if (verifyHash && isSuccessfullyVerified) {
      afterAction(verifyHash);
    }
  }, [verifyHash, isSuccessfullyVerified, afterAction]);

  useEffect(() => {
    if (completeHash && isSuccessfullyCompleted) {
      afterAction(completeHash);
    }
  }, [completeHash, isSuccessfullyCompleted, afterAction]);

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
                <MilestoneMetadata metadataURI={milestone.metadataURI} />
              )}

              {milestone.status === MilestoneStatus.ForVerification &&
                isCitizen &&
                address && (
                  <VotingSection
                    projectId={project.id}
                    milestoneIndex={index}
                    milestone={milestone}
                    userAddress={address}
                    isVerifyingMilestone={isVerifyingMilestone}
                    onVerify={handleVerify}
                  />
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
                      disabled={isSubmitMilestoneLoading}
                    >
                      {isSubmitMilestoneLoading
                        ? "Submitting..."
                        : "Submit Milestone"}
                    </Button>
                  </Box>
                )}

              {isOfficial &&
                milestone.status === MilestoneStatus.ForVerification && (
                  <Box sx={{ mt: 2 }}>
                    {milestone.upvotes <= milestone.downvotes ||
                    milestone.upvotes - milestone.downvotes < 5 ? (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        Consensus not yet reached. Requires at least 5 net
                        upvotes (upvotes - downvotes). Current:{" "}
                        {milestone.upvotes} upvotes, {milestone.downvotes}{" "}
                        downvotes ({milestone.upvotes - milestone.downvotes}{" "}
                        net)
                      </Alert>
                    ) : null}
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleCompleteMilestone}
                      fullWidth
                      disabled={
                        isCompletingMilestone ||
                        milestone.upvotes <= milestone.downvotes ||
                        milestone.upvotes - milestone.downvotes < 5
                      }
                    >
                      {isCompletingMilestone
                        ? "Processing..."
                        : "Complete Milestone"}
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
        loading={isSubmitMilestoneLoading}
      />
    </Box>
  );
}
