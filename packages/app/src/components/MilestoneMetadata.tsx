"use client";

import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ImageList,
  ImageListItem,
  IconButton,
  Chip,
  Card,
  CardContent,
  Fade,
  Backdrop,
} from "@mui/material";
import { useState } from "react";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DescriptionIcon from "@mui/icons-material/Description";
import ImageIcon from "@mui/icons-material/Image";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { useFetchMetadataQuery } from "@/hooks/useIPFS";
import { getCidFromUri } from "@/utils/format";

interface MilestoneMetadataProps {
  metadataURI: string;
}

interface MetadataContent {
  description: string;
  imageUrl?: string;
  completionDate: string;
  siteProgressUrls: string[];
  receiptUrls: string[];
}

function ImageLightbox({
  open,
  imageUrl,
  onClose,
}: {
  open: boolean;
  imageUrl: string;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: "transparent",
            boxShadow: "none",
            overflow: "hidden",
          },
        },
        backdrop: {
          sx: {
            bgcolor: "rgba(0, 0, 0, 0.9)",
          },
        },
      }}
      slots={{
        backdrop: Backdrop,
      }}
    >
      <Box sx={{ position: "relative", p: 2 }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            color: "white",
            bgcolor: "rgba(0, 0, 0, 0.5)",
            "&:hover": {
              bgcolor: "rgba(0, 0, 0, 0.7)",
            },
            zIndex: 1,
          }}
        >
          <CloseIcon />
        </IconButton>
        <img
          src={imageUrl}
          alt="Full size"
          style={{
            width: "100%",
            height: "auto",
            maxHeight: "90vh",
            objectFit: "contain",
            borderRadius: "8px",
          }}
        />
      </Box>
    </Dialog>
  );
}

function MilestoneDetailsModal({
  open,
  onClose,
  metadata,
}: {
  open: boolean;
  onClose: () => void;
  metadata: MetadataContent;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const handleImageClick = (url: string) => {
    setSelectedImage(url);
    setLightboxOpen(true);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        slots={{
          transition: Fade,
        }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography fontWeight="600">Milestone Details</Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2,
                borderColor: "divider",
                transition: "all 0.2s",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1.5,
                  }}
                >
                  <CalendarTodayIcon
                    sx={{ fontSize: 20, color: "primary.main" }}
                  />
                  <Typography variant="subtitle1" fontWeight="600">
                    Completion Date
                  </Typography>
                </Box>
                <Chip
                  label={new Date(metadata.completionDate).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 500 }}
                />
              </CardContent>
            </Card>

            {metadata.description && (
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  borderColor: "divider",
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <DescriptionIcon
                      sx={{ fontSize: 20, color: "primary.main" }}
                    />
                    <Typography variant="subtitle1" fontWeight="600">
                      Description
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.7 }}
                  >
                    {metadata.description}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {metadata.siteProgressUrls &&
              metadata.siteProgressUrls.length > 0 && (
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    borderColor: "divider",
                    transition: "all 0.2s",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <ImageIcon sx={{ fontSize: 20, color: "primary.main" }} />
                      <Typography variant="subtitle1" fontWeight="600">
                        Site Progress Images
                      </Typography>
                      <Chip
                        label={metadata.siteProgressUrls.length}
                        size="small"
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                    <ImageList cols={3} gap={12}>
                      {metadata.siteProgressUrls.map((url, index) => (
                        <ImageListItem
                          key={index}
                          sx={{
                            cursor: "pointer",
                            position: "relative",
                            overflow: "hidden",
                            borderRadius: 2,
                            "&:hover .image-overlay": {
                              opacity: 1,
                            },
                          }}
                          onClick={() => handleImageClick(url)}
                        >
                          <img
                            src={url}
                            alt={`Site progress ${index + 1}`}
                            loading="lazy"
                            style={{
                              height: "150px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              transition: "transform 0.3s ease",
                            }}
                          />
                          <Box
                            className="image-overlay"
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              bgcolor: "rgba(0, 0, 0, 0.5)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: 0,
                              transition: "opacity 0.3s ease",
                              borderRadius: 2,
                            }}
                          >
                            <VisibilityIcon
                              sx={{ color: "white", fontSize: 32 }}
                            />
                          </Box>
                        </ImageListItem>
                      ))}
                    </ImageList>
                  </CardContent>
                </Card>
              )}

            {metadata.receiptUrls && metadata.receiptUrls.length > 0 && (
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  borderColor: "divider",
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <ReceiptIcon sx={{ fontSize: 20, color: "primary.main" }} />
                    <Typography variant="subtitle1" fontWeight="600">
                      Receipt Images
                    </Typography>
                    <Chip
                      label={metadata.receiptUrls.length}
                      size="small"
                      color="primary"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  <ImageList cols={3} gap={12}>
                    {metadata.receiptUrls.map((url, index) => (
                      <ImageListItem
                        key={index}
                        sx={{
                          cursor: "pointer",
                          position: "relative",
                          overflow: "hidden",
                          borderRadius: 2,
                          "&:hover .image-overlay": {
                            opacity: 1,
                          },
                        }}
                        onClick={() => handleImageClick(url)}
                      >
                        <img
                          src={url}
                          alt={`Receipt ${index + 1}`}
                          loading="lazy"
                          style={{
                            height: "150px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            transition: "transform 0.3s ease",
                          }}
                        />
                        <Box
                          className="image-overlay"
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: "rgba(0, 0, 0, 0.5)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: 0,
                            transition: "opacity 0.3s ease",
                            borderRadius: 2,
                          }}
                        >
                          <VisibilityIcon
                            sx={{ color: "white", fontSize: 32 }}
                          />
                        </Box>
                      </ImageListItem>
                    ))}
                  </ImageList>
                </CardContent>
              </Card>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      <ImageLightbox
        open={lightboxOpen}
        imageUrl={selectedImage}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}

export function MilestoneMetadata({ metadataURI }: MilestoneMetadataProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const cid = getCidFromUri(metadataURI);
  const { data, isLoading, error } = useFetchMetadataQuery(cid);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="error">
          Failed to load milestone metadata
        </Typography>
      </Box>
    );
  }
  if (!data) {
    return null;
  }

  const metadata = data.data as unknown as MetadataContent;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {metadata.completionDate && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 1.5,
              py: 0.5,
              bgcolor: "grey.100",
              borderRadius: 1,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.75rem" }}
            >
              Completed:
            </Typography>
            <Typography
              variant="caption"
              fontWeight="600"
              sx={{ fontSize: "0.75rem" }}
            >
              {new Date(metadata.completionDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Typography>
          </Box>
        )}
        {metadata.description && (
          <Typography
            variant="body2"
            sx={{
              flex: 1,
              fontSize: "0.85rem",
              color: "text.secondary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "400px",
            }}
          >
            {metadata.description}
          </Typography>
        )}
        <Button
          variant="text"
          size="small"
          onClick={() => setModalOpen(true)}
          sx={{ ml: "auto", fontSize: "0.75rem" }}
        >
          View Details
        </Button>
      </Box>

      <MilestoneDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        metadata={metadata}
      />
    </>
  );
}
