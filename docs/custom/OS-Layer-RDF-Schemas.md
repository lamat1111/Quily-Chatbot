---
title: Operating System Layer RDF Schemas
source: Quilibrium Whitepaper
pages: 28-32
section: "5 - Operating System"
date: 2025-01-28
---

# Operating System Layer RDF Schemas

This document describes the RDF schemas that define Quilibrium's Database Operating System (DBOS) primitives, including file system, scheduler, IPC, message queues, key management, and accounts.

## Overview

Quilibrium implements OS-level primitives on top of its hypergraph database, inspired by the Database Operating System (DBOS) concept. Unlike traditional OS implementations, these primitives are represented as **RDF schemas** that can be queried and manipulated through the oblivious hypergraph.

Through **named IRI references** to the address of any graph, these concepts can be linked together where relevant.

## File System

Quilibrium adopts an **object store** model (similar to S3) rather than a traditional hierarchical file system.

### File Schema

```turtle
:File a rdfs:Class;
    rdfs:label "a file object".

:FileSize a rdfs:Property;
    rdfs:domain rdfs:Literal;
    rdfs:range :File.

:FileName a rdfs:Property;
    rdfs:domain rdfs:Literal;
    rdfs:range :File.

:FileOctet a rdfs:Property;
    rdfs:domain rdfs:Literal;
    rdfs:range :File.
```

### Block Schema

```turtle
:Block a rdfs:Class;
    rdfs:label "a block of data".

:FileParent a rdfs:Property;
    rdfs:domain rdfs:Literal;
    rdfs:range :File.

:BlockHash a rdfs:Property;
    rdfs:domain rdfs:Literal;
    rdfs:range :Block.

:BlockData a rdfs:Property;
    rdfs:domain rdfs:Literal;
    rdfs:range :Block.

:BlockNumber a rdfs:Property;
    rdfs:domain rdfs:Literal;
    rdfs:range :BlockData.

:BlockSize a rdfs:Property;
    rdfs:domain rdfs:Literal;
    rdfs:range :Block.
```

### FUSE Integration

With **FUSE drivers per RDF2FS**, Quilibrium gains a direct bridge between classical OS and the network, offering file backup capabilities.

## Scheduler

The scheduler supports two types of task execution:

1. **Priority-based**: Tasks ordered as a max-heap (0-255 priority, higher = processed first)
2. **Cron-based**: Repeated tasks executed at scheduled intervals

### Task Schema

```turtle
:Task a rdfs:Class;
    rdfs:label "a simple task".

:TaskData a rdfs:Property;
    rdfs:domain :File;
    rdfs:range :Task.

:TaskPriority a rdfs:Property;
    rdfs:label "a one-time execution parameter that indicates the 0-255 priority, in order of priority";
    rdfs:domain rdfs:Literal;
    rdfs:range :Task.

:TaskSchedule a rdfs:Property;
    rdfs:label "A cron string that describes the frequency to evaluate the task";
    rdfs:domain rdfs:Literal;
    rdfs:range :Task.

:TaskResult a rdfs:Property;
    rdfs:domain :File;
    rdfs:range :Task.
```

## Inter-Process Communication (IPC)

IPC is achieved using a **named graph based structure**.

### IPC Schema

```turtle
:IPCMessage a rdfs:Class;
    rdfs:label "a message".

:MessageData a rdfs:Property;
    rdfs:domain rdfs:Literal;
    rdfs:range :IPCMessage.

:ToAddress a rdfs:Property;
    rdfs:label "the address of the target graph";
    rdfs:domain rdfs:Literal;
    rdfs:range :IPCMessage.
```

## Message Queues

Message queues are implemented as **linked lists with parent references**, providing FIFO (First-In-First-Out) semantics.

### Queue Schema

```turtle
:Queue a rdfs:Class;
    rdfs:label "a FIFO queue".

:QueueNode a rdfs:Class;
    rdfs:label "a node in a queue".

:HeadNode a rdfs:Property;
    rdfs:domain :QueueNode;
    rdfs:range :Queue.

:NextNode a rdfs:Property;
    rdfs:domain :QueueNode;
    rdfs:range :QueueNode.

:QueueMessage a rdfs:Property;
    rdfs:domain rdfs:Literal;
    rdfs:range :QueueNode.
```

