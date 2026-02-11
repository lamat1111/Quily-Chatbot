---
title: "Quilibrium Services — Bridge (QUIL/wQUIL), QPing Notifications & QQ Message Queue"
source: official_docs_synthesis
date: 2026-02-11
type: technical_reference
topics:
  - Bridge
  - wQUIL
  - QUIL
  - cross-chain
  - Ethereum
  - QPing
  - notifications
  - dispatch
  - QQ
  - message queue
  - SQS
  - service primitives
---

# Quilibrium Services: Bridge, QPing, and QQ

Quilibrium exposes a set of AWS-compatible managed services built on top of its core network primitives (hypergraph, dispatch, and compute). This document covers three services that are frequently referenced but lack standalone documentation: the **Bridge** (QUIL/wQUIL cross-chain bridging), **QPing** (dispatch-based notifications), and **QQ** (SQS-compatible message queue).

## How Services Map to Primitives

Every Q Console managed service is composed from a small number of protocol-level building blocks. The table below shows which primitives each service uses:

| Service | Primitives Used | Description |
|---------|----------------|-------------|
| Q Storage | Hypergraph | S3-compatible object storage |
| QKMS | Compute primitive | MPC-native key management |
| Identity/Authorization | Hypergraph + MPC via compute primitive | Account and permission management |
| **QQ** | **Hypergraph + dispatch mechanism** | SQS-compatible message queue |
| **QPing** | **Dispatch mechanism** | Notification and event dispatch |
| Bridge | Ethereum state import via alt-fee basis app shards | Cross-chain token bridging |
| Quark | Token + File schemas + QStorage + RDF schema validation | Privacy-preserving game assets |

These are composable primitives that can create traditional web services. An application can combine QQ for asynchronous messaging, QPing for event notifications, QKMS for secure signing, and Q Storage for data persistence, all within a single project on Q Console.

---

## Bridge: QUIL/wQUIL Cross-Chain Bridging

### What the Bridge Does

The Quilibrium Bridge enables bidirectional transfer of tokens between the Quilibrium network and Ethereum. In its current form, it converts native QUIL tokens into wQUIL (wrapped QUIL), an audited ERC-20 token on Ethereum, and vice versa. The wQUIL ERC-20 contract has received a successful independent audit (publicly accessible via IPFS).

The bridge monitors the Ethereum blockchain for mint and burn events. An MPC-based signer built on top of Quilibrium handles the signing operations, eliminating single points of failure and making the bridge trustless rather than relying on a centralized custodian.

### How the Bridge Works Technically

The bridge uses **alt-fee basis app shards** -- a special shard type that is not consensus-bearing but does impart a commitment at the global level. Quilibrium runs an Ethereum execution node, generates output execution state in KZG polynomial commitment format, and pulls that state into an alt-fee basis app shard. This costs only 74 bytes rolled into consensus as part of 19 kilobytes of global proof state.

With this imported state, the bridge can prove anything about Ethereum's network state, enabling bidirectional bridging. Finality follows Ethereum's probabilistic model: after two epochs (~12.8 minutes), transactions are considered truly finalized. Many accept 6-7 block confirmations for lower-value transfers.

### Privacy Advantage of Bridging to Q

When you bridge an asset to Quilibrium, the entry point is public (because Ethereum is public), but where the asset goes on Q -- what address takes possession -- is completely private. Data bridges in encrypted format. The network verifies that the transaction is real and correct but does not know what you actually did.

This means you can give privacy to every single ERC-20 on Ethereum by routing through Q. Coins can come in and come out such that sender and recipient cannot be linked, provided sufficient bridging volume and time have elapsed.

### Bridging Commands via qclient

The `cross-mint` command initiates a cross-chain bridging operation:

```bash
qclient cross-mint [payload]
```

The `payload` parameter is the signed data for the operation. Currently, Ethereum is the only supported network.

**Step-by-step bridging process (QUIL to wQUIL):**

