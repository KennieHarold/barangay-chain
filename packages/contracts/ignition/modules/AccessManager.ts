import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BarangayAccessManagerModule = buildModule("CitizenNFTModule", (m) => {
  const initialAdmin = m.getParameter("initialAdmin", m.getAccount(0));
  const initialOfficial = m.getParameter(
    "initialOfficial",
    "0xB0d33Aa069dD4F55765BFF8be757848622c6e85C"
  );

  const accessManager = m.contract("BarangayAccessManager", [
    initialAdmin,
    initialOfficial,
  ]);

  return { accessManager };
});

export default BarangayAccessManagerModule;
