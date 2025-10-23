"use client";

import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardMedia,
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
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Submission Details
        </Typography>
        {metadata.completionDate && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Completion Date:
            </Typography>
            <Typography variant="body2">
              {new Date(metadata.completionDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>
          </Box>
        )}
        {metadata.imageUrl && (
          <Card sx={{ mb: 2, maxWidth: 200 }}>
            <CardMedia
              component="img"
              image={metadata.imageUrl}
              alt="Milestone submission"
              sx={{
                objectFit: "contain",
                maxHeight: 100,
              }}
            />
          </Card>
        )}
        {metadata.description && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Description:
            </Typography>
            <Typography variant="body2">{metadata.description}</Typography>
          </Box>
        )}
        <Button
          variant="outlined"
          size="small"
          onClick={() => setModalOpen(true)}
          sx={{ mt: 1 }}
        >
          See More Details
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