1. Navigate to the official bridge page at `https://quilibrium.com/bridge`.
2. Enter your QUIL account address.
3. **Save the displayed coin addresses** -- these are essential for recovery if the bridge operation fails.
4. Select a coin address to bridge.
5. Execute the `qclient cross-mint [payload]` command shown on the bridge page.
6. Copy the qclient response into the bridge page field (do not press Enter).
7. Run a second `cross-mint` command shown on the bridge page to verify account ownership.
8. Copy the second qclient response into the bridge field (do not press Enter).
9. Wait for the "Complete Bridge" button to appear, then click it. Do not refresh the page.
10. Approve the bridging transaction in your Ethereum browser wallet when prompted.
11. Save the transaction ID for reference on Etherscan.

**Prerequisites:**
- Ethereum-compatible browser wallet
- Enough ETH for gas fees (at least $50 worth recommended, though actual costs are usually lower)
- Latest qclient version installed

**Important:** Always note your coin address before attempting to bridge. If the bridge operation fails, your coin may enter a "limbo" state where `qclient token coins` cannot query it. The bridge documentation provides three recovery methods: first-format decoding, second-format decoding, and Etherscan input-data decoding.

### Future Bridge Expansion

The roadmap calls for significantly broader bridging support:

- **Standard ERC-20 tokens** -- any ERC-20 except unusual rebasing tokens
- **ERC-721 collectibles (NFTs)** -- including bridging IPFS data into encrypted Q collectibles
- **Native ETH**
- **Solana SPL tokens**
- **Other EVM-compatible chains**
- **Social media chains** like Farcaster

The long-term vision includes trustless bridging from Solana, trustless bridging for all ERC-20s on Ethereum, and deeper integrations with other networks to improve their privacy properties.

---

## QPing: Dispatch-Based Notification Service

### What QPing Does

QPing is Quilibrium's notification and event dispatch service. It is built directly on the **dispatch mechanism** -- the same underlying primitive that powers real-time messaging in Quorum Messenger.

The dispatch mechanism is the protocol-level pub/sub infrastructure that handles asynchronous message delivery between participants on the network. QPing exposes this as a managed service for sending notifications, event alerts, and lightweight signals between services or to end users.

### How QPing Relates to the Network

The dispatch primitive operates at the network layer using Quilibrium's BlossomSub gossip protocol (a modified GossipSub variant) combined with the mixnet for privacy. When an application publishes a notification through QPing, the dispatch mechanism routes it through the network's pubsub infrastructure to the intended recipients.

Key characteristics of QPing:

| Property | Detail |
|----------|--------|
| **Underlying primitive** | Dispatch mechanism |
| **Transport** | BlossomSub gossip protocol + mixnet |
| **Privacy** | Messages are encrypted; only recipients with appropriate keys can read them |
| **Latency** | Near real-time, subject to network routing |
| **Use case** | Push notifications, event alerts, webhooks, system signals |

### QPing Use Cases

- **Application event notifications** -- Alert users or services when a specific event occurs (e.g., a new message, a completed transaction, a storage upload)
- **Webhook-style triggers** -- Trigger downstream processing when upstream events happen
- **System health monitoring** -- Dispatch heartbeat or status signals between services
- **QNS integration** -- The QNS update includes the ability to message the owner of a particular name using the underlying dispatch primitive that powers Quorum, which is the same primitive QPing builds on

QPing is intentionally lightweight. For buffered, ordered, guaranteed-delivery messaging, use QQ (described below). QPing is best suited for fire-and-forget notifications where low latency matters more than delivery guarantees.

---

## QQ: SQS-Compatible Message Queue

### What QQ Does

QQ is Quilibrium's managed message queue service, providing approximately **100% API compatibility with Amazon SQS**. A few minor differences exist due to architectural differences between Quilibrium and AWS, but the vast majority of SQS use cases are supported unless the application requires something extremely bespoke.

QQ launched as part of Q Console in February 2026 alongside Q Storage, QKMS, and the Quark SDK.

### How QQ Maps to Quilibrium Primitives

