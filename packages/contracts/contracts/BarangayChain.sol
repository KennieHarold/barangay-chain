// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {AccessManaged} from "@openzeppelin/contracts/access/manager/AccessManaged.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "./interfaces/IBarangayChain.sol";
import "./interfaces/ITreasury.sol";

contract BarangayChain is IBarangayChain, AccessManaged {
    // Constants
    uint256 public constant BASIS_POINT = 10000;
    uint8 public constant QUORUM_VOTES = 5;
    uint8 public constant MIN_RELEASE_BPS_LENGTH = 3;

    // Immutables
    IERC20 public immutable PAYMENT_TOKEN;
    IERC721 public immutable CITIZEN_NFT;
    ITreasury public immutable TREASURY;

    // State variables
    uint256 public projectCounter;
    uint256 public vendorCounter;

    // Mappings
    mapping(uint256 projectId => Project) public projects;
    mapping(uint256 projectId => uint256 amount) public amountFundsReleased;
    mapping(bytes32 key => bool consensus) private userVerifications;
    mapping(uint256 vendorId => Vendor) public vendors;

    constructor(
        address authority,
        ITreasury treasury_,
        IERC721 citizenNFT
    ) AccessManaged(authority) {
        TREASURY = treasury_;
        PAYMENT_TOKEN = IERC20(treasury_.TREASURY_TOKEN());
        CITIZEN_NFT = citizenNFT;
    }

    modifier onlyCitizen() {
        require(
            CITIZEN_NFT.balanceOf(msg.sender) > 0,
            "BarangayChain: Not a citizen"
        );
        _;
    }

    modifier validateProjectExists(uint256 projectId) {
        Project memory project = projects[projectId];
        require(
            project.proposer != address(0) && project.budget > 0,
            "BarangayChain: Project doesn't exists"
        );
        _;
    }

    function createProject(
        address proposer,
        uint256 vendorId,
        uint256 budget,
        ITreasury.Category category,
        uint64 startDate,
        uint64 endDate,
        string memory uri,
        uint16[] memory releaseBpsTemplate
    ) external restricted {
        require(
            releaseBpsTemplate.length >= MIN_RELEASE_BPS_LENGTH,
            "BarangayChain::createProject: Too low release bps length"
        );
        require(
            proposer != address(0),
            "BarangayChain::createProject: Invalid proposer address"
        );

        uint256 sum = 0;
        for (uint8 i = 0; i < releaseBpsTemplate.length; i++) {
            sum += releaseBpsTemplate[i];
        }

        require(
            sum == BASIS_POINT,
            "BarangayChain::createProject: Release bps length not equal to 100"
        );

        Vendor memory vendor = vendors[vendorId];
        require(
            vendor.isWhitelisted,
            "BarangayChain::createProject: Vendor not whitelisted"
        );

        projectCounter++;

        Project storage project = projects[projectCounter];
        uint256 advancePayment = (budget * releaseBpsTemplate[0]) / BASIS_POINT;

        project.proposer = proposer;
        project.vendorId = vendorId;
        project.startDate = startDate;
        project.endDate = endDate;
        project.milestoneCount = uint8(releaseBpsTemplate.length);
        project.advancePayment = advancePayment;
        project.budget = budget;
        project.category = category;
        project.currentMilestone = 0;
        project.metadataURI = uri;

        for (uint8 i = 0; i < releaseBpsTemplate.length; i++) {
            uint16 releaseBps = 0;

            if (i == releaseBpsTemplate.length - 1) {
                releaseBps = releaseBpsTemplate[i];
            } else if (i == releaseBpsTemplate.length - 2) {
                releaseBps = 0;
            } else {
                releaseBps = releaseBpsTemplate[i + 1];
            }

            project.milestones.push(
                Milestone({
                    upvotes: 0,
                    downvotes: 0,
                    metadataURI: "",
                    releaseBps: releaseBps,
                    index: i,
                    status: MilestoneStatus.Pending,
                    isReleased: false
                })
            );
        }

        TREASURY.releaseFunds(vendor.walletAddress, advancePayment, category);
        amountFundsReleased[projectCounter] = advancePayment;

        emit ProjectCreated(
            projectCounter,
            proposer,
            vendorId,
            advancePayment,
            budget,
            category,
            startDate,
            endDate,
            uint8(releaseBpsTemplate.length),
            uri
        );
    }

    function submitMilestone(
        uint256 projectId,
        string memory uri
    ) external validateProjectExists(projectId) {
        Project storage project = projects[projectId];
        Vendor memory vendor = vendors[project.vendorId];

        require(
            vendor.isWhitelisted,
            "BarangayChain::submitMilestone: Vendor not whitelisted"
        );
        require(
            vendor.walletAddress == msg.sender,
            "BarangayChain::submitMilestone: Only assigned vendor"
        );
        require(
            _isWithinTimeframe(project.startDate, project.endDate),
            "BarangayChain::submitMilestone: Already due"
        );

        uint8 index = project.currentMilestone;
        Milestone storage milestone = project.milestones[index];

        require(
            milestone.status == MilestoneStatus.Pending,
            "BarangayChain::submitMilestone: Invalid status"
        );

        milestone.status = MilestoneStatus.ForVerification;
        milestone.metadataURI = uri;

        emit MilestoneSubmitted(projectId, index, msg.sender, uri);
    }

    function verifyMilestone(
        uint256 projectId,
        bool consensus
    ) external validateProjectExists(projectId) onlyCitizen {
        Project storage project = projects[projectId];

        require(
            _isWithinTimeframe(project.startDate, project.endDate),
            "BarangayChain::verifyMilestone: Already due"
        );

        uint8 index = project.currentMilestone;
        Milestone storage milestone = project.milestones[index];

        require(
            milestone.status == MilestoneStatus.ForVerification,
            "BarangayChain::verifyMilestone: Invalid status"
        );

        bytes32 verificationKey = _packKey(projectId, index, msg.sender);
        require(
            !userVerifications[verificationKey],
            "BarangayChain::verifyMilestone: Already verified"
        );

        if (consensus) {
            milestone.upvotes = milestone.upvotes + 1;
        } else {
            milestone.downvotes = milestone.downvotes + 1;
        }

        userVerifications[verificationKey] = consensus;

        emit MilestoneVerified(
            projectId,
            index,
            msg.sender,
            consensus,
            milestone.upvotes,
            milestone.downvotes
        );
    }

    function completeMilestone(
        uint256 projectId
    ) external validateProjectExists(projectId) restricted {
        Project storage project = projects[projectId];

        require(
            _isWithinTimeframe(project.startDate, project.endDate),
            "BarangayChain::completeMilestone: Already due"
        );

        uint8 currentMilestone = project.currentMilestone;
        Milestone storage milestone = project.milestones[currentMilestone];

        require(
            milestone.status == MilestoneStatus.ForVerification,
            "BarangayChain::completeMilestone: Invalid status"
        );

        bool consensus = milestone.upvotes > milestone.downvotes
            ? milestone.upvotes - milestone.downvotes >= QUORUM_VOTES
            : false;

        require(
            consensus,
            "BarangayChain::completeMilestone: Consensus required"
        );

        milestone.status = MilestoneStatus.Done;

        uint256 payment = (project.budget * milestone.releaseBps) / BASIS_POINT;
        bool isProjectCompleted = currentMilestone ==
            project.milestones.length - 1;

        Vendor storage vendor = vendors[project.vendorId];

        if (isProjectCompleted) {
            vendor.totalProjectsDone += 1;
        } else {
            project.currentMilestone = currentMilestone + 1;
        }

        if (payment > 0) {
            amountFundsReleased[projectId] += payment;
            vendor.totalDisbursement += payment;
            milestone.isReleased = true;

            TREASURY.releaseFunds(
                vendor.walletAddress,
                payment,
                project.category
            );
        }

        emit MilestoneCompleted(
            projectId,
            currentMilestone,
            payment,
            isProjectCompleted
        );
    }

    function addVendor(address walletAddress, string memory uri) external {
        require(
            walletAddress != address(0),
            "BarangayChain::addVendor: Invalid wallet address"
        );

        vendorCounter++;
        vendors[vendorCounter] = Vendor({
            walletAddress: walletAddress,
            metadataURI: uri,
            isWhitelisted: true,
            totalProjectsDone: 0,
            totalDisbursement: 0
        });

        emit VendorAdded(vendorCounter, walletAddress);
    }

    function setVendorWhitelist(uint256 vendorId, bool status) external {
        Vendor storage vendor = vendors[vendorId];

        require(
            vendor.walletAddress != address(0),
            "BarangayChain::setVendorWhitelist: Vendor not added"
        );

        vendor.isWhitelisted = status;

        emit SetVendorWhitelist(vendorId, status);
    }

    function getProjectMilestone(
        uint256 projectId,
        uint8 milestoneIdx
    ) external view returns (Milestone memory) {
        Project memory project = projects[projectId];
        return project.milestones[milestoneIdx];
    }

    function getUserMilestoneVerification(
        uint256 projectId,
        uint8 milestoneIdx,
        address citizen
    ) external view returns (bool) {
        bytes32 verificationKey = _packKey(projectId, milestoneIdx, citizen);
        return userVerifications[verificationKey];
    }

    function _isWithinTimeframe(
        uint64 startDate,
        uint64 endDate
    ) internal view returns (bool) {
        return block.timestamp >= startDate && block.timestamp <= endDate;
    }

    function _packKey(
        uint256 projectId,
        uint8 milestoneIdx,
        address citizen
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(projectId, milestoneIdx, citizen));
    }
}
