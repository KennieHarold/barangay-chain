import { network } from "hardhat";
import { parseUnits } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const { ethers } = await network.connect({
  network: "sepolia",
  chainType: "l1",
});

const PYUSD_ADDRESS = process.env.PYUSD_SEPOLIA_ADDRESS;
const RECIPIENT_ADDRESS = process.env.RECIPIENT_ADDRESS;
const AMOUNT = process.env.SEND_AMOUNT || "100";

async function main() {
  if (!PYUSD_ADDRESS) {
    throw new Error("Missing PYUSD_SEPOLIA_ADDRESS in environment variables");
  }
  if (!RECIPIENT_ADDRESS) {
    throw new Error(
      "Missing RECIPIENT_ADDRESS in environment variables. Please set the recipient address."
    );
  }

  console.log("Starting PYUSD transfer process...\n");

  const [sender] = await ethers.getSigners();
  console.log("Sender address:", sender.address);
  console.log("Recipient address:", RECIPIENT_ADDRESS);
  console.log("PYUSD contract address:", PYUSD_ADDRESS);
  console.log();

  // Connect to PYUSD token contract (ERC20)
  const pyusd = await ethers.getContractAt(
    [
      "function transfer(address to, uint256 amount) external returns (bool)",
      "function balanceOf(address account) external view returns (uint256)",
      "function decimals() external view returns (uint8)",
      "function symbol() external view returns (string)",
    ],
    PYUSD_ADDRESS
  );

  // Get token details
  const decimals = await pyusd.decimals();
  const symbol = await pyusd.symbol();
  console.log(`Token: ${symbol}`);
  console.log(`Decimals: ${decimals}`);
  console.log();

  // Parse amount with correct decimals
  const amountToSend = parseUnits(AMOUNT, decimals);
  console.log(`Amount to send: ${AMOUNT} ${symbol}`);
  console.log();

  // Check sender balance
  const senderBalance = await pyusd.balanceOf(sender.address);
  console.log(
    `Sender balance: ${ethers.formatUnits(senderBalance, decimals)} ${symbol}`
  );

  if (senderBalance < amountToSend) {
    throw new Error(
      `Insufficient balance. You have ${ethers.formatUnits(
        senderBalance,
        decimals
      )} ${symbol} but trying to send ${AMOUNT} ${symbol}`
    );
  }

  // Check recipient balance before transfer
  const recipientBalanceBefore = await pyusd.balanceOf(RECIPIENT_ADDRESS);
  console.log(
    `Recipient balance before: ${ethers.formatUnits(
      recipientBalanceBefore,
      decimals
    )} ${symbol}`
  );
  console.log();

  // Execute transfer
  console.log(`Sending ${AMOUNT} ${symbol} to ${RECIPIENT_ADDRESS}...`);
  const tx = await pyusd.transfer(RECIPIENT_ADDRESS, amountToSend);
  console.log("Transaction submitted. Hash:", tx.hash);
  console.log("Waiting for confirmation...");

  const receipt = await tx.wait();
  console.log("✓ Transfer confirmed!");
  console.log("Block number:", receipt.blockNumber);
  console.log("Gas used:", receipt.gasUsed.toString());
  console.log();

  // Check balances after transfer
  const senderBalanceAfter = await pyusd.balanceOf(sender.address);
  const recipientBalanceAfter = await pyusd.balanceOf(RECIPIENT_ADDRESS);

  console.log("Final balances:");
  console.log(
    `Sender: ${ethers.formatUnits(senderBalanceAfter, decimals)} ${symbol}`
  );
  console.log(
    `Recipient: ${ethers.formatUnits(
      recipientBalanceAfter,
      decimals
    )} ${symbol}`
  );
  console.log();

  console.log("PYUSD transfer completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
