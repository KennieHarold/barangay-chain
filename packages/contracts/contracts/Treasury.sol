// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AccessManaged} from "@openzeppelin/contracts/access/manager/AccessManaged.sol";

import "./interfaces/ITreasury.sol";

/**
 * @title Treasury
 * @author Barangay Chain Team
 * @notice Manages barangay treasury funds with category-based budget allocations
 * @dev Implements AccessManaged for role-based access control and enforces allocation limits per category
 */
contract Treasury is ITreasury, AccessManaged {
    using SafeERC20 for IERC20Metadata;

    // Immutables
    /// @notice ERC20 token used for all treasury operations
    address public immutable TREASURY_TOKEN;

    // Constants
    /// @notice Basis point denominator for percentage calculations (100%)
    uint256 public constant BASIS_POINT = 10000;
    /// @notice Maximum allowable budget in unscaled units (1,000,000)
    uint256 public constant MAX_ALLOWABLE_BUDGET_UNSCALED = 1000000;

    // State variables
    /// @notice Address of the protocol contract (BarangayChain) authorized to release funds
    address public protocol;

    /// @notice Mapping of category to total expenses in that category
    mapping(Category => uint256) public expenses;
    /// @notice Mapping of category to allocation percentage in basis points
    mapping(Category => uint16) public allocations;

    /**
     * @notice Initializes the Treasury contract with default allocations
     * @param authority Address of the AccessManager contract for role-based access control
     * @param protocol_ Address of the BarangayChain protocol contract
     * @param treasuryToken Address of the ERC20 token used for treasury operations
     */
    constructor(
        address authority,
        address protocol_,
        address treasuryToken
    ) AccessManaged(authority) {
        protocol = protocol_;
        TREASURY_TOKEN = treasuryToken;

        // Setup allocations
        allocations[Category.Infrastructure] = 2800; // 28%
        allocations[Category.Health] = 1400; // 14%
        allocations[Category.Education] = 1300; // 13%
        allocations[Category.Environment] = 1300; // 9%
        allocations[Category.Livelihood] = 1000; // 10%
        allocations[Category.Emergency] = 900; // 9%
        allocations[Category.Administration] = 900; // 8%
        allocations[Category.CommunityEvents] = 900; // 9%
    }

    /**
     * @notice Restricts function access to the protocol contract only
     * @dev Reverts if caller is not the authorized protocol address
     */
    modifier onlyProtocol() {
        require(
            msg.sender == protocol,
            "Treasury: Invalid BarangayChain address"
        );
        _;
    }

    /**
     * @notice Releases funds from the treasury to a recipient
     * @dev Only callable by the protocol contract. Validates allocation limits before transfer
     * @param to Address of the fund recipient
     * @param amount Amount of tokens to transfer
     * @param category Budget category for the expense
     * @custom:emits FundsReleased
     */
    function releaseFunds(
        address to,
        uint256 amount,
        Category category
    ) external onlyProtocol {
        require(to != address(0), "Treasury::releaseFunds: Invalid recipient");

        IERC20Metadata treasuryToken = IERC20Metadata(TREASURY_TOKEN);

        uint256 funds = treasuryToken.balanceOf(address(this));
        require(funds > amount, "Treasury::releaseFunds: Insufficient funds");
        require(
            isWithinAllowableAllocation(category, amount),
            "Treasury::releaseFunds: Allocation reached for this category"
        );

        expenses[category] += amount;
        treasuryToken.safeTransfer(to, amount);

        emit FundsReleased(to, amount, category);
    }

    /**
     * @notice Updates the protocol contract address
     * @dev Only callable by authorized roles
     * @param protocol_ New address of the protocol contract
     * @custom:emits SetProtocol
     */
    function setProtocol(address protocol_) external restricted {
        require(
            protocol_ != address(0),
            "Treasury::setProtocol: Invalid address"
        );
        protocol = protocol_;

        emit SetProtocol(protocol_);
    }

    /**
     * @notice Withdraws all treasury funds to the caller in case of emergency
     * @dev Only callable by authorized roles. Use with extreme caution
     * @custom:emits EmergencyWithdraw
     */
    function emergencyWithdraw() external restricted {
        IERC20Metadata treasuryToken = IERC20Metadata(TREASURY_TOKEN);

        uint256 funds = treasuryToken.balanceOf(address(this));
        treasuryToken.safeTransfer(msg.sender, funds);

        emit EmergencyWithdraw(msg.sender, funds);
    }

    /**
     * @notice Checks if an expense amount is within the allowable allocation for a category
     * @dev Calculates if total expenses (current + new) would exceed the category's allocation percentage
     * @param category Budget category to check
     * @param amount Amount to be spent
     * @return bool true if within allocation limit, false otherwise
     */
    function isWithinAllowableAllocation(
        Category category,
        uint256 amount
    ) public view returns (bool) {
        IERC20Metadata treasuryToken = IERC20Metadata(TREASURY_TOKEN);

        uint256 maxAllowableBudgeInUnits = MAX_ALLOWABLE_BUDGET_UNSCALED *
            (10 ** uint256(treasuryToken.decimals()));

        uint256 currentExpensesPlusAmount = expenses[category] + amount;
        uint256 newAllocation = (currentExpensesPlusAmount * BASIS_POINT) /
            maxAllowableBudgeInUnits;

        return newAllocation <= allocations[category];
    }
}
