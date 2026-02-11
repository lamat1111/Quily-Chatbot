---
title: "Communication Layer — E2EE, Mixnet Routing, and P2P Networking"
source: official_docs_synthesis
date: 2026-02-11
type: technical_reference
topics:
  - communication
  - E2EE
  - end-to-end encryption
  - double ratchet
  - triple ratchet
  - forward secrecy
  - mixnet
  - mix network
  - Random Permutation Matrix
  - RPM
  - metadata privacy
  - onion routing
  - BlossomSub
  - GossipSub
  - libp2p
  - P2P
  - peer-to-peer
  - peer discovery
  - DHT
  - addressing
  - Poseidon hash
  - PCAS
  - planted clique
  - SLRP
  - ephemeral messaging
  - Quorum
---

# Communication Layer: E2EE, Mixnet Routing, and P2P Networking

Quilibrium's communication layer provides privacy-preserving messaging and data transfer across the network. It is built from four core components that work together: the **Planted Clique Addressing Scheme (PCAS)** for quantum-resistant addressing, the **Triple-Ratchet Protocol** for end-to-end encryption, the **Shuffled Lattice Routing Protocol (SLRP)** with a Random Permutation Matrix mixnet for metadata privacy, and **BlossomSub** for gossip-based message propagation. Together, these components enable secure, unlinkable, and scalable communication.

## End-to-End Encryption (E2EE)

Quilibrium uses ratchet-based encryption protocols to provide end-to-end encryption with perfect forward secrecy. Two protocols are available depending on whether communication is peer-to-peer or group-based.

### Double Ratchet (Peer-to-Peer)

For one-to-one communication, Quilibrium uses the **Double Ratchet** protocol — the same cryptographic pattern underlying Signal's peer-to-peer messaging, but implemented directly on the Quilibrium network without centralized key servers.

The Double Ratchet provides **perfect forward secrecy**:

```
Scenario: Eve steals active encryption keys

- Eve does NOT see any previous messages (forward secrecy)
- Eve CAN see subsequent messages from the compromised sender
- But the moment the other party responds, messages go back
  to being encrypted and Eve is locked out again
```

This "break-and-recover" property means that even if an attacker compromises a session key, the damage is limited. Past messages remain confidential, and future messages become secure again as soon as the non-compromised party sends a new message.

### Triple Ratchet (Group Encryption)

For group communication, Quilibrium invented the **Triple Ratchet** protocol — an original cryptographic construction designed specifically for decentralized group messaging. It was created to solve the problems with existing group encryption approaches.

#### Why Not Existing Approaches?

**Signal's approach** (pairwise Double Ratchet for every member pair) is computationally explosive. For a group of N members, it requires N×(N-1)/2 key agreements. This is why Signal limits groups to 1,000 members — the cost grows factorially.

**MLS (Messaging Layer Security)** arranges all keys into a binary tree with Diffie-Hellman exchanges up the tree. However, MLS provides **no forward secrecy** — if Eve steals the conversation, she can continue to see messages as they arrive. MLS has "epochs" for periodic reset, but these are expensive and require a centralized coordinator.

#### How Triple Ratchet Works

The Triple Ratchet is an **asynchronous distributed key generation** with a bumping scheme that lets participants continually increment shared keys — the same way Double Ratchet does for two parties, but extended to multiple users.

Key properties:

1. **Forward secrecy in groups**: When a new person joins, they see **nothing** of previous messages. Everyone else retains access to their past conversations.
2. **Break-and-recovery**: Same resilience as Double Ratchet — if one member's keys are compromised, the damage is limited and the group recovers once other members send new messages.
3. **No centralized coordinator**: Unlike MLS, Triple Ratchet operates in a fully decentralized manner.
4. **Scalable**: Avoids the factorial explosion of pairwise ratchets.

#### Developer Interface

The interface for using Triple Ratchet in applications is straightforward:

```
1. Create: identity key, ephemeral key, signed pre-key
2. Construct initial encryption key and root key
   via Triple Diffie-Hellman exchange
3. Create participant session
4. From then on: ratchetEncrypt() and ratchetDecrypt()
```

The `channel` crate in the Quilibrium codebase implements these secure E2EE communication primitives.