QQ is built from two core Quilibrium primitives:

| Primitive | Role |
|-----------|------|
| **Hypergraph** | Stores queue structure and messages as RDF graph data |
| **Dispatch mechanism** | Handles message delivery notifications to consumers |

Under the hood, QQ implements queues as **linked-list FIFO data structures** with parent references, stored as RDF schemas on the hypergraph. The core components are:

| Component | Description |
|-----------|-------------|
| Queue | The queue container with a reference to its head node |
| QueueNode | A single entry in the queue |
| HeadNode | Points from the Queue to its first QueueNode |
| NextNode | Links one QueueNode to the next (forming the linked list) |
| QueueMessage | The actual message payload attached to a QueueNode |

Messages are enqueued at the tail and dequeued from the head, maintaining strict FIFO ordering. Because queues are stored as RDF graph data on the hypergraph, they are persistent -- messages remain in the queue until dequeued. The QQ product provides standard visibility timeout and retention semantics on top of the underlying primitives, matching the SQS behavioral model.

### SQS API Compatibility

QQ maps standard SQS API calls to operations on the underlying queue primitives. Developers using existing AWS SDKs and tooling can point them at QQ's endpoint and operate as they would with Amazon SQS. The compatibility layer covers:

- Queue creation and deletion
- Sending and receiving messages
- Message visibility timeout management
- Message retention policies
- Batch operations
- Standard queue attributes and metadata

### QQ Use Cases

- **Microservice communication** -- Decouple producers and consumers across distributed services
- **Event-driven architectures** -- Trigger processing when messages arrive in the queue
- **Work distribution** -- Distribute tasks across multiple consumers for parallel processing
- **Notification pipelines** -- Buffer and order notifications (QPing uses QQ for ordered notification delivery)

### QQ vs QPing: When to Use Which

| Criterion | QQ | QPing |
|-----------|-----|-------|
| **Delivery model** | Pull-based (consumers poll or long-poll) | Push-based (dispatch to subscribers) |
| **Ordering** | Strict FIFO guaranteed | Best-effort ordering |
| **Persistence** | Messages stored on hypergraph until dequeued | Transient; fire-and-forget |
| **API compatibility** | Amazon SQS (~100%) | Quilibrium-native |
| **Best for** | Reliable task queues, decoupled microservices | Real-time alerts, event notifications |
| **Underlying primitives** | Hypergraph + dispatch | Dispatch only |

In practice, QPing and QQ are complementary. A common pattern is to use QPing to notify a consumer that work is available, then have the consumer pull the actual work item from a QQ queue.

---

## Accessing These Services

All three services are accessible through **Q Console**, Quilibrium's unified management interface for managed services. Q Console provides:

- A web-based dashboard for managing queues, notifications, and bridge operations
- Full API compatibility (SQS APIs for QQ, REST APIs for other services)
- Integration with QKMS for secure key management and signing
- Cross-account asset sharing between different Q Console accounts
- Fiat and QUIL/wQUIL payment options for service usage

The Bridge is also accessible directly via the qclient CLI tool using the `cross-mint` command, independent of Q Console.

---

## Relationship to the AWS-Compatible Service Roadmap

QQ and QPing are part of Quilibrium's broader strategy to provide AWS API-compatible services, first outlined in the September 2024 roadmap. The planned services include:

| Service | AWS Equivalent | Status |
|---------|---------------|--------|
| Q Storage | Amazon S3 | Launched |
| QKMS | Amazon KMS | Launched |
| QQ | Amazon SQS | Launched |
| QPing | Amazon SNS (partial) | Launched |
| API Gateway | Amazon API Gateway | Planned |
| Lambda | AWS Lambda | Planned (requires MetaVM) |
| ElastiCache | Amazon ElastiCache | Planned |

The goal is to make migration from AWS to Quilibrium as frictionless as possible for developers, while providing privacy, encryption, and decentralization properties that centralized cloud providers cannot offer.

---

*Last updated: 2026-02-11T15:00:00*
