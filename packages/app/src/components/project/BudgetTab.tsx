"use client";

import { useMemo } from "react";
import { formatEther, parseEther } from "viem";
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

interface BudgetTabProps {
  project: Project;
}

export function BudgetTab({ project }: BudgetTabProps) {
  const totalBudget = Number(formatEther(project.budget));
  const advancePayment = Number(formatEther(project.advancePayment));
  const advancePaymentReleaseBps = (advancePayment / totalBudget) * 100;

  const advancePaymentSchedule = [
    {
      label: "Advance Payment",
      releasePercentage: advancePaymentReleaseBps,
      releaseAmount: advancePayment,
      cumulativeRelease: 0,
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
          isReleased: milestone.isReleased,
        };
      }),
    [project]
  );

  const budgetSchedule = advancePaymentSchedule.concat(milestoneBudgetSchedule);
  const totalReleased = budgetSchedule
    .filter((item) => item.isReleased)
    .reduce((sum, item) => sum + item.releaseAmount, 0);

  const releaseProgress = (totalReleased / totalBudget) * 100;

  return (
    <Box>
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
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

      <Paper elevation={1} sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 2 }}>
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
                <TableRow
                  key={`milestone-actual-index-${index}`}
                  sx={{
                    backgroundColor: item.isReleased
                      ? "success.light"
                      : "inherit",
                    opacity: item.isReleased ? 0.8 : 1,
                  }}
                >
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
