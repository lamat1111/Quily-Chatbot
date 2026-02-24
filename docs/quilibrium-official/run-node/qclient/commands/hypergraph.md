---
sidebar_position: 5
---

# Hypergraph Commands

The hypergraph commands allow you to interact with Quilibrium's distributed hypergraph data structure, enabling storage and retrieval of vertices and hyperedges with encryption.

## Overview

The Quilibrium hypergraph is a distributed data structure that stores relationships between data points.
It consists of two types of **Atoms**:
- **Vertices**: Individual data points with properties
- **Hyperedges**: Connections between multiple atoms

All data is encrypted using configured encryption keys for privacy.

## Vertex Operations

### Get Vertex

Retrieves and displays vertex data from a specified address.

```bash
qclient hypergraph get vertex <FullAddress> [<EncryptionKeyBytes>]
```

**Parameters:**
- `<FullAddress>`: The complete address of the vertex to retrieve
- `[<EncryptionKeyBytes>]`: Optional encryption key to decrypt the vertex data, uses default stored key if omitted

**Example:**
```bash
qclient hypergraph get vertex 0x[64-byte hex string]
```

**With encryption key specified:**
```bash
qclient hypergraph get vertex 0x[64-byte hex string] 0x[57-byte hex string of private key]
```

### Put Vertex

Creates or updates a vertex in the hypergraph.

```bash
qclient hypergraph put [--domain|-d <DomainAddress>] vertex [<PropertyName>=<PropertyValue>] [<EncryptionKeyBytes>]
```

**Parameters:**
- `[--domain|-d <DomainAddress>]`: Optional domain address for the vertex
- `[<PropertyName>=<PropertyValue>]`: Key-value pairs defining vertex properties
- `[<EncryptionKeyBytes>]`: Optional encryption key to encrypt the vertex data

**Example:**
```bash
qclient hypergraph put vertex name="Alice" age="30" city="New York"
```

**With domain and encryption:**
```bash
qclient hypergraph put -d 0x[32-byte hex string] vertex name="Alice" age="30" 0x[57-byte hex string]
```

:::note
The put operation validates data against the schema before insertion.
The schema is defined for the domain, the properties must match the expected types and constraints.
:::

## Hyperedge Operations

### Get Hyperedge

Retrieves and displays hyperedge data from a specified address.

```bash
qclient hypergraph get hyperedge <FullAddress> [<EncryptionKeyBytes>]
```

**Parameters:**
- `<FullAddress>`: The complete address of the hyperedge to retrieve
- `[<EncryptionKeyBytes>]`: Optional encryption key to decrypt the hyperedge data

**Example:**
```bash
qclient hypergraph get hyperedge 0x[64-byte hex string]
```

### Put Hyperedge

Creates or updates a hyperedge connecting multiple vertices.

```bash
qclient hypergraph put [--domain|-d <DomainAddress>] hyperedge <FullAddress> [<AtomAddress>, ...] [<EncryptionKeyBytes>]
```

**Parameters:**
- `[--domain|-d <DomainAddress>]`: Optional domain address for the hyperedge
- `<FullAddress>`: The address where the hyperedge will be stored
- `[<AtomAddress>, ...]`: Comma-separated list of atom addresses to connect
- `[<EncryptionKeyBytes>]`: Optional encryption key to encrypt the hyperedge data

**Example:**
```bash
qclient hypergraph put hyperedge 0x[64-byte hex string] 0x[64-byte hex string],0x[64-byte hex string],0x[64-byte hex string]
```

**With domain and encryption:**
```bash
qclient hypergraph put -d 0x[32-byte hex string] hyperedge 0x[64-byte hex string] 0x[64-byte hex string],0x[64-byte hex string],0x[64-byte hex string] 0x[57-byte hex string]
```

## Encryption

All hypergraph operations require encryption to protect data privacy:

1. **Encrypted Storage**: When an encryption key is provided during a `put` operation, this key is used to encrypt the data before being stored in the hypergraph. When omitted, it uses the default key configured
2. **Encrypted Retrieval**: To read encrypted data, you must provide the same encryption key used during storage
3. **Key Management**: Encryption keys are managed separately from the hypergraph data - ensure you store keys securely

:::warning
If you lose the encryption key for encrypted data, the data cannot be recovered.
Always maintain secure backups of your encryption keys.
:::

## Use Cases

Common use cases for hypergraph commands include:

- **Decentralized Databases**: Store structured data with relationships
- **Knowledge Graphs**: Build semantic networks of connected information
- **Private Data Storage**: Store encrypted personal or sensitive data
- **Application State**: Maintain distributed application state across the network

## Related Commands

- [Deploy Commands](/docs/run-node/qclient/commands/deploy) - Deploy schemas and applications that use the hypergraph
- [Compute Commands](/docs/run-node/qclient/commands/compute) - Execute computations on hypergraph data
- [Key Commands](/docs/run-node/qclient/commands/key) - Manage encryption keys for hypergraph operations