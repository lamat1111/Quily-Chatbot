---
title: "Node Key Management — qclient Keyset Operations Guide"
source: official_docs_synthesis
date: 2026-02-11
type: technical_reference
topics:
  - key management
  - qclient
  - keysets
  - import keys
  - export keys
  - multiple keysets
  - Ed448
  - BLS-48-581
  - Poseidon hash
  - node operations
---

# Node Key Management with qclient

## What Are Keysets in Quilibrium?

A "keyset" (also commonly called a "config") is a bundle of cryptographic key material that a Quilibrium node uses to operate on the network. Every node needs exactly one active keyset at a time. The keyset contains two primary files:

- **config.yml** -- node configuration settings (peer identity, network parameters).
- **keys.yml** -- the cryptographic keys associated with that node identity.

All keysets are stored under the user's home directory at `$HOME/.quilibrium/configs/`. Each keyset occupies its own named subdirectory:

```
~/.quilibrium/configs/
  node-quickstart/       # auto-generated default keyset
    config.yml
    keys.yml
  my-second-keyset/      # user-created keyset
    config.yml
    keys.yml
```

The node only runs with the keyset currently linked as the "default" set. To change which keyset is active, you switch the default and restart the node.

## Keyset Location by User Context

The absolute path depends on which user installed qclient:

| User Type | Keyset Path |
|-----------|-------------|
| Root | `/root/.quilibrium/configs/` |
| Non-root user | `/home/<user>/.quilibrium/configs/` |

Prior to qclient 2.1, configs were created in a `.config` directory relative to wherever the command was executed. Current versions use the centralized `~/.quilibrium/configs/` path. If you have legacy configs in a `.config` folder, you can import them into the new structure (see the import section below).

## Initial Keyset — Automatic Generation

When you run any qclient command for the first time and no default keyset exists, qclient automatically generates one for you. This auto-generated keyset is named `node-quickstart` by default.

```bash
# Any first-time qclient command triggers keyset generation
qclient token balance --public-rpc
```

After this command completes, you will find:

```
~/.quilibrium/configs/node-quickstart/
  config.yml
  keys.yml
```

The `keys.yml` file initially contains only `null:` until the node has actually connected to the network and obtained key information. This is expected behavior -- the keys populate once the node interacts with the network.

If you already have existing keys from a previous installation, you do not need to use the auto-generated keyset. You can import your existing keys instead.

## Creating a New Keyset

To manually generate a fresh keyset with a custom name, use the `node config create` command:

```bash
qclient node config create my-new-keyset
```

This creates the directory `~/.quilibrium/configs/my-new-keyset/` with a new `config.yml` and an empty `keys.yml`. Just like the auto-generated keyset, the `keys.yml` will remain empty (containing `null:`) until the keyset is used and the node interacts with the network.

To create a keyset and immediately assign it as the active default:

```bash
qclient node config create my-new-keyset --default
```

Note: the name `default` itself is reserved and cannot be used as a keyset name.

## Importing Existing Keysets

If you have key material from a previous installation, another server, or a backup, you can import it into qclient's managed directory structure.

### Basic Import (Non-Default)

Import a keyset under a given alias without making it the active keyset:

```bash
qclient node config import my-backup /path/to/existing/keys/
```

This copies the `config.yml` and `keys.yml` from the source directory into `~/.quilibrium/configs/my-backup/`.

### Import and Set as Default

To import a keyset and immediately make it the active keyset the node will use:

```bash
qclient node config import my-backup /path/to/existing/keys/ --default
```

The `--default` flag (or `-d`) tells qclient to link this imported keyset as the one the node runs with.

### Migrating Pre-2.1 Configs

If your existing keys live in an older `.config` directory (the pre-2.1 layout), use the import command to move them into the new structure:

```bash
qclient node config import old-node /home/user/.config/
```

If your `.config` folder is in a non-standard location, you can also use the `--config path-to-config` flag on any qclient command to point to it temporarily. However, importing into the new structure is recommended for long-term compatibility.

## Switching Between Keysets

If you have multiple keysets stored under `~/.quilibrium/configs/`, you can switch which one the node uses:

```bash
qclient node config switch my-backup
```

If you omit the name, qclient lists all available keysets and lets you select one:

```bash
qclient node config switch
```

**Important:** After switching configs, you must restart your node for the change to take effect.

```bash
qclient node config switch my-backup
qclient node service restart
```

## Managing Multiple Keysets on One Server

You can store multiple keysets on a single server for convenience. This is useful when you need to interact with the network using different identities or manage keys for different purposes. Only the keyset linked as the default is actively used by the running node -- all other keysets are dormant and available for qclient operations.

Typical workflow for managing multiple keysets:

1. **Import or create** each keyset with a descriptive alias.
2. **Switch** to the desired keyset before performing operations.
3. **Restart the node** whenever you switch the active keyset.

```bash
# Create or import multiple keysets
qclient node config import primary-node /backup/primary-keys/
qclient node config import secondary-node /backup/secondary-keys/
qclient node config create testing-keyset

# Switch as needed
qclient node config switch primary-node
qclient node service restart
```

## Key Types Supported by Quilibrium

Beyond node-level keysets, qclient provides granular key management through the `qclient key` commands. Quilibrium supports four cryptographic key types, each serving different purposes:

