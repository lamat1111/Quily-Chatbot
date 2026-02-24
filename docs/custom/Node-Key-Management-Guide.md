---
title: "Quilibrium Key Management — Types, Operations, Security & Custody Guide"
source: official_docs_synthesis
date: 2026-02-24
type: technical_reference
topics:
  - key management
  - qclient
  - key commands
  - key types
  - Ed448
  - x448
  - decaf448
  - BLS-48-581
  - keysets
  - config management
  - prover merge
  - cold custody
  - warm custody
  - MPC custody
  - key backup
  - signing
  - encryption keys
---

# Quilibrium Key Management Guide

This guide consolidates everything about key management on the Quilibrium network: what keysets are, the four cryptographic key types, how to create and manage keys with qclient, how to handle node configurations, how to merge prover keys for seniority, backup best practices, custody models, and security recommendations.

---

## What Are Keysets in Quilibrium?

A "keyset" (also called a "config") is a bundle of cryptographic key material that a Quilibrium node uses to operate on the network. Every node needs exactly one active keyset at a time. Each keyset contains two primary files:

- **config.yml** -- node configuration settings including peer identity, network parameters, engine settings, and key manager configuration.
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

---

## Keyset Location by User Context

The absolute path depends on which user installed qclient:

| User Type | Keyset Path |
|-----------|-------------|
| Root | `/root/.quilibrium/configs/` |
| Non-root user | `/home/<user>/.quilibrium/configs/` |

Prior to qclient 2.1, configs were created in a `.config` directory relative to wherever the command was executed. Current versions use the centralized `~/.quilibrium/configs/` path. If you have legacy configs in a `.config` folder, you can import them into the new structure using the `node config import` command.

---

## Key Types and Their Purposes

Quilibrium supports four cryptographic key types, each serving a distinct role in the network:

| Key Type | Algorithm | Primary Purpose | Typical Use Cases |
|----------|-----------|-----------------|-------------------|
| `ed448` | Edwards Curve (Ed448) | Identity and signing | Identity keys, transaction signing, message signatures |
| `x448` | Edwards Curve (X448) | Encryption and messaging | Data encryption in the hypergraph, messaging inbox keys |
| `decaf448` | Decaf | Token operations | View and spend tokens |
| `bls48581` | BLS-48-581 | Prover operations | Prover enrollment, deployment administration |

These four key types map to four functional roles in the network:

- **Identity keys (ed448)** -- Represent your identity on the network. Used to authenticate and sign transactions.
- **Encryption keys (x448)** -- Encrypt and decrypt data stored in the hypergraph. Also used for receiving encrypted messages (inbox keys).
- **Spend keys (decaf448)** -- Required for token view and spend operations.
- **Prover keys (bls48581)** -- Used by node operators for prover enrollment and deployment administration.

---

## How Key-Derived Addresses Work

For implicit (non-originated) accounts, the account address is the **Poseidon hash** of the public key. The Poseidon hash is a ZK-friendly hash function that produces a compact address from the full public key material. This applies to:

- **Type 0** accounts: Default key-derived accounts (Poseidon-hashed raw public key).
- **Type 1** accounts: WebAuthn-derived accounts (Poseidon-hashed raw public key), which additionally require a corresponding domain name for validation scope.

The type field leaves room for additional key and signature support in the future.

---

## Key Commands Reference

The `qclient key` commands manage individual cryptographic keys within your keystore. These are separate from `qclient node config` commands, which manage entire keysets (bundles of config and key files).

### Listing All Keys

Display all available keys in your keystore:

```bash
qclient key list
```

Example output:

```
Available Keys:
1. q-prover-key (bls48-581) - 0x[585-byte hex string]
```

### Creating a New Key

Generate a new cryptographic key with a specified alias and type:

```bash
qclient key create <Name> <KeyType>
```

Parameters:
- `<Name>`: Alias for the key (must be unique within your keystore)
- `<KeyType>`: One of `ed448`, `x448`, `decaf448`, `bls48581`

Examples:

