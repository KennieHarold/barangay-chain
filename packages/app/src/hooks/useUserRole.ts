import { Address } from "viem";
import { useReadContract } from "wagmi";

import { UserRole } from "@/models";
import { roles } from "@/constants/access";
import { useBalanceOf } from "./useCitizenNFT";
import { ACCESS_MANAGER_ABI } from "@/lib/abi";
import { useFetchVendorsList } from "./useBarangayChain";

const baseContractArgs = {
  address: process.env.NEXT_PUBLIC_ACCESS_MANAGER_ADDRESS as Address,
  abi: ACCESS_MANAGER_ABI,
};

export function useHasRole(role: keyof typeof roles, account: Address) {
  return useReadContract({
    ...baseContractArgs,
    functionName: "hasRole",
    args: [roles[role], account],
    query: {
      enabled: role !== undefined && account !== undefined,
    },
  });
}

export function useUserRole(address: Address | undefined): {
  role: UserRole;
  isLoading: boolean;
} {
  const {
    data: adminRoleData,
    isLoading: isAdminLoading,
    isFetched: isAdminFetched,
  } = useHasRole(UserRole.Admin, address as Address);

  const isAdmin = adminRoleData?.[0] || false;

  const {
    data: officialRoleData,
    isLoading: isOfficialLoading,
    isFetched: isOfficialFetched,
  } = useHasRole(UserRole.Official, address as Address);

  const isOfficial = officialRoleData?.[0] || false;

  const {
    data: contractors,
    isLoading: isContractorLoading,
    isFetched: isContractorFetched,
  } = useFetchVendorsList();

  const isContractor = contractors.find(
    (contactor) =>
      contactor.isWhitelisted &&
      contactor.walletAddress.toLowerCase() === address?.toLowerCase()
  );

  const {
    data: citizenBalance,
    isLoading: isCitizenLoading,
    isFetched: isCitizenFetched,
  } = useBalanceOf(address as Address);

  const isLoading =
    isAdminLoading ||
    isOfficialLoading ||
    isContractorLoading ||
    isCitizenLoading;

  let role = UserRole.Guest;

  if (
    !address ||
    !isAdminFetched ||
    !isOfficialFetched ||
    !isContractorFetched ||
    !isCitizenFetched
  ) {
    return { role, isLoading };
  }

  if (isAdmin) {
    role = UserRole.Admin;
  } else if (isOfficial) {
    role = UserRole.Official;
  } else if (isContractor) {
    role = UserRole.Contractor;
  } else if (citizenBalance && citizenBalance > 0n) {
    role = UserRole.Citizen;
  }

  return { role, isLoading };
}
