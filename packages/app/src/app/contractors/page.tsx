"use client";

import { useState, useEffect } from "react";
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
} from "@mui/material";
import { Receipt as ReceiptIcon } from "@mui/icons-material";

import { Navbar } from "@/components/Navbar";
import { shortenAddress } from "@/utils/format";
import { Contractor } from "@/models";

const MOCK_CONTRACTORS: Contractor[] = [
  {
    id: 1,
    name: "ABC Construction Corp.",
    address: "123 Main Street, Barangay San Jose, Quezon City",
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
    totalProjects: 12,
    totalDisbursement: "1,250,000.00",
  },
  {
    id: 2,
    name: "BuildRight Solutions Inc.",
    address: "456 Commerce Ave, Barangay Poblacion, Makati City",
    walletAddress: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    totalProjects: 8,
    totalDisbursement: "875,500.50",
  },
  {
    id: 3,
    name: "Greenfield Infrastructure",
    address: "789 Industrial Road, Barangay Bagumbayan, Taguig City",
    walletAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    totalProjects: 15,
    totalDisbursement: "2,100,750.25",
  },
  {
    id: 4,
    name: "Urban Builders Co.",
    address: "321 Development Drive, Barangay Escopa, Pasig City",
    walletAddress: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
    totalProjects: 5,
    totalDisbursement: "425,300.00",
  },
  {
    id: 5,
    name: "Premier Works Enterprise",
    address: "654 Project Lane, Barangay New Era, Mandaluyong City",
    walletAddress: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    totalProjects: 20,
    totalDisbursement: "3,567,890.75",
  },
];

export default function RegisteredContractorsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleViewTransactionTrail = (contractor: Contractor) => {
    console.log("View transaction trail for:", contractor);
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
                    Total Projects
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
                {MOCK_CONTRACTORS.map((contractor) => (
                  <TableRow key={contractor.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {contractor.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontFamily: "monospace" }}
                        >
                          {shortenAddress(contractor.walletAddress)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography variant="body2">
                        {contractor.address}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={contractor.totalProjects}
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
                        onClick={() => handleViewTransactionTrail(contractor)}
                      >
                        Show Transaction Trail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {MOCK_CONTRACTORS.length === 0 && (
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
            Showing {MOCK_CONTRACTORS.length} contractor
            {MOCK_CONTRACTORS.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
      </Container>
    </>
  );
}