## Mixnet Routing: Metadata Privacy

Even with perfect message encryption, an adversary who can observe network traffic can learn **who is communicating with whom** (metadata). Quilibrium addresses this with a **Random Permutation Matrix (RPM) mixnet** — a system that makes it impossible to link senders to recipients at the network level.

### The Problem with Onion Routing

Traditional onion routing (like Tor) provides privacy through layered envelope encryption:

```
Message path: Sender → Hop A → Hop B → Hop C → Recipient

- Sender encrypts to Recipient, wraps for C, wraps for B, wraps for A
- Hop A sees only: "forward to B"
- Hop B sees only: "forward to C"
- Hop C sees only: "forward to Recipient"
```

The fundamental problem: this requires a **sufficient number of honest nodes** on each route. If an adversary (such as a government agency) operates the majority of hops, they can trace the entire route and link sender to recipient. This is a known attack on Tor — traffic analysis by controlling enough relay nodes.

### Random Permutation Matrix (RPM)

Quilibrium's mixnet uses a fundamentally different approach based on **Multi-Party Computation (MPC)**.

#### How It Works

Every node in the network participates in an MPC protocol to jointly construct a **secret-shared permutation matrix**:

```
A permutation matrix is a grid of zeros and ones where:
- Each row has exactly one 1
- Each column has exactly one 1
- All other entries are 0

When you multiply a list of messages by this matrix,
the output is the same messages in a scrambled order.
```

The process:

1. Each participating node generates its own random permutation matrix.
2. Each node **Shamir-splits** its matrix into secret shares and distributes them.
3. Through MPC operations (Beaver triples, multiplications, additions), the network computes the **combined dot product** of all individual matrices.
4. The result is a truly random permutation matrix that no single party knows.
5. Input messages are multiplied against this combined matrix, producing a shuffled output where the mapping from sender to recipient is unknowable.

#### Security Guarantees

The RPM mixnet provides stronger guarantees than onion routing:

- **If at least one sender is honest** about their contribution to the permutation matrix, **no one learns anything** — the sort order is completely random and unlinkable.
- **If everyone is dishonest**, no one learns anything anyway — the MPC protocol ensures no party can reconstruct the mapping.
- **An observer watching the network** cannot determine where any particular message is being routed.
- **Active attackers** who try to manipulate the network also cannot link senders to recipients.

This gives Quilibrium **full IP-level privacy** — true unlinkability of sender and recipient for all messages on the network.

### Shuffled Lattice Routing Protocol (SLRP)

SLRP is the protocol layer that integrates the RPM mixnet into Quilibrium's routing infrastructure. It provides anonymous message routing by combining the permutation-based shuffling with lattice-based cryptographic constructions, ensuring that routing decisions themselves do not leak metadata.

### Performance at Scale

The mixnet implementation has been translated to **Rust** for performance and has been optimized to handle millions of messages in real time with no perceptible impact on user experience. The network has demonstrated the ability to securely mix at the scale needed for internet-level applications.

## P2P Networking: BlossomSub

Quilibrium's peer-to-peer networking is built on a heavily modified fork of the libp2p stack, with a custom gossip protocol called **BlossomSub** replacing the standard GossipSub.

### From GossipSub to BlossomSub

BlossomSub originated as a fork of GossipSub (the standard pub/sub protocol in libp2p), but has been modified so extensively that it "no longer resembles GossipSub at all." It is purpose-built for Quilibrium's sharded architecture and privacy requirements.

Key differences from standard GossipSub:

- **Bloom filter-based publishing**: When sending a message via BlossomSub, the sender specifies a Bloom filter that determines which shards receive the message.
- **Shard-aware routing**: Messages are routed to the appropriate prover committees based on Bloom filter matching.
- **Confirmation protocol**: Three collective nodes respond with confirmation that data has settled on the appropriate shard.
- **Privacy integration**: Works in conjunction with the RPM mixnet rather than broadcasting in the clear.

### libp2p Fork

Quilibrium maintains a **wholly separate fork** of the entire go-libp2p stack. The modifications are extensive:

- **Performance optimizations**: Removed Go's `defer` patterns where they caused measurable slowdowns, achieving network capacity of over **100 million messages per second**.
- **Bug fixes**: Fixed broken panic-recover patterns in go-multiaddr and other libraries that the upstream maintainers had flagged but couldn't fix without breaking interfaces.
- **Core libraries**: go-libp2p (core P2P), go-libp2p-blossomsub (custom gossip for sharding), go-libp2p-kad-dht (DHT implementation).

### Peer Discovery and DHT

Nodes discover each other through a **Kademlia Distributed Hash Table (DHT)**:

- The main node process connects to a globally shared peer list (DHT of all peers).
- Each data worker connects to shard-specific peer networks using dedicated BlossomSub bitmasks.
- Peer management handles discovery, connection maintenance, and NAT traversal.

### Network Architecture

The networking layer operates at two levels:

```
┌────────────────────────────────────────────┐
│              Main Node Process              │
│                                            │
│  Global BlossomSub bitmask                 │
│  DHT peer discovery                        │
│  Public channels (point-to-point auth)     │
│  Private channels (onion-routed auth)      │
└─────────────┬──────────────────────────────┘
              │
    ┌─────────┴─────────┐
    ▼                   ▼
┌──────────┐     ┌──────────┐
│ Worker 1 │     │ Worker N │
│          │     │          │
│ Shard-   │     │ Shard-   │
│ specific │     │ specific │
│ bitmask  │     │ bitmask  │
└──────────┘     └──────────┘
```

- **Public Channels**: Point-to-point authenticated message routing — both parties know each other's identity.
- **Private Channels**: Onion-routing authenticated message channels — the communication is authenticated but the routing is privacy-preserving.

## Addressing: PCAS and Content Addressing

Quilibrium uses a quantum-resistant addressing scheme and Poseidon-based content addressing to identify applications and data on the network.

### Planted Clique Addressing Scheme (PCAS)

PCAS is a cryptographic addressing system based on the **planted clique problem** combined with **Learning Parity with Noise (LPN)**. The planted clique problem is NP-complete, making PCAS believed to be **quantum-resistant**.

How addresses are derived:

1. Generate a public key (adjacency matrix of a random graph with a planted independent set) and private key (the independent set).
2. Serialize the adjacency matrix as a binary string.
3. Hash with **cSHAKE** using the customization string `"Quilibrium Address"` to produce a 256-bit output.
4. Format as: `'Q' || 'x' || encode(address)` — resulting in addresses like `Qx...`

Quilibrium encourages using **name resources** (via Q Name Service) for human-readable indirection rather than raw addresses.

### Application and Content Addresses

Network addresses operate at two levels:

```
Application Address:
  - Poseidon hash of the compiled QCL circuit, OR
  - For intrinsics (built-in protocol apps): Poseidon hash of
    a unique identification string ("nothing-up-my-sleeve" process)

Content Address:
  - Poseidon hash of (application_address || Poseidon hash(encrypted_content))
```

This two-level scheme separates the identity of the application from the identity of specific data within that application, enabling content-addressed storage with application-level namespacing.

## Ephemeral Messaging

Not all communication on Quilibrium needs to be persistent. The network supports three tiers of data permanence:

| Tier | Storage | Use Case |
|------|---------|----------|
| **Permanent** | Stored on hypergraph indefinitely | On-chain state, identity records |
| **Time-limited** | Stored on hypergraph with expiration | Temporary data, cached computations |
| **Ephemeral** | Not stored — propagated via BlossomSub only | Real-time messaging, live communication |

### Building an Ephemeral Messenger

Developers can build fully encrypted, stateless, peer-to-peer messengers with minimal code:

1. Create a **direct channel listener** for a particular key and purpose.
2. Have peers connect on the same direct channel.
3. Optionally use a **rendezvous point** to construct hidden services on the network.
4. Define gRPC protobuf services using the **P2PChannelEnvelope** type.
5. Apply Double or Triple Ratchet encryption to the channel envelopes.

The result is an asynchronous, lightweight, peer-to-peer, effectively stateless, ephemeral messenger running on Quilibrium. If an attacker steals a session key, they would need the specific messages that key relates to — and once the ratchet increments, that window is gone.

## Message Flow: Putting It All Together

A complete message through the Quilibrium communication layer:

