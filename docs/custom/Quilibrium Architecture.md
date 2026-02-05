---
title: Quilibrium Architecture
source: codebase_analysis
date: 2025-01-28
type: technical_reference
---

# Quilibrium Architecture

## Overview

Quilibrium is a distributed protocol that leverages advanced cryptographic techniques including multi-party computation (MPC) for privacy-preserving compute. The system operates on a sharded network architecture where the main process runs global consensus while data worker processes run app-level consensus for their assigned shards, each maintaining their own hypergraph state, storage, and networking stack.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       Client Applications                       │
│                  (CLI, RPC Clients, Applications)               │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────┴─────────────────────────────────┐
│                           RPC Layer                             │
│              (gRPC/REST APIs, IPCP2P Communication)             │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────┴─────────────────────────────────┐
│                     Main Node Process (Core 0)                  │
│   ┌──────────────┐  ┌─────────────┐  ┌─────────────────────┐    │
│   │    Global    │  │   Global    │  │    P2P Network      │    │
│   │  Consensus   │  │  Execution  │  │   (BlossomSub)      │    │
│   │   Engine     │  │   Engine    │  │                     │    │
│   └──────────────┘  └─────────────┘  └─────────────────────┘    │
│   ┌──────────────┐  ┌─────────────┐  ┌─────────────────────┐    │
│   │   Storage    │  │    Rust     │  │  Global Hypergraph  │    │
│   │  (PebbleDB)  │  │  Libraries  │  │       State         │    │
│   └──────────────┘  └─────────────┘  └─────────────────────┘    │
└───────────────────────────────┬─────────────────────────────────┘
                                │ IPCP2P
┌───────────────────────────────┴─────────────────────────────────┐
│                  Data Worker Process (Core 1)                   │
│   ┌──────────────┐  ┌─────────────┐  ┌─────────────────────┐    │
│   │     App      │  │Token/Hyper- │  │    P2P Network      │    │
│   │  Consensus   │  │graph/Compute│  │   (BlossomSub)      │    │
│   │   Engine     │  │  Execution  │  │                     │    │
│   └──────────────┘  └─────────────┘  └─────────────────────┘    │
│   ┌──────────────┐  ┌─────────────┐  ┌─────────────────────┐    │
│   │   Storage    │  │    Rust     │  │  Shard Hypergraph   │    │
│   │  (PebbleDB)  │  │  Libraries  │  │       State         │    │
│   └──────────────┘  └─────────────┘  └─────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                                │
                    [Repeat for Core 2, 3, ...]
