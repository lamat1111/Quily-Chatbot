---
title: "qclient Configuration & Commands — Setup, Aliases, and Config Management"
source: official_docs_synthesis
date: 2026-02-24
type: technical_reference
topics:
  - qclient
  - configuration
  - commands
  - aliases
  - global flags
  - config management
  - RPC settings
  - node connection
  - hypergraph commands
  - compute commands
  - deploy commands
  - messaging commands
---

# qclient Configuration and Commands Overview

## What Is qclient?

qclient is the official command-line interface (CLI) application for interacting with the Quilibrium network. It provides a unified toolset for managing tokens, running and configuring nodes, deploying applications, bridging tokens to other networks, and handling cryptographic keys. Whether you are a node operator, a developer, or simply holding QUIL tokens, qclient is the primary way to interact with Quilibrium from a terminal.

The general syntax for every qclient command is:

```bash
qclient [command] [subcommand] [options/flags]
```

For example, to check your token balance using the public RPC:

```bash
qclient token balance --public-rpc
```

---

## Installing qclient

There are two supported installation methods.

### Scripted Installation (Recommended)

The scripted installer downloads the binary, places it in the standard directory, and creates a symlink so `qclient` is available system-wide. It requires `sudo`:

```bash
curl -sSL https://raw.githubusercontent.com/QuilibriumNetwork/ceremonyclient/refs/heads/develop/install-qclient.sh | sudo bash
```

Binaries are installed to `/var/quilibrium/bin/qclient/<version>/`.

### Manual Installation

1. Check the latest release filenames at `https://releases.quilibrium.com/qclient-release`.
2. Download the files matching your OS (Linux or Darwin) and architecture (amd64 or arm64) from `https://releases.quilibrium.com/<filename>`.
3. Make the binary executable: `chmod +x <filename>`.
4. Place binaries in `/var/quilibrium/bin/qclient/<version>/` to match the standard layout.

After installation, future updates are handled with `qclient update`.

### Creating the System Symlink

If you installed manually, run the `link` command to create a system-wide symlink so you can simply type `qclient` instead of the full binary path:

```bash
sudo /path/to/qclient-<version>-<os>-<arch> link
```

This creates a symlink at `/usr/local/bin/qclient` pointing to your binary.

---

## First-Time Setup and Configuration Files

When you run any qclient command for the first time, it automatically creates a default configuration and key file. Configuration is stored at:

```
~/.quilibrium/
```

The qclient-specific settings (RPC preferences, aliases, signature check settings) live in:

```
~/.quilibrium/qclient-config.yml
```

Node configurations are stored under `~/.quilibrium/configs/`.

If your configuration directory is elsewhere, use the `--config` flag to specify its location:

```bash
qclient token balance --config ~/my-custom-config/
```

> **Migration note:** Prior to qclient 2.1, the default config was created in a `.config` directory relative to where you ran the command. Current versions use `~/.quilibrium/configs/`. It is recommended to import old configs into the new structure for maximum compatibility.

To create a fresh default config file explicitly:

```bash
qclient config create-default
```

To view your current configuration:

```bash
qclient config print
```

---

## Managing Node Configurations

qclient supports multiple named configuration sets for your node. This is useful when operating multiple nodes or switching between different network environments.

### Creating a New Node Config

```bash
qclient node config create <Name> [--default|-d]
```

The `--default` flag assigns the new config as the active one for the node. Note: the name `default` is reserved and cannot be used.

### Importing an Existing Config

If you have config files from a previous installation or another directory:

```bash
qclient node config import <Name> <SourceDirectory> [--default|-d]
```

### Switching Between Configs

```bash
qclient node config switch <Name>
```

If no name is provided, qclient lists all available configurations and lets you choose.

### Modifying Config Values

```bash
qclient node config set <Key> <Value>
```

Supported keys include `engine.statsMultiaddr`, `p2p.listenMultiaddr`, `listenGrpcMultiaddr`, and `listenRestMultiaddr`.

### Assigning Reward Collection

```bash
qclient node config assign-rewards <config-name>
```

---

## Connecting to the Network — RPC Configuration

qclient can connect to the Quilibrium network in two ways: via a local node or via a remote RPC endpoint (called "light client" mode).

### Using the Public RPC (Light Client)

To temporarily use the public RPC for a single command, add the `--public-rpc` flag:

