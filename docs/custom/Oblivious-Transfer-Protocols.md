---
title: Oblivious Transfer Protocols
source: Quilibrium Whitepaper
pages: 23-25
section: "4.2 - Oblivious Transfer"
date: 2025-01-28
---

# Oblivious Transfer Protocols

This document describes the Oblivious Transfer (OT) protocols used in Quilibrium's oblivious hypergraph construction, enabling private query execution where neither party learns information beyond their intended output.

## What is Oblivious Transfer?

**Oblivious Transfer** is a cryptographic technique that enables a fascinating property: a receiver can obtain exactly one piece of information from a sender, without the sender knowing which piece was chosen, and without the receiver learning anything about the other pieces.

Think of it like a vending machine where:
- The machine (sender) has multiple items
- You (receiver) select one item
- The machine dispenses your item but doesn't know which button you pressed
- You only receive what you selected, learning nothing about other items

## Why OT Matters for Quilibrium

OT is the foundation of Quilibrium's **oblivious hypergraph**, enabling:
- **Query evaluators** to process requests without knowing what data was actually queried
- **Requestors** to remain blind to contents of any additional data served
- **Network observers** to be unable to determine meaningful data about contents, structure, or processors

## Simplest OT (Base Protocol)

Based on Chou and Orlandi's work, this is the foundational OT protocol using elliptic curve cryptography.

### How It Works

**Setup**:
- Sender has two messages: message-0 and message-1
- Receiver wants exactly one of them (has a choice bit: 0 or 1)
- Both parties have private keys (random numbers)

**The Protocol**:

1. **Sender** creates a public point A from their private key and sends it to the receiver

2. **Receiver** creates their response B based on their choice:
   - If they want message-0: B is just their own public point
   - If they want message-1: B is their public point combined with A

3. **Sender** computes two encryption keys from B:
   - Key-0 for encrypting message-0
   - Key-1 for encrypting message-1
   - Sends both encrypted messages

4. **Receiver** can only compute one of the keys (based on their choice), so they can only decrypt the message they wanted

### Security Guarantee

The math ensures that:
- The **receiver cannot compute** the other message's decryption key
- The **sender cannot determine** which message the receiver chose

### Limitation

Simplest OT handles only **one choice between two messages** and must restart for each bit of information. This is too slow for practical use, but serves as a secure foundation for faster protocols.

## Correlated OT

Correlated OT dramatically improves efficiency by recognizing that many OT operations share underlying structure.

### The Key Insight

Instead of running independent OTs, parties establish a **correlation** - a shared mathematical relationship. Once established, they can extend this correlation to generate many OT results cheaply.

### How It Works

1. **Setup phase**: Receiver obtains a secret correlation value (delta) from the sender

2. **Extension phase**: For each batch of transfers:
   - Both parties do minimal computation using the correlation
   - The relationship between values is maintained: the receiver's value plus (their choice times delta) equals the sender's value
   - This property enables the OT functionality without full protocol reruns

### Benefit

Rather than expensive cryptographic operations for every single bit, most of the work is simple arithmetic using the pre-established correlation.

## Multi-Point Correlated OT (MPCOT)

An extension that handles **sorted subsets** efficiently - useful when the receiver wants multiple specific items from a larger set.

### How It Works

1. Receiver and sender agree on the set size and how many items will be selected
2. Receiver specifies which items they want (as a sorted list of positions)
3. The protocol uses a mapping function to efficiently verify the selection
4. Both parties compute their outputs, with the correlation maintained only at selected positions

### Use Case

When querying a database, you often need multiple related pieces of data. MPCOT handles this more efficiently than running separate OTs for each piece.

## Ferret COT Protocol

Ferret (Fast Extension for Correlated OT) is the high-performance protocol Quilibrium uses, achieving approximately **200x speedup** over previous approaches.

### Performance

On standard server hardware (Intel Xeon at 3.6GHz with 32GB RAM):
- **60 million correlations per second**
- Can evaluate AES encryption approximately **120 times per second** through OT
- Requires moderate bandwidth (~50Mbps)

### How Ferret Achieves Speed

Ferret uses **Learning Parity with Noise (LPN)** assumptions to compress communication:

1. **Initialization**: Both parties set up once with shared parameters

2. **Extension**: Instead of communicating full values:
   - Receiver generates a sparse error pattern and a compressed matrix
   - Sender uses these to compute their values
   - Both parties derive extended correlations from compressed data

3. **Iteration**: The protocol can repeatedly extend, generating fresh correlations from previous ones

### The Magic

The sparse error pattern (only a few positions are non-zero) combined with matrix compression means parties exchange far less data than the correlations they generate. Most computation is local matrix arithmetic rather than expensive cryptographic operations.

## How OT Enables Oblivious Queries

In Quilibrium's hypergraph:

1. **Data is stored** across network nodes in encrypted form

2. **When you query**, OT protocols let you:
   - Request specific data without revealing which data
   - Receive results without learning about other data
   - Have your query processed without processors knowing what matched

3. **The result**: Complete query privacy - neither the network nor observers learn what you searched for or found

## Comparison of Protocols

| Protocol | Speed | Use Case |
|----------|-------|----------|
| Simplest OT | Slow (one choice at a time) | Bootstrap for other protocols |
| Correlated OT | Moderate (batched operations) | General extension |
| MPCOT | Good (multiple selections) | Subset queries |
| Ferret COT | Fast (60M/second) | Production workloads |

## Summary

Oblivious Transfer is the cryptographic primitive that makes Quilibrium's privacy guarantees possible. Starting from the simple but slow base protocol, extensions like Correlated OT and Ferret achieve practical speeds while maintaining the core property: **receivers get exactly what they request, senders never learn what was requested, and observers learn nothing**.

---

*Source: Quilibrium Whitepaper, Section 4.2 - Oblivious Transfer*

*Last updated: 2025-01-28*
