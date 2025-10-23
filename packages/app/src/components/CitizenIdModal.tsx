import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

interface CitizenIdModalProps {
  open: boolean;
  onClose: () => void;
}

export function CitizenIdModal({ open, onClose }: CitizenIdModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Citizen ID
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary" paragraph>
            This is a test modal for viewing Citizen ID.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The actual Citizen ID content will be implemented here.
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
