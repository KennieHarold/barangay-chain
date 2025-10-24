"use client";

import { useState, useEffect } from "react";
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
  Avatar,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import { useAccount } from "wagmi";
import { Address, isAddress } from "viem";
import { enqueueSnackbar } from "notistack";

import { Navbar } from "@/components/Navbar";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/models";
import { Unauthorized } from "@/components/Unauthorized";
import { useNotification } from "@blockscout/app-sdk";
import { useUploadImageMutation, useUploadJsonMutation } from "@/hooks/useIPFS";
import { useMint } from "@/hooks/useCitizenNFT";
import { DEFAULT_CHAIN_ID } from "@/lib/providers";
import { getCidFromUri } from "@/utils/format";

const schema = yup.object({
  walletAddress: yup
    .string()
    .required("Wallet address is required")
    .test("is-valid-address", "Invalid Ethereum address", (value) => {
      if (!value) {
        return false;
      }
      return isAddress(value);
    }),
  firstName: yup.string().required("First name is required"),
  middleName: yup.string().optional(),
  lastName: yup.string().required("Last name is required"),
  birthday: yup.string().required("Birthday is required"),
  citizenAddress: yup.string().required("Address is required"),
  profilePicture: yup.mixed<File>().nullable().optional(),
});

type FormData = yup.InferType<typeof schema>;

export default function IssueCitizenIDPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { role, isLoading: isCheckingRole } = useUserRole(address);
  const { openTxToast } = useNotification();
  const {
    mutate,
    hash,
    isSuccess,
    isPending: isPendingMint,
    isConfirming: isConfirmingMint,
  } = useMint();
  const { mutateAsync: uploadJsonMutate, isPending: isUploadingJson } =
    useUploadJsonMutation();
  const { mutateAsync: uploadImageMutate, isPending: isUploadingImage } =
    useUploadImageMutation();

  const [mounted, setMounted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      walletAddress: "",
      firstName: "",
      middleName: "",
      lastName: "",
      birthday: "",
      citizenAddress: "",
      profilePicture: null,
    },
  });

  const firstName = watch("firstName");
  const profilePicture = watch("profilePicture");

  const isLoading =
    isPendingMint || isConfirmingMint || isUploadingImage || isUploadingJson;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("profilePicture", file);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (!data.profilePicture) {
        throw new Error("File not found");
      }

      const ppUri = await uploadImageMutate(data.profilePicture);
      if (!ppUri) {
        throw new Error("Upload failed: Can't find URL");
      }

      const uri = await uploadJsonMutate({
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        birthday: data.birthday,
        address: data.citizenAddress,
        profilePicture: ppUri,
      });

      if (!uri) {
        throw new Error("Upload failed: Can't find URL");
      }

      mutate(data.walletAddress as Address, getCidFromUri(uri));
    } catch (error) {
      console.error("Error creating citizen ID:", error);
      enqueueSnackbar({
        message: `Error creating citizen ID: ${error}`,
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    }
  };

  useEffect(() => {
    if (profilePicture) {
      const url = URL.createObjectURL(profilePicture);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl("");
    }
  }, [profilePicture]);

  useEffect(() => {
    if (hash) {
      openTxToast(DEFAULT_CHAIN_ID.toString(), hash);
    }
  }, [hash]);

  useEffect(() => {
    if (isSuccess) {
      reset();
      setPreviewUrl("");
    }
  }, [isSuccess]);

  useEffect(() => {
    setMounted(true);
  }, []);

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
            Issue Citizen ID
          </Typography>
        </Box>
        <Paper sx={{ p: 4, borderRadius: "1em" }}>
          <Typography variant="h6" gutterBottom>
            Citizen Information
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 3 }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Avatar
                  src={previewUrl}
                  sx={{ width: 120, height: 120, bgcolor: "primary.main" }}
                >
                  {!previewUrl && (firstName?.charAt(0) || "?")}
                </Avatar>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                >
                  Select Profile Picture
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>
                {profilePicture && (
                  <Typography variant="caption" color="text.secondary">
                    {profilePicture.name}
                  </Typography>
                )}
              </Box>
              <Controller
                name="walletAddress"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Wallet Address"
                    fullWidth
                    placeholder="Enter wallet address (0x...)"
                    error={!!errors.walletAddress}
                    helperText={errors.walletAddress?.message}
                  />
                )}
              />
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    fullWidth
                    placeholder="Enter first name"
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                  />
                )}
              />
              <Controller
                name="middleName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Middle Name"
                    fullWidth
                    placeholder="Enter middle name (optional)"
                    error={!!errors.middleName}
                    helperText={errors.middleName?.message}
                  />
                )}
              />
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    fullWidth
                    placeholder="Enter last name"
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                  />
                )}
              />
              <Controller
                name="birthday"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Birthday"
                    type="date"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={!!errors.birthday}
                    helperText={errors.birthday?.message}
                  />
                )}
              />
              <Controller
                name="citizenAddress"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Address"
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Enter residential address"
                    error={!!errors.citizenAddress}
                    helperText={errors.citizenAddress?.message}
                  />
                )}
              />
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button variant="outlined" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                >
                  {isLoading ? "Minting..." : "Issue Citizen ID"}
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Container>
    </>
  );
}
