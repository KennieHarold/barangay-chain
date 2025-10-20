"use client";

import { useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Button,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

interface SubmitMilestoneDialogProps {
  open: boolean;
  milestoneIndex: number | null;
  description: string;
  file: File | null;
  loading: boolean;
  onClose: () => void;
  onDescriptionChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onSubmit: () => void;
}

export function SubmitMilestoneDialog({
  open,
  milestoneIndex,
  description,
  file,
  loading,
  onClose,
  onDescriptionChange,
  onFileChange,
  onSubmit,
}: SubmitMilestoneDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onFileChange(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDialogClose = () => {
    handleRemoveFile();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
      <DialogTitle>Submit Milestone {(milestoneIndex ?? 0) + 1}</DialogTitle>
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
          <Box>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: "none" }}
              id="milestone-image-upload"
            />

            {!selectedFile ? (
              <label htmlFor="milestone-image-upload">
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{
                    py: 3,
                    borderStyle: "dashed",
                    borderWidth: 2,
                  }}
                >
                  Upload Image
                </Button>
              </label>
            ) : (
              <Box
                sx={{
                  position: "relative",
                  border: "2px solid",
                  borderColor: "primary.main",
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                <IconButton
                  onClick={handleRemoveFile}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: "background.paper",
                    "&:hover": {
                      bgcolor: "error.light",
                      color: "white",
                    },
                  }}
                  size="small"
                >
                  <CloseIcon />
                </IconButton>

                {previewUrl && (
                  <Box
                    component="img"
                    src={previewUrl}
                    alt="Preview"
                    sx={{
                      width: "100%",
                      maxHeight: 300,
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                )}

                <Box sx={{ p: 2, bgcolor: "background.default" }}>
                  <Typography variant="body2" noWrap>
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
          <Alert severity="info">
            Upload an image showing your milestone deliverables
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>Cancel</Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={!file || !description || loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
