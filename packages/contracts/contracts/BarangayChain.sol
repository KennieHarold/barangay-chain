// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {AccessManaged} from "@openzeppelin/contracts/access/manager/AccessManaged.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "./interfaces/IBarangayChain.sol";
import "./interfaces/ITreasury.sol";

/**
 * @title BarangayChain
 * @author Barangay Chain Team
 * @notice Main contract for managing barangay projects, vendors, and milestone-based fund releases
 * @dev Implements AccessManaged for role-based access control and integrates with Treasury for fund management
 */
contract BarangayChain is IBarangayChain, AccessManaged {
    // Constants
    /// @notice Basis point denominator for percentage calculations (100%)
    uint256 public constant BASIS_POINT = 10000;
    /// @notice Minimum number of net upvotes required for milestone consensus
    uint8 public constant QUORUM_VOTES = 5;
    /// @notice Minimum number of milestones required for a project
    uint8 public constant MIN_RELEASE_BPS_LENGTH = 3;

    // Immutables
    /// @notice ERC20 token used for all payments in the system
    IERC20 public immutable PAYMENT_TOKEN;
    /// @notice NFT contract representing citizenship in the barangay
    IERC721 public immutable CITIZEN_NFT;
    /// @notice Treasury contract managing fund allocation and disbursement
    ITreasury public immutable TREASURY;

    // State variables
    /// @notice Counter for tracking the total number of projects created
    uint256 public projectCounter;
    /// @notice Counter for tracking the total number of vendors registered
    uint256 public vendorCounter;

    // Mappings
    /// @notice Mapping of project ID to Project details
    mapping(uint256 projectId => Project) public projects;
    /// @notice Mapping of project ID to total amount of funds released
    mapping(uint256 projectId => uint256 amount) public amountFundsReleased;
    /// @notice Mapping of verification key to user's consensus vote (true=upvote, false=downvote)
    mapping(bytes32 key => bool consensus) private userVerifications;
    /// @notice Mapping of vendor ID to Vendor details
    mapping(uint256 vendorId => Vendor) public vendors;

    /**
     * @notice Initializes the BarangayChain contract
     * @param authority Address of the AccessManager contract for role-based access control
     * @param treasury_ Address of the Treasury contract
     * @param citizenNFT Address of the CitizenNFT contract
     */
    constructor(
        address authority,
        ITreasury treasury_,
        IERC721 citizenNFT
    ) AccessManaged(authority) {
        TREASURY = treasury_;
        PAYMENT_TOKEN = IERC20(treasury_.TREASURY_TOKEN());
        CITIZEN_NFT = citizenNFT;
    }

    /**
     * @notice Restricts function access to citizens only (NFT holders)
     * @dev Reverts if caller doesn't own a CitizenNFT
     */
    modifier onlyCitizen() {
        require(
            CITIZEN_NFT.balanceOf(msg.sender) > 0,
            "BarangayChain: Not a citizen"
        );
        _;
    }

    /**
     * @notice Validates that a project exists
     * @dev Checks if the project has a valid proposer and budget
     * @param projectId The ID of the project to validate
     */
    modifier validateProjectExists(uint256 projectId) {
        Project memory project = projects[projectId];
        require(
            project.proposer != address(0) && project.budget > 0,
            "BarangayChain: Project doesn't exists"
        );
        _;
    }

    /**
     * @notice Creates a new project with milestone-based fund releases
     * @dev Only callable by authorized roles. Validates vendor, budget allocation, and release template
     * @param proposer Address of the project proposer
     * @param vendorId ID of the vendor assigned to the project
     * @param budget Total budget for the project in payment tokens
     * @param category Budget category (Infrastructure, Health, Education, etc.)
     * @param startDate Unix timestamp for project start
     * @param endDate Unix timestamp for project end
     * @param uri Metadata URI for project details
     * @param releaseBpsTemplate Array of basis points for each milestone (must sum to 10000)
     * @custom:emits ProjectCreated
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
        require(
            TREASURY.isWithinAllowableAllocation(category, budget),
            "BarangayChain::createProject: Allocation reached for this category"
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

    /**
     * @notice Submits a milestone for verification
     * @dev Only the assigned vendor can submit milestones. Must be within project timeframe
     * @param projectId ID of the project
     * @param uri Metadata URI containing milestone deliverables
     * @custom:emits MilestoneSubmitted
     */
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

    /**
     * @notice Allows citizens to vote on milestone verification
     * @dev Only citizens (NFT holders) can vote. Each citizen can vote once per milestone
     * @param projectId ID of the project
     * @param consensus true for approval (upvote), false for rejection (downvote)
     * @custom:emits MilestoneVerified
     */
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

    /**
     * @notice Completes a milestone and releases funds if consensus is reached
     * @dev Only callable by authorized roles. Requires quorum of votes for consensus
     * @param projectId ID of the project
     * @custom:emits MilestoneCompleted
     */
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
            vendor.totalProjectsDone++;
        } else {
            project.currentMilestone++;
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

    /**
     * @notice Registers a new vendor in the system
     * @dev Only callable by authorized roles. Creates a new vendor with whitelisted status
     * @param walletAddress Address of the vendor's wallet
     * @param uri Metadata URI containing vendor information
     * @custom:emits VendorAdded
     */
    function addVendor(
        address walletAddress,
        string memory uri
    ) external restricted {
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

    /**
     * @notice Updates the whitelist status of a vendor
     * @dev Only callable by authorized roles. Controls whether a vendor can be assigned to new projects
     * @param vendorId ID of the vendor
     * @param status true to whitelist, false to blacklist
     * @custom:emits SetVendorWhitelist
     */
    function setVendorWhitelist(
        uint256 vendorId,
        bool status
    ) external restricted {
        Vendor storage vendor = vendors[vendorId];

        require(
            vendor.walletAddress != address(0),
            "BarangayChain::setVendorWhitelist: Vendor not added"
        );

        vendor.isWhitelisted = status;

        emit SetVendorWhitelist(vendorId, status);
    }

    /**
     * @notice Retrieves details of a specific milestone
     * @param projectId ID of the project
     * @param milestoneIdx Index of the milestone
     * @return Milestone struct containing milestone details
     */
    function getProjectMilestone(
        uint256 projectId,
        uint8 milestoneIdx
    ) external view returns (Milestone memory) {
        Project memory project = projects[projectId];
        return project.milestones[milestoneIdx];
    }

    /**
     * @notice Checks if a citizen has voted on a specific milestone
     * @param projectId ID of the project
     * @param milestoneIdx Index of the milestone
     * @param citizen Address of the citizen
     * @return bool true if citizen has voted (either upvote or downvote), false otherwise
     */
    function getUserMilestoneVerification(
        uint256 projectId,
        uint8 milestoneIdx,
        address citizen
    ) external view returns (bool) {
        bytes32 verificationKey = _packKey(projectId, milestoneIdx, citizen);
        return userVerifications[verificationKey];
    }

    /**
     * @notice Checks if current timestamp is within the project timeframe
     * @param startDate Unix timestamp for start date
     * @param endDate Unix timestamp for end date
     * @return bool true if current time is within range, false otherwise
     */
    function _isWithinTimeframe(
        uint64 startDate,
        uint64 endDate
    ) internal view returns (bool) {
        return block.timestamp >= startDate && block.timestamp <= endDate;
    }

    /**
     * @notice Creates a unique verification key for citizen milestone votes
     * @param projectId ID of the project
     * @param milestoneIdx Index of the milestone
     * @param citizen Address of the citizen
     * @return bytes32 Hashed key for storing verification status
     */
    function _packKey(
        uint256 projectId,
        uint8 milestoneIdx,
        address citizen
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(projectId, milestoneIdx, citizen));
    }
}