```bash
qclient token balance --public-rpc
```

To permanently enable public RPC usage:

```bash
qclient config public-rpc true
```

To disable it and revert to local node:

```bash
qclient config public-rpc false
```

The default public RPC endpoint is `rpc.quilibrium.com:8337`.

### Setting a Custom RPC Endpoint

You can point qclient to a third-party RPC or your own remote node:

```bash
qclient config set-custom-rpc my-rpc.example.com:8337
```

The endpoint must be specified as `host:port` without an `http://` or `https://` prefix.

To clear the custom RPC and revert to the default public RPC:

```bash
qclient config set-custom-rpc clear
```

Once a custom RPC is set, any command using `--public-rpc` will route through the custom endpoint instead of the default.

---

## Alias Commands — Address Shortcuts

Aliases let you create human-readable shortcuts for commonly used account addresses. This avoids repeatedly typing long hex addresses and reduces the risk of input errors.

Aliases are stored locally in `~/.quilibrium/qclient-config.yml`. They are not backed up or shared with the network.

### Adding an Alias

```bash
qclient config alias add <alias-name> <address>
```

The `create` subcommand is synonymous with `add`:

```bash
qclient config alias create <alias-name> <address>
```

### Using an Alias in Token Commands

After creating an alias, reference it in token commands with the `--alias` flag:

```bash
# Create an alias
qclient config alias add mywallet 0x1234565abcdefg

# Transfer using the alias
qclient token transfer --to mywallet --coin 0xsome21334token --alias
```

**Important:** You must include the `--alias` flag. Token operations do not resolve aliases by default, so that users who type raw addresses are not affected by alias collisions.

### Updating an Alias

```bash
qclient config alias update <alias-name> <new-address>
```

### Deleting an Alias

```bash
qclient config alias delete <alias-name>
```

### Listing All Aliases

```bash
qclient config alias list
```

This also returns addresses for any local node accounts that have been imported into qclient.

---

## Global Flags Reference

These flags can be appended to any qclient command to override defaults for that invocation.

| Flag | Description |
|------|-------------|
| `--public-rpc=<true\|false>` | Force or disable use of the public/custom RPC endpoint |
| `--config <Path>` | Specify a custom configuration directory |
| `--signature-check=<true\|false>` | Override signature verification for this command |
| `--dry-run` | Preview the operation and estimate costs without executing |
| `--interactive=<true\|false>` | Switch to interactive mode where arguments are prompted (avoids secrets in shell history) |

### Flag Precedence

When multiple configuration sources conflict, the resolution order is:

1. Command-line flags (highest priority)
2. Environment variables
3. Config file specified with `--config`
4. Default configuration file
5. Built-in defaults (lowest priority)

### Environment Variables

Global flags can also be set as environment variables:

```bash
export QCLIENT_PUBLIC_RPC=true
export QCLIENT_CONFIG=/path/to/config/
export QCLIENT_SIGNATURE_CHECK=false
```

---

## Signature Verification

By default, qclient verifies binary signatures when updating. After a fresh download, you may not yet have signature files.

**Download signatures:**

```bash
qclient download-signatures
```

**Bypass signature check for a single command:**

```bash
qclient update --signature-check=false
```

**Disable signature checks persistently:**

```bash
qclient config signature-check disable
```

**Re-enable signature checks:**

```bash
qclient config signature-check enable
```

> Disabling signature verification is not recommended for production environments, as it means downloaded binaries are not validated against known-good signatures.

---

## General Utility Commands

### Check Version

```bash
qclient version
qclient version --checksum   # also shows binary checksum
```

### Update qclient

```bash
qclient update
qclient update <Version>   # update to a specific version
```

### Link to a Node

```bash
qclient link
```

Connects qclient to a specific node or service so subsequent commands do not need to specify connection details.

---

## Common Workflows and Tips

**Check your balance without running a node:**

```bash
qclient token balance --public-rpc
```

**Preview a transfer before executing it:**

```bash
qclient token transfer 0xrecipient 10.0 --dry-run --public-rpc=true
```

**Set up aliases for frequent recipients:**

```bash
qclient config alias add alice 0xalice_address_here
qclient config alias add bob 0xbob_address_here
qclient token transfer --to alice --coin 0xcoinaddr --alias
```

**Switch between node configurations:**

