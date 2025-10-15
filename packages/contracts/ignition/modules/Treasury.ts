import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther, ZeroAddress } from "ethers";

const TreasuryModule = buildModule("TreasuryModule", (m) => {
  const initialAdmin = m.getParameter("initialAdmin", m.getAccount(0));

  // Deploy mock USDT token
  const usdtMock = m.contract(
    "MockERC20",
    ["Mock USDT", "USDT", parseEther(String(1_000_000_000_000))],
    {
      id: "USDT",
    }
  );

  const treasury = m.contract("Treasury", [
    initialAdmin,
    ZeroAddress,
    usdtMock,
  ]);

  return { treasury, usdtMock };
});

export default TreasuryModule;
