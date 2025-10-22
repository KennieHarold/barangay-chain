import { Box, IconButton, Typography } from "@mui/material";
import {
  Close as CloseIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
} from "@mui/icons-material";

interface UploadSlotProps {
  preview: { file: File; url: string } | null;
  inputId: string;
  slotIndex: number;
  onRemove: () => void;
}

export function UploadSlot({
  preview,
  inputId,
  slotIndex,
  onRemove,
}: UploadSlotProps) {
  return (
    <Box
      sx={{
        ...baseBoxStyles,
        borderColor: preview ? "primary.main" : "grey.400",
        bgcolor: preview ? "grey.50" : "grey.50",
        "&:hover": {
          borderColor: "primary.main",
          bgcolor: preview ? "grey.50" : "grey.100",
        },
      }}
    >
      {preview ? (
        <>
          <IconButton
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove();
            }}
            sx={{
              position: "absolute",
              top: 4,
              right: 4,
              bgcolor: "background.paper",
              "&:hover": {
                bgcolor: "error.light",
                color: "white",
              },
              zIndex: 2,
              padding: 0.5,
            }}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          <Box
            component="img"
            src={preview.url}
            alt={`Preview ${slotIndex + 1}`}
            sx={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />
        </>
      ) : (
        <label
          htmlFor={inputId}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <AddPhotoAlternateIcon
            sx={{ fontSize: 32, color: "grey.500", mb: 0.5 }}
          />
          <Typography variant="caption" color="text.secondary">
            Select Image
          </Typography>
        </label>
      )}
    </Box>
  );
}

const baseBoxStyles = {
  position: "relative",
  border: "2px dashed",
  borderRadius: 1,
  overflow: "hidden",
  height: 120,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};