```bash
qclient node config switch testnet-config
```

**Secure your config file permissions:**

```bash
chmod 600 ~/.quilibrium/qclient-config.yml
```

---

## Hypergraph Commands

qclient provides commands for interacting with the Quilibrium hypergraph data structure, allowing you to store and retrieve vertices and hyperedges.

### Get Vertex

Retrieve vertex data from the hypergraph by its full address, with optional decryption:

```bash
qclient hypergraph get vertex <FullAddress> [<EncryptionKeyBytes>]
```

### Put Vertex

Create or update a vertex with property values, optional domain scoping, and optional encryption:

```bash
qclient hypergraph put [--domain|-d <DomainAddress>] vertex [<PropertyName>=<PropertyValue>] [<EncryptionKeyBytes>]
```

### Get Hyperedge

Retrieve hyperedge data from the hypergraph by its full address, with optional decryption:

```bash
qclient hypergraph get hyperedge <FullAddress> [<EncryptionKeyBytes>]
```

### Put Hyperedge

Create or update a hyperedge that connects vertices, with optional domain scoping and encryption:

```bash
qclient hypergraph put [--domain|-d <DomainAddress>] hyperedge <FullAddress> [<AtomAddress>, ...] [<EncryptionKeyBytes>]
```

---

## Compute Commands

qclient supports executing computations on the Quilibrium network with optional multi-party coordination.

### Execute

Run a computation at a given address, optionally specifying a rendezvous point, party ID, and key-value arguments:

```bash
qclient compute execute <FullAddress> [<Rendezvous>] [<PartyId>] [<ArgumentKey>=<ArgumentValue>]
```

---

## Deploy Commands

Deploy commands let you publish applications, files, tokens, and hypergraph schemas to the Quilibrium network.

### Deploy Compute

Deploy a QCL (Quilibrium Computation Language) application with an optional RDF schema:

```bash
qclient deploy compute [--domain|-d <DomainAddress>] <QCLFileName> [<RDFFileName>]
```

### Deploy File

Deploy a file to the hypergraph, with optional domain scoping and encryption:

```bash
qclient deploy file [--domain|-d <DomainAddress>] <FileName> [<EncryptionKeyBytes>]
```

### Deploy Token

Deploy a custom token with configurable properties:

```bash
qclient deploy token [<ConfigurationKey>=<ConfigurationValue> ...]
```

### Deploy Hypergraph

Deploy hypergraph schemas and configurations, with an optional RDF file:

```bash
qclient deploy hypergraph [<ConfigurationKey>=<ConfigurationValue> ...] [<RDFFileName>]
```

---

## Messaging Commands

qclient includes encrypted messaging capabilities through inbox-based communication.

### Retrieve Messages

Retrieve messages for a specified inbox or all inboxes:

```bash
qclient message retrieve [<InboxKeyName>]
```

### Send Message

Send an encrypted message to a recipient's inbox:

```bash
qclient message send <InboxKeyName> <RecipientInboxKeyAddress> <Message>
```

### List Messages

Display stored messages for a specified inbox:

```bash
qclient message list <InboxKeyName>
```

### Delete Message

Remove a message from local storage:

```bash
qclient message delete <InboxKeyName> <MessageId>
```

---

## Frequently Asked Questions

**Where is my qclient config file?**
The default location is `~/.quilibrium/qclient-config.yml`. Node configs are under `~/.quilibrium/configs/`. If you migrated from pre-2.1, your old config may still be in a `.config` folder where you first ran qclient.

**Can I use qclient without running a node?**
Yes. Enable public RPC mode with `qclient config public-rpc true` or add `--public-rpc` to individual commands. This is called "light client" mode.

**How do I use aliases in transfers?**
First create the alias with `qclient config alias add <name> <address>`, then use `--to <name> --alias` in your token transfer command.

**What does `--dry-run` do?**
It previews the operation (including estimated fees) without executing it. Supported by deploy commands, token operations, node config changes, and key operations.

**How do I update qclient?**
Run `qclient update`. For a specific version, run `qclient update <version>`. Use `--signature-check=true` for verified updates.

**Can I manage multiple node configurations?**
Yes. Use `qclient node config create <Name>` to create named configs, and `qclient node config switch <Name>` to switch between them.

*Last updated: 2026-02-24T12:00:00*
