"use client";

import { Address } from "viem";
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
  Alert,
} from "@mui/material";

import { shortenAddress } from "@/utils/format";
import { mockLogs } from "@/data/mockLogs";

export function ActivityLogsTab() {
  const getEventColor = (event: string) => {
    switch (event) {
      case "ProjectCreated":
        return "primary";
      case "MilestoneSubmitted":
        return "info";
      case "MilestoneVerified":
        return "success";
      case "MilestoneCompleted":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Activity logs are fetched from smart contract events. All actions are
        recorded on the blockchain.
      </Alert>

      <Paper elevation={1} sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            Project Activity
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Event</strong>
                </TableCell>
                <TableCell>
                  <strong>Timestamp</strong>
                </TableCell>
                <TableCell>
                  <strong>Actor</strong>
                </TableCell>
                <TableCell>
                  <strong>Details</strong>
                </TableCell>
                <TableCell>
                  <strong>Transaction</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary" py={4}>
                      No activity logs yet
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                mockLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Chip
                        label={log.event}
                        color={getEventColor(log.event)}
                        size="small"
                        sx={{ fontWeight: "bold" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {log.timestamp.toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {log.timestamp.toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontFamily="monospace"
                        sx={{
                          cursor: "pointer",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        {shortenAddress(log.sender as Address)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{log.details}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontFamily="monospace"
                        sx={{
                          cursor: "pointer",
                          color: "primary.main",
                          "&:hover": { textDecoration: "underline" },
                        }}
                        component="a"
                        href={`https://sepolia.arbiscan.io/tx/${log.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {shortenAddress(log.txHash as Address)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