## Key Management

Key management enables any member of a cluster to participate on their relevant side of an OT circuit. This is critical for **non-interactive processing** where the protocol (rather than a client) initiates computation.

### Key Schema

```turtle
:Key a rdfs:Class;
    rdfs:label "a key object".

:KeyShare a rdfs:Class;
    rdfs:label "a share corresponding to a key".

:OfKey a rdfs:Property;
    rdfs:domain :Key;
    rdfs:range :KeyShare.

:Format a rdfs:Property;
    rdfs:domain rdfs:Literal;
    rdfs:range :Key.

:PublicData a rdfs:Property;
    rdfs:domain rdfs:Literal;
    rdfs:range :Key.

:Protocol a rdfs:Property;
    rdfs:domain rdfs:Literal;
    rdfs:range :Key.

:KeyData a rdfs:Property;
    rdfs:domain rdfs:Literal;
    rdfs:range :KeyShare.
```

### Security Properties

Because distinct data sections are encrypted by relevant keyholders:
- If keyshare owners are **not the same**: the key never exists combined on a single device
- If keyshare owners **are the same**: their meaningful online use is still reflected in the global hypergraph mutation, preventing state forgery

### Protocol Property

The **Protocol** reference property is multi-purpose:
- Can refer to a **known protocol** baked into node software
- Can refer to an **executable File reference** containing an OT circuit
- Enables additional MPC protocols not inherent to network function

## Accounts and Coins

Accounts enable identity assertion and balance tracking. The network reward token is a **Coin** - an exchangeable, splittable unit of balance.

### The Privacy-Compliance Dilemma

Quilibrium addresses a key ethical dilemma:
- **Financial institutions** cannot accept coins without explicit proof of legitimacy
- **People deserve** a right to financial privacy

### Solution: Bloom Filter Lineage

On coin transfer, the circuit applies the **holding account's public address** to a bloom filter. Users can:
1. Check coins against a public registry of known bad actors
2. **Accept** the coin, or
3. **Reject** it (triggering transfer to designated refund address)

### Account Schema

```turtle
:Account a rdfs:Class;
    rdfs:label "an account object".

:Coin a rdfs:Class;
    rdfs:label "an object containing a numeric balance and historical lineage".

:CoinBalance a rdfs:Property;
    rdfs:domain rdfs:Literal;
    rdfs:range :Coin.

:OwnerAccount a rdfs:Property;
    rdfs:domain :Account;
    rdfs:range :Coin.

:LineageFilter a rdfs:Property;
    rdfs:domain rdfs:Literal;
    rdfs:range :Coin.
```

### Pending Transaction Schema

```turtle
:PendingTransaction a rdfs:Class;
    rdfs:label "a pending transaction".

:ToAccount a rdfs:Property;
    rdfs:domain :Account;
    rdfs:range :PendingTransaction.

:RefundAccount a rdfs:Property;
    rdfs:domain :Account;
    rdfs:range :PendingTransaction.

:OfCoin a rdfs:Property;
    rdfs:domain :Coin;
    rdfs:range :PendingTransaction.
```

### Privacy Preservation

A pending transaction **does not reveal a source account**, retaining sender privacy outside of a bloom filter entry. If sender wishes to retain privacy, they may:
1. Designate an **alternative account for refund**
2. Consolidate funds afterwards

### Coin Operations

**Joining Coins**:
- Coins may be joined together
- The bloom filter will be **unioned**
- Choice of joining is at the owner's behest

**Splitting Coins**:
- Coins may be split
- Split coins **inherit the bloom filter**

## Universal Resources

These RDF schema definitions are deployed to the network on initialization by the Quilibrium team, with an access key allowing any network member to read and reference them.

### Governance

- Anyone may deploy a new data schema and instantiate a universal resource
- Ownership of these schemas is intended to migrate to a **separate foundation**
- The foundation will be governed independently for the network's continued function and evolution

### Deployment Model

This model enables:
1. **Schema deployment** by any participant
2. **Universal resource instantiation** based on deployed schemas
3. **Network-wide accessibility** through access keys
4. **Decentralized governance** through foundation ownership

