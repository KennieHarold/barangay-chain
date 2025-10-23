import { useMemo } from "react";
import { Address, erc20Abi, formatUnits } from "viem";
import { useReadContract, useReadContracts } from "wagmi";

import { Category } from "@/models";
import { TREASURY_ABI } from "@/lib/abi";

const baseContractArgs = {
  address: process.env.NEXT_PUBLIC_TREASURY_ADDRESS as Address,
  abi: TREASURY_ABI,
};

export function useFetchExpensesPerCategory() {
  const length = Object.keys(Category).filter((key) =>
    isNaN(Number(key))
  ).length;

  const contracts = useMemo(() => {
    return Array.from({ length }, (_, i) => ({
      ...baseContractArgs,
      functionName: "expenses" as const,
      args: [BigInt(i)] as const,
    }));
  }, []);

  const { data } = useReadContracts({
    contracts: contracts,
  });

  const allExpensesLoaded =
    data &&
    data.length === length &&
    data.every((result) => result.status === "success");

  if (!allExpensesLoaded) {
    return {
      data: [],
    };
  }

  const expensesByCategory = data.map(({ result: amount }, index) => ({
    category: getCategoryByIndex(index),
    amount: parseFloat(formatUnits(amount, 6)),
  }));

  const totalExpenses = expensesByCategory.reduce((prev, curr) => {
    return prev + curr.amount;
  }, 0);

  return { data: expensesByCategory, total: totalExpenses };
}

function getCategoryByIndex(index: number): Category {
  const categoryKeys = Object.keys(Category).filter((key) =>
    isNaN(Number(key))
  );
  return Category[categoryKeys[index] as keyof typeof Category];
}

export function useFetchTreasuryBudget() {
  return useReadContract({
    abi: erc20Abi,
    address: process.env.NEXT_PUBLIC_PYUSD_ADDRESS as Address,
    functionName: "balanceOf",
    args: [baseContractArgs.address],
  });
}
