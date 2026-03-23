---
title: "Quilibrium OS Subsystems — Accounts, Scheduler, IPC, File System, Message Queues, Key Management & Universal Resources"
source: official_docs_synthesis
date: 2026-02-11
type: technical_reference
topics:
  - operating system
  - DBOS
  - accounts
  - coins
  - scheduler
  - IPC
  - inter-process communication
  - file system
  - message queues
  - QQ
  - key management
  - QKMS
  - universal resources
  - RDF schemas
  - passkeys
  - WebAuthn
  - bloom filter lineage
  - pending transactions
  - cold custody
  - warm custody
---

# Quilibrium OS Subsystems — Comprehensive Reference

## Overview

Quilibrium implements a complete set of operating-system-level primitives on top of its oblivious hypergraph database. This design is inspired by the **Database Operating System (DBOS)** concept: instead of running OS services as kernel code, every primitive — file system, scheduler, IPC, message queues, key management, accounts, and universal resources — is represented as **RDF schemas** stored in and queryable through the hypergraph.

Because these primitives are RDF-native, they are:

- **Queryable** through the oblivious hypergraph query planner and evaluator
- **Privacy-preserving** via oblivious transfer during reads and writes
- **Composable** — any primitive can reference any other through named IRI graph addresses
- **Decentralized** — no single machine "runs" the OS; the network collectively maintains state

This document explains what each subsystem does, why it is designed the way it is, and how the subsystems relate to one another and to the broader Quilibrium architecture.

## File System

### Design: Object Store, Not Hierarchical

Quilibrium's file system follows an **object store model** (similar to Amazon S3) rather than a traditional POSIX hierarchical directory tree. Files are stored as discrete objects with metadata, and blocks are content-addressed data chunks that compose a file.

### How It Works

A **File** object has three core properties:

| Property | Description |
|----------|-------------|
| FileName | Human-readable name of the file |
| FileSize | Total size in bytes |
| FileOctet | MIME type / content type of the file |

Files are divided into **Blocks**, each with:

| Property | Description |
|----------|-------------|
| FileParent | Reference to the parent File |
| BlockHash | Content hash for integrity verification |
| BlockData | The actual data payload |
| BlockNumber | Ordering index within the file |
| BlockSize | Size of this block |

### FUSE Integration

Quilibrium supports **FUSE (Filesystem in Userspace) drivers** through an RDF-to-filesystem bridge called **RDF2FS**. This creates a direct bridge between the classical operating system on a node and the Quilibrium network, enabling:

- Mounting Quilibrium storage as a local filesystem
- File backup workflows that feel like writing to a local drive
- Transparent access to network-stored data through standard file I/O

### Relationship to QStorage

QStorage (the S3-compatible API product) is built on top of these file system primitives. When you store an object through the QStorage API, the underlying representation on the hypergraph uses the File and Block RDF schemas described here. QStorage adds bucket organization, access control, tagging, and an S3-compatible HTTP API on top.

## Scheduler

### Design: Priority-Based and Cron-Based Execution

The scheduler enables two modes of task execution on the network:

1. **Priority-based tasks** — One-time execution ordered by a max-heap with priorities 0–255 (higher number = higher priority, processed first)
2. **Cron-based tasks** — Recurring tasks executed at intervals defined by a cron string

### How It Works

A **Task** object has these properties:

| Property | Description |
|----------|-------------|
| TaskData | Reference to a File containing the task payload (e.g., an OT circuit) |
| TaskPriority | 0–255 priority for one-time execution (max-heap ordering) |
| TaskSchedule | Cron string for recurring execution (e.g., `"0 */6 * * *"` for every 6 hours) |
| TaskResult | Reference to a File where execution output is stored |

### Use Cases

- **Smart contract execution**: Tasks can reference OT circuit files deployed on the network
- **Automated data processing**: Scheduled transforms on stored data
- **Network maintenance**: Recurring operations like pruning, replication checks, or schema migrations
- **Deferred operations**: One-time tasks queued for later execution when network load permits

### Interaction with Other Subsystems

The scheduler interacts tightly with:

- **File system** — task payloads and results are File objects
- **Key management** — tasks that involve MPC computation need key shares
- **IPC** — inter-process messages can trigger task scheduling

## Inter-Process Communication (IPC)

### Design: Named Graph Messaging

IPC on Quilibrium uses a **named graph based structure**. Each message targets a specific graph address, allowing processes (whether on the same node or across the network) to exchange structured data.

