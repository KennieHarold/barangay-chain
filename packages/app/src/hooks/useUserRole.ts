import { Address } from "viem";

import { UserRole } from "@/models";
import { useBalanceOf } from "./useCitizenNFT";
import { useHasRole } from "./useBarangayChain";

export function useUserRole(address: Address | undefined): {
  role: UserRole;
  isLoading: boolean;
} {
  const {
    data: isAdmin,
    isLoading: isAdminLoading,
    isFetched: isAdminFetched,
  } = useHasRole(UserRole.Admin, address as Address);

  const {
    data: isOfficial,
    isLoading: isOfficialLoading,
    isFetched: isOfficialFetched,
  } = useHasRole(UserRole.Official, address as Address);

  const {
    data: isContractor,
    isLoading: isContractorLoading,
    isFetched: isContractorFetched,
  } = useHasRole(UserRole.Contractor, address as Address);

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
