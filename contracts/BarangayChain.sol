// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "./interfaces/IBarangayChain.sol";
import "./interfaces/ITreasury.sol";

contract BarangayChain is IBarangayChain, AccessControl {
    bytes32 public constant OFFICIAL_ROLE = keccak256("OFFICIAL_ROLE");

    bytes32 public constant VENDOR_ROLE = keccak256("VENDOR_ROLE");

    uint8 public constant QUORUM_VOTES = 5;

    IERC20 public immutable PAYMENT_TOKEN;

    IERC721 public immutable CITIZEN_NFT;

    ITreasury public immutable TREASURY;

    uint256 public constant BASIS_POINT = 10000;

    uint256 projectCounter;

    mapping(uint256 => Project) public projects;

    constructor(ITreasury treasury_, IERC721 citizenNFT) {
        TREASURY = treasury_;
        PAYMENT_TOKEN = IERC20(treasury_.TREASURY_TOKEN());
        CITIZEN_NFT = citizenNFT;
    }

    modifier onlyOfficial() {
        require(
            hasRole(OFFICIAL_ROLE, msg.sender),
            "BarangayChain: Not an official"
        );
        _;
    }

    modifier onlyVendor() {
        require(
            hasRole(VENDOR_ROLE, msg.sender),
            "BarangayChain: Not a vendor"
        );
        _;
    }

    modifier onlyCitizen() {
        require(
            CITIZEN_NFT.balanceOf(msg.sender) > 0,
            "BarangayChain: Not a citizen"
        );
        _;
    }

    function createProject(
        address proposer,
        address vendor,
        uint256 budget,
        ITreasury.Category category,
        uint64 startDate,
        uint64 endDate,
        string memory uri,
        uint16[] memory releaseBpsTemplate
    ) external onlyOfficial {
        projectCounter++;

        Project storage project = projects[projectCounter];
        project.proposer = proposer;
        project.vendor = vendor;
        project.budget = budget;
        project.category = category;
        project.startDate = startDate;
        project.endDate = endDate;
        project.metadataURI = uri;
        project.currentMilestone = 0;

        for (uint8 i = 0; i < releaseBpsTemplate.length; i++) {
            project.milestones.push(
                Milestone({
                    index: i,
                    releaseBps: releaseBpsTemplate[i],
                    metadataURI: "",
                    status: MilestoneStatus.Pending,
                    upvotes: 0,
                    downvotes: 0
                })
            );
        }

        uint256 advancePayment = (budget * releaseBpsTemplate[0]) / BASIS_POINT;
        TREASURY.releaseFunds(vendor, advancePayment, category);
    }

    function submitMilestone(
        uint256 projectId,
        string memory uri
    ) external onlyVendor {
        Project storage project = projects[projectId];

        require(
            isWithinTimeframe(project.startDate, project.endDate),
            "BarangayChain::submitMilestone: Not Allowed outside timeframe"
        );

        uint8 index = project.currentMilestone;
        Milestone storage milestone = project.milestones[index];

        milestone.status = MilestoneStatus.ForVerification;
        milestone.metadataURI = uri;
    }

    function verifyMilestone(
        uint256 projectId,
        bool status
    ) external onlyCitizen {
        Project storage project = projects[projectId];

        require(
            isWithinTimeframe(project.startDate, project.endDate),
            "BarangayChain::verifyMilestone: Not Allowed outside timeframe"
        );

        uint8 index = project.currentMilestone;
        Milestone storage milestone = project.milestones[index];

        if (status) {
            milestone.upvotes = milestone.upvotes + 1;
        } else {
            milestone.downvotes = milestone.downvotes + 1;
        }
    }

    function completeMilestone(uint256 projectId) external onlyOfficial {
        Project storage project = projects[projectId];

        require(
            isWithinTimeframe(project.startDate, project.endDate),
            "BarangayChain::completeMilestone: Not Allowed outside timeframe"
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
            "BarangayChain:completeMilestone Consensus required"
        );

        milestone.status = MilestoneStatus.Done;

        uint256 payment = 0;
        uint8 nextIndex = currentMilestone + 1;
        bool isProjectCompleted = currentMilestone == project.milestones.length;

        if (isProjectCompleted) {
            payment = (project.budget * milestone.releaseBps) / BASIS_POINT;
        } else {
            project.currentMilestone = nextIndex;
        }

        bool isNextMilestone = project.currentMilestone == nextIndex;
        bool isBeforeCompletionStage = currentMilestone <
            project.milestones.length - 2;

        if (isNextMilestone && isBeforeCompletionStage) {
            Milestone memory nextMilestone = project.milestones[nextIndex];
            payment = (project.budget * nextMilestone.releaseBps) / BASIS_POINT;
        }
        if (payment > 0) {
            TREASURY.releaseFunds(project.vendor, payment, project.category);
        }
    }

    function isWithinTimeframe(
        uint64 startDate,
        uint64 endDate
    ) internal view returns (bool) {
        return block.timestamp >= startDate && block.timestamp <= endDate;
    }
}
