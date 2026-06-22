// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * MINDFEINT — minimal on-chain attestation (v1).
 *
 * Anchors each round's 0G Storage root on 0G Chain, so the provable record is also
 * timestamped and tamper-evident on-chain. This is the third 0G primitive in v1.
 *
 * OWNER: Dev B. v2 extends this into persona iNFTs (ERC-7857) + a provable leaderboard.
 */
contract MindfeintLog {
    event RoundAttested(bytes32 indexed storageRoot, address indexed by, uint256 timestamp);

    /// How many rounds have been attested (handy for a quick on-chain stat).
    uint256 public total;

    /// Anchor a round's 0G Storage root on-chain.
    function attest(bytes32 storageRoot) external {
        total += 1;
        emit RoundAttested(storageRoot, msg.sender, block.timestamp);
    }
}