```bash
# Create an identity/signing key
qclient key create my_identity ed448

# Create an encryption key for hypergraph data
qclient key create data_encryption x448

# Create a messaging inbox key
qclient key create private_inbox x448

# Create a secondary spend key for tokens
qclient key create secondary_spend decaf448
```

### Importing a Key by Hex Bytes

Import an existing key from raw hexadecimal key material:

```bash
qclient key import <Name> <KeyType> <KeyBytes>
```

Parameters:
- `<Name>`: Alias for the imported key
- `<KeyType>`: Type of key (e.g., `ed448`, `x448`)
- `<KeyBytes>`: Hexadecimal representation of the key

Example:

```bash
qclient key import backup_key ed448 0x1234567890abcdef...
```

**Security warning:** Never share private keys or import keys from untrusted sources. Keep your private key material secure at all times.

### Deleting a Key

Remove a key from your keystore permanently:

```bash
qclient key delete <Name>
```

Example:

```bash
qclient key delete old_key
```

**Warning:** Deletion is permanent and cannot be undone. Always ensure you have backups before deleting keys that are associated with encrypted data, tokens, or valuable assets.

---

## Signing Operations

### Signing a Payload

Sign raw data with a specific key from your keystore:

```bash
qclient key sign [--domain|-d <DomainAddress>] <Name> <Payload>
```

Parameters:
- `--domain` or `-d <DomainAddress>`: Optional domain address to broadcast the signed message to
- `<Name>`: Alias of the signing key
- `<Payload>`: Data to sign (hex-encoded)

Sign without broadcasting:

```bash
qclient key sign my_key 0xdeadbeef
```

Sign and broadcast to a specific domain:

```bash
qclient key sign -d 0x[32-byte hex string] my_key 0xdeadbeef
```

### Signing Security Warnings

**DANGEROUS**: The `key sign` command signs raw payloads. This is a powerful and potentially destructive operation.

- Only sign data you fully understand and trust.
- Signing malicious or unknown payloads could compromise your assets or identity.
- Verify the payload contents before signing.
- Be especially cautious when signing payloads from third parties.

---

## Node Config Management

The `qclient node config` commands manage entire keysets (bundles of `config.yml` and `keys.yml` files) used by the node. All node config commands accept a `--config` parameter to specify either a directory path (e.g., `/home/user/my-config/`) or a config name.

### Initial Keyset -- Automatic Generation

When you run any qclient command for the first time and no default keyset exists, qclient automatically generates one named `node-quickstart`:

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

The `keys.yml` file initially contains only `null:` until the node has connected to the network and obtained key information. This is expected behavior.

### Creating a New Configuration

Generate a fresh keyset with a custom name:

```bash
qclient node config create [name] [--default|-d]
```

Examples:

```bash
# Create a keyset without setting it as default
qclient node config create my-new-keyset

# Create a keyset and immediately set it as the active default
qclient node config create my-new-keyset --default
```

The name `default` is reserved and cannot be used as a keyset name.

### Importing a Configuration

Import existing key material from a directory:

```bash
qclient node config import [name] <path> [--default|-d]
```

Examples:

```bash
# Import without setting as default
qclient node config import my-backup /path/to/existing/keys/

# Import and set as the active default
qclient node config import my-backup /path/to/existing/keys/ --default

# Migrate pre-2.1 configs from old .config directory
qclient node config import old-node /home/user/.config/
```

### Modifying Configuration Settings

Change a specific key in the default configuration file:

```bash
qclient node config set <key> <value>
```

Supported keys include: `engine.statsMultiaddr`, `p2p.listenMultiaddr`, `listenGrpcMultiaddr`, `listenRestMultiaddr`.

### Switching Between Configurations

Switch which keyset the node uses:

```bash
# Switch to a specific keyset by name
qclient node config switch my-backup

# List all available keysets and select one interactively
qclient node config switch
```

**Important:** After switching configs, you must restart your node for the change to take effect.

### Assigning Rewards to a Configuration

Direct reward collection to a specific configuration:

```bash
qclient node config assign-rewards [config-name]
```

Example:

```bash
qclient node config assign-rewards my-config
```

---

## Prover Key Merge for Seniority

