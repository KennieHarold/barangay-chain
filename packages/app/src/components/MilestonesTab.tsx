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
import {
  CheckCircleOutlineRounded,
  Upload as UploadIcon,
} from "@mui/icons-material";
import { useNotification } from "@blockscout/app-sdk";
import { enqueueSnackbar } from "notistack";

import { Project, MilestoneStatus, UserRole } from "@/models";
import { statusColors, statusLabels } from "@/constants/project";
import { SubmitMilestoneDialog } from "@/components/SubmitMilestoneDialog";
import { MilestoneMetadata } from "@/components/MilestoneMetadata";
import { VotingSection } from "@/components/VotingSection";
import {
  useBlockTimestamp,
  useCompleteMilestone,
  useHasRole,
  useSubmitMilestone,
  useVerifyMilestone,
} from "@/hooks/useBarangayChain";
import { useBalanceOf } from "@/hooks/useCitizenNFT";
import { useUploadImageMutation, useUploadJsonMutation } from "@/hooks/useIPFS";
import { DEFAULT_CHAIN_ID } from "@/lib/providers";
import { formatDate } from "@/utils/format";

interface MilestonesTabProps {
  project: Project;
  refetch: () => Promise<void>;
}

export function MilestonesTab({ project, refetch }: MilestonesTabProps) {
  const { address } = useAccount();
  const { openTxToast } = useNotification();
  const { data: blockTimestamp } = useBlockTimestamp();
  const { data: isOfficial } = useHasRole(
    UserRole.Official,
    address as Address
  );
  const { data: nftBalance } = useBalanceOf(address as Address);
  const { mutateAsync: uploadImageMutate } = useUploadImageMutation();
  const { mutateAsync: uploadJsonMutate, isPending: isUploadingJson } =
    useUploadJsonMutation();

  const {
    mutate: submitMutate,
    hash: submitHash,
    isSuccess: isSuccessfullySubmitted,
    isPending: isSubmittingMilestone,
    isConfirming: isConfirmingMilestoneSubmission,
  } = useSubmitMilestone();
  const {
    mutate: verifyMutate,
    hash: verifyHash,
    isSuccess: isSuccessfullyVerified,
    isPending: isVerifyingMilestone,
    isConfirming: isConfirmingVoting,
  } = useVerifyMilestone();
  const {
    mutate: completeMutate,
    hash: completeHash,
    isSuccess: isSuccessfullyCompleted,
    isPending: isCompletingMilestone,
    isConfirming: isConfirmingCompletion,
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

  const currentTimestamp = blockTimestamp || BigInt(0);
  const hasStartDatePassed = currentTimestamp >= project.startDate;
  const hasEndDatePassed = currentTimestamp > project.endDate;

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
            <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  px: 2,
                  py: 1.25,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  bgcolor:
                    index === project.currentMilestone
                      ? "primary.50"
                      : "grey.50",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ fontSize: "1.05rem" }}
                  >
                    Milestone {index + 1}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 500,
                      px: 1,
                      py: 0.25,
                      bgcolor: "background.paper",
                      borderRadius: 0.5,
                      fontSize: "0.8rem",
                    }}
                  >
                    Release {milestone.releaseBps / 100}%
                  </Typography>
                </Box>
                <Box>
                  {index === project.currentMilestone && (
                    <Chip
                      label="Current"
                      color="primary"
                      sx={{ fontWeight: 600, marginRight: 0.5 }}
                    />
                  )}
                  <Chip
                    label={statusLabels[milestone.status]}
                    sx={{
                      backgroundColor: statusColors[milestone.status],
                      color: "white",
                      fontWeight: "bold",
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ px: 2, py: 1.5 }}>
                {milestone?.metadataURI && (
                  <MilestoneMetadata metadataURI={milestone.metadataURI} />
                )}

                {milestone.status === MilestoneStatus.Pending &&
                  !milestone.metadataURI && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        py: 1,
                        px: 1.5,
                        bgcolor: "grey.100",
                        borderRadius: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "0.85rem" }}
                      >
                        This milestone has not started yet
                      </Typography>
                    </Box>
                  )}

                {milestone.status === MilestoneStatus.ForVerification &&
                  isCitizen &&
                  address && (
                    <Box sx={{ mt: 1.5 }}>
                      <VotingSection
                        projectId={project.id}
                        milestoneIndex={index}
                        milestone={milestone}
                        userAddress={address}
                        isVerifyingMilestone={
                          isVerifyingMilestone || isConfirmingVoting
                        }
                        onVerify={handleVerify}
                      />
                    </Box>
                  )}

                {isContractor &&
                  index === project.currentMilestone &&
                  milestone.status === MilestoneStatus.Pending && (
                    <Box sx={{ mt: 1.5 }}>
                      {!hasStartDatePassed && (
                        <Alert severity="warning" sx={{ mb: 1.5, py: 0.5 }}>
                          Project has not started yet. You can submit this
                          milestone starting{" "}
                          {`${formatDate(project.startDate)} UTC+0`}.
                        </Alert>
                      )}
                      {hasEndDatePassed && (
                        <Alert severity="error" sx={{ mb: 1.5, py: 0.5 }}>
                          Project deadline has passed (
                          {`${formatDate(project.endDate)} UTC+0`}). You can no
                          longer submit milestones.
                        </Alert>
                      )}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<UploadIcon />}
                          onClick={() => handleOpenSubmitDialog(index)}
                          disabled={
                            isSubmittingMilestone ||
                            isConfirmingMilestoneSubmission ||
                            !hasStartDatePassed ||
                            hasEndDatePassed
                          }
                        >
                          {isSubmittingMilestone ? "Submitting..." : "Submit"}
                        </Button>
                      </Box>
                    </Box>
                  )}

                {isOfficial &&
                  milestone.status === MilestoneStatus.ForVerification && (
                    <Box sx={{ mt: 1.5 }}>
                      {milestone.upvotes <= milestone.downvotes ||
                      milestone.upvotes - milestone.downvotes < 5 ? (
                        <Alert severity="warning" sx={{ mb: 1.5, py: 0.5 }}>
                          Consensus not reached. Need 5+ net upvotes. Current:{" "}
                          {milestone.upvotes - milestone.downvotes} net
                        </Alert>
                      ) : null}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          endIcon={<CheckCircleOutlineRounded />}
                          onClick={handleCompleteMilestone}
                          disabled={
                            isCompletingMilestone ||
                            isConfirmingCompletion ||
                            milestone.upvotes <= milestone.downvotes ||
                            milestone.upvotes - milestone.downvotes < 5
                          }
                        >
                          {isCompletingMilestone || isConfirmingCompletion
                            ? "Processing..."
                            : "Complete"}
                        </Button>
                      </Box>
                    </Box>
                  )}
              </Box>
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
        loading={
          isSubmittingMilestone ||
          isUploadingJson ||
          isConfirmingMilestoneSubmission
        }
      />
    </Box>
  );
}
