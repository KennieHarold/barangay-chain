"use client";

import { useMemo } from "react";
import { formatUnits } from "viem";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  LinearProgress,
} from "@mui/material";

import { MilestoneStatus, Project } from "@/models";
import { useFetchAmountFundsReleased } from "@/hooks/useBarangayChain";

interface BudgetTabProps {
  project: Project;
}

export function BudgetTab({ project }: BudgetTabProps) {
  const totalBudget = Number(formatUnits(project.budget, 6));
  const advancePayment = Number(formatUnits(project.advancePayment, 6));
  const advancePaymentReleaseBps = (advancePayment / totalBudget) * 100;

  const advancePaymentSchedule = [
    {
      label: "Advance Payment",
      releasePercentage: advancePaymentReleaseBps,
      releaseAmount: advancePayment,
      cumulativeRelease: advancePayment,
      status: MilestoneStatus.Done,
      isReleased: true,
    },
  ];

  const milestoneBudgetSchedule = useMemo(
    () =>
      project.milestones.map((milestone, index) => {
        const releasePercentage = milestone.releaseBps / 100;
        const releaseAmount = (totalBudget * releasePercentage) / 100;

        return {
          label:
            index === project.milestoneCount - 1
              ? "Final Payment"
              : `Milestone ${index + 1}`,
          releasePercentage,
          releaseAmount,
          cumulativeRelease: 0,
          status: milestone.status,
          isReleased:
            project.currentMilestone === project.milestoneCount - 1 &&
            releaseAmount === 0
              ? true
              : milestone.isReleased,
        };
      }),
    [project]
  );

  const budgetSchedule = useMemo(
    () =>
      advancePaymentSchedule
        .concat(milestoneBudgetSchedule)
        .map((item, index, arr) => {
          if (index === 0) {
            return item;
          }
          const cumulativeRelease = arr
            .slice(0, index + 1)
            .reduce((sum, curr) => sum + curr.releaseAmount, 0);
          return {
            ...item,
            cumulativeRelease,
          };
        }),
    [advancePaymentSchedule, milestoneBudgetSchedule]
  );

  const { data: totalReleasedRaw } = useFetchAmountFundsReleased(project.id);
  const totalReleased = parseFloat(
    formatUnits(totalReleasedRaw || BigInt(0), 6)
  );
  const releaseProgress = (totalReleased / totalBudget) * 100;

  return (
    <Box>
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: "1em" }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Budget Overview
        </Typography>
        <Box sx={{ display: "flex", gap: 12, mb: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Total Budget
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {totalBudget.toFixed(2)} PYUSD
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Released
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="success.main">
              {totalReleased.toFixed(2)} PYUSD
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Remaining
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="warning.main">
              {(totalBudget - totalReleased).toFixed(2)} PYUSD
            </Typography>
          </Box>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Release Progress
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <LinearProgress
              variant="determinate"
              value={releaseProgress}
              sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" fontWeight="bold">
              {releaseProgress.toFixed(1)}%
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={1} sx={{ borderRadius: "1em" }}>
        <Box
          sx={{
            p: 2,
            bgcolor: "grey.50",
            borderTopRightRadius: "1em",
            borderTopLeftRadius: "1em",
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Fund Release Schedule
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Milestone</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Release %</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Release Amount</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Cumulative Release</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Status</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {budgetSchedule.map((item, index) => (
                <TableRow key={`milestone-actual-index-${index}`}>
                  <TableCell>
                    <Typography fontWeight="medium">{item.label}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography>{item.releasePercentage}%</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold">
                      {item.releaseAmount.toFixed(2)} PYUSD
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography color="text.secondary">
                      {item.cumulativeRelease.toFixed(2)} PYUSD
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {item.isReleased ? (
                      <Chip
                        label="Released"
                        color="success"
                        size="small"
                        sx={{ fontWeight: "bold" }}
                      />
                    ) : (
                      <Chip
                        label="Pending"
                        color="default"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
