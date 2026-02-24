---
sidebar_position: 2
---

# Consensus Mechanism

Quilibrium implements a novel consensus mechanism called **Proof of Meaningful Work** that ensures network security while requiring participants to contribute valuable computational resources.

## Overview

Unlike traditional Proof of Work systems that perform arbitrary hash calculations, Quilibrium's consensus requires provers to execute meaningful computations that benefit the network and its users.

## Proof of Meaningful Work

### Core Principles

1. **Computational Contribution**: Provers must execute real computations requested by network users
2. **Storage Contribution**: Provers must provide succinctly verifiable proof of storage
3. **Verifiable Results**: All computational outputs must be cryptographically verifiable
4. **Economic Incentives**: Provers are rewarded for contributing computational resources
5. **Security Through Work**: The computational effort required provides network security

### Prover Network

The consensus mechanism relies on a distributed network of provers:

#### Prover Roles
- **Computation Execution**: Running QCL (Quilibrium Compute Language) programs
- **Data Validation**: Verifying hypergraph operations and state transitions  
- **Network Maintenance**: Participating in frame consensus and production
- **Storage Provision**: Maintaining distributed state across shards

#### Prover Selection
Provers are selected for specific tasks based on:
- **Shard Assignment**: The shards the provers have allocated for themselves
- **Computational Capacity**: Available capabilities and storage

## Frame-Based Architecture

### Frame Structure
The protocol operates in discrete time periods called **frames**:
- **Duration**: Fixed time intervals (ten seconds)
- **Ordering**: Sequential numbering (on conflicts) ensures deterministic state progression
- **Finality**: Frames become immutable once consensus is reached

### Frame Consensus Process

1. **Transaction Collection**: Provers gather pending transactions from the mixnet
2. **Computation Execution**: Provers execute computations and prepare results
3. **Proof Generation**: Cryptographic proofs are created for all operations
4. **Consensus Round**: Provers participate in Byzantine Fault Tolerant consensus
5. **Frame Commitment**: Agreed-upon frame is committed to the global state

### State Transitions

Each frame represents a state transition of the network:
```text
State(n) + Transactions(frame_n) = State(n+1)
```

## Consensus Algorithm Details

This section is omitted until the release of 2.1

## Economic Model

### Reward Distribution
Provers receive rewards for:
- **Computation Execution**: Payment for running user computations
- **Frame Production**: Rewards for successfully proposing frames

### Penalty System
Malicious or unreliable behavior is penalized through:
- **Slashing**: Seniority decays on missed proof intervals
- **Reputation**: Seniority dictates conflict resolution for shard joins
- **Ejection**: Removal from prover set for serious violations, complete loss of seniority

## Security Guarantees

### Attack Resistance
The consensus mechanism provides resistance against:
- **51% Attacks**: Proof system ensures one honest prover is sufficient to remove malicious majorities
- **Nothing at Stake**: Economic penalties (through loss of seniority and eviction) for signing conflicting frames
- **Long Range Attacks**: Single-slot finality under normal conditions, checkpoint finality under probabilistic conditions prevents historical rewrites
- **Eclipse Attacks**: Diverse peer connections and reputation systems

### Finality
Frames achieve different levels of finality:
- **Soft Finality**: Immediate probabilistic finality after consensus
- **Hard Finality**: Immediate finality under normal conditions, probabilistic finality after checkpoint confirmation
- **Economic Finality**: Cost of reversal exceeds potential gain

## Performance Characteristics

### Throughput
- **Transaction Processing**: Thousands of transactions per shard frame
- **Computation Capacity**: Scales with prover network size
- **Data Storage**: Distributed across multiple shards

### Latency
- **Frame Time**: Predictable intervals for state updates
- **Confirmation Time**: Fast confirmations via mixnet
- **Finality Time**: Deterministic finality within known bounds

## Implementation Details

### Prover Coordination
Provers coordinate through:
- **Gossip Protocol**: Efficient propagation of transactions and proofs
- **Leader Election**: Verifiably random leadership selection for frame proposal
- **Synchronization**: Clock synchronization for frame timing

### State Management
- **Sharding**: Horizontal partitioning of state for scalability
- **Replication**: Multiple copies of critical state for availability
- **Consistency**: Strong consistency within shards, eventual consistency across shards