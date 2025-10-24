"use client";

import { useState, useEffect } from "react";
import { Address } from "viem";
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import { Receipt as ReceiptIcon } from "@mui/icons-material";

import { Navbar } from "@/components/Navbar";
import { shortenAddress } from "@/utils/format";
import { useFetchVendorsList } from "@/hooks/useBarangayChain";
import { DEFAULT_CHAIN_ID } from "@/lib/providers";
import { useTransactionPopup } from "@blockscout/app-sdk";

export default function RegisteredContractorsPage() {
  const [mounted, setMounted] = useState(false);
  const { data: contractors, isLoading } = useFetchVendorsList();
  const { openPopup } = useTransactionPopup();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleViewTransactionTrail = (address: Address) => {
    openPopup({
      chainId: DEFAULT_CHAIN_ID.toString(),
      address,
    });
  };

  if (!mounted) {
    return <></>;
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">
            Registered Contractors
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            View all registered contractors and their project history
          </Typography>
        </Box>

        <Paper sx={{ borderRadius: "1em", overflow: "hidden" }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "0.95rem" }}>
                      Contractor Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "0.95rem" }}>
                      Address
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", fontSize: "0.95rem" }}
                      align="center"
                    >
                      Total Projects Done
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", fontSize: "0.95rem" }}
                      align="right"
                    >
                      Total Disbursement
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", fontSize: "0.95rem" }}
                      align="center"
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contractors.map((contractor) => (
                    <TableRow key={contractor.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {contractor.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography variant="body2">
                          {shortenAddress(contractor.walletAddress)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={contractor.totalProjectsDone}
                          color="primary"
                          size="small"
                          sx={{ fontWeight: "bold", minWidth: 50 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body1"
                          fontWeight="medium"
                          color="success.main"
                        >
                          {contractor.totalDisbursement} PYUSD
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<ReceiptIcon />}
                          onClick={() =>
                            handleViewTransactionTrail(contractor.walletAddress)
                          }
                        >
                          Show Transaction Trail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {contractors.length === 0 && !isLoading && (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary">
                No contractors registered yet.
              </Typography>
            </Box>
          )}
        </Paper>

        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Showing {contractors.length} contractor
            {contractors.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
      </Container>
    </>
  );
}