### How It Works

An **IPCMessage** has two properties:

| Property | Description |
|----------|-------------|
| MessageData | The content of the message (arbitrary bytes) |
| ToAddress | The address of the target graph (the recipient) |

### Architecture Context

In Quilibrium's multi-process node architecture:

- The **main process (Core 0)** runs global consensus and coordination
- **Data worker processes (Cores 1+)** each manage specific shards
- IPC is used for structured message passing between these processes
- Communication happens over **private pubsub topics** via the P2P layer
- The main process acts as coordinator; workers connect to it via IPC

This design provides:

- **Process isolation** — each process has independent memory, storage, and networking
- **Minimal shared state** — processes communicate only through well-defined IPC messages
- **Failure resilience** — a crashed worker doesn't bring down the main process

### IPC vs. P2P Messaging

IPC (inter-process communication) is for communication **within a node** or between processes that share trust. P2P messaging (via BlossomSub and the mixnet) is for communication **between nodes** across the network. However, both ultimately use the same underlying pubsub infrastructure, with IPC using private topics.

## Message Queues

### Design: Linked-List FIFO Queues

Message queues provide **First-In-First-Out (FIFO)** semantics using a linked-list data structure with parent references. This is the primitive that powers the **QQ** product (Quilibrium's SQS-compatible message queue service).

### How It Works

A **Queue** consists of **QueueNodes** linked together:

| Component | Description |
|-----------|-------------|
| Queue | The queue container with a reference to its head node |
| QueueNode | A single entry in the queue |
| HeadNode | Points from the Queue to its first QueueNode |
| NextNode | Links one QueueNode to the next (forming the list) |
| QueueMessage | The actual message payload attached to a QueueNode |

Messages are enqueued at the tail and dequeued from the head, maintaining strict FIFO ordering.

### QQ: The SQS-Compatible Product

QQ provides approximately **100% API compatibility with Amazon SQS**. The service maps SQS API calls to operations on these underlying queue primitives. A few minor differences exist due to architectural differences between Quilibrium and AWS, but the vast majority of SQS use cases are supported.

QQ is built from two Quilibrium primitives:

| Primitive | Role |
|-----------|------|
| Hypergraph | Stores queue structure and messages as RDF graph data |
| Dispatch mechanism | Handles message delivery notifications |

### Use Cases

- **Microservice communication** — Decouple producers and consumers
- **Event-driven architectures** — Trigger processing on message arrival
- **Work distribution** — Distribute tasks across multiple consumers
- **Notification pipelines** — Buffer and order notifications (used by QPing)

## Key Management

### Design: MPC-Native Distributed Keys

Key management on Quilibrium is fundamentally different from traditional systems. Rather than storing complete private keys in a single location (even inside an HSM), Quilibrium uses **Multi-Party Computation (MPC)** to split keys into shares that **never exist combined on any single device**.

### How It Works

A **Key** object has:

| Property | Description |
|----------|-------------|
| Format | The key format identifier |
| PublicData | The public key component (visible to authorized parties) |
| Protocol | Reference to a known protocol, or to an executable OT circuit File |

Each Key has one or more **KeyShares**:

| Property | Description |
|----------|-------------|
| OfKey | Reference back to the parent Key |
| KeyData | The actual key share data (one shard of the split key) |

### Security Properties

The split-key design provides two critical guarantees:

1. **Different owners** — If key shares are held by different parties, the complete key never exists on a single device. Signing and decryption happen through MPC without key reconstruction.
2. **Same owner** — Even if one entity holds all shares, any meaningful use (signing, decrypting) is reflected in the global hypergraph as a mutation, preventing state forgery.

### The Protocol Property

The Protocol field on a Key is multi-purpose:

- It can reference a **known protocol** built into node software (e.g., Ed448, BLS-48-581, secp256k1)
- It can reference an **executable File** containing a custom OT circuit
- This enables additional MPC protocols beyond what the network natively supports

### QKMS: The KMS Product

QKMS (Quilibrium Key Management Service) is built on top of these primitives. It provides:

- **Symmetric keys** — AES and other symmetric algorithms
- **Asymmetric RSA** — Standard RSA key pairs
- **Asymmetric ECC** — Elliptic curve keys
- **Edwards curves** — Ed25519, Ed448 (AWS KMS doesn't support these)
- **secp256k1** — For Ethereum, Bitcoin, and Tezos compatibility
- **HMAC** — Hash-based message authentication
- **SM2** — Chinese national cryptographic standard

QKMS uses the oblivious transfer primitive inside the compute operation to achieve multi-party compute of keys, providing **distributed key management without being a key custodian**. Key shards are encrypted and stored on the hypergraph; QKMS pulls them through to the compute primitive for MPC signing operations.

### Performance

An actual DKL-S18 (two-of-two threshold signing for secp256k1) run takes approximately **half a second** under normal network conditions. Higher thresholds (three-of-five, etc.) use upgraded DKL-S versions. For Ed25519 (Solana, Farcaster), the FROST algorithm is used with three rounds.

### Practical Use: Server-Side Key Management

For applications that need server-side signing (e.g., a Farcaster-compatible app managing Ed25519 keys on behalf of users):

- One key shard stays with your application sidecar
- One key shard stays with Quilibrium's network
- This eliminates traditional custody issues while maintaining regulatory compliance

## Accounts and Coins

### Design: Privacy-Compliant Token System

Accounts on Quilibrium serve two roles: **identity assertion** and **balance tracking**. The network reward token is a **Coin** — an exchangeable, splittable unit of balance that is separate from the Account itself.

### Why Coins Are Separate from Accounts

Unlike Ethereum's single account-balance model, Quilibrium keeps coins as **individually partitioned discrete quantities**. This solves a critical compliance problem:

On Ethereum, if a sanctioned entity sends tokens to your account, your entire balance becomes tainted because everything is mixed together. On Quilibrium, each Coin is a distinct object with its own lineage. If a sanctioned entity sends you a Coin, you can isolate or reject that specific Coin without affecting your other holdings.

### Account Types

There are two categories of accounts:

| Type | Description |
|------|-------------|
| **Originated account** | Created explicitly on the network through a transaction (used for cold custody) |
| **Implicit account** | Derived from a key without prior on-chain existence |

Implicit accounts have subtypes:

| Subtype | Description |
|---------|-------------|
| Type 0 | Default key-derived — address is the Poseidon hash of the public key |
| Type 1 | WebAuthn-derived — address is still Poseidon-hashed, but signatures use WebAuthn's internal nonce management |

### No Wallets — Passkeys Instead

Quilibrium intentionally does **not** support traditional crypto wallets. The reasoning:

1. **WebAuthn eliminates the need** — Modern browsers support private keys natively through passkeys
2. **Domain-bounded security** — Account keys are tied to specific domains, not a single universal key
3. **Phishing resistance** — Unlike wallet-drainer scams that exploit a single key controlling everything, Quilibrium's domain-bounded model requires explicit cross-domain consent flows (similar to OAuth)

Manual key management via RPCs or qclient is possible but intentionally high-friction — the platform strongly encourages passkey-based authentication.

### Privacy: Bloom Filter Lineage

When a Coin is transferred, the circuit applies the **holding account's public address** to a bloom filter attached to the Coin. This enables:

1. **Compliance checking** — Recipients can check incoming Coins against a public registry of known bad actors
2. **Accept or reject** — The recipient can accept the Coin, or reject it (triggering transfer to a designated refund address)
3. **Sender privacy** — A pending transaction does **not** reveal the source account; privacy is preserved outside of the bloom filter entry

### Coin Operations

| Operation | Behavior |
|-----------|----------|
| **Join** | Multiple Coins can be merged; their bloom filters are unioned |
| **Split** | A Coin can be divided; split Coins inherit the parent's bloom filter |
| **Transfer** | Creates a PendingTransaction with to_account, refund_account, and of_coin |

The **refund_account** in a PendingTransaction can be different from the sender's account, allowing senders to retain privacy by designating an alternative account for refunds and consolidating funds afterward.

### Cold, Warm, and MPC Custody

**Cold custody**: The initial signature (proving possession of the private key) is simply an "allow account" request — granting read-only rights to a warm wallet so it can list pending transactions. This satisfies regulatory audit trail requirements.

**Warm/hot custody**: Generate a key and use the Poseidon-hashed public key as the address. Straightforward.

**MPC custody**: Supports Ed448, Ed25519 (not recommended for security), and BLS-48-581 signatures. For decentralized MPC-based signing over the network, key shares can be distributed across the Quilibrium network using QKMS.

## Universal Resources

### Design: Network-Wide Schema Deployment

Universal Resources are the foundational RDF schemas deployed to the network at initialization by the Quilibrium team. These schemas define the types used by all the subsystems described above (File, Block, Task, IPCMessage, Queue, Key, Account, Coin, etc.).

### How They Work

- Deployed with an **access key that allows any network member** to read and reference them
- Anyone can deploy new data schemas and instantiate additional universal resources
- The existing schemas provide the vocabulary that all applications on Quilibrium share

### Governance

Ownership of the foundational schemas is intended to migrate to a **separate independent foundation** that will govern the network's continued function and evolution. This prevents any single entity from controlling the base data model.

### Composability Through Universal Resources

Universal Resources enable Quilibrium's product composability. For example:

| Product | Primitives Composed |
|---------|--------------------|
| QStorage | File + Block schemas via Hypergraph |
| QKMS | Key + KeyShare schemas via Compute primitive |
| QQ | Queue + QueueNode schemas via Hypergraph + Dispatch |
| QPing | Dispatch mechanism primitives |
| Quark | Token + File schemas + QStorage + RDF schema validation |

Any developer can compose these same primitives to build custom services.

## How the Subsystems Interconnect

```
┌──────────────────────────────────────────────────────────┐
│                  Universal Resources                      │
│          (RDF schemas shared across all subsystems)       │
└──────────────┬───────────────────────────────────────────┘
               │ defines types for
     ┌─────────┼──────────┬──────────┬──────────┐
     ▼         ▼          ▼          ▼          ▼
┌─────────┐ ┌──────┐ ┌───────┐ ┌─────────┐ ┌──────────┐
│  File   │ │ Task │ │  IPC  │ │  Queue  │ │   Key    │
│ System  │ │Sched.│ │       │ │         │ │  Mgmt    │
└────┬────┘ └──┬───┘ └───┬───┘ └────┬────┘ └────┬─────┘
     │         │         │          │            │
     │    references     │     messages in    key shares
     │    File objects   │     QueueNodes     for MPC
     │         │         │          │            │
     └─────────┴─────┬───┴──────────┴────────────┘
                     ▼
            ┌────────────────┐
            │   Accounts &   │
            │     Coins      │
            │  (ownership,   │
            │   transfers,   │
            │   lineage)     │
            └────────────────┘
```

Key interconnections:

- **Scheduler → File System**: Task payloads and results are stored as Files
- **Key Management → Compute**: MPC signing pulls key shares through the compute primitive
- **Message Queues → IPC**: Queue operations can trigger IPC notifications
- **Accounts → Everything**: All ownership and access control flows through Accounts
- **Universal Resources → All**: Every subsystem's types are defined as Universal Resource schemas

## Frequently Asked Questions

**Q: How does Quilibrium's file system differ from IPFS?**
Quilibrium's file system is an RDF-native object store built into the hypergraph, not a separate content-addressed filesystem. Unlike IPFS, files on Quilibrium are privacy-preserving (encrypted at rest, accessed via oblivious transfer) and integrated with the network's access control, key management, and account systems.

**Q: Can I run arbitrary code on the scheduler?**
Tasks reference Files containing OT circuits (compiled via the Bedlam compiler from QCL). You cannot run arbitrary code — only garbled circuits that have been deployed to the network. This ensures privacy-preserving execution through MPC.

**Q: Why use RDF schemas instead of smart contracts for OS primitives?**
RDF schemas are data-centric rather than execution-centric. They define the shape of data and relationships, which can be queried efficiently through the hypergraph. Smart contracts (in the Ethereum sense) couple data and logic; Quilibrium separates them — data lives in RDF schemas on the hypergraph, and logic lives in OT circuits executed via the compute engine.

**Q: How does QKMS compare to AWS KMS?**
AWS KMS relies on Hardware Security Modules (HSMs) in trusted execution environments — you're trusting that Amazon's employment of HSMs is actually secure and that they aren't providing data to state actors. QKMS uses MPC: key shards never exist in the same place, and signing happens through oblivious transfer without key reconstruction. This eliminates the single point of trust.

**Q: What happens if I receive a Coin from a sanctioned entity?**
You can check the Coin's bloom filter lineage against known registries. If flagged, you reject the pending transaction, which triggers a transfer to the designated refund address. Your other Coins remain unaffected because each Coin is a discrete, isolated object.

**Q: Are message queues persistent or ephemeral?**
Queues are stored as RDF graph data on the hypergraph, making them persistent. Messages remain in the queue until dequeued. The QQ product (SQS-compatible API) provides standard visibility timeout and retention semantics on top.

---
*Last updated: 2026-02-11T14:30:00*
