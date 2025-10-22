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

import { Navbar } from "@/components/Navbar";
import { useUserRole } from "@/hooks/useUserRole";
import { UserRole } from "@/models";
import { Unauthorized } from "@/components/Unauthorized";

const schema = yup.object({
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (profilePicture) {
      const url = URL.createObjectURL(profilePicture);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl("");
    }
  }, [profilePicture]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("profilePicture", file);
    }
  };

  const onSubmit = (data: FormData) => {
    console.log({
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      birthday: data.birthday,
      address: data.citizenAddress,
      profilePicture: data.profilePicture,
    });

    reset();
    setPreviewUrl("");
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
                  Upload Profile Picture
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
                <Button type="submit" variant="contained" size="large">
                  Issue Citizen ID
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Container>
    </>
  );
}
