import { network } from "hardhat";
import { keccak256, toUtf8Bytes } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const { ethers } = await network.connect({
  network: "arbitrumSepolia",
  chainType: "l1",
});

const OFFICIAL_ROLE = keccak256(toUtf8Bytes("OFFICIAL_ROLE"));
const VENDOR_ROLE = keccak256(toUtf8Bytes("VENDOR_ROLE"));

const OFFICIAL_ADDRESS = process.env.OFFICIAL_ADDRESS;
const CONTRACTOR_ADDRESS = process.env.CONTRACTOR_ADDRESS;
const BARANGAY_CHAIN_ADDRESS = process.env.BARANGAY_CHAIN_ADDRESS;

async function main() {
  if (!BARANGAY_CHAIN_ADDRESS || !OFFICIAL_ADDRESS || !CONTRACTOR_ADDRESS) {
    throw new Error(
      "Missing required environment variables: BARANGAY_CHAIN_ADDRESS, OFFICIAL_ADDRESS, or CONTRACTOR_ADDRESS"
    );
  }

  console.log("Starting role granting process...\n");

  const [admin] = await ethers.getSigners();
  console.log("Admin address:", admin.address);

  console.log("BarangayChain contract address:", BARANGAY_CHAIN_ADDRESS);
  console.log();

  const barangayChain = await ethers.getContractAt(
    "BarangayChain",
    BARANGAY_CHAIN_ADDRESS
  );

  console.log(`Checking OFFICIAL_ROLE for ${OFFICIAL_ADDRESS}...`);
  const hasOfficialRole = await barangayChain.hasRole(
    OFFICIAL_ROLE,
    OFFICIAL_ADDRESS
  );

  if (hasOfficialRole) {
    console.log("⊘ Address already has OFFICIAL_ROLE, skipping...");
    console.log();
  } else {
    console.log(`Granting OFFICIAL_ROLE to ${OFFICIAL_ADDRESS}...`);
    const tx1 = await barangayChain.grantRole(OFFICIAL_ROLE, OFFICIAL_ADDRESS);
    await tx1.wait();
    console.log("✓ OFFICIAL_ROLE granted successfully");
    console.log("Transaction hash:", tx1.hash);
    console.log();
  }

  console.log(`Checking VENDOR_ROLE for ${CONTRACTOR_ADDRESS}...`);
  const hasVendorRole = await barangayChain.hasRole(
    VENDOR_ROLE,
    CONTRACTOR_ADDRESS
  );

  if (hasVendorRole) {
    console.log("⊘ Address already has VENDOR_ROLE, skipping...");
    console.log();
  } else {
    console.log(
      `Granting VENDOR_ROLE (Contractor) to ${CONTRACTOR_ADDRESS}...`
    );
    const tx2 = await barangayChain.grantRole(VENDOR_ROLE, CONTRACTOR_ADDRESS);
    await tx2.wait();
    console.log("✓ VENDOR_ROLE granted successfully");
    console.log("Transaction hash:", tx2.hash);
    console.log();
  }

  console.log("Final role status:");
  const finalOfficialRole = await barangayChain.hasRole(
    OFFICIAL_ROLE,
    OFFICIAL_ADDRESS
  );
  const finalVendorRole = await barangayChain.hasRole(
    VENDOR_ROLE,
    CONTRACTOR_ADDRESS
  );

  console.log(
    `${OFFICIAL_ADDRESS} has OFFICIAL_ROLE:`,
    finalOfficialRole ? "✓" : "✗"
  );
  console.log(
    `${CONTRACTOR_ADDRESS} has VENDOR_ROLE:`,
    finalVendorRole ? "✓" : "✗"
  );
  console.log();

  console.log("Role granting process completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
