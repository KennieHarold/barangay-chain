"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  IconButton,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Address, parseUnits } from "viem";
import { enqueueSnackbar } from "notistack";
import { useAccount } from "wagmi";
import { useNotification } from "@blockscout/app-sdk";

import { Category, CreateProjectData, UserRole } from "@/models";
import { categoryLabels } from "@/constants/project";
import { Navbar } from "@/components/Navbar";
import {
  useCreateProject,
  useFetchVendorsList,
} from "@/hooks/useBarangayChain";
import { useUploadJsonMutation } from "@/hooks/useIPFS";
import { MIN_MILESTONES, ProjectFormData, schema } from "./schema";
import { DEFAULT_CHAIN_ID } from "@/lib/providers";
import { useUserRole } from "@/hooks/useUserRole";
import { Unauthorized } from "@/components/Unauthorized";

const BASIS_POINTS = 10000;

export default function CreateProjectPage() {
  const router = useRouter();
  const { address } = useAccount();
  const {
    mutate,
    hash,
    isPending: isCreatingProject,
    isConfirming: isConfirmingProjectCreation,
    isSuccess,
  } = useCreateProject();
  const { mutateAsync: uploadAsync, isPending: isUploading } =
    useUploadJsonMutation();
  const { openTxToast } = useNotification();
  const { role, isLoading: isCheckingRole } = useUserRole(address);
  const { data: vendors } = useFetchVendorsList();

  const [mounted, setMounted] = useState(false);

  const categories = useMemo(
    () => Object.values(Category).filter((value) => typeof value === "number"),
    []
  );

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<ProjectFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      proposer: address,
      vendor: 0,
      budget: "",
      category: Category.Infrastructure,
      startDate: "",
      endDate: "",
      milestones: [
        { percentage: 30 }, // Advance payment
        { percentage: 40 }, // Milestone 1
        { percentage: 0 }, // Second to last (always 0)
        { percentage: 30 }, // Final payment
      ],
    },
  });

  const { fields, remove, update, insert } = useFieldArray({
    control,
    name: "milestones",
  });

  const milestones = watch("milestones");
  const totalPercentage = useMemo(() => {
    return (
      milestones?.reduce(
        (sum, milestone) =>
          sum + (parseInt(milestone.percentage.toString()) || 0),
        0
      ) || 0
    );
  }, [milestones]);

  const handleAddMilestone = () => {
    // Insert new milestone before the second-to-last (0%) milestone
    const insertIndex = fields.length - 2; // Before second-to-last
    insert(insertIndex, { percentage: 0 });
  };

  const handleRemoveMilestone = (index: number) => {
    // Only allow removing milestones that are not: advance payment, second-to-last, or final payment
    const isAdvancePayment = index === 0;
    const isSecondToLast = index === fields.length - 2;
    const isLastMilestone = index === fields.length - 1;

    if (
      fields.length > MIN_MILESTONES + 1 &&
      !isAdvancePayment &&
      !isSecondToLast &&
      !isLastMilestone
    ) {
      remove(index);
    }
  };

  // Effect to ensure second-to-last milestone is always 0
  useEffect(() => {
    if (fields.length >= 2) {
      const secondToLastIndex = fields.length - 2;
      const secondToLastValue = milestones[secondToLastIndex]?.percentage;

      if (secondToLastValue !== 0) {
        update(secondToLastIndex, { percentage: 0 });
      }
    }
  }, [fields.length, milestones, update]);

  const onSubmit = async (data: ProjectFormData) => {
    try {
      const uri = await uploadAsync({
        title: data.title,
        description: data.description,
      });

      if (!uri) {
        throw new Error("Upload failed: Can't find URL");
      }

      const releaseBpsTemplate = data.milestones
        .map((milestone) =>
          Math.round((milestone.percentage / 100) * BASIS_POINTS)
        )
        .filter((percentage: number) => percentage > 0);

      const startTimestamp = BigInt(
        Math.floor(new Date(data.startDate).getTime() / 1000)
      );
      const endTimestamp = BigInt(
        Math.floor(new Date(data.endDate).getTime() / 1000)
      );
      const budgetInUnits = parseUnits(data.budget, 6);

      const projectData: CreateProjectData = {
        proposer: data.proposer as Address,
        vendorId: data.vendor,
        budget: budgetInUnits,
        category: data.category,
        startDate: startTimestamp,
        endDate: endTimestamp,
        uri,
        releaseBpsTemplate,
      };

      mutate(projectData);
    } catch (error) {
      console.error("Error creating project:", error);
      enqueueSnackbar({
        message: `Error creating project: ${error}`,
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
    }
  };

  useEffect(() => {
    if (hash) {
      openTxToast(DEFAULT_CHAIN_ID.toString(), hash);
    }
  }, [hash]);

  useEffect(() => {
    if (isSuccess) {
      reset();
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
            Create New Project
          </Typography>
        </Box>

        <Paper sx={{ p: 4, borderRadius: "1em" }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" gutterBottom>
                  Project Details
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Project Title"
                      fullWidth
                      error={!!errors.title}
                      helperText={errors.title?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      multiline
                      rows={4}
                      fullWidth
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="proposer"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Proposer Address"
                      placeholder="0x..."
                      fullWidth
                      error={!!errors.proposer}
                      helperText={
                        errors.proposer?.message ||
                        "Wallet address of the project proposer"
                      }
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="vendor"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Vendor"
                      select
                      fullWidth
                      error={!!errors.vendor}
                      helperText={
                        errors.vendor?.message || "Select a contractor/vendor"
                      }
                      disabled={!vendors || vendors.length === 0}
                    >
                      <MenuItem value={0} disabled>
                        Select a vendor
                      </MenuItem>
                      {vendors?.map((vendor) => (
                        <MenuItem key={vendor.id} value={vendor.id}>
                          {vendor.name} ({vendor.walletAddress.slice(0, 6)}...
                          {vendor.walletAddress.slice(-4)})
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="budget"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Budget (PYUSD)"
                      type="number"
                      slotProps={{ htmlInput: { step: "0.01", min: "0" } }}
                      fullWidth
                      error={!!errors.budget}
                      helperText={errors.budget?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Category"
                      select
                      fullWidth
                      error={!!errors.category}
                      helperText={errors.category?.message}
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {categoryLabels[cat]}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Start Date"
                      type="date"
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                      error={!!errors.startDate}
                      helperText={errors.startDate?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="End Date"
                      type="date"
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                      error={!!errors.endDate}
                      helperText={errors.endDate?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h6">
                      Milestone Budget Release
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Structure: Advance Payment → Milestones → Reserved (0%) →
                      Final Payment
                    </Typography>
                  </Box>
                  <Chip
                    label={`Total: ${totalPercentage.toFixed(1)}%`}
                    color={
                      Math.abs(totalPercentage - 100) < 0.01
                        ? "success"
                        : "warning"
                    }
                    sx={{ fontWeight: "bold" }}
                  />
                </Box>
              </Grid>

              {fields.map((field, index) => {
                const isAdvancePayment = index === 0;
                const isSecondToLast = index === fields.length - 2;
                const isLastMilestone = index === fields.length - 1;

                const actualMilestoneNumber =
                  isAdvancePayment || isSecondToLast || isLastMilestone
                    ? null
                    : index;

                let label = "";
                let helperText = "";

                if (isAdvancePayment) {
                  label = "Advance Payment";
                  helperText = "Released immediately upon project creation";
                } else if (isSecondToLast) {
                  label = `Verified Milestone ${
                    actualMilestoneNumber || index
                  }`;
                  helperText = "Set to 0% - reserved for final payment";
                } else if (isLastMilestone) {
                  label = "Final Payment";
                  helperText = "Released upon project completion";
                } else {
                  label = `Verified Milestone ${actualMilestoneNumber}`;
                  helperText = "Released after community verification";
                }

                return (
                  <Grid size={{ xs: 12 }} key={field.id}>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "flex-start",
                      }}
                    >
                      <Box sx={{ minWidth: 250, pt: 1 }}>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: "medium" }}
                        >
                          {label}
                        </Typography>
                        {helperText && (
                          <Typography variant="caption" color="text.secondary">
                            {helperText}
                          </Typography>
                        )}
                      </Box>
                      <Controller
                        name={`milestones.${index}.percentage`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            type="number"
                            disabled={isSecondToLast}
                            slotProps={{
                              htmlInput: {
                                step: "0.1",
                                min: "0",
                                max: "100",
                              },
                              input: {
                                endAdornment: <Typography>%</Typography>,
                              },
                            }}
                            sx={{ width: 150 }}
                            error={!!errors.milestones?.[index]?.percentage}
                            helperText={
                              errors.milestones?.[index]?.percentage?.message
                            }
                          />
                        )}
                      />
                      <IconButton
                        onClick={() => handleRemoveMilestone(index)}
                        disabled={
                          fields.length <= MIN_MILESTONES + 1 ||
                          isSecondToLast ||
                          isLastMilestone ||
                          isAdvancePayment
                        }
                        color="error"
                        sx={{ mt: 0.5 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                );
              })}

              <Grid size={{ xs: 12 }}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddMilestone}
                  variant="outlined"
                >
                  Add Milestone
                </Button>
              </Grid>

              {errors.milestones &&
                typeof errors.milestones?.root?.message === "string" && (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="error">
                      {errors.milestones.root.message}
                    </Alert>
                  </Grid>
                )}

              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}
                >
                  <Button variant="outlined" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={
                      isCreatingProject ||
                      isUploading ||
                      !isValid ||
                      isConfirmingProjectCreation
                    }
                  >
                    {isCreatingProject ||
                    isUploading ||
                    isConfirmingProjectCreation
                      ? "Simmering..."
                      : "Create Project"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </>
  );
}