| Key Type | Algorithm | Common Uses |
|----------|-----------|-------------|
| `ed448` | Edwards Curve (Ed448) | Identity keys, transaction signing |
| `x448` | Edwards Curve (X448) | Message encryption, data encryption |
| `decaf448` | Decaf | View/spend tokens |
| `bls48581` | BLS-48-581 | Prover operations, deployment administration |

### How Key-Derived Addresses Work

For implicit (non-originated) accounts, the account address is the **Poseidon hash** of the public key. This applies to both Type 0 accounts (default key-derived) and Type 1 accounts (WebAuthn-derived). The Poseidon hash is a ZK-friendly hash function that produces a compact address from the full public key material.

## qclient Key Commands Reference

### Listing All Keys

```bash
qclient key list
```

Example output:

```
Available Keys:
1. q-prover-key (bls48-581) - 0x[585-byte hex string]
```

### Creating Individual Keys

Create a key with a specific type and alias:

```bash
# Identity key
qclient key create my_identity ed448

# Encryption key for data
qclient key create data_encryption x448

# Messaging inbox key
qclient key create private_inbox x448

# Spend key for tokens
qclient key create secondary_spend decaf448
```

Each key alias must be unique within your keystore.

### Importing a Key by Hex Bytes

If you have raw key material in hexadecimal form:

```bash
qclient key import backup_key ed448 0x1234567890abcdef...
```

### Deleting a Key

```bash
qclient key delete old_key
```

Deletion is permanent. Always ensure you have backups before deleting keys associated with encrypted data or valuable assets.

### Signing Payloads

Sign raw data with a specific key:

```bash
# Sign without broadcasting
qclient key sign my_key 0xdeadbeef

# Sign and broadcast to a domain
qclient key sign -d 0x[32-byte hex string] my_key 0xdeadbeef
```

**Warning:** Only sign payloads you fully understand and trust. Signing malicious payloads can compromise your assets or identity.

## Key Purposes and the Account Model

Keys in Quilibrium serve four distinct roles:

- **Identity keys** -- Represent your identity on the network. Typically Ed448.
- **Encryption keys** -- Encrypt and decrypt data stored in the hypergraph. Typically X448.
- **Signing keys** -- Sign transactions and messages. Ed448 or BLS-48-581.
- **Inbox keys** -- Receive encrypted messages. Typically X448.

Quilibrium's account model is intentionally domain-bounded. Unlike traditional crypto wallets where a single key controls everything, Quilibrium encourages using separate keys for separate purposes and domains. The platform is designed around passkey-based authentication (WebAuthn) for browser interactions, with manual key management via qclient available but intentionally higher friction for security reasons.

## Security Best Practices

### Backup Your Keysets

Always maintain secure backups of your `config.yml` and `keys.yml` files. Without these files, you cannot access tokens or data associated with that keyset. Store backups in encrypted, offline storage.

### Key Storage and Encryption

- Keys are stored encrypted in your local keystore.
- Use strong passwords for keystore encryption.
- Regularly verify that your backups are restorable.

### Key Separation

- Use different keys for different purposes (identity, encryption, signing, inbox).
- Never reuse a single key across all operations.
- Use separate keysets for production nodes and testing.

### Key Rotation

- Periodically rotate keys for enhanced security.
- Keep old keys available for decrypting historical data.
- Update references when rotating identity keys.

### Never Share Private Keys

- Never share private key material or import keys from untrusted sources.
- Only share public keys when necessary.
- When using RPCs, understand that you are providing key material to the RPC endpoint. Only use RPCs you trust and control.

### Custody Considerations

- **Cold custody:** Use an "allow account" request as the initial signature to prove key possession, granting only read-only rights to a warm wallet.
- **Warm/hot custody:** Generate a key and use the Poseidon-hashed public key as the address directly.
- **MPC custody:** Quilibrium supports standard Ed448, Ed25519 (not recommended), and BLS-48-581 signatures for MPC signing infrastructure.

## Frequently Asked Questions

**Q: Do I need a running node to use my keys?**
No. The qclient embeds a light client that can construct network interactions without a full node. You can use `--public-rpc` to query the network via a public RPC endpoint without running your own node.

**Q: What happens if I lose my keys?**
If you lose your keyset files (`config.yml` and `keys.yml`) and have no backup, the tokens and data associated with that keyset are irrecoverable. Always maintain secure backups.

**Q: Can I move my keyset to a different server?**
Yes. Copy the keyset directory (or the `config.yml` and `keys.yml` files) to the new server, then use `qclient node config import` to bring them into qclient's managed structure.

**Q: Why does keys.yml show `null:` after creation?**
This is normal. The `keys.yml` file populates with actual key data only after the node connects to the network and obtains key information. Until then, it contains `null:`.

**Q: How do I know which keyset is currently active?**
Run `qclient node config switch` without a name -- it will list all available keysets and indicate which one is the current default.

**Q: Can multiple keysets be active simultaneously?**
No. Only one keyset can be the active default at a time. The node runs exclusively with the keyset linked as the default. Other keysets are stored but dormant.

**Q: What is the difference between `qclient key` commands and `qclient node config` commands?**
The `qclient node config` commands manage entire keysets (bundles of config and key files) used by the node. The `qclient key` commands manage individual cryptographic keys within the keystore for specific operations like signing, encryption, and identity.

*Last updated: 2026-02-11T15:00:00*
