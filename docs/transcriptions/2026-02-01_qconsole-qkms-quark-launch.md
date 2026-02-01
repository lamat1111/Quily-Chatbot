---
title: "Q Console Launch: QKMS, Q Storage, QQ, and Quark SDK"
source: youtube
youtube_url: https://www.youtube.com/watch?v=2686031142
author: Cassandra Heart
date: 2026-02-01
type: livestream_transcript
topics:
  - q-console
  - q-storage
  - mpc
  - security
  - roadmap
  - quorum
---

## Version 2.1.0.18 Update Status

For the past two weeks, significant effort has been put into resolving issues around the release of 2.1.0.18. There's one outstanding blocker related to synchronization in a subtle way—specifically getting the trees to align properly.

The native hypergraph store of the network has underlying trees that provide a CRDT-style primitive for the vertices and hyper edges of the hypergraph. Issues have been found around the synchronization of this data, specifically in how information is surfaced from the syncing side (the client requesting data) and the server side providing it.

Each update to this branch narrows down the issue further. The most recent update includes additional debug details that will help get this over the finish line. Compared to the previous broadcast, shard coverage is increasing, halt risk is decreasing, and the needs coverage section has also decreased.

## QNS Update

An update to QNS will ship within the next 24 to 48 hours. It will include:

- Improvements to the auctions and offers features
- Deeper integration with Quorum Mobile
- Ability to message the owner of a particular name using the underlying dispatch primitive that powers Quorum

## Quorum Mobile Update

Quorum Mobile will also receive an update with:

- More L1s supported on the wallet, including Monero and Zcash
- Deeper integration with QNS, supporting all full QNS features
- Faster sync and own-device full sync capability

### Cross-Device Synchronization

If you're using Quorum on web and authenticated Quorum on mobile from web, some things exist on the web app that don't exist on the mobile app—not just features, but also previous messages. The synchronization update will support fully syncing this data if you choose to do so.

Users will be given the option to choose their degree of synchronization:
- Just preferences and profile information
- Full chat history (with trade-offs to consider)

Bug fixes for quality of life issues reported in the beta will also be included.

## Frame Production Issues: Resolution Status

Three categories of issues affected frame production, and all have been resolved:

### Archive Node Availability

One archive node was part of the consensus loop and went offline when the operator chose to stop running it. Another individual has stepped up and been brought into the fold.

With roughly two-of-three consensus and six archive nodes total, stability issues created a situation where only four nodes were active (one offline by choice, another due to a bug). This meant any update issues could leave only three of six nodes working, causing the network to halt for frame production. This is now resolved.

### Consensus Logic Changes

Subtle changes to consensus logic occasionally caused halt conditions that needed to be overcome. This has been addressed.

### Synchronization Issues

Synchronization was causing consensus participants to disagree on the state of the network moving forward. This is one reason QClient hasn't launched yet—the protobuf messages used on the network have been slightly altered. Not releasing QClient avoids support issues while these changes settle.

> **Note:** The archive node root challenge alignment issue is being addressed in the next update to the .18 branch. The latest logs provide greater detail about where differences are happening, enabling resolution.

## Q Storage Launch

The service is launching with billing tests completing within hours of this broadcast. Event notifications have been added since the previous talk.

Features not included (by design):
- Intelligent tiering (unnecessary for an edgeless network—no Glacier vs edge deployment concerns)

## QKMS: Why "True MPC" Matters

This section covers the critical distinction between Quilibrium's true MPC implementation and what most wallet services do.

### The Problem with "Fake MPC"

Most consumer-facing multi-party wallet services are not doing real MPC. What they typically do:

1. Split the key into multiple shares (sometimes generated locally, sometimes in a TEE)
2. Give the device one share, keep one, store a recovery shard elsewhere
3. **Critical flaw:** When signing, they recombine the key shares in one place

The recombination happens either:
- On the user's device (full wallet key in memory on device)
- In a trusted enclave on behalf of the user (key material travels to enclave, recombines, signs, discards)

### Regulatory Implications (NYDFS)

