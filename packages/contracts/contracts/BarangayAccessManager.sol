// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/manager/AccessManager.sol";

contract BarangayAccessManager is AccessManager {
    uint64 public constant OFFICIAL_ROLE = 1;

    constructor(
        address initialAdmin,
        address initialOfficial
    ) AccessManager(initialAdmin) {
        _grantRole(OFFICIAL_ROLE, initialOfficial, 0, 0);
    }
}
