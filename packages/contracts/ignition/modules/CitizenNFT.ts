import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import BarangayAccessManagerModule from "./AccessManager.js";

const CitizenNFTModule = buildModule("CitizenNFTModule", (m) => {
  const { accessManager } = m.useModule(BarangayAccessManagerModule);
  const citizenNFT = m.contract("CitizenNFT", [accessManager]);

  return { citizenNFT };
});

export default CitizenNFTModule;