```
1. ADDRESSING
   Sender constructs recipient address (PCAS or QNS lookup)

2. ENCRYPTION
   Message encrypted via Double/Triple Ratchet
   (forward secrecy, break-and-recovery)

3. MIXNET ROUTING
   Message enters RPM mixnet
   - Secret-shared permutation matrices shuffle message order
   - SLRP routes through lattice structure
   - No party can link sender to recipient

4. GOSSIP PROPAGATION
   BlossomSub propagates to target shard(s)
   - Bloom filter selects destination committees
   - 3 collective nodes confirm settlement
   - Minimum 8x replication per committee (24 total copies)

5. DELIVERY
   Recipient retrieves and decrypts
   - Ratchet advances for next message
```

## Performance Characteristics

| Metric | Value |
|--------|-------|
| **Message throughput** | 100+ million messages per second (tested) |
| **Transaction throughput** | 1.5–2.5 million TPS (estimated across shards) |
| **Per-shard throughput** | ~6,000 TPS |
| **Finalization time** | 200ms – 10 seconds |
| **Data replication** | 3 committees × 8 minimum replicas = 24 copies |
| **Mixnet overhead** | Negligible — real-time processing at scale |

## Frequently Asked Questions

**Q: How does Quilibrium's mixnet compare to Tor?**
A: Tor uses onion routing, which requires trusting that a majority of relay nodes are honest. Quilibrium's RPM mixnet uses MPC so that if even one participant is honest, the message routing is completely unlinkable. Quilibrium provides stronger privacy guarantees with no trust assumptions about the number of honest nodes.

**Q: Can Quilibrium messages be intercepted?**
A: Messages are end-to-end encrypted with ratchet protocols (forward secrecy), routed through an MPC-based mixnet (metadata privacy), and stored with verifiable encryption. An interceptor would need to break the encryption AND defeat the mixnet AND compromise the specific ratchet keys for the specific message — each independently infeasible.

**Q: What is the difference between Double Ratchet and Triple Ratchet?**
A: Double Ratchet is for two-party (peer-to-peer) communication. Triple Ratchet extends the same forward-secrecy properties to groups of any size without requiring a centralized coordinator or suffering factorial key-agreement costs. Triple Ratchet is an original invention by Quilibrium's team.

**Q: Is BlossomSub the same as GossipSub?**
A: No. BlossomSub started as a GossipSub fork but has been modified so extensively that it is effectively a new protocol. It adds Bloom filter-based shard routing, privacy-aware propagation, and optimizations that enable 100M+ messages per second.

**Q: Are Quilibrium addresses quantum-resistant?**
A: Yes. The Planted Clique Addressing Scheme (PCAS) is based on the planted clique problem (NP-complete) combined with Learning Parity with Noise (LPN), both believed to be resistant to quantum algorithms.

**Q: What is ephemeral messaging?**
A: Ephemeral messages propagate through BlossomSub without being stored on the hypergraph. They exist only in transit and in the recipient's local memory. This enables real-time communication applications like chat without leaving a permanent on-chain record.

**Q: How does Quorum (the messenger app) use these primitives?**
A: Quorum is a peer-to-peer encrypted messenger built on Quilibrium. It uses Triple Ratchet for group encryption, the RPM mixnet for routing privacy, and offers users a choice between periodic polling (maximum privacy) or k-anonymity bucket notifications (balanced convenience/privacy). See the Quorum Notifications and Privacy document for details on the notification architecture.

## What the Communication Layer Cannot Do

- **It cannot hide that you are using Quilibrium**: Network participation is visible at the IP level (though the mixnet hides what you are doing on the network).
- **It cannot protect against endpoint compromise**: If an attacker has full access to your device, encryption cannot help. Quilibrium recommends biometric auth and disabling notification content display for high-risk users.
- **Ephemeral messages have no delivery guarantee**: If the recipient is offline, ephemeral messages are lost. Use time-limited or permanent storage for reliable delivery.
- **The mixnet adds latency**: The MPC-based shuffling introduces some processing time compared to direct routing, though Quilibrium has optimized this to be imperceptible at scale.
- **PCAS addresses are not human-readable**: Raw addresses look like `Qx...` strings. Human-readable names require the Q Name Service (QNS) for indirection.

---

*Last updated: 2026-02-11*
