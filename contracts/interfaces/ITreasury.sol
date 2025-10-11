// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "../types/CategoryEnum.sol";

interface ITreasury {
    function TREASURY_TOKEN() external view returns (address);

    function releaseFunds(address to, uint256 amount) external;
}
