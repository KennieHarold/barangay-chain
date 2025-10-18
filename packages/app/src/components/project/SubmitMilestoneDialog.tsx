"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Button,
  Box,
} from "@mui/material";

interface SubmitMilestoneDialogProps {
  open: boolean;
  milestoneIndex: number | null;
  description: string;
  attachmentUri: string;
  onClose: () => void;
  onDescriptionChange: (value: string) => void;
  onAttachmentUriChange: (value: string) => void;
  onSubmit: () => void;
}

export function SubmitMilestoneDialog({
  open,
  milestoneIndex,
  description,
  attachmentUri,
  onClose,
  onDescriptionChange,
  onAttachmentUriChange,
  onSubmit,
}: SubmitMilestoneDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Submit Milestone {(milestoneIndex ?? 0) + 1}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Description"
            multiline
            rows={4}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Describe the work completed for this milestone..."
            fullWidth
          />
          <TextField
            label="Attachment URI (URL)"
            value={attachmentUri}
            onChange={(e) => onAttachmentUriChange(e.target.value)}
            placeholder="https://..."
            required
            fullWidth
          />
          <Alert severity="info">
            Upload your milestone deliverables here
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" disabled={!attachmentUri}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
