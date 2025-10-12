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

    event MilestoneVoted(
        uint256 indexed projectId,
        uint8 indexed milestoneIndex,
        address indexed voter,
        bool status,
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
        uint256 budget;
        ITreasury.Category category;
        uint64 startDate;
        uint64 endDate;
        string metadataURI;
        uint8 currentMilestone;
        Milestone[] milestones;
    }

    struct Milestone {
        uint8 index;
        uint16 releaseBps;
        string metadataURI;
        MilestoneStatus status;
        uint256 upvotes;
        uint256 downvotes;
    }

    struct MilestonePayload {
        uint16 releaseBps;
    }
}
