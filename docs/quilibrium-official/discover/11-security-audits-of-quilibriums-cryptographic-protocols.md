---
title: "Security Audits of Quilibrium's Cryptographic Protocols"
description: An overview of the audit history behind Quilibrium's cryptographic libraries, including Nekryptology, VDF implementations from Chia, libp2p, and the wQUIL ERC-20 contract.
---

# Security Audits of Quilibrium's Cryptographic Protocols

Quilibrium relies on advanced cryptographic protocols that include Triple-Ratchet, Oblivious Transfer, and Verifiable Delay Functions (VDFs) to ensure secure and private computation.

A natural question emerges: *Have security audits been conducted on these protocols as implemented within Quilibrium?*

While historical audits exist for the underlying technologies, the dynamic nature of their deployment in Quilibrium suggests that revisiting these evaluations could further solidify trust in the network’s security.

## Leveraging Audited Foundations: The Core Libraries

Quilibrium’s cryptographic backbone is built on established, battle-tested libraries, many of which have been rigorously audited in the past.

This reliance on off-the-shelf components significantly narrows the scope of potential vulnerabilities. Here’s a breakdown of the key libraries and their audit pedigrees:

1. **Kryptology Library (Now Nekryptology)**\
   Originally developed by Coinbase and later abandoned, this library was forked into "nekryptology" for use in Quilibrium. It carries a robust audit history, with detailed reports available here: [Nekryptology Audits](https://github.com/QuilibriumNetwork/ceremonyclient/tree/develop/nekryptology/audits). While these audits provide a strong starting point, the forked version’s adoption in Quilibrium may merit a fresh review to account for any divergence.
2. **VDF Implementation (Adapted from Chia)**\
   Quilibrium’s VDF implementation originates from the Chia project, enhanced with larger bit-strength parameters and a tweak to the Fiat-Shamir transform to address an unresolved vulnerability in the original. The foundational audits are part of Chia’s broader security reviews, accessible here: [Chia Audit Reports](https://github.com/Chia-Network/Audit-Reports). Given Quilibrium’s modifications, a targeted re-audit could validate the updated implementation’s integrity.
3. **Libp2p Library**\
   This networking library, integral to Quilibrium’s peer-to-peer architecture, has undergone periodic audits over time. While specific reports aren’t immediately easy to pinpoint, libp2p’s widespread use and recurring evaluations lend it a degree of trustworthiness. Consolidating and referencing these audits would enhance transparency for Quilibrium’s stakeholders.

## Quilibrium’s Unique Deployment: Timing an Audit

While the individual libraries boast a solid audit legacy, their integration into Quilibrium’s MPC framework is an evolving endeavor.

The network’s codebase remains in flux, adapting to the demands of a decentralized, privacy-preserving system, not yet mature.

Conducting a comprehensive audit of this bespoke implementation now would be inefficient—both in terms of cost and relevance—given the ongoing changes.

Instead, the optimal moment for a formal audit would come once Quilibrium’s protocol stack stabilizes, ensuring that resources are spent on a mature, finalized system.

## wQUIL Wrapped Token Contract

In addition to its core protocols, Quilibrium employs an Ethereum-based wrapped token contract adhering to the ERC-20 standard. This contract has been audited, benefiting from its conventional design and widespread use in the blockchain ecosystem. The audit report is publicly available here: [ERC-20 Audit Report](https://d391b93f5f62d9c15f67142e43841acc.ipfscdn.io/ipfs/QmaMiezCMfmo5zWmwNc2WXLex11BuRZJ9p9ZhWj638Tdws). This successful review reinforces confidence in Quilibrium’s blockchain-facing components.