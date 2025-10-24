import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Avatar,
  Divider,
} from "@mui/material";
import { useAccount } from "wagmi";
import { Close as CloseIcon } from "@mui/icons-material";

import { useTokenUri } from "@/hooks/useCitizenNFT";
import { getCidFromUri } from "@/utils/format";
import { useFetchMetadataQuery } from "@/hooks/useIPFS";

interface CitizenIdModalProps {
  open: boolean;
  onClose: () => void;
}

interface IPFSMetadata {
  firstName: string;
  middleName: string;
  lastName: string;
  birthday: string;
  address: string;
  profilePicture: string;
}

export function CitizenIdModal({ open, onClose }: CitizenIdModalProps) {
  const { address: walletAddress } = useAccount();
  const { data: tokenUri } = useTokenUri(0); // todo: Get actual token id

  const cid = getCidFromUri(tokenUri || "");
  const { data: rawMetadata } = useFetchMetadataQuery(cid);

  const {
    firstName = "",
    middleName = "",
    lastName = "",
    birthday = "",
    address = "",
    profilePicture = "",
  } = (rawMetadata?.data?.valueOf() as IPFSMetadata) ?? {};

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: "grey.500",
          zIndex: 1,
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            p: 4,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: "50%",
              bgcolor: "rgba(255, 255, 255, 0.1)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              borderRadius: "50%",
              bgcolor: "rgba(255, 255, 255, 0.1)",
            }}
          />
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography
              variant="h5"
              sx={{
                color: "white",
                fontWeight: "bold",
                textAlign: "center",
                mb: 0.5,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Barangay Citizen ID
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255, 255, 255, 0.9)",
                textAlign: "center",
                mb: 3,
              }}
            >
              Official Identification Card
            </Typography>

            <Box
              sx={{
                bgcolor: "white",
                borderRadius: 2,
                p: 3,
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Box sx={{ display: "flex", gap: 3 }}>
                <Box sx={{ flexShrink: 0 }}>
                  <Avatar
                    src={profilePicture}
                    alt={`${firstName} ${lastName}`}
                    sx={{
                      width: 120,
                      height: 120,
                      border: "4px solid",
                      borderColor: "primary.main",
                      boxShadow: 2,
                    }}
                  />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        textTransform: "uppercase",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        letterSpacing: 0.5,
                      }}
                    >
                      Full Name
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        color: "text.primary",
                        lineHeight: 1.2,
                      }}
                    >
                      {firstName} {middleName} {lastName}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          textTransform: "uppercase",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          letterSpacing: 0.5,
                        }}
                      >
                        Date of Birth
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, color: "text.primary" }}
                      >
                        {birthday}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    textTransform: "uppercase",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: 0.5,
                  }}
                >
                  Wallet Address
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "monospace",
                    bgcolor: "grey.100",
                    p: 1,
                    borderRadius: 1,
                    wordBreak: "break-all",
                    fontSize: "0.85rem",
                    color: "text.primary",
                  }}
                >
                  {walletAddress}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    textTransform: "uppercase",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    letterSpacing: 0.5,
                  }}
                >
                  Address
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, color: "text.primary" }}
                >
                  {address}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