Quilibrium 2.0 introduced the concept of **prover seniority**, which determines precedence in joining prover rings. Seniority is a global-level value the network uses to resolve conflicts on enrollment attempts. If you operated nodes before version 1.4.19, you can combine older keys with your current keys to increase your seniority.

### Key Rules for Prover Merging

- You can only combine **one** set of keys from version 1.4.19+ with older keys.
- Seniority from older keys is **not** a pure summation -- overlapping ranges are not counted multiple times.
- Older keys can only be used for prover enrollment **once**. You cannot reuse them for multiple sets of 1.4.19+ keys.
- If you use multiple sets of keys from after 1.4.19, only one will count for post-1.4.19 seniority.

### Merging with qclient

Each bundle of keys and store files must live in separate folders. The 1.4.19+ config folder should be listed first:

```bash
qclient node prover merge ../node/.config ../node/.config1 ../node/.config2 ../node/.config3
```

To preview the resulting seniority without making permanent changes, append `--dry-run`:

```bash
qclient node prover merge ../node/.config ../node/.config1 ../node/.config2 --dry-run
```

**Important:** Restart your node after running the merge command.

### Merging via config.yml

Alternatively, you can specify enrollment paths directly in the `config.yml` file under the `engine` section:

```yaml
engine:
  multisigProverEnrollmentPaths: [
    "/path/to/.config1/",
    "/path/to/.config2/",
    "/path/to/.config3/"
  ]
```

---

## Key and Store Backup Best Practices

Losing your keyset files means losing access to all tokens and data associated with that identity. There is no recovery mechanism.

### What to Back Up

Your node's critical data lives in the `.config` directory (or `~/.quilibrium/configs/<keyset-name>/` for newer installations):

| File / Directory | Purpose | Priority |
|-----------------|---------|----------|
| `config.yml` | Node configuration and peer identity | **Critical** |
| `keys.yml` | Cryptographic keys for the node | **Critical** |
| `worker-store/[worker-id]/` | Worker proof data | **Important** |

If you used the `release_autorun.sh` script, your config directory is typically `ceremonyclient/node/.config`.

### Backup Recommendations

1. **Encrypt your backups.** Store `config.yml` and `keys.yml` in encrypted, offline storage (e.g., encrypted USB drive, hardware vault).
2. **Back up worker data regularly.** Worker data in `worker-store/` should be backed up on a regular schedule. If lost, the node can re-fetch data from shard peers, but you will miss rewards and may incur penalties during recovery.
3. **Test your backups.** Periodically verify that your backed-up keysets can be successfully imported and used.
4. **Use multiple backup locations.** Keep copies in separate physical locations to protect against hardware failure or disaster.
5. **Never store keys in plain text** on network-accessible storage, cloud drives, or version control systems.

### Restoring from Backup

To restore a keyset from backup on a new server:

```bash
# Copy backup files to the new server, then import
qclient node config import restored-keyset /path/to/backup/ --default
```

---

## Custody Models: Cold, Warm, and MPC

Quilibrium's RPC layer supports advanced custody strategies for managing keys and assets with varying security levels. These models are primarily relevant for institutional operators, exchanges, and advanced users.

### Cold Custody

Cold custody keeps key material in a secure, airgapped environment. The private key never touches an online system except when absolutely necessary. The recommended approach:

1. Generate keys offline. The account is an **implicit account** (type 0), where the address is the Poseidon hash of the public key.
2. As the initial signed operation, create an `AllowAccountRequest` that grants a warm/hot key read-only rights -- specifically, permission to call `ListPendingTransactions`. This lets a warm wallet monitor incoming transactions without exposing the cold key.
3. Monitor pending transactions from the RPC using the permitted warm key.
4. When the cold key needs to come online (e.g., to accept or reject a transaction, or to transfer assets), bring it online briefly, perform the operation, then return it to cold storage.

The goal is to minimize the time cold key material is exposed to any online environment. Any interaction with the online world transitions the key's classification to "warm" or "hot," making it unsuitable for long-term cold storage.

### Warm/Hot Custody

