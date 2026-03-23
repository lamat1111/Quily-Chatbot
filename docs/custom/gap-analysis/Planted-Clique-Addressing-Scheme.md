---
title: Planted Clique Addressing Scheme (PCAS)
source: Quilibrium Whitepaper
pages: 6-7
section: "2.1 - Planted Clique Addressing Scheme"
date: 2025-01-28
type: whitepaper_excerpt
---

# Planted Clique Addressing Scheme (PCAS)

This document describes Quilibrium's Planted Clique Addressing Scheme, a quantum-resistant cryptographic addressing system based on the planted clique problem combined with Learning Parity with Noise (LPN).

## Overview

The Planted Clique Addressing Scheme is one of the four core components of Quilibrium's communication layer, alongside the Triple-Ratchet Protocol, Shuffled Lattice Routing Protocol, and the Gossip Layer (BlossomSub).

## Background Concepts

### Graphs and Cliques

**Undirected graphs** are a common structure in discrete mathematics describing relationships between elements. Graphs consist of:
- **Vertices (V)**: The elements/nodes
- **Edges (E)**: Connections between pairs of vertices

A **clique** is a subset of vertices where every vertex is connected to every other vertex in the subset by an edge. Under the right conditions, finding cliques can be computationally extremely difficult.

### The Planted Clique Problem

A **planted clique** is a clique formed by amending a random graph in a particular way. The **planted clique problem** is a computational hardness assumption stating that it's impossible to distinguish a random graph from one containing a planted clique in polynomial time.

This computational hardness can be leveraged as a type of asymmetric cryptosystem. Combined with the Learning Parity with Noise (LPN) problem, this produces a cryptosystem believed to be **quantum-resistant** due to the NP-complete nature of the planted clique problem.

## Mathematical Foundations

### Terminology

- **Bern_ε^n** - Bernoulli distribution: binary 0-1 vectors of length n where ε denotes the probability of entry being 1
- **U_n** - Uniform distribution over binary vectors of length n
- **G(n, p)** - Erdős-Rényi random graphs

### Learning Parity with Noise (LPN) Problem

Given M ∈ F_q^(m×n) and s ∈ F_q^n, it is computationally infeasible to determine s from Ms + e where e ← Bern_ε^m

## Cryptographic Algorithms

### Key Generation

1. Choose a random G ← G(n, p) graph
2. Choose a random k-sized subset from the nodes of the graph containing the last row. Denote it with S ⊂ [n]
3. Remove all edges between nodes contained in S: replace E by (E \ {(u, v)|u, v ← S}) - this plants an independent set to the positions corresponding to S
4. Iterate through {u ∈ V \ S | |Π_G(u) ∩ S| ≡ 1 (mod 2)} with u in random order:
   - With p_add probability: add (u, v) for v ← S \ Π_G(u) to E
   - Else: remove (u, v) for v ← Π_G(u)|S from E

**Result**: The public key is the graph G's adjacency matrix M, and the private key is S.

### Encryption

1. Generate a private key S, public key G. From G we get the adjacency matrix M
2. Choose a random vector x ← U_n and a random noise vector e ← Bern_ε^n, let b = Mx + e
   - To encrypt 0: send the vector b
   - To encrypt 1: send the vector b with its last bit flipped

### Decryption

To decrypt y ∈ {0, 1}^n, output Σ_{i∈S} y_i (mod 2)

### Extended Encryption

The encryption algorithm can be extended to more than single-bit encryption using Ring-LPN constructions.

## Address Derivation

Quilibrium derives addresses from the public key matrix as follows:

1. Given M (the adjacency matrix), serialized as a binary string m
2. Compute H(m), where H is the hash function cSHAKE with:
   - Customization string: "Quilibrium Address" (ASCII, used as domain separator)
   - Output length: 256 bits
3. The address A = H(m)

### Address Format

For visual distinction, addresses are serialized as ASCII encoding prepended with an identifier:

```
'Q' || 'x' || encode(A)
```

Example: `Qx...` followed by the encoded address bytes.

### Checksumming and Names

While a checksumming algorithm may be used to ensure proper address entry, Quilibrium strongly encourages public user interfaces to interact with addresses through **indirection via name resources** (described in the Accounts system) rather than raw addresses.

## Security Properties

The PCAS provides:

1. **Quantum Resistance**: Based on NP-complete planted clique problem
2. **Privacy-Preserving**: Address derivation uses domain-separated hashing
3. **Asymmetric Security**: Public key (adjacency matrix) can be shared; private key (clique subset) remains secret

## Relationship to Other Components

PCAS works in conjunction with:

- **Triple-Ratchet Protocol**: For establishing secure communication channels
- **Shuffled Lattice Routing Protocol (SLRP)**: For anonymous message routing
- **BlossomSub**: For gossip-based message propagation

Together, these components enable Quilibrium's privacy-preserving communication layer.

