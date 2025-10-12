// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface ITreasury {
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
