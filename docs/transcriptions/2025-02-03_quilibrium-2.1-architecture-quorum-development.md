---
title: "Quilibrium 2.1 Architecture, Sharding Design, and Quorum Development"
source: youtube
youtube_url: https://www.youtube.com/watch?v=w2KWlhfLlvQ
author: Cassandra Heart
date: 2025-02-03
type: livestream_transcript
topics:
  - 2.1 architecture
  - sharding
  - proof of meaningful work
  - miner consolidation
  - vector commitments
  - verkle trees
  - difficulty calibration
  - Quorum development
  - MPC wallet
  - Q Name Service
---

## Near-Term Roadmap

The near-term roadmap for Quilibrium includes several key items:

**Milestone 3 Updates:**
- This will be the last update to Milestone 3 currently in progress on testnet
- It will give the remaining components a chance to be vetted out and ensure they are performant and behaving as expected
- We'll finish with a mainnet data import and dry run - a common practice among protocols to ensure the network properly shards out existing mainnet data, maintains consensus, and continues to prove over the datasets in the new sharded tree format

**S3 and KMS APIs:**
- Testing the S3 and KMS APIs is ongoing
- The MPC wallet testing is a very important part of this - you may have seen the recent Quorum screenshot where we were vetting out the MPC wallet

**Quorum Updates:**
- Q Name Service implementation for decentralized identities on the network and for Quorum itself
- Public invite link synchronization issues being resolved
- MPC wallet feature targeting initial compatibility with Ethereum and Solana
- This is important for onboarding DAOs - many have expressed interest in moving away from Discord because it's not decentralized and has no encryption besides basic HTTPS

**Milestone 5:**
- Introducing the schema repository providing bonded types to the network
- When deploying an application, ensuring data is structured in a way that is easily referenceable despite being encrypted
- QCL runtime and compiler will be part of Milestone 5
- After vetting, 2.1 will deploy to mainnet

---

## Quilibrium 2.1 Architecture Overview

### Current State and Problems Being Solved

The 2.1 architecture is a large lift from where we are today. The way the network currently works is essentially one singular data shard which is much larger than a data shard will be on 2.1. It's the entire token application and all its contents consolidated into a single network shard.

This is essentially the same approach other networks use - for example, Ethereum doesn't have sharding; everything lives within Ethereum mainnet. There are L2s that are somewhat of a workaround, but the core network remains unsharded.

### Why Sharding?

Quilibrium was inspired by the notion of trying to decentralize Discord. When you look at the architecture of applications running at significant scale like Discord, they have a shard design baked into the data model. This shard basis is used in almost every large application at scale.

Doing this in a cryptographically secure way that's in step with typical blockchain approaches requires redesigning how sharding is done compared to traditional data models used by CassandraDB for Discord, or other shard bases like Uber's quad trees.

### The Miner Consolidation Problem

In proof of work networks like Bitcoin, you see a "race to the bottom" where all mining power converges on a few small pools. This happens because of how rewards are distributed. When you produce a new block in Bitcoin, the coinbase specifies a single address as the recipient of the reward. If you have a very small amount of hash power, your likelihood of receiving that reward is basically nil.

The last solo miner to receive a reward was recently, but it was such an anomaly that it became news. The protocol's distribution of rewards is probabilistic - the likelihood of any node producing hashes at a certain rate is essentially a percentage of the overall network's hash rate.

Quilibrium uses proof of meaningful work, which is encoded in 2.0, but the membership set on the ring is competitive. This causes a consolidation effect where large concentrations of miners operate on a single pool, dominating ring zero (the largest reward recipient for a given frame).

---

## Database Sharding Fundamentals

### Traditional Database Scaling

When designing a database with millions of users requesting simultaneously, you face constraints:
- Number of connections the database can service
- CPU power available
- RAM for caching repeatedly accessed data
- Disk space limitations

Traditional approaches include using network-attached storage or large redundant arrays, but there are intrinsic limits.

### Naive Sharding Approaches

The naive approach assigns users to shards based on modulo arithmetic of their ID. For example:
- User 1 → Shard 1
- User 2 → Shard 2
- User 3 → Shard 3

This fails for social networks where user interactions aren't bounded to user IDs following even/odd patterns. When you hit scaling limits and need more shards, you must redesign the bucketing, leading to hotspots.

### Consistent Hashing

Instead of bucketing based on modulo arithmetic, consistent hashing encodes the actual content of objects. Sometimes it's encoded as a hash immediately, sometimes as a UUID derived from content or randomly generated.

This approach tries to relieve hotspot pressure, but hotspots can still happen. Consider Twitter - when Kanye returned, millions of users requested data hitting a hotspot on that database.

### Higher-Level Caching

