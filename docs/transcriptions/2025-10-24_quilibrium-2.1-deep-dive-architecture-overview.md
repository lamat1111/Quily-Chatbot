---
title: "Quilibrium 2.1 Deep Dive: Architecture Overview and Code Walkthrough"
source: youtube
youtube_url: https://www.youtube.com/watch?v=mmHqdnqFKJc
author: Cassandra Heart
date: 2025-10-24
type: livestream_transcript
topics:
  - Quilibrium 2.1
  - architecture
  - consensus mechanism
  - enrollment
  - rewards system
  - time reel
  - hypergraph
  - code walkthrough
  - privacy
  - MPC
  - zero knowledge proofs
---

## Introduction and Update Overview

This is part one of a two-part deep dive into Quilibrium 2.1. This stream is happening while enrollment is still in progress. We have an update to 2.1 coming out (2.1.0.3) currently going through signing.

### Quorum Updates

The team has been hard at work adding more features to the Quorum web application. In the coming week after enrollment concludes, Quorum Mobile will be released. For those who signed up for the beta, you'll receive a free Q Name Service name, which corresponds with the Q Name Service unlock.

The Q Name Service is our equivalent to the Ethereum Name Service but works differently. We don't do rentals - you buy a Q name, you have it for life unless you want to sell it.

### Upcoming Services

After 2.1 launch concludes, we're rolling out additional services:
- Quorum Mobile
- Q Console
- Q Storage
- Q Name Service
- QKMS

Further down the road:
- F of X (our equivalent to AWS Lambda)
- Relational (equivalent to RDS, Amazon Keyspaces, DynamoDB, and Redis)

With subsequent protocol upgrades, we'll bring out:
- Klearu for machine learning (**not yet available** — planned for future protocol upgrades; still in research/testing phase as of this stream)
- Streaming data primitives for phone video and streaming content calls

## The Mission of Quilibrium

The mission is to secure every bit of traffic on the internet, whether on Quilibrium in service of other protocols or the broader web. This comes from a realization that we're under a multi-sided attack encroaching on our privacy and freedom on the web through various actors: identity, personal storage, communication, ISPs, infrastructure providers, and government.

### Why Not Traditional Blockchain?

When you take the aggregate throughput of all actually decentralized chains combined, the performance is less than the transactions per second needed to provide just iMessage in 2016. Blockchain has an inherent scaling limit - an intrinsic bandwidth limit you cannot scale past without sacrificing decentralization.

The solution is to take concepts from crypto, tweak them so the network is highly parallelized, and utilize cutting-edge research around zero-knowledge proofs and MPC to provide private execution at instant finality at global scale.

## Quilibrium 2.1 Core Components

### Privacy and Security Layers

- **Onion routing layer**: Provides network-level privacy
- **Secure permutation MPC protocol**: Creates a mixnet on top for analytic privacy
- **Confidential compute compiler (MPC compiler)**: Turns applications into garbled circuits for private data computation
- **Oblivious hypergraph**: Data structure using MPC for cooperative data writing while revealing no content except to key holders
- **Token primitive**: Incentive basis for network operation

### First Generation Q Services

- S3 compatible API
- Lambda compatible API
- KMS
- CQL
- Redis compatible
- RDS compatible

The purpose is to take the existing cloud model and invert it into a decentralized context that never has to go down.

### Second Generation Services (Future)

- Streaming video
- Confidential machine learning
- Streaming audio
- Image store
- Metaveritualization
- Scheduled tasks

## Enrollment Process

The enrollment process lays groundwork for all nodes currently on the network to sign up for shards they want to cover, specify their workers and storage, and have the network load balance based on available resources.

### Current Network Status

We're at about 500 peers that have already upgraded to 2.1. The average prover count is around 20-30 provers per node. The initial cadre of the network is going to be earning healthy rewards.

## Technical Architecture Deep Dive

### Project Structure

The node has helpful build scripts. You'll need:
- Rust installed
- Golang 1.24 (1.21+ will auto-upgrade)
- Various utilities (install scripts available for Ubuntu and Mac)

### Startup Process

1. Main function loads configuration
2. Go Wire handles dependency injection (static, code-generated)
3. Master process (Core 0) runs
4. Auto-detects cores and spawns appropriate workers
5. Data worker nodes spawn alongside

### Two-Tier Consensus Structure

**Tier 1 - Global Level**: Maintains 256 values - a compression of the entire world state into 256 elliptic curve points (74 bytes each = ~19KB total). This can prove more statements of truth than there are atoms in the universe.

