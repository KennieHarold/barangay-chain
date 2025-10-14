// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./ITreasury.sol";

interface IBarangayChain {
    // Events
    event ProjectCreated(
        uint256 indexed projectId,
        address indexed proposer,
        address indexed vendor,
        uint256 budget,
        ITreasury.Category category,
        uint64 startDate,
        uint64 endDate,
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

    struct Project {
        address proposer;
        address vendor;
        uint64 startDate;
        uint64 endDate;
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
        MilestoneStatus status;
    }

    struct MilestonePayload {
        uint16 releaseBps;
    }
}
