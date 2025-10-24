// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AccessManaged} from "@openzeppelin/contracts/access/manager/AccessManaged.sol";

import "./interfaces/ITreasury.sol";

contract Treasury is ITreasury, AccessManaged {
    using SafeERC20 for IERC20Metadata;

    // Immutables
    address public immutable TREASURY_TOKEN;

    // Constants
    uint256 public constant BASIS_POINT = 10000;
    uint256 public constant MAX_ALLOWABLE_BUDGET_UNSCALED = 1000000;

    // State variables
    address public protocol;

    mapping(Category => uint256) public expenses;
    mapping(Category => uint16) public allocations;

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

    modifier onlyProtocol() {
        require(
            msg.sender == protocol,
            "Treasury: Invalid BarangayChain address"
        );
        _;
    }

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

    function setProtocol(address protocol_) external restricted {
        require(
            protocol_ != address(0),
            "Treasury::setProtocol: Invalid address"
        );
        protocol = protocol_;

        emit SetProtocol(protocol_);
    }

    function emergencyWithdraw() external restricted {
        IERC20Metadata treasuryToken = IERC20Metadata(TREASURY_TOKEN);

        uint256 funds = treasuryToken.balanceOf(address(this));
        treasuryToken.safeTransfer(msg.sender, funds);

        emit EmergencyWithdraw(msg.sender, funds);
    }

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
