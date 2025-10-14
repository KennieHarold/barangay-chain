import { expect } from "chai";
import { network } from "hardhat";
import {
  ContractTransactionResponse,
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
  let dave: Signer;
  let james: Signer;
  let billy: Signer;
  let john: Signer;

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
    [admin, official, vendor, alice, bob, dave, james, billy, john] =
      await ethers.getSigners();

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

    // Mint CitizenNFT
    await citizenNFT.safeMint(alice);
    await citizenNFT.safeMint(bob);
    await citizenNFT.safeMint(dave);
    await citizenNFT.safeMint(james);
    await citizenNFT.safeMint(billy);
    await citizenNFT.safeMint(john);
  });

  async function timeTravel(seconds: number) {
    await networkHelpers.time.increase(seconds);
  }

  async function createProjectDefault() {
    const startDate = await networkHelpers.time.latest();
    const endDate = startDate + 1825 * 24 * 60 * 60; // 5 years from now

    const tx = await barangayChain.connect(official).createProject(
      official,
      vendor,
      parseEther(String(1_000_000)), // 1 million
      0n,
      BigInt(startDate),
      BigInt(endDate),
      "ipfs://test-ipfs-hash",
      [3000n, 6000n, 1000n]
    );

    return { tx, startDate, endDate };
  }

  async function submitMilestone(projectId: bigint) {
    await barangayChain
      .connect(vendor)
      .submitMilestone(projectId, "ipfs://test-ipfs-hash");
  }

  describe("Deployment", function () {
    it("should deploy with correct constants", async function () {
      expect(await barangayChain.DEFAULT_ADMIN_ROLE()).to.be.eq(ADMIN_ROLE);
      expect(await barangayChain.OFFICIAL_ROLE()).to.be.eq(OFFICIAL_ROLE);
      expect(await barangayChain.VENDOR_ROLE()).to.be.eq(VENDOR_ROLE);
      expect(await barangayChain.QUORUM_VOTES()).to.be.eq(5);
      expect(await barangayChain.BASIS_POINT()).to.be.eq(10000n);
      expect(await barangayChain.MIN_RELEASE_BPS_LENGTH()).to.be.eq(3);
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

    it("should mint CitizenNFT", async function () {
      expect(await citizenNFT.ownerOf(0)).to.be.eq(alice);
    });
  });

  describe("Project Creation", function () {
    let startDate: number;
    let endDate: number;

    beforeEach(async function () {
      startDate = await networkHelpers.time.latest();
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

    it("should revert release bps template is too low", async function () {
      await expect(
        barangayChain.connect(official).createProject(
          official,
          vendor,
          parseEther(String(1_000_000)), // 1 million
          0n,
          BigInt(startDate),
          BigInt(endDate),
          "ipfs://test-ipfs-hash",
          [3000n, 7000n]
        )
      ).to.be.rejectedWith(
        "BarangayChain::createProject: Too low release bps length"
      );
    });
  });

  describe("Milestone Submission", async function () {
    beforeEach(async function () {
      await createProjectDefault();
    });

    it("should revert when non-vendor submits milestone", async function () {
      await expect(
        barangayChain
          .connect(alice)
          .submitMilestone(1n, "ipfs://test-ipfs-hash")
      ).to.be.rejectedWith("BarangayChain: Not a vendor");
    });

    it("should submit milestone successfully", async function () {
      await expect(
        barangayChain
          .connect(vendor)
          .submitMilestone(1n, "ipfs://test-ipfs-hash")
      )
        .to.emit(barangayChain, "MilestoneSubmitted")
        .withArgs(1n, 0n, vendor, "ipfs://test-ipfs-hash");
    });

    it("should revert when submitting another milestone", async function () {
      await submitMilestone(1n);
      await expect(
        barangayChain
          .connect(vendor)
          .submitMilestone(1n, "ipfs://test-ipfs-hash")
      ).to.be.rejectedWith("BarangayChain::submitMilestone: Invalid status");
    });

    it("should revert when project is already due", async function () {
      await timeTravel(1825 * 24 * 60 * 60 + 1);
      await expect(
        barangayChain
          .connect(vendor)
          .submitMilestone(1n, "ipfs://test-ipfs-hash")
      ).to.be.rejectedWith("BarangayChain::submitMilestone: Already due");
    });
  });

  describe("Milestone Verification", async function () {
    beforeEach(async function () {
      await createProjectDefault();
      await submitMilestone(1n);
    });

    it("should revert when verifying milestone by a non-citizen", async function () {
      await expect(
        barangayChain.connect(vendor).verifyMilestone(1n, true)
      ).to.be.rejectedWith("BarangayChain: Not a citizen");
    });

    it("should verify milestone", async function () {
      await expect(barangayChain.connect(alice).verifyMilestone(1n, true))
        .to.emit(barangayChain, "MilestoneVerified")
        .withArgs(1n, 0n, alice, true, 1n, 0n);

      expect(await barangayChain.getUserMilestoneVerification(1n, 0n, alice)).to
        .be.true;

      const milestone = [1n, 0n, "ipfs://test-ipfs-hash", 3000n, 0n, 1n];
      expect(await barangayChain.getProjectMilestone(1n, 0n)).to.be.eqls(
        milestone
      );
    });

    it("should not allow double verification", async function () {
      await barangayChain.connect(alice).verifyMilestone(1n, true);
      await expect(
        barangayChain.connect(alice).verifyMilestone(1n, true)
      ).to.be.rejectedWith("BarangayChain::verifyMilestone: Already verified");
    });

    it("should revert when project is already due", async function () {
      await timeTravel(1825 * 24 * 60 * 60 + 1);
      await expect(
        barangayChain.connect(alice).verifyMilestone(1n, true)
      ).to.be.rejectedWith("BarangayChain::verifyMilestone: Already due");
    });
  });

  describe("Complete Milestone", async function () {
    beforeEach(async function () {
      await createProjectDefault();
      await submitMilestone(1n);
      await barangayChain.connect(alice).verifyMilestone(1n, true);
      await barangayChain.connect(bob).verifyMilestone(1n, true);
      await barangayChain.connect(dave).verifyMilestone(1n, true);
      await barangayChain.connect(james).verifyMilestone(1n, true);
      await barangayChain.connect(billy).verifyMilestone(1n, true);
    });

    it("should revert when quorum is not reached", async function () {
      await barangayChain.connect(john).verifyMilestone(1n, false);
      await expect(
        barangayChain.connect(official).completeMilestone(1n)
      ).to.be.rejectedWith(
        "BarangayChain::completeMilestone: Consensus required"
      );
    });

    it("should revert when non-official completes a milestone", async function () {
      await expect(
        barangayChain.connect(vendor).completeMilestone(1n)
      ).to.be.rejectedWith("BarangayChain: Not an official");
    });

    it("should successfully complete milestone", async function () {
      await expect(barangayChain.connect(official).completeMilestone(1n))
        .to.be.emit(barangayChain, "MilestoneCompleted")
        .withArgs(1n, 0n, parseEther(String(600_000)), false)
        .to.emit(treasury, "FundsReleased")
        .withArgs(vendor, parseEther(String(600_000)), 0n)
        .to.emit(treasuryToken, "Transfer")
        .withArgs(treasury, vendor, parseEther(String(600_000)));

      expect((await barangayChain.projects(1n)).currentMilestone).to.be.eql(1n);
      expect(
        (await barangayChain.getProjectMilestone(1n, 0n)).status
      ).to.be.eqls(2n);
    });
  });

  describe("Complete Project", async function () {
    let completeMilestone0Tx: ContractTransactionResponse;
    let completeMilestone1Tx: ContractTransactionResponse;
    let completeMilestone2Tx: ContractTransactionResponse;

    beforeEach(async function () {
      await createProjectDefault();

      // Milestone 0
      await submitMilestone(1n);
      await barangayChain.connect(alice).verifyMilestone(1n, true);
      await barangayChain.connect(bob).verifyMilestone(1n, true);
      await barangayChain.connect(dave).verifyMilestone(1n, true);
      await barangayChain.connect(james).verifyMilestone(1n, true);
      await barangayChain.connect(billy).verifyMilestone(1n, true);
      completeMilestone0Tx = await barangayChain
        .connect(official)
        .completeMilestone(1n);

      // Milestone 1
      await submitMilestone(1n);
      await barangayChain.connect(alice).verifyMilestone(1n, true);
      await barangayChain.connect(bob).verifyMilestone(1n, true);
      await barangayChain.connect(dave).verifyMilestone(1n, true);
      await barangayChain.connect(james).verifyMilestone(1n, true);
      await barangayChain.connect(billy).verifyMilestone(1n, true);
      completeMilestone1Tx = await barangayChain
        .connect(official)
        .completeMilestone(1n);

      // Milestone 2
      await submitMilestone(1n);
      await barangayChain.connect(alice).verifyMilestone(1n, true);
      await barangayChain.connect(bob).verifyMilestone(1n, true);
      await barangayChain.connect(dave).verifyMilestone(1n, true);
      await barangayChain.connect(james).verifyMilestone(1n, true);
      await barangayChain.connect(billy).verifyMilestone(1n, true);
      completeMilestone2Tx = await barangayChain
        .connect(official)
        .completeMilestone(1n);
    });

    it("should complete project without fail", async function () {
      expect(completeMilestone2Tx)
        .to.be.emit(barangayChain, "MilestoneCompleted")
        .withArgs(1n, 2n, parseEther(String(100_000)), true)
        .to.emit(treasury, "FundsReleased")
        .withArgs(vendor, parseEther(String(100_000)), 0n)
        .to.emit(treasuryToken, "Transfer")
        .withArgs(treasury, vendor, parseEther(String(100_000)));
    });

    it("should marked all milestones to done", async function () {
      expect((await barangayChain.projects(1n)).currentMilestone).to.be.eql(2n);
      expect(
        (await barangayChain.getProjectMilestone(1n, 0n)).status
      ).to.be.eqls(2n);
      expect(
        (await barangayChain.getProjectMilestone(1n, 1n)).status
      ).to.be.eqls(2n);
      expect(
        (await barangayChain.getProjectMilestone(1n, 2n)).status
      ).to.be.eqls(2n);
    });

    it("should not release fund on second milestone", async function () {
      expect(completeMilestone1Tx)
        .to.be.emit(barangayChain, "MilestoneCompleted")
        .withArgs(1n, 1n, parseEther("0"), false)
        .to.not.emit(treasury, "FundsReleased")
        .to.not.emit(treasuryToken, "Transfer");
    });
  });
});
