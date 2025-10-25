import { expect } from "chai";
import { network } from "hardhat";
import { ZeroAddress, type Signer } from "ethers";

import type { CitizenNFT } from "../types/ethers-contracts/CitizenNFT.js";
import type { BarangayAccessManager } from "../types/ethers-contracts/BarangayAccessManager.js";
import type { CitizenNFT__factory } from "../types/ethers-contracts/index.js";

export const TEST_METADATA_URI =
  "http://scarlet-inc-buzzard-641.mypinata.cloud/ipfs/test-ipfs-hash";

describe("CitizenNFT", function () {
  let ethers: any;
  let networkHelpers: any;
  let accessManager: BarangayAccessManager;
  let citizenNFT: CitizenNFT;

  let admin: Signer;
  let official: Signer;
  let vendor: Signer;
  let alice: Signer;
  let bob: Signer;
  let dave: Signer;

  before(async function () {
    const provider = await network.connect();
    ethers = provider.ethers;
    networkHelpers = provider.networkHelpers;
  });

  beforeEach(async function () {
    [admin, official, vendor, alice, bob, dave] = await ethers.getSigners();

    // Deploy AccessManager
    const AccessManagerFactory = await ethers.getContractFactory(
      "BarangayAccessManager"
    );
    accessManager = await AccessManagerFactory.deploy(admin, official);

    // Deploy CitizenNFT
    const CitizenNFTFactory: CitizenNFT__factory =
      await ethers.getContractFactory("CitizenNFT");
    citizenNFT = await CitizenNFTFactory.deploy(accessManager);

    // Set access control rules for official
    const safeMintSelector =
      CitizenNFTFactory.interface.getFunction("safeMint")?.selector || "";

    await accessManager.setTargetFunctionRole(
      citizenNFT,
      [safeMintSelector],
      1n
    );
  });

  describe("Deployment", function () {
    it("should deploy with correct initial data", async function () {
      expect(await citizenNFT.name()).to.be.eq("CitizenNFT");
      expect(await citizenNFT.symbol()).to.be.eq("CZNFT");
      expect(await citizenNFT.authority()).to.be.eq(accessManager);
    });
    it("should have empty states", async function () {
      expect(await citizenNFT.totalSupply()).to.be.eq(0);
      expect(await citizenNFT.balanceOf(alice)).to.be.eq(0);
    });
  });

  describe("Safe Mint", function () {
    it("should revert when non-official issue nft", async () => {
      await expect(
        citizenNFT.connect(alice).safeMint(alice, "test-ipfs-hash")
      ).to.be.rejectedWith(
        `AccessManagedUnauthorized("${await alice.getAddress()}")`
      );
    });
    it("should successfully mint nft", async function () {
      await expect(
        citizenNFT.connect(official).safeMint(alice, "test-ipfs-hash")
      )
        .to.emit(citizenNFT, "Transfer")
        .withArgs(ZeroAddress, alice, 0);

      expect(await citizenNFT.balanceOf(alice)).to.be.eq(1);
      expect(await citizenNFT.ownerOf(0)).to.be.eq(alice);
      expect(await citizenNFT.totalSupply()).to.be.eq(1);
      expect(await citizenNFT.tokenOfOwnerByIndex(alice, 0)).to.be.eq(0);
      expect(await citizenNFT.tokenURI(0)).to.be.eq(TEST_METADATA_URI);
    });
    it("should multiple mint", async function () {
      await expect(
        citizenNFT.connect(official).safeMint(alice, "test-ipfs-hash")
      )
        .to.emit(citizenNFT, "Transfer")
        .withArgs(ZeroAddress, alice, 0);
      await expect(citizenNFT.connect(official).safeMint(bob, "test-ipfs-hash"))
        .to.emit(citizenNFT, "Transfer")
        .withArgs(ZeroAddress, bob, 1);

      // Multiple mint with same owner
      await expect(
        citizenNFT.connect(official).safeMint(dave, "test-ipfs-hash")
      )
        .to.emit(citizenNFT, "Transfer")
        .withArgs(ZeroAddress, dave, 2);
      await expect(
        citizenNFT.connect(official).safeMint(dave, "test-ipfs-hash")
      )
        .to.emit(citizenNFT, "Transfer")
        .withArgs(ZeroAddress, dave, 3);

      expect(await citizenNFT.totalSupply()).to.be.eq(4);
      expect(await citizenNFT.tokenOfOwnerByIndex(dave, 0)).to.be.eq(2);
      expect(await citizenNFT.tokenOfOwnerByIndex(dave, 1)).to.be.eq(3);
    });
  });
});
