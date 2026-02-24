---
sidebar_position: 7
---

# Key Commands

The key commands provide comprehensive key management functionality for various operations on the Quilibrium network, including creating, importing, and signing with cryptographic keys.

## Overview

Keys in Quilibrium serve multiple purposes:
- **Identity Keys**: Represent your identity on the network
- **Encryption Keys**: Encrypt and decrypt data in the hypergraph
- **Signing Keys**: Sign transactions and messages
- **Inbox Keys**: Receive encrypted messages

## Key Management Commands

### List Keys

Display all available keys in your keystore.

```bash
qclient key list
```

**Output Example:**
```
Available Keys:
1. q-prover-key (bls48-581) - 0x[585-byte hex string]
```

### Create Key

Generate a new cryptographic key with a specified alias.

```bash
qclient key create <Name> <KeyType>
```

**Parameters:**
- `<Name>`: Alias for the key (must be unique)
- `<KeyType>`: Type of key to create (e.g., ed448, decaf448, x448, bls48581)

**Examples:**

Create an identity key:
```bash
qclient key create my_identity ed448
```

Create an encryption key:
```bash
qclient key create data_encryption x448
```

Create a messaging inbox key:
```bash
qclient key create private_inbox x448
```

Create a spend key:
```bash
qclient key create secondary_spend decaf448
```

### Import Key

Import an existing key into your keystore.

```bash
qclient key import <Name> <KeyBytes>
```

**Parameters:**
- `<Name>`: Alias for the imported key
- `<KeyType>`: Type of key
- `<KeyBytes>`: Hexadecimal representation of the key

**Example:**
```bash
qclient key import backup_key ed448 0x1234567890abcdef...
```

:::warning
Keep your private keys secure.
Never share private keys or import keys from untrusted sources.
:::

### Delete Key

Remove a key from your keystore.

```bash
qclient key delete <Name>
```

**Parameters:**
- `<Name>`: Alias of the key to delete

**Example:**
```bash
qclient key delete old_key
```

:::caution
Deleting a key is permanent.
Ensure you have backups before deleting keys used for encryption or valuable assets.
:::

## Signing Operations

### Sign Payload

Sign a raw payload with a specified key.

:::danger
**DANGEROUS**: This command signs raw payloads.
Only sign data you fully understand and trust.
Signing malicious payloads could compromise your assets or identity.
:::

```bash
qclient key sign [--domain|-d <DomainAddress>] <Name> <Payload>
```

**Parameters:**
- `[--domain|-d <DomainAddress>]`: Optional domain to broadcast the signed message to
- `<Name>`: Alias of the signing key
- `<Payload>`: Data to sign (hex-encoded)

**Examples:**

Sign without broadcasting:
```bash
qclient key sign my_key 0xdeadbeef
```

Sign and broadcast to domain:
```bash
qclient key sign -d 0x[32-byte hex string] my_key 0xdeadbeef
```

## Key Types and Uses

### Supported Key Types

| Key Type | Algorithm | Common Uses |
|----------|-----------|-------------|
| ed448 | Edwards Curve | Identity, signing |
| x448 | Edwards Curve | Message and Data encryption |
| decaf448 | Decaf | View/Spend tokens |
| bls48581 | BLS48-581 | Prover, Deployment administration |

### Key Purposes

Keys can be designated for specific purposes:

- **Identity**: Primary identity on the network
- **Encryption**: Encrypting hypergraph data
- **Signing**: Transaction and message signatures
- **Messaging**: Encrypted messaging inbox

## Security Best Practices

### Key Storage
- Keys are stored encrypted in your local keystore
- Use strong passwords for keystore encryption
- Regularly backup your keystore

### Key Rotation
- Periodically rotate keys for enhanced security
- Keep old keys for decrypting historical data
- Update references when rotating identity keys

### Key Sharing
- Never share private keys
- Only share public keys when necessary
- Use separate keys for different purposes

## Integration with Other Commands

Keys created or imported here can be used with:

- **Hypergraph**: Encrypt/decrypt vertex and hyperedge data
- **Messaging**: Send and receive encrypted messages
- **Deploy**: Sign deployment transactions
- **Token**: Sign token transfers

## Troubleshooting

### Common Issues

**"Key already exists"**
- Choose a different alias or delete the existing key first

**"Invalid key format"**
- Ensure key bytes are properly hex-encoded
- Verify the key type matches the key data

**"Key not found"**
- Check key alias spelling
- Use `qclient key list` to see available keys

## Related Commands

- [Messaging Commands](/docs/run-node/qclient/commands/messaging) - Use keys for encrypted messaging
- [Hypergraph Commands](/docs/run-node/qclient/commands/hypergraph) - Use keys for data encryption