**Tier 2 - App Shard Level**: A clique of nodes participates in consensus for specific app shards. Workers create proofs that roll up into the global proof tree.

### Why This Matters

If you only need to manage 256 points of data (256 elliptic curve operations at the global level), proofs are small, fast, and cheap. Small data distributed quickly means easy global consensus maintenance and wide scalability.

Initial state: Over 100 million logical shards of data, starting with 4,096 distributed shards.

### Self-Error Correcting Code

The proof system creates self-error correcting code distribution ensuring no data loss even if an entire shard goes offline. This enables scaling to potentially millions of actual shards without impacting global consensus.

### Consensus State Machine

Located in the consensus package under `state_machine.go`. It provides Byzantine fault tolerant consensus with additional mechanisms that reduce the traditional one-third Byzantine failure requirement.

**States**:
1. **Loading**: Synchronize with network
2. **Collecting**: Collect data for consensus round, prepare proposal
3. **Liveness Check**: Announce "I'm alive, this is what I've collected"
4. **Proving**: Generate proof (non-emitting state)
5. **Publishing**: Publish and wait for others
6. **Voting**: Vote on proposals from live participants
7. **Finalizing**: Make voting decision, reach consensus
8. **Verifying**: Acknowledge consensus

If failures occur between collecting and verifying, it kicks back to loading for resync.

### Key Separation: Peer ID vs Prover Key

In Q 2.0, everything was tied to your peer ID. In 2.1, peer ID is fully separated from prover key. Linking peer ID to prover reduces anonymity and makes you a target for denial of service attacks (as seen with Solana's block producers who were constantly attacked because everyone knew who they were and when they were next in sequence).

## Reward System

The reward formula from the Proof of Meaningful Work document is implemented with:
- A reference (non-optimized) implementation for other language implementations
- An optimized implementation for actual node use
- A minimal allocation version for very low memory situations

### Calculation Components

- Current difficulty level (VDF steps before new frame production)
- Overall state in bytes (world state from hypergraph)
- Unit denomination (8 billion units per QUIL)

The global intrinsic operation `shard_update` takes shard frame headers, calculates value based on world state and shard state, and divides rewards accordingly.

## Time Reel

The time reel is the mechanism for:
- Writing frames to the store
- Fork choice (if familiar with traditional blockchains)

### Key Feature: Self-Verifying Frames

In 2.0, new nodes had long sync times requiring snapshot downloads. In 2.1, if not running archive mode (most won't need to unless running an explorer), nodes only hold up to 360 frames. Fork choice evaluations can "snap ahead" with sufficient proof support.

This is essentially what Vitalik has been discussing with ETH 3.0's stateless Ethereum concept - Quilibrium is already there.

## Project Package Structure

| Package | Purpose |
|---------|---------|
| alias | Related to client |
| bedum | Circuit compiler |
| bls48581 | BLS 48-581 curve and KZG proof system |
| bulletproofs | Transaction privacy |
| channel | Encrypted direct and group messaging (used by Quorum) |
| client | Q client |
| config | Configuration |
| conntest | Connection test utility |
| consensus | State machine |
| crates | Rust implementations bound to Go |
| ferret | Oblivious transfer library |
| hypergraph | CRDT implementation |
| necryptology | Original cryptography library (from Coinbase) |
| rpm | Random permutation mixnet library |
| types | Interfaces and implementations |
| utils | Common utilities |
| vdf | Verifiable delay function |
| veranek | Verifiable encryption for oblivious hypergraph |

### Testing Structure

Integration tests have tags as `integration test`. Native binding tests are segmented so you can run most tests inside your IDE efficiently.

## Metrics and Monitoring

There's an extensive Prometheus monitoring system. If enabled, you can export metrics to Grafana to see:
- Node performance
- Worker health
- Contention issues
- Overall node health

## Q&A Highlights

### When Can Regular Users Switch Web Activity to Quilibrium?

**MPC TLS** (might be in 2.2 or 2.3): This will enable private browsing using the network as a distributed VPN.

**QS Domains** (available now with Quorum Mobile): The first public implementation of webkit tooling enabling browsers to connect to QS domains through the network's onion router.

### Current Onion Router Status

Presently has checks to prevent use as exit relay for external traffic. Public exit relays have known problems, and supporting general web traffic isn't the current purpose.

## Coming in Part 2

- Deeper component exploration
- Manually constructing and transacting with tokens
- Putting data in the hypergraph
- Prover entry structure for enrollment
- Launching applications
- Q Console related content (assuming smooth rollout)

---

*Updated: 2026-02-07*
