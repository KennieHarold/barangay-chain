"use client";

import { useState, useEffect } from "react";
import { isAddress } from "viem";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useAccount } from "wagmi";

import { Navbar } from "@/components/Navbar";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/models";
import { Unauthorized } from "@/components/Unauthorized";

const schema = yup.object({
  contractorName: yup.string().required("Contractor name is required"),
  contractorAddress: yup.string().required("Address is required"),
  walletAddress: yup
    .string()
    .required("Wallet address is required")
    .test("is-valid-address", "Invalid Ethereum address", (value) => {
      if (!value) {
        return false;
      }
      return isAddress(value);
    }),
});

type FormData = yup.InferType<typeof schema>;

export default function ManageContractorsPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { role, isLoading: isCheckingRole } = useUserRole(address);

  const [mounted, setMounted] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      contractorName: "",
      contractorAddress: "",
      walletAddress: "",
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = (data: FormData) => {
    console.log({
      name: data.contractorName,
      address: data.contractorAddress,
      walletAddress: data.walletAddress,
    });

    reset();
  };

  if (isCheckingRole || !mounted) {
    return <></>;
  }
  if (role !== UserRole.Official) {
    return <Unauthorized />;
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => router.back()}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold">
            Add Contractor
          </Typography>
        </Box>
        <Paper sx={{ p: 4, borderRadius: "1em" }}>
          <Typography variant="h6" gutterBottom>
            Contractor Information
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 3 }}
            >
              <Controller
                name="contractorName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Contractor Name"
                    fullWidth
                    placeholder="Enter contractor name"
                    error={!!errors.contractorName}
                    helperText={errors.contractorName?.message}
                  />
                )}
              />
              <Controller
                name="contractorAddress"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Address"
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Enter physical address"
                    error={!!errors.contractorAddress}
                    helperText={errors.contractorAddress?.message}
                  />
                )}
              />
              <Controller
                name="walletAddress"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Wallet Address"
                    fullWidth
                    placeholder="0x..."
                    error={!!errors.walletAddress}
                    helperText={errors.walletAddress?.message}
                  />
                )}
              />
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button variant="outlined" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" size="large">
                  Add Contractor
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Container>
    </>
  );
}
