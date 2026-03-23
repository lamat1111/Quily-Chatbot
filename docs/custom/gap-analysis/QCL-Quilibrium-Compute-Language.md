---
title: QCL (Q Compute Language) — Quilibrium's Application Programming Language
source: official_docs_and_transcripts
date: 2026-02-11
type: technical_reference
---

# QCL (Q Compute Language)

QCL (Q Compute Language) is Quilibrium's programming language for building decentralized applications that run on the Quilibrium network. It is a subset of Golang designed specifically for secure multi-party computation (MPC). Code written in QCL is compiled into garbled circuits, meaning all computation happens with encrypted inputs — neither party in a transaction can see the other's data.

QCL is not a general-purpose backend language. It does not handle HTTP requests, call external APIs, or run as a persistent server. It is purpose-built for privacy-preserving computation and encrypted data storage on Quilibrium's oblivious hypergraph.

## How QCL Works

QCL code is compiled by **Bedlam**, Quilibrium's compiler, into **Bristol-format** garbled circuits. The Bristol standard format is also compatible with LLVM tooling, meaning other languages could potentially target the same circuit format in the future.

When a QCL application is executed on the network:

1. The initiator (called the "garbler") provides their private inputs
2. The network or a second party (called the "evaluator") provides their inputs
3. The garbled circuit is evaluated — neither party sees the other's inputs
4. The result is output to all participants
5. Any hypergraph state changes (creates, updates, deletes) are applied

This is fundamentally different from traditional computing. A QCL application evaluates once like a function call — it does not run as a long-lived process or server.

## QCL vs Golang: Key Differences

QCL is a subset of Go, but with important constraints required by garbled circuit compilation:

- **Bounded primitive types**: You must use explicitly sized types like `int8`, `int16`, `int32`, `uint256` instead of Go's `int`. This is because garbled circuits need to know the exact bit width of every value.
- **Bounded arrays**: Arrays must have fixed sizes like `[256]byte` instead of Go's dynamic `[]byte`. Variable-length data cannot exist in a circuit.
- **RDF schema tags**: Structs stored on the hypergraph must have RDF (Resource Description Framework) tags that define their schema and relationships.
- **No standard library**: QCL does not support Go's standard library imports. Only the `hypergraph` package and built-in intrinsics are available.
- **No dynamic memory**: No maps, slices, or dynamically allocated structures. Everything must be fixed-size at compile time.

## The RDF Schema System

QCL applications use RDF schemas (written in Turtle syntax) to define data structures. The schema serves as the single source of truth for how data is stored on the hypergraph. You write the schema first, then generate QCL type boilerplate from it.

Here is an example RDF schema defining a simple 256-byte data block:

```turtle
BASE <https://types.quilibrium.com/schema-repository/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX qcl: <https://types.quilibrium.com/qcl/>
PREFIX byteblock: <https://types.quilibrium.com/schema-repository/examples/byteblock/>

byteblock:ByteBlock a rdfs:Class;
  rdfs:label "an example RDF class".
byteblock:Bytes a rdfs:Property;
  rdfs:domain qcl:ByteArray;
  qcl:size 256;
  qcl:order 0;
  rdfs:range byteblock:ByteBlock.
```

Running `qclient schema qclgen byteblock.rdf` generates QCL types with marshal/unmarshal functions automatically. Sizes in RDF are defined in bytes, while QCL unsigned integer types are bit-sized (a `qcl:U size 32` becomes `qcl_u256` — 32 bytes = 256 bits). Byte arrays remain in bytes.

When defining RDF schemas, types that are stored on the network have a type of "extrinsic." Types that are inputs to methods have a type of "garbler" (for the initiator's input) or "evaluator" (for the second party's input).

## Two-Party Computation (2PC)

The default mode for QCL applications is two-party computation. One party (the garbler/initiator) provides input, and the network relay acts as the evaluator. This is used when only one user is involved in the computation.

```go
package main

func main(input int8, relay hypergraph.Network) int8 {
  return input + 2
}
```

In this example, the `relay` parameter of type `hypergraph.Network` indicates that the evaluator is just the network itself — there is no second party providing private input.

