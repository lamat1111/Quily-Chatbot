---
title: "Quilibrium 2.1 Consensus Engine Overhaul and Component Lifecycle"
source: youtube
youtube_url: https://www.youtube.com/watch?v=hwan0jgWp1M
author: Cassandra Heart
date: 2025-11-03
type: livestream_transcript
topics:
  - architecture
  - node-operation
  - roadmap
---


## Consensus Engine Replacement

The consensus package has been significantly expanded to support a hardened HotStuff-style consensus implementation. The previous consensus model used a state machine with strict linear ordering of events. The new approach breaks things down into more distinct pieces, enabling better testing of variant behaviors and more accurate modeling of consensus scenarios.

### HotStuff Implementation Origin

The implementation was adapted from Flow, which originally took their HotStuff implementation from Aptos (previously part of Diem, the Move-oriented series of protocols). The original implementation was fairly generic but had some aspects specific to their block production approach. Quilibrium has completely abstracted these out, making the consensus engine fully generic - you can plug in whatever state types, vote types, or peer types you need.

### Integration Testing Approach

The integration tests in `consensus/integration/instance_test.go` demonstrate the construction of consensus instances. The constructor only plugs in external dependencies as mocks while using the actual consensus code. Key pluggable components include:

- **Committees**: Coordination of consensus set members
- **Leader Provider**: Dictates the ordering of leaders. Quilibrium has two styles - global leader order and shard-specific leader orders. This is pluggable because Quilibrium has many parallel tracks of frames being produced, unlike chains with a single block unit.
- **Consensus Store**: Manages two states - liveness (important for HotStuff consensus) and the consensus state itself
- **Signer**: Cryptography operations including BLS aggregation, verification, and vote structuring

### Ranks vs Views

HotStuff implementations typically call these "views" - Quilibrium calls them "ranks." Ranks represent the linear sequencing of consensus rounds. Ranks are separated from frames because in HotStuff, consensus maintains ranking order based on either quorum certificates or timeout certificates. Either can lead to the next rank, but only a quorum certificate means a new frame has been produced.

### Test Scenarios

Several test scenarios model production conditions:

1. **Single Instance Happy Path**: Basic scenario iterating through ranks with 100ms proposal/timeout production, reaching a terminal condition of 10 certified quorum certificates.

2. **Three Instance Model**: Multiple instances with interleaved logs showing proposal collection, vote processing, and certified state progression.

3. **Seven Instance with Misbehavior**: Models nodes that are misbehaving - controlling whether outgoing votes are dropped, incoming proposals are dropped, or other pub/sub communication issues. This captures scenarios like nodes starting late, being slower, or not being active members of the set.

4. **Timeout Handling (Two of Seven)**: Models five healthy nodes and two that are timing out. BFT consensus should still progress despite timeouts. The expected pattern:
   - Ranks 0-3: healthy nodes proceed normally
   - Rank 4: unhealthy replica fails to produce proposals/votes
   - Rank 5: timeout, advance to next (also unhealthy)
   - Rank 6: back to healthy instance, progress resumes

5. **Async Cluster Startup**: Simulates production environments where nodes upgrade at different times, creating rolling progression of nodes coming online. Each node fails to propose their rounds initially, then comes online - the worst possible scenario for testing robustness.

## Component Lifecycle Management

Community member BlackSwan identified an issue with component startup behavior. The pub/sub peer-to-peer initialization could fail hard in certain conditions, and combined with the panic guard pattern used with Go Wire, this created risks.

### The Database Corruption Risk

Quilibrium uses PebbleDB for persistence. If PebbleDB starts compacting and a panic kills it halfway through, the database can become corrupted. This is particularly dangerous when the pub/sub engine can't listen on a network interface (for example, when running Q as a Linux service and the network interface isn't enabled yet based on service initialization order).

### New Lifecycle Facade

The new lifecycle interface addresses three concerns:

1. **Start**: Ability to start the component
2. **Ready**: Channel to wait on for readiness state
3. **Done**: Channel to wait on when shut down

Previously, components used start and done with a context pattern, but lacked readiness checking. This matters because some standup operations take variable time - for example, creating a genesis frame requires a VDF that takes unique time on every machine.

### Error Handling Behaviors

The lifecycle system includes granular error handling:

- **Restart**: Component needs to restart (e.g., waiting for network interface)
- **Stop**: Stop this component and dependents, but not the whole application
- **Stop Parents**: Propagate upward, stopping the entire dependency chain
- **Shutdown**: Cross-cutting concern for severe situations requiring node shutdown
- **Spin Halt**: Catastrophic scenario - puts the system into a spinning/halted state with a log message rather than crashing

### Spin Halt Use Case

The disk space monitor (added in 2.1.0) notifies at 70% capacity, warns at 90%, and terminates at 95%. If users set all values to 100 and run out of disk space, PebbleDB will panic. If the service auto-restarts on failure, it creates a thrashing loop that can corrupt the database beyond recovery.

Spin halt prevents this by refusing to shut down in catastrophic scenarios, requiring a manual SIGTERM rather than allowing Control-C to exit. This is better than Ethereum's approach of wiping the database and starting over on catastrophic failure.

### Supervisor Component

The supervisor creates a topological graph of dependencies, starting components in the requisite order, waiting for readiness in order, and shutting down in reverse dependency order. This prevents message buildup on dead consumers by ensuring brokers shut down before their consumers.

## Building Applications on Quilibrium

### Three Intrinsic Types

1. **Token Intrinsic**: Customizable token with configuration options in `token_configuration.go`

2. **Hypergraph**: Simple read/write key-value store for vertices and hyperedges. Used for relational structured content needing a storage engine and query engine with privacy.

3. **Compute Intrinsic**: For MPC-based applications. Key operations:
   - Deploy code
   - Issue execution order
   - Finalization

### Deploying Code

Code is written in QCL (essentially Golang). When deploying:

1. Set the domain for the target shard
2. Source code is a raw byte string of QCL code
3. The `prove` step calls the compiler to produce an output circuit
4. The circuit uses the Bristol standard format, compatible with LLVM tooling for other languages
5. Execute schedules the computation and picks a rendezvous address over the onion router
6. Finalize writes settled state

### Testing Locally

The `bedum` package outside the node package contains:
- Standalone compiler
- Tools for testing between two parties locally
- Compiler work for producing Bristol format output

### WebAssembly Libraries

The `crates` folder contains WASM implementations that can be called from JavaScript without Go:
- BLS WASM
- Bulletproofs WASM
- Channel WASM
- Vanguard WASM

These enable direct interactions with network intrinsics from JavaScript via WebAssembly.

## Implementing Atomic Swaps

Atomic swaps would combine:
1. Intrinsic calls for the tokens involved
2. QCL code handling the two-party interaction

The flow involves initiating the atomic swap, writing the logic in QCL, which dispatches calls to the token intrinsics.

## Q&A Highlights

**Can a decentralized permissionless casino exist on Quilibrium?**
Yes, in theory - it's a permissionless network. However, strongly recommended to consult with a lawyer due to varying regulations across countries and international legal complexities.

---

*Cleaned: 2026-01-29*
