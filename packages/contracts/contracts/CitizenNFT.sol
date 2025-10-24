// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Pausable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {AccessManaged} from "@openzeppelin/contracts/access/manager/AccessManaged.sol";

/**
 * @title CitizenNFT
 * @author Barangay Chain Team
 * @notice NFT contract representing citizenship in the barangay system
 * @dev Extends ERC721 with URI storage and pausable functionality. Citizens can vote on project milestones
 */
contract CitizenNFT is ERC721, ERC721URIStorage, ERC721Pausable, AccessManaged {
    /// @dev Counter for token IDs
    uint256 private _nextTokenId;

    /**
     * @notice Initializes the CitizenNFT contract
     * @param authority Address of the AccessManager contract for role-based access control
     */
    constructor(
        address authority
    ) ERC721("CitizenNFT", "CZNFT") AccessManaged(authority) {}

    /**
     * @notice Returns the base URI for token metadata
     * @dev Override to set IPFS gateway base URI
     * @return string Base URI for all tokens
     */
    function _baseURI() internal pure override returns (string memory) {
        return "http://scarlet-inc-buzzard-641.mypinata.cloud/ipfs/";
    }

    /**
     * @notice Pauses all token transfers
     * @dev Only callable by authorized roles
     */
    function pause() public restricted {
        _pause();
    }

    /**
     * @notice Resumes all token transfers
     * @dev Only callable by authorized roles
     */
    function unpause() public restricted {
        _unpause();
    }

    /**
     * @notice Mints a new citizen NFT
     * @dev Only callable by authorized roles
     * @param to Address to receive the NFT
     * @param uri Token metadata URI (will be appended to base URI)
     * @return uint256 The ID of the newly minted token
     */
    function safeMint(
        address to,
        string memory uri
    ) public restricted returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }

    /**
     * @notice Internal update function that handles token transfers
     * @dev Overrides both ERC721 and ERC721Pausable to integrate pause functionality
     * @param to Recipient address
     * @param tokenId ID of the token being transferred
     * @param auth Address authorized to perform the transfer
     * @return address The previous owner of the token
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Pausable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    /**
     * @notice Returns the token URI for a given token ID
     * @dev Overrides both ERC721 and ERC721URIStorage
     * @param tokenId ID of the token
     * @return string Complete URI for the token metadata
     */
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
     * @notice Checks if contract supports a given interface
     * @dev Overrides both ERC721 and ERC721URIStorage
     * @param interfaceId Interface identifier to check
     * @return bool true if interface is supported
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
