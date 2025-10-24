import * as yup from "yup";
import { isAddress } from "viem";

import { Category } from "@/models";

export const MIN_MILESTONES = 3;

export interface ProjectFormData {
  title: string;
  description: string;
  proposer: string;
  vendor: number;
  budget: string;
  category: Category;
  startDate: string;
  endDate: string;
  milestones: Array<{ percentage: number }>;
}

export const schema: yup.ObjectSchema<ProjectFormData> = yup.object({
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
    .number()
    .required("Vendor is required")
    .min(1, "Please select a vendor"),
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
            .min(0, "Percentage cannot be negative")
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
    )
    .test(
      "second-to-last-is-zero",
      "Second to last milestone must be 0%",
      (milestones) => {
        if (!milestones || milestones.length < 2) {
          return true;
        }
        const secondToLastIndex = milestones.length - 2;
        const secondToLastValue = milestones[secondToLastIndex]?.percentage;
        return secondToLastValue === 0;
      }
    )
    .test(
      "advance-payment-positive",
      "Advance payment (first milestone) must be greater than 0%",
      (milestones) => {
        if (!milestones || milestones.length === 0) {
          return false;
        }
        const advancePayment = milestones[0]?.percentage;
        return advancePayment > 0;
      }
    )
    .test(
      "final-payment-positive",
      "Final payment (last milestone) must be greater than 0%",
      (milestones) => {
        if (!milestones || milestones.length === 0) {
          return false;
        }
        const finalPayment = milestones[milestones.length - 1]?.percentage;
        return finalPayment > 0;
      }
    ),
});