Warm and hot custody operations are more straightforward. The key is generated and used directly, with the Poseidon-hashed public key serving as the account address. Key considerations:

- Asset limits should be enforced -- do not store more value under a warm/hot key than you are comfortable having online.
- Use `GetBalance` and `ListCoins` RPCs for ongoing monitoring.
- Accept and reject pending transactions as part of normal operations.
- For live peer-to-peer transfers, use the `MutualReceive` / `MutualTransfer` flow.

### MPC (Multi-Party Computation) Custody

MPC custody distributes signing authority across multiple parties so that no single party holds the complete private key. Quilibrium supports MPC signing with the following signature types:

- **Ed448** (recommended)
- **Ed25519** (not recommended for new deployments)
- **BLS-48-581**

MPC custodial operations traditionally perform signatures entirely within the infrastructure of the custodian. However, if distributed signing is needed, Quilibrium's Key Management application can perform MPC signing over the network across two or more parties. The output key generated can then be used as an `ImplicitAccount` for standard network operations.

---

## ImplicitAccount vs OriginatedAccountRef

Quilibrium uses two types of account references:

### ImplicitAccount

An implicit account is **derived from a specific key**. The address is the Poseidon hash of the public key material. Implicit accounts do not need to be explicitly created on the network -- they exist by virtue of the key's existence. This is the standard model for cold custody operations and most user accounts.

Fields:
- `implicit_type`: 0 for default key-derived, 1 for WebAuthn-derived
- `address`: The Poseidon-hashed public key
- `domain`: Required only for type 1 (WebAuthn) accounts, specifying the validation scope

### OriginatedAccountRef

An originated account is **explicitly created as an entity on the network** and referenced by its on-chain address, like any other network entity. This model is used when an account needs to exist independently of a single key (e.g., multi-sig arrangements or contract-controlled accounts).

### When to Use Each

- **ImplicitAccount (type 0)**: Most users, node operators, cold custody keys. The account address is deterministically derived from the key -- no on-chain creation step needed.
- **ImplicitAccount (type 1)**: Browser-based authentication via WebAuthn/passkeys. Requires a domain for validation.
- **OriginatedAccountRef**: Advanced use cases where the account must exist as a separate on-chain entity.

---

## Key Configuration in config.yml

The `key` section of `config.yml` specifies how the node manages its key material:

```yaml
key:
  keyManagerType: file
  keyManagerFile:
    path: .config/keys.yml
    createIfMissing: false
    encryptionKey: <hex string without 0x prefix>
```

- `keyManagerType`: Currently only `file` is supported. Future versions will support in-memory, PKCS11, and RPC key managers.
- `path`: Location of the `keys.yml` file relative to the config directory.
- `createIfMissing`: If `true`, the node will recreate a missing key file.
- `encryptionKey`: Hexadecimal encryption key used to encrypt the key file at rest (without the `0x` prefix).

---

## Troubleshooting Common Key Issues

### "Key already exists"

This error occurs when you try to create or import a key with an alias that is already in use.

**Solution:** Choose a different alias name, or delete the existing key first (after backing it up):

```bash
qclient key list                    # Check existing key names
qclient key delete old_key_name     # Remove the conflicting key
qclient key create new_alias ed448  # Create with a new name
```

### "Invalid key format"

This error indicates the provided key bytes do not match the expected format for the specified key type.

**Solution:**
- Ensure key bytes are properly hex-encoded (prefixed with `0x`).
- Verify that the key type parameter matches the actual key data.
- Check that the hex string is complete and not truncated.

```bash
# Correct format: type matches the key data
qclient key import my_key ed448 0x<valid-ed448-hex-bytes>
```

### "Key not found"

The specified key alias does not exist in your keystore.

**Solution:**
- Check the key alias spelling (names are case-sensitive).
- List available keys to confirm the correct name:

```bash
qclient key list
```

### keys.yml Shows Only `null:`

After creating a new keyset with `node config create`, the `keys.yml` file contains only `null:`. This is **expected behavior**. The keys populate once the node connects to the network and obtains key information. Simply run the node or use a qclient command that interacts with the network.

### Cannot Switch Configs

