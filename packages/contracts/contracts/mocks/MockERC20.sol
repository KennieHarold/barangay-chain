// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockERC20
 * @author Barangay Chain Team
 * @notice Mock ERC20 token for testing purposes
 * @dev Allows unrestricted minting and burning for testing scenarios
 */
contract MockERC20 is ERC20 {
    /**
     * @notice Initializes the mock ERC20 token
     * @param name Token name
     * @param symbol Token symbol
     * @param initialSupply Initial supply minted to deployer
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }

    /**
     * @notice Mints tokens to a specified address
     * @dev Unrestricted minting for testing - do not use in production
     * @param to Address to receive minted tokens
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /**
     * @notice Burns tokens from a specified address
     * @dev Unrestricted burning for testing - do not use in production
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }
}