```

### Core Components

#### 1. Node Module (`/node/`)

The main entry point containing the core system implementation with a multi-process architecture where each process has its own complete stack.

**Process Types:**

##### Main Process (Core 0)
Runs the global consensus and coordination:
- **Global Consensus Engine**: System-wide consensus and coordination
- **Global Execution Engine**: System-level operations
- **P2P Networking**: Full BlossomSub stack for global communication
- **Storage (PebbleDB)**: Persistent storage for global state
- **Rust Library Bindings**: Access to cryptographic operations
- **Global Hypergraph State**: System-wide state management

##### Data Worker Processes (Cores 1+)
Each worker manages specific shards:
- **App Consensus Engine**: Shard-level consensus
- **Execution Engines**: Token, Hypergraph, and Compute engines
- **P2P Networking**: Full BlossomSub stack for shard communication
- **Storage (PebbleDB)**: Persistent storage for shard state
- **Rust Library Bindings**: Access to cryptographic operations
- **Shard Hypergraph State**: Shard-specific state management

**Application Layer** (`app/`):
- `Node`: Main node implementation (runs in main process)
- `DataWorkerNode`: Worker node implementation (runs in worker processes)

**Key Subsystems:**

##### Consensus Engines (`consensus/`)

Two distinct consensus implementations:

**Global Consensus** (`global/`) - Main Process:
- System-wide coordination
- Cross-shard transaction ordering
- Global state transitions
- Network-wide fork choice

**App Consensus** (`app/`) - Worker Processes:
- Shard-specific consensus
- Local transaction ordering
- Shard state transitions
- Integration with global consensus

**Shared Components**:
- `ConsensusEngine` interface
- `DifficultyAdjuster`: Dynamic difficulty adjustment
- `DynamicFeeManager`: Dynamic Fee Market management
- `ProverRegistry`: Enrolled prover registry
- `SignerRegistry`: Block signer registry
- Time Reels: VDF-based time consensus

##### Execution Engines (`execution/`)

Distribution across processes:

**Global Execution Engine** - Main Process:
- System-wide operations
- Cross-shard coordination
- Global state updates

**App Execution Engines** - Worker Processes:
- **Token Engine**: QUIL token operations within shards
- **Hypergraph Engine**: CRDT-based state management for shards
- **Compute Engine**: MPC-based privacy-preserving computation

##### P2P Networking (`p2p/`)

Each process (main and workers) has its own complete P2P stack:
- **BlossomSub**: Custom pub/sub protocol
- **Peer Management**: Discovery and connections
- **Public Channels**: Point to point authenticated message routing
- **Private Channels**: Onion-routing authenticated message channels
- **DHT Integration**: Distributed peer discovery

Main process handles global bitmask, workers handle shard-specific bitmasks.

##### Storage Layer (`store/`)

Each process maintains its own PebbleDB instance:
- **Clock Store**: Frame-based ordering
- **Coin Store**: Locally managed token state
- **Data Proof Store**: Cryptographic proofs
- **Hypergraph Store**: Hypergraph state persistence
- **Peer Store**: Network peer information

Storage is partitioned by process responsibility (global vs shard).

##### Hypergraph (`hypergraph/`)

Distributed graph structure:
- **Global Hypergraph**: Maintained by main process
- **Shard Hypergraphs**: Maintained by respective workers
- **CRDT Semantics**: Conflict-free updates
- **Components**:
  - `Hypergraph`: Core graph structure
  - `Vertex`: Node with associated data
  - `Hyperedge`: Multi-way relationships

##### Cryptographic Layer (`crypto/`)

Shared across all processes via Rust bindings:
- **Proof Trees**: Verkle tree structures
- **Channel Crypto**: Secure E2EE communication
- **Integration**: CGO bindings to Rust libraries and interfaces

#### 2. Client Module (`/client/`)

Command-line interface for user interactions:
- **Node Management**: Install, update, service control
- **Token Operations**: Balance, transfer, mint operations
- **Hypergraph Operations**: Deploy, store, update, query operations
- **Compute Operations**: Deploy, execute, commit operations
- **Cross-Mint**: Token bridging
- **Configuration**: Network and RPC settings

#### 3. Rust Crates (`/crates/`)

High-performance cryptographic libraries used by all processes:

**Core Cryptography**:
- **bls48581**: BLS signatures
- **bulletproofs**: Transaction privacy via zero-knowledge proofs
- **vdf**: Verifiable Delay Functions for time consensus
- **verenc**: Verifiable encryption schemes

**MPC Components**:
- **ferret**: Oblivious transfer protocols
- **channel**: Secure communication protocols
- **rpm**: Randomized Permutation Matrices

**Supporting**:
- **classgroup**: Class group VDF implementation
- WASM bindings for various libraries

#### 4. Supporting Libraries

**MPC and Privacy**:
- `bedlam`: Garbled circuit compiler/evaluator
- `emp-ot`, `emp-tool`: Efficient MPC primitives
- `nekryptology`: Additional cryptographic tools

**Networking**:
- `go-libp2p-blossomsub`: Custom gossip for sharding
- `go-libp2p-kad-dht`: DHT implementation
- `go-libp2p`: Core P2P functionality

**Storage**:
- `pebble`: High-performance key-value store
- `protobufs`: Protocol definitions

### Architectural Patterns

#### 1. Full-Stack Process Architecture

Each process is self-contained with its own:
- Consensus engine (global or app)
- Execution engine(s)
- P2P networking stack
- Storage layer
- Cryptographic libraries

Benefits:
- Process independence
- Failure isolation
- Horizontal scalability

#### 2. Sharded State Management

State is partitioned across processes:
- Main process: Global state and coordination
- Worker processes: Shard-specific state
- CRDT hypergraph for convergence

#### 3. Multi-Party Computation (MPC)

Privacy-preserving computation:
- Garbled circuits via bedlam
- Oblivious transfer for private inputs
- General-purpose privacy beyond just transactions

#### 4. Layered Consensus

Two-tier consensus system:
- Global consensus for system-wide coordination
- App consensus for shard-level operations
- Time Reel VDF for temporal ordering

#### 5. IPC Communication

Inter-process communication design:
- Unix domain sockets
- Structured message passing
- Minimal shared state

### Security Architecture

#### 1. Privacy Layers

**Transaction Privacy**:
- Bulletproofs for amount hiding
- Zero-knowledge range proofs

**Computation Privacy**:
- MPC for general computations
- Garbled circuits for function privacy
- Oblivious transfer for input privacy

#### 2. Process Isolation

- Independent process spaces
- Limited IPC surface
- Resource isolation per process

#### 3. Network Security

- Peer reputation scoring
- Sybil resistance
- Eclipse attack prevention
- Shard-aware routing

#### 4. Binary Verification

- Multi-signature verification
- Threshold signing schemes
- Automated signature updates

### System Boundaries

#### Process Boundaries
- Main process: Global operations
- Worker processes: Shard operations
- Clear IPC interfaces between processes

#### Consensus Boundaries
- Global consensus: Cross-shard coordination
- App consensus: Intra-shard operations
- Well-defined interaction protocols

#### State Boundaries
- Global state in main process
- Shard state in worker processes
- CRDT merge protocols for synchronization

#### Network Boundaries
- Each process has independent P2P stack
- Topic-based message routing
- Shard-aware peer connections

### Build and Deployment

#### Build System
- Hybrid Go/Rust via CGO
- Platform-specific optimizations
- Static linking for distribution

#### Configuration
- Per-process configuration
- Environment variable support
- YAML configuration files

#### Monitoring
- Prometheus metrics per process
- Grafana dashboards
- Structured logging

## Design Rationale

### 1. Independent Process Stacks
- **Decision**: Each process has full stack
- **Rationale**: Maximum isolation, independent scaling, failure resilience

### 2. Two-Tier Consensus
- **Decision**: Separate global and app consensus
- **Rationale**: Scalability through sharding while maintaining global coordination

### 3. MPC for General Privacy
- **Decision**: MPC beyond just transactions
- **Rationale**: Flexible privacy for arbitrary computations

### 4. CRDT Hypergraph
- **Decision**: CRDT-based state model
- **Rationale**: Natural convergence in distributed sharded system

### 5. Rust Cryptography
- **Decision**: Rust for crypto operations
- **Rationale**: Performance and memory safety for critical operations

## Development Guidelines

### Architecture Principles
- Maintain process independence
- Respect consensus boundaries
- Minimize cross-shard communication
- Preserve privacy guarantees

### Code Organization
- Clear separation by process type
- Shared interfaces and types
- Process-specific implementations

### Testing Strategy
- Unit tests per component
- Integration tests per process
- Cross-process interaction tests
- MPC protocol verification

## Frequently Asked Questions (FAQ) with Code References

### Getting Started

**Q: Where is the main entry point?**
- Main entry: `node/main.go`
- The `main()` function handles initialization, spawns worker processes, and manages the lifecycle

**Q: How does the multi-process architecture work?**
- Process spawning: `node/main.go` (see `spawnDataWorkers` function)
- Main process runs on core 0, spawns workers for cores 1+ using `exec.Command`
- Each worker receives `--core` parameter to identify its role

**Q: How do I run the node?**
- Build: `./node/build.sh` (creates static binary)
- Run: `./node/node` (starts main process which spawns workers)
- Configuration: `config.yml` or environment variables

### Architecture & Design

**Q: How do processes communicate (IPC)?**
- Uses IPC over private pubsub topics for structured message passing
- Main process acts as coordinator, workers connect via IPC

**Q: Where is consensus implemented?**
- App Consensus (workers): `node/consensus/app/app_consensus_engine.go`
- Factory: `node/consensus/app/factory.go`
- Consensus interface: `node/consensus/consensus_engine.go`

**Q: Where is the hypergraph implementation?**
- Main interface: `node/hypergraph/hypergraph.go`
- Core components:
  - Vertex: `node/hypergraph/vertex.go`
  - Hyperedge: `node/hypergraph/hyperedge.go`
  - Atoms: `node/hypergraph/atom.go`
  - Proofs: `node/hypergraph/proofs.go`

### Networking & P2P

**Q: How is P2P networking initialized?**
- BlossomSub: `node/p2p/blossomsub.go` (`NewBlossomSub`)
- Worker P2P ports: Base port + worker index
- Each process has independent P2P stack

**Q: How does cross-shard communication work?**
- Through main process coordination via P2P
- Topic-based routing in BlossomSub
- Shard-aware peer connections
- Majority of cross-shard communication requires only proof data, keeping shards conflict-free

### Execution & State

**Q: Where are execution engines created?**
- Factory: `node/execution/engines/factory.go` (`CreateExecutionEngine`)
- Engine types: Global, Compute, Token, Hypergraph
- Batch creation: `CreateAllEngines`

**Q: How is state stored?**
- PebbleDB wrapper: `node/store/pebble.go`
- Clock store: `node/store/clock.go`
- Coin store: `node/store/coin.go`
- Each process has its own DB instance

### Cryptography & Privacy

**Q: Where is MPC/garbled circuits used?**
- Bedlam compiler: `bedlam/` directory
- Compute intrinsic: `node/execution/intrinsics/compute/compute_deploy.go`
- Client deployment initializes the garbler

**Q: Where are the cryptographic libraries?**
- Rust crates: `crates/` directory
  - BLS: `crates/bls48581/`
  - Bulletproofs: `crates/bulletproofs/`
  - VDF: `crates/vdf/`
- Go bindings: Generated via CGO in each crate

**Q: How are bulletproofs integrated?**
- Rust implementation: `crates/bulletproofs/`
- Used for transaction privacy (amount hiding)
- Go bindings in `bulletproofs/` directory

### Configuration & Operations

**Q: How do I configure the node?**
- Main config: `node/config/config.go` (`Config` struct)
- Engine config: `node/config/engine.go`
- Data worker config
- Load with YAML file or environment variables

**Q: What are the RPC/API endpoints?**
- Node RPC: `node/rpc/node_rpc_server.go`
- gRPC definitions: `protobufs/node.proto`

**Q: How do I monitor the node?**
- Prometheus metrics throughout codebase
- Grafana dashboards: `dashboards/grafana/`
- Structured logging with configurable levels

### Development

**Q: How is the project built?**
- Node build: `node/build.sh` (static linking, platform detection)
- Client build: `client/build.sh`
- Rust integration: Various `generate.sh` scripts
- Docker: Multiple Dockerfiles for different scenarios

**Q: What happens when a worker crashes?**
- Main process monitors worker processes
- Automatic restart logic in `spawnDataWorkers`
- Process isolation prevents cascade failures

**Q: How do I add a new execution engine?**
- Implement the interface in `node/execution/`
- Add to factory in `node/execution/engines/factory.go`
- Register intrinsics as needed

### Common Code Paths

**Transaction Flow:**
1. RPC endpoint receives transaction
2. Routed to appropriate shard via worker
3. App consensus orders transaction
4. Execution engine processes
5. State updated in hypergraph
6. Proof generated and stored

**Consensus Flow:**
1. Time reel provides ordering
2. App consensus in workers for shards
3. Global consensus coordinates cross-shard
4. Fork choice based on VDF proofs

**P2P Message Flow:**
1. BlossomSub receives message
2. Topic routing to appropriate handler
3. Shard-specific messages to workers
4. Global messages to main process

