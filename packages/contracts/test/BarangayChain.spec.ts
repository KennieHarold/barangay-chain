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
import type { BarangayAccessManager } from "../types/ethers-contracts/BarangayAccessManager.js";
import type {
  BarangayChain__factory,
  CitizenNFT__factory,
  MockERC20,
  Treasury__factory,
} from "../types/ethers-contracts/index.js";

export const TEST_METADATA_URI =
  "http://scarlet-inc-buzzard-641.mypinata.cloud/ipfs/test-ipfs-hash";

describe("BarangayChain", function () {
  let ethers: any;
  let networkHelpers: any;
  let accessManager: BarangayAccessManager;
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

  before(async function () {
    const provider = await network.connect();
    ethers = provider.ethers;
    networkHelpers = provider.networkHelpers;
  });

  beforeEach(async function () {
    [admin, official, vendor, alice, bob, dave, james, billy, john] =
      await ethers.getSigners();

    // Deploy AccessManager
    const AccessManagerFactory = await ethers.getContractFactory(
      "BarangayAccessManager"
    );
    accessManager = await AccessManagerFactory.deploy(admin, official);

    // Deploy CitizenNFT
    const CitizenNFTFactory: CitizenNFT__factory =
      await ethers.getContractFactory("CitizenNFT");
    citizenNFT = await CitizenNFTFactory.deploy(accessManager);

    // Deploy Treasury Token
    const TreasuryTokenFactory = await ethers.getContractFactory("MockERC20");
    treasuryToken = await TreasuryTokenFactory.deploy(
      "Tether USD",
      "USDT",
      parseEther(String(1_000_000_000_000)) // 1 trillion
    );

    // Deploy Treasury
    const TreasuryFactory: Treasury__factory = await ethers.getContractFactory(
      "Treasury"
    );
    treasury = await TreasuryFactory.deploy(
      accessManager,
      ZeroAddress,
      treasuryToken
    );

    // Deploy BarangayChain
    const BarangayChainFactory: BarangayChain__factory =
      await ethers.getContractFactory("BarangayChain");
    barangayChain = await BarangayChainFactory.deploy(
      accessManager,
      treasury,
      citizenNFT
    );

    // Set access control rules for official
    const createProjectSelector =
      BarangayChainFactory.interface.getFunction("createProject")?.selector ||
      "";
    const completeMilestoneSelector =
      BarangayChainFactory.interface.getFunction("completeMilestone")
        ?.selector || "";
    const safeMintSelector =
      CitizenNFTFactory.interface.getFunction("safeMint")?.selector || "";

    await accessManager.setTargetFunctionRole(
      barangayChain,
      [createProjectSelector, completeMilestoneSelector, safeMintSelector],
      1n
    );

    // Set Protocol
    await treasury.setProtocol(barangayChain);

    // Fund treasury
    await treasuryToken.connect(admin).transfer(
      treasury,
      parseEther(String(1_000_000_000)) // 1 billion
    );

    // Mint CitizenNFT
    await citizenNFT.safeMint(alice, "1");
    await citizenNFT.safeMint(bob, "2");
    await citizenNFT.safeMint(dave, "3");
    await citizenNFT.safeMint(james, "4");
    await citizenNFT.safeMint(billy, "5");
    await citizenNFT.safeMint(john, "6");
  });

  async function timeTravel(seconds: number) {
    await networkHelpers.time.increase(seconds);
  }

  async function createProjectDefault() {
    const startDate = await networkHelpers.time.latest();
    const endDate = startDate + 1825 * 24 * 60 * 60; // 5 years from now

    const tx = await barangayChain.connect(official).createProject(
      official,
      1n,
      parseEther(String(1_000_000)), // 1 million
      0n,
      BigInt(startDate),
      BigInt(endDate),
      TEST_METADATA_URI,
      [3000n, 6000n, 1000n]
    );

    return { tx, startDate, endDate };
  }

  async function submitMilestone(projectId: bigint) {
    await barangayChain
      .connect(vendor)
      .submitMilestone(projectId, TEST_METADATA_URI);
  }

  describe("Deployment", function () {
    it("should deploy with correct constants", async function () {
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
        0n,
        0n,
        0n,
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
      await barangayChain.addVendor(vendor, TEST_METADATA_URI);
    });

    it("should revert when non-official creates project", async function () {
      await expect(
        barangayChain.connect(alice).createProject(
          official,
          1n,
          parseEther(String(1_000_000)), // 1 million
          0n,
          BigInt(startDate),
          BigInt(endDate),
          TEST_METADATA_URI,
          [3000n, 6000n, 1000n]
        )
      ).to.be.rejectedWith(
        `AccessManagedUnauthorized("${await alice.getAddress()}")`
      );
    });

    it("should successfully create project", async function () {
      await expect(
        barangayChain.connect(official).createProject(
          official,
          1n,
          parseEther(String(1_000_000)), // 1 million
          0n,
          BigInt(startDate),
          BigInt(endDate),
          TEST_METADATA_URI,
          [3000n, 6000n, 1000n]
        )
      )
        .to.emit(barangayChain, "ProjectCreated")
        .withArgs(
          1n,
          official,
          1n,
          parseEther(String(300_000)),
          parseEther(String(1_000_000)),
          0n,
          BigInt(startDate),
          BigInt(endDate),
          3,
          TEST_METADATA_URI
        )
        .to.emit(treasury, "FundsReleased")
        .withArgs(vendor, parseEther(String(300_000)), 0n)
        .to.emit(treasuryToken, "Transfer")
        .withArgs(treasury, vendor, parseEther(String(300_000)));

      expect(await barangayChain.projectCounter()).to.be.eq(1);
      expect(await barangayChain.projects(1)).to.be.eqls([
        await official.getAddress(),
        BigInt(startDate),
        BigInt(endDate),
        3n,
        1n,
        parseEther(String(300_000)),
        parseEther(String(1_000_000)), // 1 million
        0n,
        0n,
        TEST_METADATA_URI,
      ]);

      const milestones = {
        0: [0n, 0n, "", 6000n, 0n, false, 0n],
        1: [0n, 0n, "", 0n, 1n, false, 0n],
        2: [0n, 0n, "", 1000n, 2n, false, 0n],
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
          1n,
          parseEther(String(1_000_000)), // 1 million
          0n,
          BigInt(startDate),
          BigInt(endDate),
          TEST_METADATA_URI,
          [3000n, 7000n]
        )
      ).to.be.rejectedWith(
        "BarangayChain::createProject: Too low release bps length"
      );
    });
  });

  describe("Milestone Submission", async function () {
    beforeEach(async function () {
      await barangayChain.addVendor(vendor, TEST_METADATA_URI);
      await createProjectDefault();
    });

    it("should revert when non-vendor submits milestone", async function () {
      await expect(
        barangayChain.connect(alice).submitMilestone(1n, TEST_METADATA_URI)
      ).to.be.rejectedWith(
        "BarangayChain::submitMilestone: Only assigned vendor"
      );
    });

    it("should submit milestone successfully", async function () {
      await expect(
        barangayChain.connect(vendor).submitMilestone(1n, TEST_METADATA_URI)
      )
        .to.emit(barangayChain, "MilestoneSubmitted")
        .withArgs(1n, 0n, vendor, TEST_METADATA_URI);
    });

    it("should revert when submitting another milestone", async function () {
      await submitMilestone(1n);
      await expect(
        barangayChain.connect(vendor).submitMilestone(1n, TEST_METADATA_URI)
      ).to.be.rejectedWith("BarangayChain::submitMilestone: Invalid status");
    });

    it("should revert when project is already due", async function () {
      await timeTravel(1825 * 24 * 60 * 60 + 1);
      await expect(
        barangayChain.connect(vendor).submitMilestone(1n, TEST_METADATA_URI)
      ).to.be.rejectedWith("BarangayChain::submitMilestone: Already due");
    });
  });

  describe("Milestone Verification", async function () {
    beforeEach(async function () {
      await barangayChain.addVendor(vendor, TEST_METADATA_URI);
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

      const milestone = [1n, 0n, TEST_METADATA_URI, 6000n, 0n, false, 1n];
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
      await barangayChain.addVendor(vendor, TEST_METADATA_URI);
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
      ).to.be.rejectedWith(
        `AccessManagedUnauthorized("${await vendor.getAddress()}")`
      );
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
      await barangayChain.addVendor(vendor, TEST_METADATA_URI);
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
