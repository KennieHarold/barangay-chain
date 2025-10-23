// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./ITreasury.sol";

interface IBarangayChain {
    // Events
    event ProjectCreated(
        uint256 indexed projectId,
        address indexed proposer,
        uint256 indexed vendorId,
        uint256 advancePayment,
        uint256 budget,
        ITreasury.Category category,
        uint64 startDate,
        uint64 endDate,
        uint8 milestoneCount,
        string uri
    );

    event MilestoneSubmitted(
        uint256 indexed projectId,
        uint8 indexed milestoneIndex,
        address indexed vendor,
        string uri
    );

    event MilestoneVerified(
        uint256 indexed projectId,
        uint8 indexed milestoneIndex,
        address indexed voter,
        bool consensus,
        uint256 upvotes,
        uint256 downvotes
    );

    event MilestoneCompleted(
        uint256 indexed projectId,
        uint8 indexed milestoneIndex,
        uint256 paymentReleased,
        bool isProjectCompleted
    );

    // Enums
    enum MilestoneStatus {
        Pending,
        ForVerification,
        Done
    }

    event VendorAdded(uint256 indexed vendorId, address indexed walletAddress);

    event SetVendorWhitelist(uint256 indexed vendorId, bool status);

    struct Project {
        address proposer;
        uint64 startDate;
        uint64 endDate;
        uint8 milestoneCount;
        uint256 vendorId;
        uint256 advancePayment;
        uint256 budget;
        ITreasury.Category category;
        uint8 currentMilestone;
        string metadataURI;
        Milestone[] milestones;
    }

    struct Milestone {
        uint256 upvotes;
        uint256 downvotes;
        string metadataURI;
        uint16 releaseBps;
        uint8 index;
        bool isReleased;
        MilestoneStatus status;
    }

    struct MilestonePayload {
        uint16 releaseBps;
    }

    struct Vendor {
        address walletAddress;
        string metadataURI;
        bool isWhitelisted;
        uint256 totalProjectsDone;
        uint256 totalDisbursement;
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
    ) external;

    function submitMilestone(uint256 projectId, string memory uri) external;

    function verifyMilestone(uint256 projectId, bool consensus) external;

    function completeMilestone(uint256 projectId) external;

    function addVendor(address walletAddress, string memory uri) external;

    function setVendorWhitelist(uint256 vendorId, bool status) external;

    function getProjectMilestone(
        uint256 projectId,
        uint8 milestoneIdx
    ) external view returns (Milestone memory);

    function getUserMilestoneVerification(
        uint256 projectId,
        uint8 milestoneIdx,
        address citizen
    ) external view returns (bool);
}
