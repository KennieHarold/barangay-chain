// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title ITreasury
 * @author Barangay Chain Team
 * @notice Interface for the Treasury contract
 * @dev Defines events, enums, and function signatures for treasury fund management
 */
interface ITreasury {
    // Events
    /// @notice Emitted when funds are deposited to the treasury
    event TreasuryDeposit(
        address indexed operator,
        address indexed from,
        uint256 amount,
        bytes data
    );

    /// @notice Emitted when funds are released from the treasury
    event FundsReleased(address indexed to, uint256 amount, Category category);

    /// @notice Emitted when the protocol address is updated
    event SetProtocol(address indexed newProtocolAddress);

    /// @notice Emitted when emergency withdrawal is executed
    event EmergencyWithdraw(address indexed initiator, uint256 amount);

    // Enums
    /**
     * @notice Budget categories for fund allocation
     * @param Infrastructure Roads, bridges, facilities construction
     * @param Health Medical services, health programs
     * @param Education Educational programs and scholarships
     * @param Environment Environmental protection and waste management
     * @param Livelihood Income-generating projects and skills training
     * @param Emergency Disaster response and relief operations
     * @param Administration Operational and administrative expenses
     * @param CommunityEvents Cultural activities and community gatherings
     */
    enum Category {
        Infrastructure,
        Health,
        Education,
        Environment,
        Livelihood,
        Emergency,
        Administration,
        CommunityEvents
    }

    /**
     * @notice Returns the address of the treasury token
     * @return address Address of the ERC20 token used for treasury operations
     */
    function TREASURY_TOKEN() external view returns (address);

    /**
     * @notice Releases funds from the treasury to a recipient
     * @param to Address of the fund recipient
     * @param amount Amount of tokens to transfer
     * @param category Budget category for the expense
     */
    function releaseFunds(
        address to,
        uint256 amount,
        Category category
    ) external;

    /**
     * @notice Withdraws all treasury funds in case of emergency
     */
    function emergencyWithdraw() external;

    /**
     * @notice Returns total expenses for a given category
     * @param category Budget category to query
     * @return uint256 Total amount spent in the category
     */
    function expenses(Category category) external view returns (uint256);

    /**
     * @notice Returns allocation percentage for a given category
     * @param category Budget category to query
     * @return uint16 Allocation in basis points (e.g., 2800 = 28%)
     */
    function allocations(Category category) external view returns (uint16);

    /**
     * @notice Checks if an expense is within the allowable allocation
     * @param category Budget category to check
     * @param amount Amount to be spent
     * @return bool true if within allocation limit, false otherwise
     */
    function isWithinAllowableAllocation(
        Category category,
        uint256 amount
    ) external view returns (bool);
}
