import { expect } from "chai";
import { network } from "hardhat";
import {
  keccak256,
  parseEther,
  toUtf8Bytes,
  ZeroAddress,
  ZeroHash,
  type Signer,
} from "ethers";

import type { BarangayChain } from "../types/ethers-contracts/BarangayChain.js";
import type { Treasury } from "../types/ethers-contracts/Treasury.js";
import type { CitizenNFT } from "../types/ethers-contracts/CitizenNFT.js";
import type { MockERC20 } from "../types/ethers-contracts/index.js";

describe("BarangayChain", function () {
  let ethers: any;
  let networkHelpers: any;
  let barangayChain: BarangayChain;
  let treasury: Treasury;
  let citizenNFT: CitizenNFT;
  let treasuryToken: MockERC20;

  let admin: Signer;
  let official: Signer;
  let vendor: Signer;
  let alice: Signer;
  let bob: Signer;

  const ADMIN_ROLE = ZeroHash;
  const OFFICIAL_ROLE = keccak256(toUtf8Bytes("OFFICIAL_ROLE"));
  const VENDOR_ROLE = keccak256(toUtf8Bytes("VENDOR_ROLE"));

  before(async function () {
    const { ethers: networkEthers, networkHelpers: networkHelpers_ } =
      (await network.connect()) as any;
    ethers = networkEthers;
    networkHelpers = networkHelpers_;
  });

  beforeEach(async function () {
    [admin, official, vendor, alice, bob] = await ethers.getSigners();

    // Deploy CitizenNFT
    const CitizenNFTFactory = await ethers.getContractFactory("CitizenNFT");
    citizenNFT = await CitizenNFTFactory.deploy(admin);

    // Deploy Treasury Token
    const TreasuryTokenFactory = await ethers.getContractFactory("MockERC20");
    treasuryToken = await TreasuryTokenFactory.deploy(
      "Tether USD",
      "USDT",
      parseEther(String(1_000_000_000_000)) // 1 trillion
    );

    // Deploy Treasury
    const TreasuryFactory = await ethers.getContractFactory("Treasury");
    treasury = await TreasuryFactory.deploy(admin, ZeroAddress, treasuryToken);

    // Deploy BarangayChain
    const BarangayChainFactory = await ethers.getContractFactory(
      "BarangayChain"
    );
    barangayChain = await BarangayChainFactory.deploy(treasury, citizenNFT);
    await treasury.setProtocol(barangayChain);

    // Fund treasury
    await treasuryToken.connect(admin).transfer(
      treasury,
      parseEther(String(1_000_000_000)) // 1 billion
    );

    // Grant roles
    await barangayChain.grantRole(OFFICIAL_ROLE, official);
    await barangayChain.grantRole(VENDOR_ROLE, vendor);
  });

  async function timeTravel(seconds: number) {
    await networkHelpers.time.increase(seconds);
  }

  describe("Deployment", function () {
    it("should deploy with correct constants", async function () {
      expect(await barangayChain.DEFAULT_ADMIN_ROLE()).to.be.eq(ADMIN_ROLE);
      expect(await barangayChain.OFFICIAL_ROLE()).to.be.eq(OFFICIAL_ROLE);
      expect(await barangayChain.VENDOR_ROLE()).to.be.eq(VENDOR_ROLE);
      expect(await barangayChain.QUORUM_VOTES()).to.be.eq(5);
      expect(await barangayChain.BASIS_POINT()).to.be.eq(10000n);
    });

    it("should deploy with correct immutables", async function () {
      expect(await barangayChain.PAYMENT_TOKEN()).to.be.eq(treasuryToken);
      expect(await barangayChain.CITIZEN_NFT()).to.be.eq(citizenNFT);
      expect(await barangayChain.TREASURY()).to.be.eq(treasury);
    });

    it("should have empty projects", async function () {
      expect(await barangayChain.projectCounter()).to.be.eq(0);
      expect(await barangayChain.projects(1)).to.be.eqls([
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
        0n,
        0n,
        0n,
        0n,
        0n,
        "",
      ]);
    });
  });

  describe("Project Creation", function () {
    let startDate: number;
    let endDate: number;

    beforeEach(function () {
      startDate = Math.floor(Date.now() / 1000);
      endDate = startDate + 1825 * 24 * 60 * 60; // 5 years from now
    });

    it("should revert when non-official creates project", async function () {
      await expect(
        barangayChain.connect(alice).createProject(
          official,
          vendor,
          parseEther(String(1_000_000)), // 1 million
          0n,
          BigInt(startDate),
          BigInt(endDate),
          "ipfs://test-ipfs-hash",
          [3000n, 6000n, 1000n]
        )
      ).to.be.rejectedWith("BarangayChain: Not an official");
    });

    it("should successfully create project", async function () {
      await expect(
        barangayChain.connect(official).createProject(
          official,
          vendor,
          parseEther(String(1_000_000)), // 1 million
          0n,
          BigInt(startDate),
          BigInt(endDate),
          "ipfs://test-ipfs-hash",
          [3000n, 6000n, 1000n]
        )
      )
        .to.emit(barangayChain, "ProjectCreated")
        .withArgs(
          1,
          official,
          vendor,
          parseEther(String(1_000_000)),
          0n,
          BigInt(startDate),
          BigInt(endDate),
          "ipfs://test-ipfs-hash"
        )
        .to.emit(treasury, "FundsReleased")
        .withArgs(vendor, parseEther(String(300_000)), 0n)
        .to.emit(treasuryToken, "Transfer")
        .withArgs(treasury, vendor, parseEther(String(300_000)));

      expect(await barangayChain.projectCounter()).to.be.eq(1);
      expect(await barangayChain.projects(1)).to.be.eqls([
        await official.getAddress(),
        await vendor.getAddress(),
        BigInt(startDate),
        BigInt(endDate),
        parseEther(String(1_000_000)), // 1 million
        0n,
        0n,
        "ipfs://test-ipfs-hash",
      ]);

      const milestones = {
        0: [0n, 0n, "", 3000n, 0n, 0n],
        1: [0n, 0n, "", 6000n, 1n, 0n],
        2: [0n, 0n, "", 1000n, 2n, 0n],
      };

      expect(await barangayChain.getProjectMilestone(1n, 0n)).to.be.eqls(
        milestones[0]
      );
      expect(await barangayChain.getProjectMilestone(1n, 1n)).to.be.eqls(
        milestones[1]
      );
      expect(await barangayChain.getProjectMilestone(1n, 2n)).to.be.eqls(
        milestones[2]
      );
    });
  });

  describe("Milestone Submission", async function () {
    let startDate: number;
    let endDate: number;

    beforeEach(async function () {
      startDate = Math.floor(Date.now() / 1000);
      endDate = startDate + 1825 * 24 * 60 * 60; // 5 years from now

      await barangayChain.connect(official).createProject(
        official,
        vendor,
        parseEther(String(1_000_000)), // 1 million
        0n,
        BigInt(startDate),
        BigInt(endDate),
        "ipfs://test-ipfs-hash",
        [3000n, 6000n, 1000n]
      );
    });

    it("should revert when non-vendor creates milestone", async function () {
      await expect(
        barangayChain
          .connect(alice)
          .submitMilestone(1n, "ipfs://test-ipfs-hash")
      ).to.be.rejectedWith("BarangayChain: Not a vendor");
    });

    it("should create milestone successfully", async function () {
      await expect(
        barangayChain
          .connect(vendor)
          .submitMilestone(1n, "ipfs://test-ipfs-hash")
      )
        .to.emit(barangayChain, "MilestoneSubmitted")
        .withArgs(1n, 0n, vendor, "ipfs://test-ipfs-hash");
    });

    it("should revert when project is already due", async function () {
      await timeTravel(1825 * 24 * 60 * 60 + 1);
      await expect(
        barangayChain
          .connect(vendor)
          .submitMilestone(1n, "ipfs://test-ipfs-hash")
      ).to.be.rejectedWith(
        "BarangayChain::submitMilestone: Not allowed outside timeframe"
      );
    });
  });
});
