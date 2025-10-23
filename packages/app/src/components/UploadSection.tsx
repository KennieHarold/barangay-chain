import { Box, Typography, Button, Alert } from "@mui/material";

import { UploadSlot } from "./UploadSlot";

export enum UploadSectionTypes {
  SiteProgress,
  Receipts,
}

interface UploadSectionProps {
  title: string;
  inputIdPrefix: string;
  previews: Array<{ file: File; url: string } | null>;
  type: UploadSectionTypes;
  helpText: string;
  uploading: boolean;
  hasFiles: boolean;
  isUploaded?: boolean;
  onFileChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => void;
  onUpload: () => void;
  onRemove: (index: number) => void;
}

export function UploadSection({
  title,
  inputIdPrefix,
  previews,
  helpText,
  uploading,
  hasFiles,
  isUploaded = false,
  onFileChange,
  onUpload,
  onRemove,
}: UploadSectionProps) {
  return (
    <Box>
      <Typography variant="subtitle1" fontWeight="medium" mb={1.5}>
        {title}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns:
            previews.length === 1 ? "300px" : "repeat(3, 1fr)",
          gap: 2,
        }}
      >
        {previews.map((preview, index) => (
          <Box key={index}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onFileChange(e, index)}
              style={{ display: "none" }}
              id={`${inputIdPrefix}-${index}`}
            />
            <UploadSlot
              preview={preview}
              inputId={`${inputIdPrefix}-${index}`}
              slotIndex={index}
              onRemove={() => onRemove(index)}
            />
          </Box>
        ))}
      </Box>
      <Button
        variant="contained"
        onClick={onUpload}
        disabled={!hasFiles || uploading || isUploaded}
        fullWidth
        sx={{ mt: 2 }}
        color={isUploaded ? "success" : "primary"}
      >
        {uploading
          ? "Uploading..."
          : isUploaded
          ? "Uploaded to IPFS ✓"
          : "Upload to IPFS"}
      </Button>
      <Alert severity="info" sx={{ mt: 2 }}>
        {helpText}
      </Alert>
    </Box>
  );
}
