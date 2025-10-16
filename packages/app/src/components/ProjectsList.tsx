"use client";

import { useEffect, useState } from "react";
import { Box, Container, Grid, Typography } from "@mui/material";
import { ProjectCard } from "./ProjectCard";
import { mockProjects } from "@/data/mockProjects";

export function ProjectsList() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {mockProjects.length === 0 ? (
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
          {mockProjects.map((project) => (
            <Grid key={project.id} size={{ md: 4 }}>
              <ProjectCard project={project} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  ) : (
    <></>
  );
}