If `qclient node config switch` does not work as expected:

- Verify the keyset name exists under `~/.quilibrium/configs/`.
- Remember that `default` is a reserved name and cannot be used.
- Always restart your node after switching: `qclient node service restart`.

---

## Security Best Practices

### Key Storage

- Keys are stored encrypted in your local keystore via the `encryptionKey` field in `config.yml`.
- Use a strong, randomly generated encryption key for keystore encryption.
- Regularly verify that your backups are restorable by testing imports on a separate machine.
- Store the encryption key separately from the encrypted key files.

### Key Separation

- Use different keys for different purposes: identity, encryption, signing, and inbox.
- Never reuse a single key across all operations.
- Use separate keysets for production nodes and testing environments.
- Quilibrium's account model is intentionally domain-bounded -- unlike traditional crypto wallets where a single key controls everything, Quilibrium encourages purpose-specific keys.

### Key Rotation

- Periodically rotate keys for enhanced security, especially signing and identity keys.
- Keep old encryption keys available for decrypting historical data.
- Update all references when rotating identity keys.
- When rotating prover keys, be aware of seniority implications.

### Never Share Private Keys

- Never share private key material with anyone.
- Never import keys from untrusted sources.
- Only share public keys when necessary.
- When using RPCs, understand that you are providing key material to the RPC endpoint. Only use RPCs you trust and control.

### RPC Security

When using the Node RPC for advanced key management and custody operations:

- Do not use an RPC server you do not control.
- Ensure that your connection to the RPC is secure and encrypted.
- Keep RPC interactions within secure trust boundaries to maintain account privacy.

---

## Frequently Asked Questions

**Q: What is the difference between `qclient key` commands and `qclient node config` commands?**
The `qclient node config` commands manage entire keysets (bundles of `config.yml` and `keys.yml` files) used by the node. The `qclient key` commands manage individual cryptographic keys within the keystore for specific operations like signing, encryption, and identity.

**Q: Do I need a running node to use my keys?**
No. The qclient embeds a light client that can construct network interactions without a full node. You can use `--public-rpc` to query the network via a public RPC endpoint without running your own node.

**Q: What happens if I lose my keys?**
If you lose your keyset files (`config.yml` and `keys.yml`) and have no backup, the tokens and data associated with that keyset are irrecoverable. There is no recovery mechanism. Always maintain secure, encrypted backups.

**Q: Can I move my keyset to a different server?**
Yes. Copy the keyset directory (or the `config.yml` and `keys.yml` files) to the new server, then use `qclient node config import` to bring them into qclient's managed structure.

**Q: Why does keys.yml show `null:` after creation?**
This is normal. The `keys.yml` file populates with actual key data only after the node connects to the network and obtains key information. Until then, it contains `null:`.

**Q: How do I know which keyset is currently active?**
Run `qclient node config switch` without a name -- it will list all available keysets and indicate which one is the current default.

**Q: Can multiple keysets be active simultaneously?**
No. Only one keyset can be the active default at a time. The node runs exclusively with the keyset linked as the default. Other keysets are stored but dormant.

**Q: What key types should I create for basic node operation?**
For basic node operation, the auto-generated keyset provides what you need. If you want to manage keys individually, an `ed448` key for identity/signing and a `decaf448` key for token operations are the most common starting points. Prover nodes will also need a `bls48581` key.

**Q: Can I use one key for multiple purposes?**
While technically possible for compatible key types, it is strongly discouraged. Quilibrium's security model is designed around purpose-specific keys. Using separate keys for separate operations reduces the blast radius if any single key is compromised.

**Q: How does prover seniority work after merging keys?**
After merging, the network calculates your combined seniority from the merged key history. Overlapping time ranges are not double-counted. The 1.4.19+ config must be listed first in the merge command. Use `--dry-run` to preview the resulting seniority before committing.

**Q: What custody model should I use?**
For most individual node operators, standard warm custody (direct key usage) is sufficient. Cold custody is recommended for high-value accounts or institutional operations. MPC custody is for organizations requiring distributed signing authority across multiple parties.

*Last updated: 2026-02-24T12:00:00*
