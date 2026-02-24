---
sidebar_position: 6
---

# Compute Commands

The compute commands enable execution of distributed computations on the Quilibrium network, supporting multi-party computation and finalizing results to the hypergraph.

## Overview

Quilibrium's compute layer allows for secure, distributed computation across multiple parties.
This enables:
- Multi-party computation where different parties provide inputs
- Privacy-preserving computations using secure protocols
- Automatic finalization of results to the hypergraph

## Execute Command

Performs execution of a computation at a given address.

```bash
qclient compute execute <FullAddress> [<Rendezvous>] [<PartyId>] [<ArgumentKey>=<ArgumentValue>]
```

**Parameters:**
- `<FullAddress>`: The address of the computation to execute
- `[<Rendezvous>]`: Optional rendezvous address for multi-party coordination
- `[<PartyId>]`: Party identifier (1, 2, ..., n) for multi-party computation
- `[<ArgumentKey>=<ArgumentValue>]`: Key-value pairs for computation arguments

### Single-Party Execution

For computations that don't require multiple parties:

```bash
qclient compute execute 0x[64-byte hex string] input1="value1" input2="value2"
```

### Multi-Party Execution

For computations requiring multiple parties to provide inputs:

**Party 1:**
```bash
qclient compute execute 0x[64-byte hex string] 1 secret="alice_secret"
```

Party 1 will receive the rendezvous address, and should provide it to other parties.

**Party 2:**
```bash
qclient compute execute 0x[64-byte hex string] 0x[32-byte hex string] 2 secret="bob_secret"
```

:::note
In multi-party computation, all parties must use the same rendezvous address to coordinate.
The computation will not proceed until all required parties have provided their inputs.
:::

## Computation Results

After successful execution:
- Results are automatically finalized to the hypergraph (if applicable)
- Settled data outputs become available at their designated addresses
- Parties can retrieve results using hypergraph commands

## Arguments and Data Types

Arguments passed to computations must match the expected types defined in the computation's schema:

- **Strings**: `name="Alice"`
- **Numbers**: `age="30"` or `amount="100.5"`
- **Booleans**: `active="true"` or `verified="false"`
- **Addresses**: `recipient="0x[64-byte hex string]"`

## Security Considerations

### Party Authentication
- Each party in a multi-party computation is identified by their PartyId
- The computation verifies that inputs come from the expected parties

### Input Privacy
- In multi-party computation, parties' inputs remain private from other parties
- Only the computed result is revealed, not the individual inputs

### Result Integrity
- Computation results are cryptographically signed
- Results are immutable once finalized to the hypergraph

## Common Use Cases

### Blind Highest-wins Auctions
Multiple parties submit bids, winner determined without revealing all bids:
```bash
# Auctioneer as party 1 with minimum bid
qclient compute execute 0x[64-byte hex string of auction address] 1 bid="1000"

# Bidder as party 2 with their bid
qclient compute execute 0x[64-byte hex string of auction address] 0x[32-byte hex string of rendezvous] 2 bid="1200"
```

### Collaborative Analytics
Parties contribute data for joint analysis without sharing raw data:
```bash
# Hospital 1
qclient compute execute 0x[64-byte hex string of analytics address] 1 patients="500" cases="50"

# Hospital 2
qclient compute execute 0x[64-byte hex string of analytics address] 0x[32-byte hex string of rendezvous] 2 patients="300" cases="30"
```

### Threshold Signatures
Multiple parties collaborate to create a signature:
```bash
# Signer 1
qclient compute execute 0x[64-byte hex string of threshold signature address] 1 share="0x[byte string of key share]"

# Signer 2
qclient compute execute 0x[64-byte hex string of threshold signature address] 0x[32-byte hex string of rendezvous] 2 share="[byte string of key share]"
```

## Error Handling

Common errors and their meanings:

- **Invalid Address**: The computation address doesn't exist or is malformed
- **Missing Party**: Required party hasn't provided input yet
- **Type Mismatch**: Argument type doesn't match schema expectation
- **Computation Failed**: The computation logic encountered an error
- **Insufficient Funds**: Not enough QUIL to pay for computation execution

## Related Commands

- [Deploy Commands](/docs/run-node/qclient/commands/deploy) - Deploy applications to the network
- [Hypergraph Commands](/docs/run-node/qclient/commands/hypergraph) - Access computation results
- [Token Commands](/docs/run-node/qclient/commands/token) - Manage funds for computation fees