Applications put giant Redis clusters in front of databases to cache responses, serving them faster without hitting databases and relieving pressure on shards.

### Snowflake Identifiers

Discord and Twitter use snowflake identifiers - sequential IDs bucketed to individual shards. Each ID includes a timestamp, server cluster identifier, and other attributes. These work well for traditional server designs but present challenges for decentralized networks.

---

## Cryptographic Tree Structures

### The Quad Tree Approach

Uber deals with geographic data with natural hotspots from large population centers. Their approach:
1. Take a map of the world and divide it into quadrants
2. Some spots are basically empty (oceans) - just need one dedicated shard
3. Structure data into a tree design where quadrants become branches
4. When data in one quadrant grows, there's natural partitioning following the tree pattern
5. Instead of replicating the entire block, split into smaller shards

This is divide and conquer - trees continue to branch out.

### Merkle Trees

Bitcoin's original approach uses Merkle trees where:
- Leaves are hashed (transactions in Bitcoin's case)
- Branches are hashes of the hash data
- Converges on a root hash
- The root is the finalized state representing the entire collection of data

### The Problem with Traditional Merkle Proofs

Ethereum's state is about 250GB. To prove any particular transaction's inclusion in a block, you must provide sibling hashes all the way up to the root. With a traditional Merkle tree having only two branches at every level, Ethereum requires about 13-14 sibling proofs (32 bytes each).

---

## Vector Commitments and Verkle Trees

### Powers of Tau Ceremony

In April two years ago, Quilibrium conducted a powers of tau ceremony where people contributed random entropy to help secure the values that construct polynomials on the network.

### How It Works

Instead of chained hashes, we encode data into a polynomial where:
- f(x) = ax³ + bx² + cx + d
- The values for x are effectively invisible because each contributor adds individual entropy and randomness
- The real value for x is locked inside a public key point rather than exposed as a private key

This secure reference string allows us to condense information in leaves as a vector commitment. We transform committed data into polynomial coefficients. When evaluated, we get a point instead of chained hashes.

### Performance Results

Because you have a string of points leading to the root, you don't need all the expensive sibling proofs. You can just provide the string of commitments up to the root for a verifiable proof.

After extensive performance testing, we refined the parameterization:
- 64-degree polynomial proved most performant
- About 100 millisecond tree commitment times
- About 100 millisecond proof times

This enables fast proof verification and provides a mechanism for continuing to partition the network as branches grow.

---

## State Size and Reward Calculations

### Calculating Network State

The tree construction provides known values:
- 64 leaves allowed per branch
- Based on tree height, we know exactly how many sets of 64 branches can exist
- Multiply these values to get total state size of a particular shard

### Proof of Meaningful Work Equation

The issuance of QUIL is directly bounded to variables including the total state size of the network. This also affects transaction fees - adding data reduces token emissions, so there must be a counterbalancing fee.

The fee calculation:
- Larger data = greater fee
- More impact data has at creation time = higher fee at the beginning
- This checks and balances issuance against data being added

---

## Global Shard Architecture

### Application Placement Using Bloom Filters

When you have an application, its identifier is unique. You hash this identifier to produce a bloom filter selection. A bloom filter works with:
- A bit string of a certain size (zeros and ones)
- Input value (application identifier)
- Pass through hash functions to get output vector
- Pick selected bits (e.g., positions 0, 4, 7)

This determines which global shard the application lives on. At the global level, we use combinatorial construction (256 possible bits, selecting 3, always guaranteed to pick 3).

### Reed-Solomon Encoding

Individual shards are encoded using Reed-Solomon encoding to ensure at least three individual global sections replicate the data, along with other applications falling in those buckets. The position on the vector dictates which chunk of data each section holds.

### Scale

The network starts from the 2.0 to 2.1 transition with approximately 2.5 million global shards. This evaluates very quickly. Nodes choose which global shards to address:
- Every node covers the token application by default (matters for every miner)
- Other applications like Quorum have unique address spaces
- Nodes choose whether to replicate that data, incentivized by the network

---

## Why 2.1 Prevents Miner Consolidation

### The 2.0 Model

In 2.0, a large cluster takes each frame and constructs a proof by:
1. Taking the frame's output value
2. Encoding data identifying the miner
3. Submitting the proof to the next frame
4. Chaining this infinitely

Rewards distribute based on number of workers on a given proof. Inputs must be unique, composed of:
- Frame output
- Prover ID
- Core ID of individual worker

This fans out quickly - a single master node with relatively large capacity can handle hundreds to thousands to hundreds of thousands of workers, delegating small proof inputs.

### The 2.1 Difference

In 2.1, individual inputs are entirely different. To maintain proofs, you must maintain that data individually on shards in a unique way. This requires:
- More work per individual worker
- Much more bandwidth than initial input data model

---

## Data Trees and Verifiable Encryption

### Application Trees

The oblivious hypergraph is an oblivious data structure the network maintains for secure querying with deniability. Unlike Ethereum where using public RPCs (Infura, Alchemy) reveals your addresses to your IP address, Quilibrium's query inputs are effectively private.

When hypergraph information is put on the tree:
1. Application tree says which addresses correspond to data stored for that application
2. Each pocket of addresses has its own unique data tree
3. Data tree uses the same vector commitment/verkle tree structure
4. Broken into 64-byte segments up to 1GB per data shard

### Preventing Sybil Squatting

If you wanted to sybil-squat a particular data shard (pretend to be three different nodes), we combat this with verifiable encryption.

The network uses encrypted data on the hypergraph - you don't know what the data is. When producing proofs, you're selecting chunks of data you don't know.

**Naive approach problem:** Network issues an interval, you randomly select one branch, choose that chunk, produce a time proof. But you could pretend to be multiple nodes and produce the same proof.

**Solution:** A second layer of verifiable encryption where each individual worker maintains verifiably encrypted storage unique for every single proof. This amplifies the cost - to fake being three provers, you'd need to maintain three times the data stored.

**Result:** If you try to squat a shard, you're effectively securing the network, making consolidation moot. The network also encourages replication across different jurisdictions and IP addresses for broader data distribution.

---

## Difficulty Calibration

### Per-Shard Calibration

Each shard has its own difficulty calibration because:
- Workers use different hardware
- A Raspberry Pi could never compete at the global level for VDF issuance
- This would make Raspberry Pis ineffective as worker nodes

Instead, each individual shard has its own difficulty. Similar to Bitcoin's model, every so often a window of produced proofs triggers difficulty recalibration.

### Network Pulse Rate

At the shard level, difficulty sets the network's pulse rate. We target 10-second time frames for each individual frame per shard.

**Examples:**
- Cluster of Raspberry Pis occupying individual shards = lower difficulty
- High-end Thread Ripper cluster = higher difficulty, handling more intensive computation

The network converges into useful pockets based on what nodes can handle:
- Highly data-intensive applications not doing much processing → captured by Raspberry Pis
- Highly data-intensive processing applications → captured by Thread Rippers or GPUs

### Average Difficulty and Generations

Difficulty data is captured in the application state tree, rolled up to data shards, then to global shards. This gives a bird's eye view of average network difficulty and each individual shard's difficulty.

While Moore's law is contentious (transistors can only get so small), we still see improvements in speed and 3D structuring of transistors. The VDF measures this - a live snapshot at every frame of how fast the network can process.

Since VDF is not parallelizable (must iterate in sequence), it provides a nice view of network computation speed.

### Generational Issuance

The network generation represents exponential growth from initial difficulty value. We launched with about 10,000 VDF iterations, now at 160,000 iterations.

**Next generation step:** 100 million iterations (about 8 years away)

This addresses Bitcoin's security budget problem. As computational power required gets harder, mining pools accumulate more nodes, rewards become fewer, and contributing more power seems wasteful.

Quilibrium has generational issuance changes - when we reach the next generation, the curve rebounds to issue more tokens, encouraging more computational power and storage to join without feeling wasted on trying to get the last bits of QUIL from a bounded curve.

---

## Quorum Development Demo

### Adding Stickers Feature

This demonstration shows how easy it is to add features to Quorum. The process involves:

**1. Add New Message Type:**
```typescript
// Add sticker message type with unique type ID
interface StickerMessage {
  type: 'sticker';
  stickerId: string;
  repliesToMessageId?: string;
}
```

**2. Create Rendering Component:**
- Similar to existing embedded image approach
- Filter by sticker ID and provide image URL
- Add stickers map to message props

**3. Add Space Configuration:**
- Copy emojis payload structure in space editor
- Create separate drop zone for stickers
- Add button to access sticker category

**4. Add Send Capability:**
- Create button in channel editor
- Submit channel message with sticker type
- Update message DB to handle new type

**5. Handle Protocol Messages:**
- Add canonicalization for sticker messages in message DB
- Handle default case for messages without special processing needs
- Pass stickers through message list component

### Architecture Benefits

This demonstrates Quorum's powerful architecture where features compose naturally. When new features get added to Quilibrium, applications can potentially supercharge:
- KMS service launching in a few days
- MPC wallet capabilities for wallet-as-a-service providers or Quorum itself
- Embedded wallets for DAOs to manage funds in jointly controlled fashion within group chats

### Open Source Contribution

The message component has grown large and unwieldy - this would be a good refactoring target for contributors. If your space wants specialized features not in mainline Quorum, you can fork it and run it on your own. Please submit PRs back to benefit the community.

---

*Last updated: 2026-01-29*
