// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./interfaces/ITreasury.sol";

contract Treasury is ITreasury {
    using SafeERC20 for IERC20;

    address public immutable BARANGAY_CHAIN_ADDRESS;

    address public immutable TREASURY_TOKEN;

    uint256 public constant BASIS_POINT = 10000;

    mapping(Category => uint256) public expenses;

    mapping(Category => uint16) public allocations;

    constructor(address barangayChainAddress, address treasuryToken) {
        BARANGAY_CHAIN_ADDRESS = barangayChainAddress;
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

    modifier onlyBarangayChain() {
        require(
            msg.sender == BARANGAY_CHAIN_ADDRESS,
            "Treasury: Invalid BarangayChain address"
        );
        _;
    }

    event TreasuryDeposit(
        address indexed sender,
        uint256 amount,
        string source
    );
    event FundsReleased(address indexed to, uint256 amount, Category category);

    function releaseFunds(
        address to,
        uint256 amount,
        Category category
    ) external onlyBarangayChain {
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

    receive() external payable {
        emit TreasuryDeposit(msg.sender, msg.value, "Treasury: Funds received");
    }
}
