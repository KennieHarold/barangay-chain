"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Container, Grid, Paper, Button } from "@mui/material";
import { Address } from "viem";
import {
  AssignmentTurnedIn as ProjectIcon,
  AttachMoney as MoneyIcon,
  Badge as BadgeIcon,
} from "@mui/icons-material";

import { useBalanceOf } from "@/hooks/useCitizenNFT";
import { useFetchExpensesPerCategory } from "@/hooks/useTreasury";
import { StatCard } from "./StatCard";
import { ExpensesPieChart } from "./ExpensesPieChart";
import { CitizenIdModal } from "./CitizenIdModal";

export function Dashboard() {
  const { address } = useAccount();
  const { data: nftBalance } = useBalanceOf(address as Address);
  const { data: expensesByCategory, total: totalExpenses } =
    useFetchExpensesPerCategory();

  const [openModal, setOpenModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const completedProjects = 12;
  const activeProjects = 8;
  const isCitizen = BigInt(nftBalance || 0) > BigInt(0);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <></>;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={3} paddingX={12}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ExpensesPieChart data={expensesByCategory} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <StatCard
                title="Total Projects Done"
                value={completedProjects}
                icon={<ProjectIcon sx={{ fontSize: 40, color: "white" }} />}
                color="#10B981"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <StatCard
                title="Total Expenses (PYUSD)"
                value={parseFloat(String(totalExpenses || 0)).toFixed(2)}
                icon={<MoneyIcon sx={{ fontSize: 40, color: "white" }} />}
                color="#3B82F6"
                valueVariant="h5"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <StatCard
                title="Active Projects"
                value={activeProjects}
                icon={<ProjectIcon sx={{ fontSize: 40, color: "white" }} />}
                color="#F59E0B"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 2,
                  borderRadius: 2,
                  height: "100%",
                }}
              >
                <BadgeIcon sx={{ fontSize: 48, color: "#8B5CF6" }} />
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleOpenModal}
                  disabled={!isCitizen}
                  sx={{
                    backgroundColor: "#8B5CF6",
                    "&:hover": {
                      backgroundColor: "#7C3AED",
                    },
                  }}
                >
                  View Citizen ID
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <CitizenIdModal open={openModal} onClose={handleCloseModal} />
    </Container>
  );
}
