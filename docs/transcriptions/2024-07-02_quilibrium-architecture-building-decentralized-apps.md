---
title: "Quilibrium Architecture: Building Decentralized Discord from Web2 to Web3"
source: youtube
youtube_url: https://www.youtube.com/watch?v=eZ6oRyMAB3c
author: Cassandra Heart
date: 2024-07-02
type: livestream_transcript
topics:
  - quilibrium-architecture
  - system-design
  - hypergraph
  - kzg-commitments
  - bloom-filter-sharding
  - double-ratchet
  - triple-ratchet
  - mpc
  - local-testnet
  - building-on-quilibrium
  - decentralized-messaging
---

# Quilibrium Architecture: Building Decentralized Discord from Web2 to Web3

## Background: From Code Wolfpack to Quilibrium

This is a nostalgic journey back to the origins of Quilibrium. Around 2017, I was in the midst of doing a crypto startup and started doing educational broadcasts, originally on Discord, teaching people how to write production code at the caliber of companies like Facebook, Amazon, Apple, and Google.

Eventually I created from the bottom up a clone of Discord called Howler. At the time there were rumors that Microsoft was going to acquire Discord, which made a lot of gamers upset. The project felt like something that could actually succeed with millions of users overnight if done right.

As we were exploring how to take this and turn it into a federated approach (something like Matrix but without its problems), and then eventually peer-to-peer spaces, I realized that if you're going to solve these problems, you need to solve for one and do it well.

There was a particular social media platform that Amazon pulled the plug on. I'm a massive advocate for freedom of speech, and what the world witnessed was that a politically inconvenient project causes a company like Amazon to completely deplatform you at one of the most critical junctures of your project's success.

Instead of trying to do three different styles of projects at once (traditional web service approach, federated approach like Matrix), I decided to just go all in on peer-to-peer. Since about 2019, we started working backwards from the design of what we were building with Howler and building something that was usable. In doing so we ultimately came up with what is now today Quilibrium.

## System Design: Building Discord from Scratch

### Functional Requirements

To build Discord from scratch, you need basic features:
- User authentication and identity
- Simple chat functionality: direct messaging, group messaging
- Group messaging organized into "servers" (Discord originally called them guilds)
- File hosting (for images, stickers, emojis)
- Moderation (regardless of freedom of speech proclivities, freedom of association means moderators need to exist)

### Non-Functional Requirements

For scale, we need to consider:
- Discord today has servers with over 15 million users (MidJourney being the largest)
- Back when I was first building Howler, the largest Discord server had about 1-2 million users
- Discord measures roughly 50,000 to 200,000 messages per second at any time
- We need sub-millisecond latency (100-400ms) for message sends
- Ability to upload up to 10 megabyte files
- Handle image thumbnail processing
- Download in sub-second times
- Let's say we need to handle at least 400,000 messages per second

## Web2 Architecture

### Authentication Layer

A common composition is separating authentication from authorization. You disconnect your authentication from your application services.

When you authenticate with the auth server, you receive a JWT (JSON Web Token). The JWT has three parts: the header, intermediary set of claims, and a signature. The signature uses a private key that only the auth server has, while all other servers have a public key that can validate that signature originated from the auth server.

This allows you to validate implicitly without a bunch of "mother may I" style API calls against the auth server.

For the auth server itself, you use a KV store (DynamoDB, Redis with durability, etc.) that is sufficiently parallelizable to handle millions of users. You expose it through a load balancer with a fleet of Docker images for your API containers.

### Web3 Approach to Authentication

In Web3, you just have a wallet. There is no authentication server. When you're on Ethereum or Solana, you're dealing with wallets. When you're on Quilibrium, you're not actually having to deal with wallets - you're just using private keys appropriately, but all of that is taken care of for you with passkeys.

Passkeys are domain-segregated, which is something wallets in any other ecosystem can't do. That's one of the reasons why so many people get wrecked. You're really just dealing with a public key, and that public key is sufficient.

### Servers and Guilds: Wide Column Stores

Discord uses a NoSQL database type called a wide column database, specifically ScyllaDB (which is CQL compatible but not Apache Cassandra).

