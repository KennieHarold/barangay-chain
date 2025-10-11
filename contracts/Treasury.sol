// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/ITreasury.sol";

contract Treasury is ITreasury {
    using SafeERC20 for IERC20;

    address public immutable BARANGAY_CHAIN_ADDRESS;

    address public immutable TREASURY_TOKEN;

    constructor(address barangayChainAddress, address treasuryToken) {
        BARANGAY_CHAIN_ADDRESS = barangayChainAddress;
        treasuryToken = TREASURY_TOKEN;
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

    function releaseFunds(
        address to,
        uint256 amount
    ) external onlyBarangayChain {
        require(
            IERC20(TREASURY_TOKEN).balanceOf(address(this)) > amount,
            "Treasury: Insufficient funds"
        );
        IERC20(TREASURY_TOKEN).safeTransfer(to, amount);
    }

    receive() external payable {
        emit TreasuryDeposit(msg.sender, msg.value, "Treasury: Funds received");
    }
}
