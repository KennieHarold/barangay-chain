"use client";

import { useEffect, useState } from "react";
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
import { useNotification } from "@blockscout/app-sdk";
import { enqueueSnackbar } from "notistack";

import { Project, MilestoneStatus, UserRole } from "@/models";
import { statusColors, statusLabels } from "@/constants/project";
import { SubmitMilestoneDialog } from "@/components/SubmitMilestoneDialog";
import { MilestoneMetadata } from "@/components/MilestoneMetadata";
import { VotingSection } from "@/components/VotingSection";
import {
  useCompleteMilestone,
  useHasRole,
  useSubmitMilestone,
  useVerifyMilestone,
} from "@/hooks/useBarangayChain";
import { useBalanceOf } from "@/hooks/useCitizenNFT";
import { useUploadImageMutation, useUploadJsonMutation } from "@/hooks/useIPFS";
import { DEFAULT_CHAIN_ID } from "@/lib/providers";

interface MilestonesTabProps {
  project: Project;
  refetch: () => Promise<void>;
}

export function MilestonesTab({ project, refetch }: MilestonesTabProps) {
  const { address } = useAccount();
  const { openTxToast } = useNotification();
  const { data: isOfficial } = useHasRole(
    UserRole.Official,
    address as Address
  );
  const { data: nftBalance } = useBalanceOf(address as Address);

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
  const [completionDate, setCompletionDate] = useState("");
  const [siteProgressFiles, setSiteProgressFiles] = useState<File[]>([]);
  const [receiptFiles, setReceiptFiles] = useState<File[]>([]);
  const [uploadingSiteProgress, setUploadingSiteProgress] = useState(false);
  const [uploadingReceipts, setUploadingReceipts] = useState(false);
  const [siteProgressUrls, setSiteProgressUrls] = useState<string[]>([]);
  const [receiptUrls, setReceiptUrls] = useState<string[]>([]);

  const isContractor = address === project.vendor;
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
    setCompletionDate("");
    setSiteProgressFiles([]);
    setReceiptFiles([]);
    setSiteProgressUrls([]);
    setReceiptUrls([]);
  };

  const handleUploadSiteProgress = async () => {
    try {
      if (siteProgressFiles.length === 0) {
        throw new Error("No site progress files selected");
      }

      setUploadingSiteProgress(true);
      const uploadedUrls: string[] = [];

      for (const file of siteProgressFiles) {
        const url = await uploadImageMutate(file);
        uploadedUrls.push(url);
      }

      setSiteProgressUrls(uploadedUrls);
      enqueueSnackbar({
        message: "Site progress images uploaded successfully",
        variant: "success",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar({
        message: `Error uploading site progress: ${error}`,
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    } finally {
      setUploadingSiteProgress(false);
    }
  };

  const handleUploadReceipts = async () => {
    try {
      if (receiptFiles.length === 0) {
        throw new Error("No receipt files selected");
      }

      setUploadingReceipts(true);
      const uploadedUrls: string[] = [];

      for (const file of receiptFiles) {
        const url = await uploadImageMutate(file);
        uploadedUrls.push(url);
      }

      setReceiptUrls(uploadedUrls);
      enqueueSnackbar({
        message: "Receipt images uploaded successfully",
        variant: "success",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    } catch (error) {
      console.error(error);
      enqueueSnackbar({
        message: `Error uploading receipts: ${error}`,
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    } finally {
      setUploadingReceipts(false);
    }
  };

  const handleSubmitMilestone = async () => {
    try {
      if (!description || !completionDate) {
        throw new Error("Please fill in all required fields");
      }
      if (siteProgressUrls.length === 0 || receiptUrls.length === 0) {
        throw new Error("Please upload both site progress and receipt images");
      }

      const metadataUrl = await uploadJsonMutate({
        description,
        completionDate,
        siteProgressUrls,
        receiptUrls,
      });

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

  useEffect(() => {
    if (submitHash) {
      handleCloseSubmitDialog();
      openTxToast(DEFAULT_CHAIN_ID.toString(), submitHash);
    }
  }, [submitHash]);

  useEffect(() => {
    if (verifyHash) {
      openTxToast(DEFAULT_CHAIN_ID.toString(), verifyHash);
    }
  }, [verifyHash]);

  useEffect(() => {
    if (completeHash) {
      openTxToast(DEFAULT_CHAIN_ID.toString(), completeHash);
    }
  }, [completeHash]);

  useEffect(() => {
    if (
      isSuccessfullySubmitted ||
      isSuccessfullyVerified ||
      isSuccessfullyCompleted
    ) {
      refetch();
    }
  }, [
    isSuccessfullySubmitted,
    isSuccessfullyVerified,
    isSuccessfullyCompleted,
  ]);

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
        completionDate={completionDate}
        siteProgressFiles={siteProgressFiles}
        receiptFiles={receiptFiles}
        siteProgressUrls={siteProgressUrls}
        receiptUrls={receiptUrls}
        uploadingSiteProgress={uploadingSiteProgress}
        uploadingReceipts={uploadingReceipts}
        onClose={handleCloseSubmitDialog}
        onDescriptionChange={setDescription}
        onCompletionDateChange={setCompletionDate}
        onSiteProgressFilesChange={setSiteProgressFiles}
        onReceiptFilesChange={setReceiptFiles}
        onUploadSiteProgress={handleUploadSiteProgress}
        onUploadReceipts={handleUploadReceipts}
        onSubmit={handleSubmitMilestone}
        loading={isSubmittingMilestone}
      />
    </Box>
  );
}
