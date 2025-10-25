// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/manager/AccessManager.sol";

/**
 * @title BarangayAccessManager
 * @notice Manages role-based access control for the barangay system
 * @dev Extends OpenZeppelin's AccessManager with predefined roles
 */
contract BarangayAccessManager is AccessManager {
    /// @notice Role ID for barangay officials with administrative privileges
    uint64 public constant OFFICIAL_ROLE = 1;

    /**
     * @notice Initializes the AccessManager with admin and official roles
     * @param initialAdmin Address granted admin privileges
     * @param initialOfficial Address granted official role privileges
     */
    constructor(
        address initialAdmin,
        address initialOfficial
    ) AccessManager(initialAdmin) {
        _grantRole(OFFICIAL_ROLE, initialOfficial, 0, 0);
    }
}
