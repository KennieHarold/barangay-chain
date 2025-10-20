"use client";

import { useEffect, useState } from "react";
import { Box, Container, Grid, Typography } from "@mui/material";
import { ProjectCard } from "./ProjectCard";
import { mockProjects } from "@/data/mockProjects";
import { useProjectCounter } from "@/hooks/useBarangayChain";

export function ProjectsList() {
  const [mounted, setMounted] = useState(false);
  const { data: projectLength } = useProjectCounter();
  const projectIds = Array.from(
    { length: parseInt(projectLength?.toString() || "0") },
    (_, i) => i + 1
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {projectIds.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            backgroundColor: "background.paper",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" color="text.secondary">
            No projects found
          </Typography>
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
  ) : (
    <></>
  );
}
