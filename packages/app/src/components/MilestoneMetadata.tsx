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
} from "@mui/material";
import { useState } from "react";

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

function MilestoneDetailsModal({
  open,
  onClose,
  metadata,
}: {
  open: boolean;
  onClose: () => void;
  metadata: MetadataContent;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Milestone Details</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Completion Date
            </Typography>
            <Typography variant="body2">
              {new Date(metadata.completionDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>
          </Box>
          {metadata.description && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Description
              </Typography>
              <Typography variant="body2">{metadata.description}</Typography>
            </Box>
          )}

          {metadata.siteProgressUrls &&
            metadata.siteProgressUrls.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Site Progress Images
                </Typography>
                <ImageList cols={3} gap={8} sx={{ mt: 1 }}>
                  {metadata.siteProgressUrls.map((url, index) => (
                    <ImageListItem key={index}>
                      <img
                        src={url}
                        alt={`Site progress ${index + 1}`}
                        loading="lazy"
                        style={{
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            )}

          {metadata.receiptUrls && metadata.receiptUrls.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Receipt Images
              </Typography>
              <ImageList cols={3} gap={8} sx={{ mt: 1 }}>
                {metadata.receiptUrls.map((url, index) => (
                  <ImageListItem key={index}>
                    <img
                      src={url}
                      alt={`Receipt ${index + 1}`}
                      loading="lazy"
                      style={{
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
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
