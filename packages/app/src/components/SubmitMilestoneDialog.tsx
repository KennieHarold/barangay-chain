"use client";

import { useState } from "react";
import { enqueueSnackbar } from "notistack";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
  Typography,
  Card,
} from "@mui/material";

import { UploadSectionTypes, UploadSection } from "./UploadSection";

interface SubmitMilestoneDialogProps {
  open: boolean;
  milestoneIndex: number | null;
  description: string;
  siteProgressFiles: File[];
  receiptFiles: File[];
  siteProgressUrls: string[];
  receiptUrls: string[];
  completionDate: string;
  loading: boolean;
  uploadingSiteProgress: boolean;
  uploadingReceipts: boolean;
  onClose: () => void;
  onDescriptionChange: (value: string) => void;
  onSiteProgressFilesChange: (files: File[]) => void;
  onReceiptFilesChange: (files: File[]) => void;
  onCompletionDateChange: (date: string) => void;
  onUploadSiteProgress: () => void;
  onUploadReceipts: () => void;
  onSubmit: () => void;
}

export function SubmitMilestoneDialog({
  open,
  milestoneIndex,
  description,
  siteProgressFiles,
  receiptFiles,
  siteProgressUrls,
  receiptUrls,
  completionDate,
  loading,
  uploadingSiteProgress,
  uploadingReceipts,
  onClose,
  onDescriptionChange,
  onSiteProgressFilesChange,
  onReceiptFilesChange,
  onCompletionDateChange,
  onUploadSiteProgress,
  onUploadReceipts,
  onSubmit,
}: SubmitMilestoneDialogProps) {
  const [siteProgressPreviews, setSiteProgressPreviews] = useState<
    Array<{ file: File; url: string } | null>
  >([null]);

  const [receiptPreviews, setReceiptPreviews] = useState<
    Array<{ file: File; url: string } | null>
  >([null, null, null]);

  const checklistItems = [
    {
      label: "Completion date provided",
      checked: !!completionDate,
    },
    {
      label: "Accomplishment description written",
      checked: !!description && description.trim().length > 0,
    },
    {
      label: "Site progress images uploaded to IPFS",
      checked: siteProgressUrls.length > 0,
    },
    {
      label: "Receipt images uploaded to IPFS",
      checked: receiptUrls.length > 0,
    },
  ];

  const allChecksPassed = checklistItems.every((item) => item.checked);

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number,
    type: UploadSectionTypes
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      enqueueSnackbar({
        message: "Please select an image",
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      });
      return;
    }

    const preview = { file, url: URL.createObjectURL(file) };

    if (type === UploadSectionTypes.SiteProgress) {
      const temp = [...siteProgressPreviews];

      if (temp[index]?.url) {
        URL.revokeObjectURL(temp[index]!.url);
      }
      temp[index] = preview;
      setSiteProgressPreviews(temp);

      const newFiles = Array.isArray(siteProgressFiles)
        ? [...siteProgressFiles]
        : [];
      newFiles[index] = file;

      onSiteProgressFilesChange(newFiles.filter((f) => f !== undefined));
    } else {
      const temp = [...receiptPreviews];

      if (temp[index]?.url) {
        URL.revokeObjectURL(temp[index]!.url);
      }
      temp[index] = preview;
      setReceiptPreviews(temp);

      const newFiles = Array.isArray(receiptFiles) ? [...receiptFiles] : [];
      newFiles[index] = file;

      onReceiptFilesChange(newFiles.filter((f) => f !== undefined));
    }
  };

  const handleRemoveFile = (index: number, type: UploadSectionTypes) => {
    if (type === UploadSectionTypes.SiteProgress) {
      const preview = siteProgressPreviews[index];
      if (preview?.url) {
        URL.revokeObjectURL(preview.url);
      }

      const temp = [...siteProgressPreviews];
      temp[index] = null;
      setSiteProgressPreviews(temp);

      const newFiles = Array.isArray(siteProgressFiles)
        ? [...siteProgressFiles]
        : [];
      newFiles[index] = undefined as any;

      onSiteProgressFilesChange(newFiles.filter((f) => f !== undefined));
    } else {
      const preview = receiptPreviews[index];
      if (preview?.url) {
        URL.revokeObjectURL(preview.url);
      }

      const temp = [...receiptPreviews];
      temp[index] = null;
      setReceiptPreviews(temp);

      const newFiles = Array.isArray(receiptFiles) ? [...receiptFiles] : [];
      newFiles[index] = undefined as any;
      onReceiptFilesChange(newFiles.filter((f) => f !== undefined));
    }
  };

  const handleDialogClose = () => {
    siteProgressPreviews.forEach((preview) => {
      if (preview?.url) {
        URL.revokeObjectURL(preview.url);
      }
    });
    receiptPreviews.forEach((preview) => {
      if (preview?.url) {
        URL.revokeObjectURL(preview.url);
      }
    });
    setSiteProgressPreviews([null]);
    setReceiptPreviews([null, null, null]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth="md" fullWidth>
      <DialogTitle>Submit Milestone {(milestoneIndex ?? 0) + 1}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
          <TextField
            label="Date Milestone Finished"
            type="date"
            value={completionDate}
            onChange={(e) => onCompletionDateChange(e.target.value)}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Accomplishment Description"
            multiline
            rows={4}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Describe the work completed for this milestone..."
            fullWidth
          />
          <UploadSection
            title="Upload Site Progress"
            inputIdPrefix="site-progress-upload"
            previews={siteProgressPreviews}
            type={UploadSectionTypes.SiteProgress}
            helpText="Select images to upload showing the progress of the work on site"
            uploading={uploadingSiteProgress}
            hasFiles={siteProgressPreviews.some((p) => p !== null)}
            isUploaded={siteProgressUrls.length > 0}
            onFileChange={(e, index) =>
              handleFileSelect(e, index, UploadSectionTypes.SiteProgress)
            }
            onUpload={onUploadSiteProgress}
            onRemove={(index: number) =>
              handleRemoveFile(index, UploadSectionTypes.SiteProgress)
            }
          />
          <UploadSection
            title="Upload Receipts"
            inputIdPrefix="receipts-upload"
            previews={receiptPreviews}
            type={UploadSectionTypes.Receipts}
            helpText="Select receipt images to upload for expenses related to this milestone"
            uploading={uploadingReceipts}
            hasFiles={receiptPreviews.some((p) => p !== null)}
            isUploaded={receiptUrls.length > 0}
            onFileChange={(e, index) =>
              handleFileSelect(e, index, UploadSectionTypes.Receipts)
            }
            onUpload={onUploadReceipts}
            onRemove={(index: number) =>
              handleRemoveFile(index, UploadSectionTypes.Receipts)
            }
          />
          <Card
            sx={{
              p: 2,
              backgroundColor: allChecksPassed
                ? "success.50"
                : "background.paper",
              borderColor: allChecksPassed ? "success.main" : "divider",
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Submission Checklist
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mb: 1.5 }}
            >
              Complete all items below before submitting the milestone:
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {checklistItems.map((item, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={item.checked}
                      disabled
                      size="small"
                      sx={{
                        color: item.checked
                          ? "success.main"
                          : "action.disabled",
                        "&.Mui-checked": {
                          color: "success.main",
                        },
                      }}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={{
                        color: item.checked ? "text.primary" : "text.secondary",
                        textDecoration: item.checked ? "none" : "none",
                      }}
                    >
                      {item.label}
                    </Typography>
                  }
                />
              ))}
            </Box>
          </Card>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>Cancel</Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={
            !completionDate ||
            !description ||
            siteProgressFiles.length === 0 ||
            receiptFiles.length === 0 ||
            loading
          }
        >
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