## Multi-Party Computation (MPC)

When multiple parties need to jointly compute something without revealing their inputs to each other, you define multiple input parameters and omit the relay argument:

```go
package main

func main(initiatorInput int8, secondInput int8) bool {
  return initiatorInput > secondInput
}
```

Both parties provide their inputs privately. The garbled circuit evaluates the comparison, and only the boolean result is revealed to both parties. Neither party learns the other's actual value.

A real-world example is a mutual token transfer where neither the sender nor recipient needs to know the other's identity — MPC enables this by keeping both parties' account details private during the computation.

## Hypergraph Data Operations

QCL applications can read and write encrypted data on Quilibrium's oblivious hypergraph. The hypergraph is Quilibrium's decentralized data storage layer where all data is encrypted and structured using RDF schemas.

Available operations:

- **`hypergraph.RetrieveExtrinsic(ref)`** — Read encrypted data from the hypergraph by reference address
- **`hypergraph.CreateExtrinsic(type, data)`** — Create new encrypted data on the hypergraph (equivalent to an INSERT)
- **`hypergraph.UpdateExtrinsic(type, ref, data)`** — Update existing encrypted data (equivalent to an UPDATE)
- **`hypergraph.DeleteExtrinsic(type, ref)`** — Delete encrypted data from the hypergraph (equivalent to a DELETE)
- **`hypergraph.EmptyRef()`** — Returns an empty reference (used to "null out" a field like removing an owner)

Every QCL method that modifies hypergraph state must return the corresponding extrinsic operations as return values, along with a final boolean indicating success (`true`) or failure (`false`). If the method returns `false`, all state changes are rolled back.

## Built-in Intrinsics

QCL provides pre-optimized primitives called "intrinsics" for operations that would be prohibitively expensive as garbled circuits:

- **`sign.Verify(publicKey, hash, signature, algo)`** — Cryptographic signature verification. An ED25519 verification as a garbled circuit takes much longer than using this purpose-built intrinsic.
- **`extrinsics.Hash(data...)`** — Cryptographic hashing of data for creating proofs
- **`bloom.Add(filter, element)`** — Bloom filter operations for private set intersection (used for tracking coin lineage without revealing transaction history)

These intrinsics exist because certain algorithms are very expensive to compute inside MPC garbled circuits. As Cassandra Heart explained: "Specific algorithms can be really expensive to do in MPC if you're just defaulting to garbled circuits. One of those is without a doubt signature verification." Intrinsics solve this by providing optimized implementations outside the circuit evaluation.

## Deploying QCL Applications

To deploy a QCL application to the Quilibrium network:

```bash
qclient deploy compute application.qcl
```

This single command compiles the QCL code using the Bedlam compiler, deploys the resulting circuit to the network, and publishes the corresponding RDF schema to the schema repository. The deployment requires paying a fee in QUIL tokens based on the dynamic fee market.

To estimate the deployment cost without actually deploying:

```bash
qclient deploy compute application.qcl --dry-run
```

## Running QCL Applications

### Single-Party Execution

For applications that only need one party's input:

```bash
qclient compute execute <application-address> input1="value1" input2="value2"
```

### Multi-Party Execution

For applications requiring multiple parties:

**Party 1 (initiator):**
```bash
qclient compute execute <application-address> 1 secret="alice_value"
```
Party 1 receives a rendezvous address and shares it with other parties.

**Party 2:**
```bash
qclient compute execute <application-address> <rendezvous-address> 2 secret="bob_value"
```

The computation does not proceed until all required parties have provided their inputs. Rendezvous identifiers can be shared via QR codes, NFC, or direct dispatches on the network.

### Continuous Applications

Continuous applications are QCL programs that require multi-step evaluation across multiple frames on a core shard, similar to how a CPU evaluates instructions over multiple clock cycles. They initiate via a rendezvous request that stays open as a connection until evaluation completes, with privacy buffers to prevent linkability.

## Common Use Cases for QCL

