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
import { useFetchProjectEventLogs } from "@/hooks/useBarangayChain";
import {
  getActorFromEventArgs,
  getDetailsFromEventName,
  getEventColor,
} from "@/utils/events";

interface ActivityLogsTabProps {
  projectId: number;
}

export function ActivityLogsTab({ projectId }: ActivityLogsTabProps) {
  const { data: logs } = useFetchProjectEventLogs(projectId);

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
              {logs && logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary" py={4}>
                      No activity logs yet
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                logs?.map((log) => (
                  <TableRow key={log.transactionHash} hover>
                    <TableCell>
                      <Chip
                        label={log.eventName}
                        color={getEventColor(log.eventName)}
                        size="small"
                        sx={{ fontWeight: "bold" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {log.timestamp.toLocaleDateString()}
                        {" - "}
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
                        {shortenAddress(
                          getActorFromEventArgs(log.eventName, log.args)
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getDetailsFromEventName(log.eventName)}
                      </Typography>
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
                        href={`https://sepolia.arbiscan.io/tx/${log.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {shortenAddress(log.transactionHash as Address)}
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
