"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Container, Box, Tabs, Tab } from "@mui/material";
import { zeroAddress } from "viem";

import { Navbar } from "@/components/Navbar";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { MilestonesTab } from "@/components/project/MilestonesTab";
import { BudgetTab } from "@/components/project/BudgetTab";
import { ActivityLogsTab } from "@/components/project/ActivityLogsTab";
import { useProjectData } from "@/hooks/useProjectData";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { project, refetchAll } = useProjectData(parseInt(projectId, 10));

  const [activeTab, setActiveTab] = useState(0);
  const [mounted, setMounted] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (project.proposer === zeroAddress) {
    return (
      <Container sx={{ py: 4 }}>
        <Box>Project not found</Box>
      </Container>
    );
  }

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
          {activeTab === 0 && (
            <MilestonesTab project={project} refetch={refetchAll} />
          )}
          {activeTab === 1 && <BudgetTab project={project} />}
          {activeTab === 2 && <ActivityLogsTab projectId={project.id} />}
        </Box>
      </Container>
    </div>
  ) : (
    <></>
  );
}
