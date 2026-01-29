---
title: "Reshaping the Internet's Infrastructure: Architecture Deep Dive"
source: youtube
youtube_url: https://www.youtube.com/watch?v=7yEoxju-1zI
author: Cassandra Heart
date: 2025-02-21
type: livestream_transcript
topics:
  - architecture
  - sharding
  - hypergraph
  - verifiable encryption
  - oblivious transfer
  - S3 API
  - KMS API
  - decentralization
  - web3 thesis
  - 2.1 release
---

## UK Privacy Legislation and Industry Response

On the legislative front, the UK is forcing Apple to create a backdoor for not only users' content in the UK but for all users on Apple products altogether. Quilibrium, along with many others like Tor and Mozilla, have signed a joint statement to the British government trying to dissuade them from pushing forward on this. This helps put our name in their eyes as we're not going to cooperate before they even try to start with us.

Additionally, in the US, Senator Wyden has released a draft bill to secure communications against foreign surveillance demands. We encourage the adoption of this legislation as it helps American companies have a very strong legal stance in fighting back against governments making unreasonable demands if they happen to have nexus in other countries.

## Fundraising and Team Expansion

We are coming near the close of the fundraise. We have already received some checks related to this and are starting to issue offer letters to individuals who have been longtime contributors to the protocol and interested in working for Quilibrium full-time.

We are focusing on three types of domains:

1. **Development** - This is the largest focus since this is a protocol
2. **Sales Engineers** - A combination of sales and developer positions to help companies with personalized integration support and acclimating to the quirks of Quilibrium versus other cloud providers
3. **Marketing** - Including potential marketing team expansion for the Q account

The community funds have approved a proposal to get a PR team working with Quilibrium to develop warm relationships with media outlets like Forbes and Business Insider. We're working with this team to build relationships and get more traction on the traditional media front.

## Stream Agenda Update

The Q Console S3 and KMS APIs discussion is being punted to Sunday because we've been dealing with chaos from the Milestone 5 update. With limited team resources, we need to prioritize getting 2.1 out the door, resolving testnet issues to ensure a smooth mainnet release, and getting the bridge back online.

Today's topics will cover:
- What Quilibrium is about beyond the mission and our motivations
- How we're building this protocol
- How shards are built up and maintained

## The Problem: Multi-Sided Attack on the Internet

The internet is currently under a multi-sided attack. These attacks come from:
- Identity, personal storage, and communication providers
- ISPs
- Cloud providers
- Government forces

The natural question becomes: why don't we use crypto to solve this? While crypto may provide some technologies as solutions, it also brings problems.

## How Crypto Has Been Co-opted

### Bitcoin
Bitcoin has been co-opted through miner consolidation. There are effectively six mining pools with significant influence, meaning any protocol enhancement that might harm those mining operations cannot move forward. Even if there was pushback, Bitcoin doesn't solve surveillance. A significant quantity of Bitcoin has been accumulated by a small handful of parties through ETFs and companies like MicroStrategy, who have vested interests in keeping things exactly as they are.

### Ethereum
Ethereum has seen capture through exchanges. The meme "never ask Coinbase how much percentage of the total stake deep is theirs" reflects this reality. This has been considerably harmful to overall decentralization.

Architecturally, after the merge, Ethereum planned to support sharding but instead acquiesced to L2s. Value flow and mindshare has migrated into these L2s, many of which are centralized. Some L2s are actually run by exchanges like Kraken's Ink. Their vision has narrowed to managing wallets, account abstraction, and launching tokens.

### Solana
The Libra coin launch disaster revealed the deep dark tendrils of the cabal casino infiltrating every major token launch and extracting money from the ecosystem. Hayden Davis was actually saying "this is going to be a mass extract" - they are actively extracting money at everyone else's detriment and reveling in it.

Instead of bringing meaningful value outside of coin launches, certain protocols have been stoking the fire and encouraging more of this disaster to happen on their network.

## The Alternative Thesis

The current thesis of crypto can't win this fight because blockchain cargo-culting means everything must work as linearization of content into singular blocks of transactions with execution caps. This only succeeds at producing limited financialized applications, not internet-scale applications.

