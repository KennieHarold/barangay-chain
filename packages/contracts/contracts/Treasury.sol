// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AccessManaged} from "@openzeppelin/contracts/access/manager/AccessManaged.sol";
import {IERC1363Receiver} from "@openzeppelin/contracts/interfaces/IERC1363Receiver.sol";

import "./interfaces/ITreasury.sol";

contract Treasury is ITreasury, IERC1363Receiver, AccessManaged {
    using SafeERC20 for IERC20;

    // Immutables
    address public immutable TREASURY_TOKEN;

    // Constants
    uint256 public constant BASIS_POINT = 10000;

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
        require(
            IERC20(TREASURY_TOKEN).balanceOf(address(this)) > amount,
            "Treasury: Insufficient funds"
        );

        uint256 funds = IERC20(TREASURY_TOKEN).balanceOf(address(this));
        uint256 currentAllocation = (expenses[category] / funds) * BASIS_POINT;

        require(
            currentAllocation < allocations[category],
            "Treasury::releaseFunds: Allocation reached for this category"
        );

        expenses[category] = amount;
        IERC20(TREASURY_TOKEN).safeTransfer(to, amount);

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

    function onTransferReceived(
        address operator,
        address from,
        uint256 value,
        bytes calldata data
    ) external override returns (bytes4) {
        emit TreasuryDeposit(operator, from, value, data);
        return IERC1363Receiver.onTransferReceived.selector;
    }

    function emergencyWithdraw() external restricted {
        uint256 funds = IERC20(TREASURY_TOKEN).balanceOf(address(this));
        IERC20(TREASURY_TOKEN).safeTransfer(msg.sender, funds);

        emit EmergencyWithdraw(msg.sender, funds);
    }
}
