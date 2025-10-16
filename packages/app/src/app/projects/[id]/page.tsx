"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Container, Box, Tabs, Tab } from "@mui/material";

import { mockProjects } from "@/data/mockProjects";
import { Navbar } from "@/components/Navbar";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { MilestonesTab } from "@/components/project/MilestonesTab";
import { BudgetTab } from "@/components/project/BudgetTab";
import { ActivityLogsTab } from "@/components/project/ActivityLogsTab";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [activeTab, setActiveTab] = useState(0);
  const [mounted, setMounted] = useState(false);

  // For now, using mock data
  const project = mockProjects.find((p) => p.id === parseInt(projectId));

  if (!project) {
    return (
      <Container sx={{ py: 4 }}>
        <Box>Project not found</Box>
      </Container>
    );
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? (
    <div>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ProjectHeader project={project} />

        <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 4 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Milestones" />
            <Tab label="Budget" />
            <Tab label="Activity Logs" />
          </Tabs>
        </Box>

        <Box sx={{ mt: 3 }}>
          {activeTab === 0 && <MilestonesTab project={project} />}
          {activeTab === 1 && <BudgetTab project={project} />}
          {activeTab === 2 && <ActivityLogsTab />}
        </Box>
      </Container>
    </div>
  ) : (
    <></>
  );
}