You can't put the entire web on a blockchain. It's not possible because of intrinsic limits to how large that data structure can scale. The best you can get is a decentralized transparent public ledger - great if you want to build a spreadsheet accelerator, but not if you want to replace and secure the broader web.

**Quilibrium is an alternative thesis to crypto** - revisiting first principles to coordinate the network with parallelized private execution for instant finality at global scale without having to succumb to building on a blockchain.

## Quilibrium Architecture Overview

### Global Layer
Every single node maintains a collection of global synchronized commitments - about 19 kilobytes of data. This propagates every 10 seconds and is deterministic, avoiding conflict resolution problems.

### Data Shards as a Tree Structure
From global synchronized commitments, we create the collective data shards represented as a tree. Similar to Ethereum's Merkle Patricia tree used for world state, but ours is a **vector commitment tree (Verkle tree)**.

Key differences:
- Expanded branches to 64 individual slots instead of 16 (most efficient for computation)
- Merkle Patricia tree proofs require roughly 1 kilobyte of data to prove any one thing
- Verkle tree proofs require just a handful of elliptic curve points
- Result: lighter weight transactions, lighter weight proofs, better scalability

### Shard Tree Metadata
The tree provides metadata at each branch level:
- How many leaves are underneath that branch
- How big the overall data is underneath that branch

This tells us when to break out into a new shard. Workers can break data out when reaching thresholds and split workers to cover individual branches instead of one. Multiple shards can be proven in one single step because the root of the branch gives us the ability to create a proof that constitutes one block of shards.

### Verifiable Delay Function
Utilized to dictate the operating clock of the network - a periodic settlement of data and proof that data has been held by individual nodes providing access.

### Verifiable Encryption
When putting data on the network, you're encrypting it to prove:
1. You have the relevant key to this data, or you've provided a public key for someone who should have access
2. You've provided sufficient proof that this data is encrypted such that the key holder can reasonably decrypt it

### Storage Layer
Traditional log-structured merge approach for data storage. Tree metadata moved to separate flat files for efficiency. Shard data, vertices of the hypergraph, and verifiably encrypted data all live in the LSM-style database.

### Execution Layer
ESS primitives provide private retrieval of data and private execution of alterations to data.

## Dawn Era Core Concepts

From the Dawn era, we introduced unique core concepts:
- Peer list (globally shared distributed hash table of peers)
- Sequencing of data through the Master Clock (data proof clock)
- Secure message channels
- Key manager (peer level key and prover level key separation - important for keeping reward recipient in cold storage)
- Original ceremony application (demonstrating MPC evaluation as extension of Powers of Tau ceremony)
- Execution context threading to master and data proof clocks
- Primitive storage layer (rapidly iterated and enhanced)

## Dusk Era: 2.0 and 2.1 Releases

This release has been tumultuous as we've iterated and evaluated our initial assumptions. As they say, "everybody thinks they got a plan until they get punched in the face." We got punched in the face when testing problems of scale that other networks haven't faced.

### Why We Had Unique Scaling Challenges

Unlike Bitcoin and other protocols, we didn't have:
- Token generation event
- Pre-allocation to insiders or VCs
- Marketing allocations
- KOL distributions

We did a **fair launch** - if you launch a node and participate in the protocol, you get rewards relative to the rules. This caused a lot of people to immediately jump in and start running nodes, forcing us to solve scaling problems other protocols may never face.

### Dusk Release Components

The Dusk series provides the foundation of network capabilities. The 2.1 release provides:
- Secure private routing
- OT circuit compiler
- Schema repository (being set up Sunday for structured data settlement)
- First hypergraph applications (including the token as the main fork point)
- Oblivious hypergraph (actively testing through testnet)

## Services Built on Dusk

### First Generation (Familiar APIs)
- **S3 compatible API** - Instead of deploying a smart contract with link references to S3, use Quilibrium's decentralized S3-compatible API
- **KMS compatible API** - Many wallet-as-a-service providers aren't honest about how their infrastructure works (centralized trusted execution environments, not cooperative protocols)
- Redis compatibility
- CQL compatibility
- Lambda style compatibility

