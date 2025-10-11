// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "../types/CategoryEnum.sol";

interface IBarangayChain {
    enum MilestoneStatus {
        Pending,
        ForVerification,
        Done
    }

    struct Project {
        address proposer;
        address vendor;
        uint256 budget;
        Category category;
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