ScyllaDB is fantastic because of its "shared nothing" approach. The original authors were trying to build an operating system, so they use a library called Seastar that gets really close to the grain. It forces you to adopt an almost actor-like model for facilitating "one thread per core" philosophy.

The less that a processor needs to context switch, the faster your overall application will be. With shared nothing, all the individual cluster components (shards) do not share any resources with one another. They don't share RAM, they don't share cache on the CPU, they don't share file or network attached storage.

Discord actually measures their message submission times in nanoseconds instead of milliseconds because of this architecture.

### Web3 Limitations

If you're familiar with developing for Ethereum, you have a global computer. You think about things in terms of a smart contract that manages some collection of data stored in a Merkle tree root related to the account of the smart contract.

That doesn't scale very well. Even with new chains claiming 100,000 TPS, if you're wanting to handle 400,000 messages a second, you've already failed.

A lot of people in the Web3 context will leave only authentication as the decentralized component. Farcaster, for example, has a sufficiently decentralized approach with hubs that cause data replication to occur, but that data replication is completely irrespective of the Ethereum mainnet (or in Farcaster's case, Optimism mainnet). You can't put all that content on an EVM-based network.

## Quilibrium Architecture: The Hypergraph

### Global Commitment Shards and Core Shards

Quilibrium has a massive grid of 256 global commitment shards (about 19KB of data each). From those, you have an additional 65,536 core shards arranged in a massive bipartite graph.

When the network needs to maintain consensus, it's only needing to maintain consensus around this little pocket of data (the 256 commitment shards). Individual core shards have their own committees keeping consensus around the broader shards.

### Bloom Filter Data Routing

Data ends up on the network through a series of application calls. When you send a message to the network, you declare which application you're going to send it to and which shards it relates to.

We use a Bloom filter approach:
1. Take hash1, hash2, and hash3 of a message (three different hash functions)
2. Perform modulo 256 on each
3. This gives you positions A, B, and C
4. These three different values indicate which bit you're selecting on the overall shard

Those all share the same data as redundancy across three different components. From there, data flows into individual core shards, then into the committees of those shards, then to the shards themselves.

### KZG Commitments: Better Than Merkle Trees

We use a commitment scheme called KZG. KZG lets you take vectors of data (arrays) and pack them into a polynomial.

A polynomial is something like: ax^4 + bx^3 + cx^2 + dx + e

KZG takes notice that these constants might be publicly known or not, but you can create an unforgeable attestation (commitment) that lets you later prove something about that data.

For our 65,536 degree polynomial:
1. Take the first section of data, slot it in for constant a
2. Second section for b, third for c, and so on
3. The x values come from our trusted setup ceremony

We had a ceremony where people contributed random data. As long as one person is honest, the setup is secure. We had over 200,000 contributions to that ceremony.

Using those public points from the powers of tau setup ceremony as your powers in place of x^65536 and so on, when you evaluate that polynomial, you just add the scalar times those points all the way down the line. That output value is your commitment.

### Why KZG is Better Than Merkle Trees

With Merkle trees, to provide a proof you must provide:
- The initial data relating to the particular leaf
- All of the hashes climbing up as siblings to the root
- This is O(log n) data

With KZG, to prove a commitment at a particular point you only need:
- The particular data you're wanting to prove
- The corresponding proof point
- That's it - just one point

This compresses the amount of data needed for proofs. If we tried to convert a 256 to 65,536 bipartite graph nested twice to a Merkle tree, the corresponding Merkle proof size would be disastrously large. We would spend majority of the bandwidth just sending proofs.

In the original design, that's actually what we did, which is why I'm saying that was not a good choice. We adopted KZG because the savings gained outweigh the fears around the security of the trusted setup ceremony.

### Core Shard Sizing

Core shards store up to a gigabyte of data:
- 65,536 x 64 bytes = 4,194,304 bytes (roughly 4MB per commitment)
- 256 of those that data can settle into
- Collectively: 1GB maximum shard size

## Atomicity and Consistency Across Shards

Should related data live in the same shard? No. The shard scheme runs massively parallel. You should shard out every single component of your data as long as it's not intrinsically related (like a single user identity object being individual pieces in a total vector commitment).

You would NOT want related data to live in the same shard because that would massively compact the amount of data in a single core shard, which can slow things down. You want data spread out as much as possible.

### Consensus and Finality

At the global level, everybody keeps this 19KB commitment replicated. There's a synchronization interval that enforces that everyone has agreed.

For financial transactions between two parties, depending on your level of trust, you may want to wait until you hit that global synchronization level before considering it finalized.

Realistically, you can usually settle at the core shard committee level. Once settled there, it's sufficiently finalized for most intents and purposes - unless you're moving millions of dollars worth of USDC.

### VDF and Prover Selection

The Master Clock gives sequencing to the overall network and provides an unforgeable random beacon.

Prover committees are broken down into collections of eight:
- First ring: 8 provers
- Outer ring: 8 more
- Expands out like an onion

The closer you are to the core, the earlier you were as a prover under the proof of meaningful work consensus algorithm, and you get more rewards. This rewards being data-greedy more than being shard-greedy - you want to cover as much data as possible and be cooperative.

Every single VDF interval, nodes are individually producing a verifiable delay function proof over the collection of data they're covering. The VDF proof gives randomness to the order of which nodes are picked - you can't predict who's next.

All provers are individually proving their data all the time because they don't know when they'll be called upon and need to answer quickly. If they don't answer quickly, it counts against them and they'll slowly get scored out.

### Replication and Confirmation

Because of the Bloom filter at the global level, data gets spread out across three different prover committees, each with a minimum replication rate of eight. That means a total of 24 machines hold onto that data.

When you send a message via Blossom sub, you're dictating the Bloom filter on which you're publishing. Three different collective nodes will respond back with confirmation that data has been settled on the appropriate shard.

For critically important data that needs global consensus level assurance, wait for the global prover interval. We're still calibrating that - currently set to roughly 60 seconds, but we might bring it back up to the full 60-minute level originally outlined in the white paper.

## Identity on Quilibrium

Discord's portable identity problem: if you get banned from Discord, you lose everything. Web3 has portable identities - data settles onto the blockchain or Quilibrium's hypergraph.

You can genericize the concept of identity as its own application, and multiple applications can take advantage of it.

Because you have a vector of data representing a particular user object, you can do interesting things with KZG proofs. For example, prove your date of birth without revealing your address, or prove your location without revealing your name - because individual vector components are separate elements on that particular proof string.


## Cryptographic Primitives for Applications

### Double Ratchet

Simple end-to-end encryption (like Twitter's secret chats) just agrees to a single key. If that key is ever broken, an attacker can see everything.

Double ratchet provides perfect forward secrecy:
- Alice sends messages to Bob
- Eve steals the active keys
- Eve does NOT see any previous messages
- Eve CAN see subsequent messages from the sender whose keys were stolen (Bob)
- But the moment Alice says something new, assuming Eve doesn't have compromise of Bob's machine, messages go back to being encrypted

### Triple Ratchet

Signal's group messaging does every single pair of every user in the group with double ratchet - that's why Signal limits groups to 1,000 members. It's factorial explosive.

MLS (Messaging Layer Security) arranges all keys into a big binary tree with Diffie-Hellman between each party all the way up. But this gives no forward secrecy - if Eve steals the conversation, she can continue to see it as it comes along. MLS has "epochs" for reset, but those are expensive and require a centralized coordinator.

Triple ratchet is my solution - an asynchronous distributed key generation with a bumping scheme that lets you continually increment the key the same way double ratchet does, but between multiple users.

Properties:
- When a new person joins, they see NOTHING of previous messages
- Everyone else still has all their past conversations
- Same break-and-recovery as double ratchet in group context

### Using These Primitives

The interface is straightforward:
1. Create identity key, ephemeral key, signed pre-key
2. Construct initial message encryption key and root key based on triple Diffie-Hellman exchange
3. Create participant session
4. From then on, just use `ratchetEncrypt` and `ratchetDecrypt`

I'm going to add a wrapper layer so you can just say "identify participant, create session" without worrying about putting in the right key info.

### Shuffle (MPC Matrix Operations)

The shuffle interface is used for the mixnet and for secure machine learning. You create permutation matrices, Shamir split them, then do MPC operations (creating Beaver triples, multiplications, additions) to get a combined dot product of all matrices.

We also have Elon Beaver for power series of matrices - useful for machine learning.

### Hypergraph CRDT

The in-memory hypergraph example shows how data settles on the hypergraph as a CRDT:
- Declare locations for individual shards (giant bit string of the Bloom filter)
- Declare new vertices, new hyperedges
- See how it shards out and how the CRDT is kept consistent

When you add a hyperedge in location 2 that relates to location 1, you need consistency checks that happen along the way. The assertions must be met to reconcile data correctly.

## Building Ephemeral Peer-to-Peer Messengers

Quilibrium has three types of data permanence:
1. Store on hypergraph permanently (indefinite)
2. Store on hypergraph for a set period that expires
3. Ephemeral mode via Blossom - doesn't store anything, just propagates messages

For an ephemeral encrypted messenger:
1. Create a direct channel listener for a particular key and purpose
2. Have other peers connect on that same direct channel
3. Maybe use a rendezvous point for constructing hidden services on the network
4. Define gRPC protobuf services using P2PChannelEnvelope
5. Double/triple ratchet participants create P2P Channel Envelopes

You've essentially bootstrapped an asynchronous, completely lightweight, peer-to-peer, effectively stateless, ephemeral messenger on Quilibrium with barely any code.

If someone steals a key, they'd have to actually have those messages that key relates to. And again, only moving forward from that same user - once it increments and iterates, that option is gone.

## RDF and Hypergraph Query Optimization

For the RDF to hypergraph composition, there's a great paper from the National Institute of Technology with only six citations: "Hypergraph Based Query Optimization."

This paper takes hypergraphs and uses them as an embedding of RDF graphs, with SPARQL (query language for RDF) as execution plans embedded into the hypergraph with a predicate-based index. Finding and retrieving material on the hypergraph becomes more efficient than entity-attribute-value based RDF implementations in relational databases.

We use the RDF Schema to represent the structure of data on the network. Applications interact with that data through QCL (a subset of Go) generated from RDF schemas.

## Future Development and Intrinsics

When will Quilibrium be feature complete? There's no end to that. The network will continue to evolve like Ethereum and Solana have.

Current state: limited intrinsics. To support machine learning, you need matrix multiplication and activation functions. Floating point over MPC is complicated, but there are efficient MPC methods for activation functions.

We already have MPC primitives (oblivious transfer based MPC using FET as our OT primitive) capable of running AES circuits in usable speed for live stream decryption.

### Quantum Resistance Planning

Why use larger keys (Ed448, BLS48-581) instead of Ed25519 and BLS12-381?

All attacks today are conducted on smaller 256-bit curves. If such an attack is mounted, they'll suffer first. The parameters to attack Ed448 and BLS48-581 are exponentially larger, giving us more time.

During that time, we can actively build quantum-resistant things. Because we already have MPC-in-the-head as our offline prover construction, we can use it for a signature scheme known to be quantum-resistant (like Picnic).

This is long-term thinking - setting the foundation for easy upgrade solutions moving forward.

## Interoperability with Other Networks

Quilibrium doesn't have a negative opinion towards other networks. This ecosystem is too small for PVP-style antics. Burning bridges makes you an island, and an island doesn't succeed for a protocol.

When building Howler, we built integrations with Ethereum and Solana so you could have connections related to your crypto assets.

Our MPC-based bridge that bridges Quilibrium assets onto Ethereum with wrapped QUIL uses an MPC-based signer built on top of Quilibrium. With version 2.0, this enables bringing Ethereum assets onto Quilibrium.

Example use case: Build a decentralized messenger on Quilibrium. Want to send someone an ERC-20? Quilibrium is anonymous. Bridge that ERC-20 over to Quilibrium, send the asset keeping privacy preserved, and they can bridge it back to Ethereum if they'd like.

---

*Transcript cleaned on 2026-01-29*
