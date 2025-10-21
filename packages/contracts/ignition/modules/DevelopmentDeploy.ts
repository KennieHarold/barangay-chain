import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

import CitizenNFTModule from "./CitizenNFT.js";
import TreasuryModule from "./Treasury.js";

const DevelopmentDeployModule = buildModule("DevelopmentDeployModule", (m) => {
  // Deploy CitizenNFT
  const { citizenNFT } = m.useModule(CitizenNFTModule);

  // Deploy Treasury
  const { treasury } = m.useModule(TreasuryModule);

  // Deploy Protocol
  const barangayChain = m.contract("BarangayChain", [treasury, citizenNFT]);

  // Set protocol
  m.call(treasury, "setProtocol", [barangayChain], {
    id: "setProtocol",
  });

  return {
    citizenNFT,
    treasury,
    barangayChain,
  };
});

export default DevelopmentDeployModule;
