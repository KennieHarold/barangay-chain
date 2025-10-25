"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Container, Grid, Card, Button } from "@mui/material";
import { Address, formatUnits } from "viem";
import {
  AssignmentTurnedIn as ProjectIcon,
  AttachMoney as MoneyIcon,
  Badge as BadgeIcon,
} from "@mui/icons-material";

import { useBalanceOf } from "@/hooks/useCitizenNFT";
import {
  useFetchExpensesPerCategory,
  useFetchTreasuryBudget,
} from "@/hooks/useTreasury";
import { StatCard } from "./StatCard";
import { ExpensesPieChart } from "./ExpensesPieChart";
import { CitizenIdModal } from "./CitizenIdModal";
import { useProjectCounter } from "@/hooks/useBarangayChain";

export function Dashboard() {
  const { address } = useAccount();
  const { data: nftBalance } = useBalanceOf(address as Address);
  const { data: treasuryBudget } = useFetchTreasuryBudget();
  const { data: totalProjects } = useProjectCounter();
  const { data: expensesByCategory, total: totalExpenses } =
    useFetchExpensesPerCategory();

  const [openModal, setOpenModal] = useState(false);
  const [mounted, setMounted] = useState(false);

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
      <Grid container spacing={3} paddingX={{ xs: 2, sm: 4, md: 2, lg: 12 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ExpensesPieChart data={expensesByCategory} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <StatCard
                title="Budget Left (PYUSD)"
                value={parseFloat(
                  String(formatUnits(treasuryBudget || BigInt(0), 6))
                ).toFixed(2)}
                icon={<MoneyIcon sx={{ fontSize: 40, color: "white" }} />}
                color="#6BCB77"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <StatCard
                title="Released Funds (PYUSD)"
                value={parseFloat(String(totalExpenses || 0)).toFixed(2)}
                icon={<MoneyIcon sx={{ fontSize: 40, color: "white" }} />}
                color="#4D96FF"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <StatCard
                title="Total Projects"
                value={Number(totalProjects || 0)}
                icon={<ProjectIcon sx={{ fontSize: 40, color: "white" }} />}
                color="#FF8C42"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 2,
                  height: "100%",
                }}
              >
                <BadgeIcon sx={{ fontSize: 48, color: "#C77DFF" }} />
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleOpenModal}
                  disabled={!isCitizen}
                  sx={{
                    backgroundColor: "#C77DFF",
                    color: "#000",
                    "&:hover": {
                      backgroundColor: "#C77DFF",
                    },
                  }}
                >
                  View Citizen ID
                </Button>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <CitizenIdModal open={openModal} onClose={handleCloseModal} />
    </Container>
  );
}