### Second Generation Services
- Streaming video store
- Streaming audio store
- Image store
- Machine learning runtime
- Scheduled tasks (evaluate functions on the network on a recurring basis - something other chains don't allow)
- Meta virtualization layer (like EC2 on Amazon but on the network)

## How Shards Work: Deep Dive

### Developer Facing View
For S3-style objects, from a developer perspective you simply have an object with useful properties like underlying data, metadata about content types, and whether it resolves to a publicly accessible bucket.

### Protocol Facing View
An object is composed of one or multiple vertices on the hypergraph. The hypergraph has layers:
- Global shard commitment level (3 positions of the overall bitmask)
- Level 2: App address
- Level 3: Tree position under that application
- Implementation: Vertex address set of the specific app shard

### How Data Gets Added

When adding data to the network, you deal with four sets:
- Vertex adds
- Vertex removes
- Hyperedge adds
- Hyperedge removes

These are essentially two-phase sets (familiar from CRDT mathematical proofs for building graphs).

### Vertex Size Limits and Processing

A vertex can be no greater than 1 gigabyte in resolved data. If you have a 1.5GB file:
1. Break it into chunks (e.g., two 0.75GB pieces)
2. Pass through verifiable encryption process

### Verifiable Encryption Process

Verifiable encryption takes:
- Transparent block of data
- Encryption key (asymmetric - public key for encryption, private key for decryption)

Outputs:
- **Encrypted output** - opaque blob from network's perspective
- **Zero knowledge proof** - proves data was encrypted correctly such that it's decryptable by the corresponding private key

For Quilibrium Inc's S3 API, we don't manage your keys. We don't want to know your keys. This is "can't be evil" vs "don't be evil" - the network verifies we haven't done anything screwy with your data.

### Tree Structure and Shard Creation

Each vertex's statement element gets encoded into the hypergraph's vertex adds. Vertices contribute to the overall proof tree (Verkle proof trees). For the application shard, you get a singular root commitment - a statement usable to verify any data at the application level.

Shards are created when:
- Leaves have their size roll up to branches, which roll up to the root
- A logical shard itself falls under the individual leaf when a prover is expected to maintain up to 1GB of proven data
- Multi-proof capability: many branches collectively 1GB or more can be proven at a larger branch level

### 2.0 vs 2.1 Shard Architecture

**2.0:** One shard - the core data proofs coming through frames. One singular commitment that all workers operate over. Workers are fed that particular bit string, produce proofs, feed back to master, master emits proof for rewards.

**2.1:** Global commitments level has 256 x 3 combinatorial. Workers are responsible for sequencing their own collective shards they manage. Master is aware of which shard sets it's covering based on allocation strategy, provides proofs, but doesn't actively manage everything convergent around the master node.

### Hyperedge Relationships

Hyperedge adds relate files together. For two vertices (V1, V2) representing file chunks, create a hyperedge linking them under application rules. This gives a unitary object that can be queried to obtain all vertex addresses needed to surface the file.

## Oblivious Hypergraph: Private Data Retrieval

How do you ensure a node serving data doesn't know what data you're requesting?

When querying data, you answer upfront:
- Do I want the network to know which application I'm dealing with?
- Do I want the network to know which data shard I'm dealing with?
- What is my acceptable privacy level?

Based on this, you choose:
- **Global level search** - very expensive but sometimes important
- **Application level search** - much more common (if there's enough users, it doesn't matter)

### Hierarchical Compact Query Evaluation

The naive approach (process all entries, give all answers) is too expensive computationally and bandwidth-wise.

Instead, hierarchical compact query evaluation establishes a statistical bar for how many elements can be queried based on set size and paths through the underlying tree.

For each step:
- Back and forth saying "if this bit, take left; if this bit, take right"
- But given for potentially both sides of branches
- Server sends back more data (not the whole amount) providing a statistical privacy bar
- You end up with several traces down the tree
- Enough data points to efficiently tell you what data you queried for
- Doesn't tell the evaluating node what data you actually queried for

## Summary

Nothing here is novel individually - these things have been done before, just not in this way. With global sequencing collecting only 19 kilobytes of global commitment shard proofs, we achieve:
- Significantly larger parallelization of processing and storing data
- Securely provable operation
- Significantly more scalable than any blockchain could ever be

This is what's coming with the 2.1 release.

---
*Updated: 2026-01-29*
