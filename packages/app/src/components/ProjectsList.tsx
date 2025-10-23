"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  CircularProgress,
} from "@mui/material";
import { ProjectCard } from "./ProjectCard";
import { useProjectCounter } from "@/hooks/useBarangayChain";

export function ProjectsList() {
  const [mounted, setMounted] = useState(false);
  const { data: projectLength, isLoading } = useProjectCounter();
  const projectIds = Array.from(
    { length: parseInt(projectLength?.toString() || "0") },
    (_, i) => i + 1
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <></>;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, paddingX: 12 }}>
        <Typography variant="h5" fontWeight="bold">
          Active Projects
        </Typography>
      </Box>

      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 8,
          }}
        >
          <CircularProgress size={48} />
        </Box>
      ) : projectIds.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            paddingX: 12,
          }}
        >
          <Box
            sx={{
              backgroundColor: "background.paper",
              borderRadius: 2,
              py: 8,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No projects found
            </Typography>
          </Box>
        </Box>
      ) : (
        <Grid container spacing={3} paddingX={12}>
          {projectIds.map((id) => (
            <Grid key={id} size={{ md: 4 }}>
              <ProjectCard projectId={id} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
