import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ZeroAddress } from "ethers";

import BarangayAccessManagerModule from "./AccessManager.js";

const TreasuryModule = buildModule("TreasuryModule", (m) => {
  const { accessManager } = m.useModule(BarangayAccessManagerModule);
  const pyusd = m.getParameter(
    "pyusd",
    "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9"
  );
  const treasury = m.contract("Treasury", [accessManager, ZeroAddress, pyusd]);

  return { treasury };
});

export default TreasuryModule;