The New York Department of Financial Services understands MPC and knows this approach constitutes custodial behavior. Wherever the key material lives combined—that's the custodian. Companies not complying with custodial obligations in regions with such requirements (like New York State) are in violation of the law.

Many companies have avoided scrutiny because:
- MPC is hard to understand
- They're not large enough to be targets yet

But NYDFS doesn't care about company size once they figure it out.

### How Quilibrium's MPC Differs

With Quilibrium's MPC, key shards never live in the same place. Instead of recombining keys, the system uses special threshold signing algorithms:

**For secp256k1 (Ethereum, Bitcoin):**
- Two-of-two: DKL-S18 algorithm
- Higher thresholds (three-of-five, etc.): Upgraded DKL-S version

**For ED25519 (Solana, Farcaster):**
- FROST algorithm (three rounds)

These algorithms use oblivious transfer—a proper MPC technique that's essentially a binary multiplication matrix gadget. No key material is ever exchanged between parties; it's strictly multi-party computation.

### Practical Example: Server-Side Key Management

If you're creating a Farcaster-compatible app and want to manage ED25519 signing keys on behalf of users (not wallet keys in their phone), you could have:
- One key shard with your sidecar
- One key shard with Quilibrium

This eliminates traditional custody issues while maintaining regulatory compliance.

### Performance

An actual DKL-S18 run under normal network conditions takes approximately half a second. The demo showed key generation taking about six seconds with a slow refresh rate (one round per second) for demonstration purposes.

## QQ: SQS-Compatible Message Queue

QQ provides an SQS-style service with approximately 100% API compatibility. A few minor things differ due to architectural differences between Quilibrium and AWS, but the majority of SQS use cases are supported unless you're doing something incredibly bespoke.

## Service Architecture

All services relate to primitives on Quilibrium:

| Service | Primitives Used |
|---------|-----------------|
| Q Storage | Hypergraph |
| QKMS | Compute primitive |
| Identity/Authorization | Hypergraph + MPC via compute primitive |
| QQ | Hypergraph + dispatch mechanism |
| QPing | Dispatch mechanism |

These are composable primitives that can create traditional web services.

## Quark SDK: Privacy-Preserving Game Assets

Quark demonstrates what happens when you compose the token primitive with the storage service and RDF schema validation (enforcing certain types of 3D assets).

### Privacy Advantages Over Ethereum-Based Gaming

If a game uses Ethereum-aligned ownership and everything is tied to your wallet address, you're publicly broadcasting:
- What games you're playing
- When you're playing them
- What assets you have
- What worlds you have access to

With Quilibrium's approach:
- Your wallet is a view and spend key visible only to you, not the game
- When you buy an avatar, you construct a private mint transaction
- Where the token goes is nobody's business except yours
- You can organize all owned assets without anyone else knowing

### Demo Overview

The demo showed a basic game environment (using Fyrox engine) with:
- World assets loaded from Q Storage
- VRM avatar assets in an avatars folder
- A shop system with purchasable items using "Q bucks" (a token on the Quilibrium network)

After uploading avatar files to Q Storage, they appeared in the shop and could be purchased and equipped as the player's avatar.

### Technical Integration

The Quark SDK works with:
- Q Storage for asset delivery
- Collectible token for ownership
- Alt-fee basis app shards for development environments (not beholden to mainnet rules)

For the Q Storage client, the game ownership manager:
1. Connects to storage
2. Fetches items using access key and secret key
3. Applies access policies (custom bucket policies or QKMS HMAC keys for signed URL generation)

## Launch Timeline (February 2026)

- **Q Console with all services**: Launching within 24 hours (after billing tests complete)
- **QNS update**: 24-48 hours
- **Quorum Mobile update**: Shortly after QNS
- **Version 2.1.0.18 for node runners**: Imminent, pending synchronization issue resolution

## Seniority Score Display Fix

For those not seeing a seniority score on their nodes: this will be resolved with the 2.1.0.18 update rollout. The final migration step will fix the seniority display issue.

---

*Cleaned: 2026-02-01*
