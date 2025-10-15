import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CitizenNFTModule = buildModule("CitizenNFTModule", (m) => {
  const initialAdmin = m.getParameter("initialAdmin", m.getAccount(0));

  const citizenNFT = m.contract("CitizenNFT", [initialAdmin]);

  return { citizenNFT };
});

export default CitizenNFTModule;
