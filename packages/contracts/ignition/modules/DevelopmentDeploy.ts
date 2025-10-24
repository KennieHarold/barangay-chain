import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

import CitizenNFTModule from "./CitizenNFT.js";
import TreasuryModule from "./Treasury.js";
import BarangayAccessManagerModule from "./AccessManager.js";

const DevelopmentDeployModule = buildModule("DevelopmentDeployModule", (m) => {
  // Deploy Access Manager
  const { accessManager } = m.useModule(BarangayAccessManagerModule);

  // Deploy Treasury
  const { treasury } = m.useModule(TreasuryModule);

  // Deploy CitizenNFT
  const { citizenNFT } = m.useModule(CitizenNFTModule);

  // Deploy Protocol
  const barangayChain = m.contract("BarangayChain", [
    accessManager,
    treasury,
    citizenNFT,
  ]);

  // Set access rules
  m.call(
    accessManager,
    "setTargetFunctionRole",
    [barangayChain, ["0xa22180f4"], 1n],
    {
      id: "setCreateProjectAccessRule",
    }
  );
  m.call(
    accessManager,
    "setTargetFunctionRole",
    [barangayChain, ["0x852ea203"], 1n],
    {
      id: "setCompleteMilestoneAccessRule",
    }
  );
  m.call(
    accessManager,
    "setTargetFunctionRole",
    [barangayChain, ["0x1898a1c7"], 1n],
    {
      id: "setAddVendorAccessRule",
    }
  );
  m.call(
    accessManager,
    "setTargetFunctionRole",
    [barangayChain, ["0x5b5d3c0a"], 1n],
    {
      id: "setVendorWhitelistAccessRule",
    }
  );
  m.call(
    accessManager,
    "setTargetFunctionRole",
    [citizenNFT, ["0xd204c45e"], 1n],
    {
      id: "setSafeMintAccessRule",
    }
  );

  // Set protocol
  m.call(treasury, "setProtocol", [barangayChain], {
    id: "setProtocol",
  });

  return {
    accessManager,
    citizenNFT,
    treasury,
    barangayChain,
  };
});

export default DevelopmentDeployModule;
