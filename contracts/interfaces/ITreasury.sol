// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface ITreasury {
    // Events
    event TreasuryDeposit(
        address indexed operator,
        address indexed from,
        uint256 amount,
        bytes data
    );

    event FundsReleased(address indexed to, uint256 amount, Category category);

    event SetProtocol(address indexed newProtocolAddress);

    // Enums
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

    function TREASURY_TOKEN() external view returns (address);

    function releaseFunds(
        address to,
        uint256 amount,
        Category category
    ) external;
}
