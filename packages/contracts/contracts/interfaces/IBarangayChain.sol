// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./ITreasury.sol";

/**
 * @title IBarangayChain
 * @author Barangay Chain Team
 * @notice Interface for the BarangayChain contract
 * @dev Defines events, enums, structs, and function signatures for project and vendor management
 */
interface IBarangayChain {
    // Events
    /// @notice Emitted when a new project is created
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

    /// @notice Emitted when a milestone is submitted for verification
    event MilestoneSubmitted(
        uint256 indexed projectId,
        uint8 indexed milestoneIndex,
        address indexed vendor,
        string uri
    );

    /// @notice Emitted when a citizen votes on a milestone
    event MilestoneVerified(
        uint256 indexed projectId,
        uint8 indexed milestoneIndex,
        address indexed voter,
        bool consensus,
        uint256 upvotes,
        uint256 downvotes
    );

    /// @notice Emitted when a milestone is completed and funds are released
    event MilestoneCompleted(
        uint256 indexed projectId,
        uint8 indexed milestoneIndex,
        uint256 paymentReleased,
        bool isProjectCompleted
    );

    /// @notice Emitted when a new vendor is added
    event VendorAdded(uint256 indexed vendorId, address indexed walletAddress);

    /// @notice Emitted when a vendor's whitelist status is updated
    event SetVendorWhitelist(uint256 indexed vendorId, bool status);

    // Enums
    /**
     * @notice Status of a project milestone
     * @param Pending Milestone has not been submitted yet
     * @param ForVerification Milestone is submitted and awaiting citizen votes
     * @param Done Milestone is completed and funds released (if applicable)
     */
    enum MilestoneStatus {
        Pending,
        ForVerification,
        Done
    }

    /**
     * @notice Project data structure
     * @param proposer Address of the project proposer
     * @param startDate Unix timestamp for project start
     * @param endDate Unix timestamp for project end
     * @param milestoneCount Total number of milestones in the project
     * @param vendorId ID of the assigned vendor
     * @param advancePayment Initial payment released to vendor
     * @param budget Total project budget
     * @param category Budget category for the project
     * @param currentMilestone Index of the current active milestone
     * @param metadataURI URI pointing to project metadata
     * @param milestones Array of milestone data
     */
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

    /**
     * @notice Milestone data structure
     * @param upvotes Number of approval votes received
     * @param downvotes Number of rejection votes received
     * @param metadataURI URI pointing to milestone deliverables
     * @param releaseBps Basis points of budget to release upon completion
     * @param index Milestone index in the project
     * @param isReleased Whether funds have been released for this milestone
     * @param status Current status of the milestone
     */
    struct Milestone {
        uint256 upvotes;
        uint256 downvotes;
        string metadataURI;
        uint16 releaseBps;
        uint8 index;
        bool isReleased;
        MilestoneStatus status;
    }

    /**
     * @notice Payload for milestone release configuration
     * @param releaseBps Basis points to release
     */
    struct MilestonePayload {
        uint16 releaseBps;
    }

    /**
     * @notice Vendor data structure
     * @param walletAddress Address of the vendor's wallet
     * @param metadataURI URI pointing to vendor information
     * @param isWhitelisted Whether vendor is approved for new projects
     * @param totalProjectsDone Number of projects completed by vendor
     * @param totalDisbursement Total amount disbursed to vendor
     */
    struct Vendor {
        address walletAddress;
        string metadataURI;
        bool isWhitelisted;
        uint256 totalProjectsDone;
        uint256 totalDisbursement;
    }

    /**
     * @notice Creates a new project with milestone-based fund releases
     * @param proposer Address of the project proposer
     * @param vendorId ID of the vendor assigned to the project
     * @param budget Total budget for the project
     * @param category Budget category for the project
     * @param startDate Unix timestamp for project start
     * @param endDate Unix timestamp for project end
     * @param uri Metadata URI for project details
     * @param releaseBpsTemplate Array of basis points for each milestone
     */
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

    /**
     * @notice Submits a milestone for verification
     * @param projectId ID of the project
     * @param uri Metadata URI containing milestone deliverables
     */
    function submitMilestone(uint256 projectId, string memory uri) external;

    /**
     * @notice Allows citizens to vote on milestone verification
     * @param projectId ID of the project
     * @param consensus true for approval, false for rejection
     */
    function verifyMilestone(uint256 projectId, bool consensus) external;

    /**
     * @notice Completes a milestone and releases funds if consensus is reached
     * @param projectId ID of the project
     */
    function completeMilestone(uint256 projectId) external;

    /**
     * @notice Registers a new vendor in the system
     * @param walletAddress Address of the vendor's wallet
     * @param uri Metadata URI containing vendor information
     */
    function addVendor(address walletAddress, string memory uri) external;

    /**
     * @notice Updates the whitelist status of a vendor
     * @param vendorId ID of the vendor
     * @param status true to whitelist, false to blacklist
     */
    function setVendorWhitelist(uint256 vendorId, bool status) external;

    /**
     * @notice Retrieves details of a specific milestone
     * @param projectId ID of the project
     * @param milestoneIdx Index of the milestone
     * @return Milestone struct containing milestone details
     */
    function getProjectMilestone(
        uint256 projectId,
        uint8 milestoneIdx
    ) external view returns (Milestone memory);

    /**
     * @notice Checks if a citizen has voted on a specific milestone
     * @param projectId ID of the project
     * @param milestoneIdx Index of the milestone
     * @param citizen Address of the citizen
     * @return bool true if citizen has voted
     */
    function getUserMilestoneVerification(
        uint256 projectId,
        uint8 milestoneIdx,
        address citizen
    ) external view returns (bool);
}
