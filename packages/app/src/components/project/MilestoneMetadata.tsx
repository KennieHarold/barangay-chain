"use client";

import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardMedia,
} from "@mui/material";

import { useFetchMetadataQuery } from "@/hooks/useIPFS";
import { getCidFromUri } from "@/utils/format";

interface MilestoneMetadataProps {
  metadataURI: string;
}

interface MetadataContent {
  description: string;
  imageUrl: string;
}

export function MilestoneMetadata({ metadataURI }: MilestoneMetadataProps) {
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
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
        Submission Details
      </Typography>
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
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Description:
          </Typography>
          <Typography variant="body2">{metadata.description}</Typography>
        </Box>
      )}
    </Box>
  );
}