- **Token applications**: Custom token contracts with transfer, mint, and burn operations. Quilibrium also provides a pre-built token intrinsic for simpler token deployments that don't need custom logic.
- **Blind auctions**: Multiple parties submit bids without revealing them. The circuit determines the winner without exposing losing bids.
- **Collaborative analytics**: Organizations like hospitals can jointly analyze data (e.g., patient statistics) without sharing raw data with each other.
- **Threshold signatures**: Multiple parties collaborate to create a cryptographic signature, with no single party holding the complete key.
- **Atomic swaps**: Two parties exchange tokens where the swap either completes fully or not at all, with neither party seeing the other's account details.
- **Private set intersection**: Using bloom filter intrinsics to check overlapping data between parties without revealing the full datasets.

## What QCL Cannot Do

QCL is specifically designed for privacy-preserving on-chain computation. It is **not** a replacement for traditional web backends or serverless functions:

- **No HTTP layer**: QCL cannot receive HTTP requests, send HTTP responses, set headers, or manage cookies. It has no concept of web protocols.
- **No outbound network calls**: QCL cannot call external APIs, databases, or services. It can only interact with Quilibrium's hypergraph.
- **No unbounded data**: All types must have fixed sizes defined at compile time. You cannot process arbitrary-length strings like chat messages.
- **No streaming**: QCL evaluates a circuit and returns a result. It cannot stream data back incrementally.
- **No environment variables or secrets**: Inputs come through the circuit parameters, not from configuration files or environment variables.
- **No filesystem access**: QCL cannot read or write files. Data persistence is exclusively through the hypergraph.
- **No long-running processes**: A QCL application evaluates once and terminates. It is a function, not a server.

## QCL vs f(x) (Q Lambda)

Quilibrium is building two distinct compute systems that serve different purposes:

**QCL** is for privacy-preserving computation using garbled circuits. It runs on-chain, provides input privacy through MPC, and stores data on the encrypted hypergraph. Use QCL when you need cryptographic privacy guarantees — when parties should not see each other's data during computation.

**f(x)** (also called Q Lambda) is Quilibrium's planned AWS Lambda-equivalent serverless compute platform. It will provide traditional server-side functionality: HTTP request handling, outbound API calls, environment variables, streaming responses, and general-purpose Node.js/runtime execution. Use f(x) when you need a traditional backend — API routes, database connections, external service integrations.

They are complementary: a web application might use f(x) for its API backend while using QCL for specific privacy-sensitive operations like anonymous voting or blind auctions. As of early 2026, f(x) has not yet launched. QCL is part of the combined Milestone 4/5 testnet release.

## Performance Considerations

QCL computation runs as garbled circuit evaluation, which has different performance characteristics than traditional code execution:

- Quilibrium's Oblivious Transfer construction (using FERET) achieves approximately **54 million OTs per shard**, yielding a clock speed of roughly **54 megahertz per shard**. The system scales horizontally across shards.
- Complex cryptographic operations (like signature verification) are significantly slower as garbled circuits compared to purpose-built intrinsics. Always use intrinsics where available.
- Circuit optimization matters: structuring verification checks appropriately in your code can improve streaming circuit performance.
- Quilibrium ships purpose-built primitives for common expensive operations rather than requiring developers to implement them in QCL. These intrinsics will continue to expand with the Equinox and Event Horizon releases.

## Development Tools

- **Q Console** (`console.quilibrium.com`): Web-based IDE with Monaco editor for writing QCL code, defining RDF schemas, validating schemas, and deploying applications.
- **qclient CLI**: Command-line tool for compiling, deploying, and executing QCL applications. Also supports local testing between two parties.
- **Bedlam compiler**: The QCL-to-Bristol-format compiler. Invoked automatically by qclient during deployment.
- **`qclient schema qclgen`**: Generates QCL type boilerplate from RDF schema files.
- **JavaScript SDK wrapper**: Auto-generated SDK for interacting with deployed QCL applications from web frontends (used alongside QStorage for building decentralized websites).

---

*Sources: Quilibrium official documentation (build/applications), qclient command reference, livestream transcripts (2024-06 through 2026-02)*
*Last updated: 2026-02-11*
