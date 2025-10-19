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
import { parseEther, isAddress } from "viem";
import { enqueueSnackbar } from "notistack";
import { useAccount } from "wagmi";
import * as yup from "yup";

import { Category, CreateProjectData } from "@/models";
import { categoryLabels } from "@/constants/project";
import { Navbar } from "@/components/Navbar";
import { useCreateProject } from "@/hooks/useBarangayChain";
import { useUploadJsonMutation } from "@/hooks/useIPFS";
import { shortenAddress } from "@/utils/format";

const MIN_MILESTONES = 3;
const BASIS_POINTS = 10000;

interface ProjectFormData {
  title: string;
  description: string;
  proposer: string;
  vendor: string;
  budget: string;
  category: Category;
  startDate: string;
  endDate: string;
  milestones: Array<{ percentage: number }>;
}

const schema: yup.ObjectSchema<ProjectFormData> = yup.object({
  title: yup.string().required("Project title is required"),
  description: yup.string().required("Description is required"),
  proposer: yup
    .string()
    .required("Proposer address is required")
    .test("is-valid-address", "Invalid Ethereum address", (value) => {
      if (!value) {
        return false;
      }
      return isAddress(value);
    }),
  vendor: yup
    .string()
    .required("Vendor address is required")
    .test("is-valid-address", "Invalid Ethereum address", (value) => {
      if (!value) {
        return false;
      }
      return isAddress(value);
    }),
  budget: yup
    .string()
    .required("Budget is required")
    .test("is-positive", "Budget must be greater than 0", (value) => {
      if (!value) {
        return false;
      }
      return parseFloat(value) > 0;
    }),
  category: yup
    .mixed<Category>()
    .oneOf(Object.values(Category).filter((v) => typeof v === "number"))
    .required("Category is required"),
  startDate: yup.string().required("Start date is required"),
  endDate: yup
    .string()
    .required("End date is required")
    .test(
      "is-after-start",
      "End date must be after start date",
      function (value) {
        const { startDate } = this.parent;
        if (!value || !startDate) {
          return true;
        }
        return new Date(value) > new Date(startDate);
      }
    ),
  milestones: yup
    .array()
    .of(
      yup
        .object({
          percentage: yup
            .number()
            .required("Percentage is required")
            .min(0.01, "Percentage must be greater than 0")
            .max(100, "Percentage cannot exceed 100"),
        })
        .required()
    )
    .min(MIN_MILESTONES, `Minimum ${MIN_MILESTONES} milestones required`)
    .required()
    .test(
      "sum-to-100",
      "Milestone percentages must sum to 100%",
      (milestones) => {
        if (!milestones) {
          return false;
        }
        const total = milestones.reduce(
          (sum: number, milestone) =>
            sum + (parseInt(milestone?.percentage?.toString()) || 0),
          0
        );
        return Math.abs(total - 100) < 0.01; // Allow small floating point errors
      }
    ),
});

export default function CreateProjectPage() {
  const router = useRouter();
  const { address } = useAccount();
  const {
    mutate,
    hash,
    isSuccess,
    isPending: isCreatingProject,
  } = useCreateProject();
  const { mutateAsync: uploadAsync, isPending: isUploading } =
    useUploadJsonMutation();

  const [mounted, setMounted] = useState(false);

  const categories = useMemo(
    () => Object.values(Category).filter((value) => typeof value === "number"),
    []
  );

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<ProjectFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      proposer: address,
      vendor: "",
      budget: "",
      category: Category.Infrastructure,
      startDate: "",
      endDate: "",
      milestones: [{ percentage: 30 }, { percentage: 40 }, { percentage: 30 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
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
    append({ percentage: 0 });
  };

  const handleRemoveMilestone = (index: number) => {
    if (fields.length > MIN_MILESTONES) {
      remove(index);
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      const uri = await uploadAsync({
        title: data.title,
        description: data.description,
      });

      if (!uri) {
        throw new Error("Upload failed: Can't find URL");
      }

      const releaseBpsTemplate = data.milestones.map((milestone) =>
        Math.round((milestone.percentage / 100) * BASIS_POINTS)
      );
      const startTimestamp = BigInt(
        Math.floor(new Date(data.startDate).getTime() / 1000)
      );
      const endTimestamp = BigInt(
        Math.floor(new Date(data.endDate).getTime() / 1000)
      );
      const budgetInWei = parseEther(data.budget);

      const projectData: CreateProjectData = {
        proposer: data.proposer as `0x${string}`,
        vendor: data.vendor as `0x${string}`,
        budget: budgetInWei,
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
    if (hash && isSuccess) {
      enqueueSnackbar({
        message: `Successfully created project with transaction hash: ${shortenAddress(
          hash
        )}`,
        variant: "success",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });

      setTimeout(() => {
        router.push("/");
      }, 2000);
    }
  }, [hash, isSuccess, router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? (
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
                      label="Vendor Address"
                      placeholder="0x..."
                      fullWidth
                      error={!!errors.vendor}
                      helperText={
                        errors.vendor?.message ||
                        "Wallet address of the contractor/vendor"
                      }
                    />
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
                      Define percentage of budget to release at each milestone
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

              {fields.map((field, index) => (
                <Grid size={{ xs: 12 }} key={field.id}>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Typography
                      variant="body1"
                      sx={{ minWidth: 100, fontWeight: "medium" }}
                    >
                      Milestone {index + 1}
                    </Typography>
                    <Controller
                      name={`milestones.${index}.percentage`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          type="number"
                          slotProps={{
                            htmlInput: { step: "0.1", min: "0", max: "100" },
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
                      disabled={fields.length <= MIN_MILESTONES}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Grid>
              ))}

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
                    disabled={isCreatingProject || isUploading || !isValid}
                  >
                    {isCreatingProject || isUploading
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
  ) : (
    <></>
  );
}
