// SPDX-License-Identifier: MIT
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

    event EmergencyWithdraw(address indexed initiator, uint256 amount);

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

    function emergencyWithdraw() external;

    function expenses(Category category) external view returns (uint256);

    function allocations(Category category) external view returns (uint16);

    function isWithinAllowableAllocation(
        Category category,
        uint256 amount
    ) external view returns (bool);
}
