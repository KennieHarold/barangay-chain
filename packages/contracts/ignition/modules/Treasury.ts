import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ZeroAddress } from "ethers";

const TreasuryModule = buildModule("TreasuryModule", (m) => {
  const initialAdmin = m.getParameter("initialAdmin", m.getAccount(0));
  const pyusd = m.getParameter(
    "pyusd",
    "0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9"
  );
  const treasury = m.contract("Treasury", [initialAdmin, ZeroAddress, pyusd]);

  return { treasury };
});

export default TreasuryModule;
