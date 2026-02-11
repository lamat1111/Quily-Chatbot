---
title: "Quilibrium Node Maintenance — Updates, Cleanup, Checksums & Account Aliases"
source: official_docs_synthesis
date: 2026-02-11
type: technical_reference
topics:
  - node maintenance
  - auto-update
  - manual update
  - clean command
  - checksum verification
  - account aliases
  - advanced node management
  - node operations
---

# Quilibrium Node Maintenance Guide

This guide covers the full lifecycle of maintaining a Quilibrium node after initial installation: updating node binaries, enabling automatic updates, verifying checksums, cleaning up disk space, managing node services, using account aliases, and advanced cluster management.

## Updating Node Binaries

Node updates deliver new features, consensus changes, and security patches. Updates can be performed manually or through automatic scheduling. After updating, the node service must be restarted for the new binary to take effect.

### Manual Update

To manually check for and download the latest node binary:

```bash
qclient node update
```

After the update completes, restart the node service so the new version takes effect:

```bash
qclient node service restart
```

These two steps can be combined into a single command using the `--restart` flag. If the update fails for any reason, the restart will not occur, preventing the node from going down:

```bash
qclient node update --restart
```

### Installing a Specific Version

In rare cases you may need to install a particular version rather than the latest. This is useful for optional updates or when troubleshooting version-specific issues:

```bash
sudo qclient node install "2.1.0"
```

Node binaries are installed to `/var/quilibrium/bin/node/<version>/` and a symlink at `/usr/local/bin/quilibrium-node` points to the active version.

## Auto-Update System

QClient includes a built-in auto-update mechanism that uses a cron scheduled task to check for new versions at regular intervals. By default, the cron task runs every 10 minutes and executes `qclient node update --restart` automatically.

### Enabling Auto-Updates

To enable the auto-update cron task:

```bash
qclient node auto-update enable
```

If your operating system does not already have `cron` installed, the enable command will install it for you.

### Disabling Auto-Updates

To remove the auto-update cron task:

```bash
qclient node auto-update disable
```

### How Auto-Updates Work

When enabled, the cron task performs the equivalent of `qclient node update --restart` every 10 minutes. This means:

1. The cron job checks whether a newer node binary is available.
2. If a newer version exists, it downloads and installs it.
3. The node service is automatically restarted only if the update succeeds.
4. If no update is available, nothing happens and the node continues running.

Auto-updates are recommended for most operators because they ensure the node stays current with consensus-critical changes without manual intervention.

## Checksum Verification

To verify the integrity of your installed QClient binary, you can retrieve its checksum. This is useful for confirming that the binary has not been tampered with or corrupted during download:

```bash
qclient version --checksum
```

Or using the short flag:

```bash
qclient version -c
```

Compare the output against the official checksums published with each release to confirm binary authenticity.

## Cleaning Your Node Server

Over time, old node binaries and log files accumulate on disk. QClient provides a built-in cleaning tool to reclaim space. Log rotation is installed by default during node setup, so logs should not grow excessively, but the clean command handles cleanup explicitly when needed.

### Clean Everything

Remove both old node versions and log files in a single command:

```bash
qclient node clean --all
```

### Clean Only Old Node Versions

Remove outdated node binaries while keeping logs intact:

```bash
qclient node clean --node
```

This command preserves the currently installed version. It only removes previous versions that are no longer in use. To remove even the current version (for a full uninstall), use `qclient node uninstall` instead.

### Clean Only Logs

Remove accumulated log files without touching node binaries:

```bash
qclient node clean --logs
```

## Node Service Management

QClient wraps the operating system's native service manager for convenience. On macOS it uses Launchd; on Linux it uses Systemd. QClient detects the OS automatically and issues the appropriate commands.

### Service Commands Reference

| Command | Description |
|---------|-------------|
| `qclient node service start` | Start the node |
| `qclient node service stop` | Gracefully stop the node |
| `qclient node service restart` | Restart the node |
| `qclient node service status` | Check the current status of the node |
| `qclient node service reload` | Reload after config changes (rarely needed) |
| `qclient node service enable` | Enable automatic start on server reboot |
| `qclient node service disable` | Disable automatic start on server reboot |
| `qclient node service update` | Update the service file to the latest version |
| `qclient node service uninstall` | Remove the service installation |

When new versions of QClient are released, the service file itself may be updated for optimization. The service file is not replaced automatically during node updates. Run `qclient node service update` to apply the latest service file if recommended in release notes.

## Account Aliases

Account aliases are a local convenience feature that lets you save frequently used Quilibrium account addresses under short, memorable names. Instead of typing a full address like `0xabcdefg12345hijk`, you can reference it as a simple name like `john-doe`.

### Important Characteristics

- Aliases are stored locally in `~/.quilibrium/qclient-config.yml`.
- Aliases are not backed up automatically. You must manage backups yourself.
- Aliases cannot be referenced by other users or nodes.
- The `--alias` flag must be included in token commands to trigger alias lookup.

### Alias Commands

| Command | Description |
|---------|-------------|
| `qclient config alias add <alias> <address>` | Create a new alias |
| `qclient config alias create <alias> <address>` | Synonym for `add` |
| `qclient config alias update <alias> <new-address>` | Update an existing alias to a new address |
| `qclient config alias delete <alias>` | Remove an alias |
| `qclient config alias list` | List all aliases and their addresses |

The `list` command also returns account addresses for local node accounts that have been imported.

### Using Aliases in Token Operations

After creating an alias:

```bash
qclient config alias add example 0x1234565abcdefg
```

You can use it in token transfer commands by including the `--alias` flag:

```bash
qclient token transfer --to example --coin 0xsome21334token --alias
```

Without the `--alias` flag, QClient treats the value as a literal address. This design allows operators to input addresses manually without aliases interfering.

## Advanced Node Management

### Running a Node in a Cluster

Quilibrium supports clustering, where multiple servers work together. In a cluster, a control process coordinates with dataworker processes that may run on separate machines.

### Firewall Configuration for Clusters

When a dataworker-only server sits behind a firewall, the control process communicates with it via gRPC. The firewall must allow inbound connections from the control process server IP on the dataworker's gRPC port.

Key networking rules for clustered setups:

- The default gRPC port starting index is **40000**, incremented for each dataworker on the server.
- The firewall should only accept connections from the control process's IP address, not the public internet.
- If the server is on a private network with no public exposure, the firewall is optional.

| Port | Description | Required |
|------|-------------|----------|
| 40XXX | gRPC traffic between the dataworker and control process | Yes, if server is behind a firewall |

## 2.1 Upgrade Guide

The 2.1 upgrade introduced significant changes to networking, storage, and worker configuration. This section summarizes what operators need to know.

### Default Configuration Changes

**Worker ports**: Workers must now have their ports opened externally. The `dataWorkerBaseListenMultiaddr` value of `/ip4/127.0.0.1/tcp/%d` is automatically replaced with `/ip4/0.0.0.0/tcp/%d` after the 2.1 cutoff frame. Two new port bases were introduced:

- `dataWorkerBaseP2PPort` — default **50000**
- `dataWorkerBaseStreamPort` — default **60000**

For a node with four workers, you must open ports: 50000-50003 and 60000-60003.

**Master node**: A new mandatory port is `streamListenMultiaddr` in the P2P section, defaulting to `/ip4/0.0.0.0/tcp/8340`. If the node fails its reachability test, it will halt and inform you.

### Advanced 2.1 Configuration

For operators with manual `dataWorkerMultiaddrs` settings: these values are ignored after the 2.1 cutoff frame. Replace them with `dataWorkerP2PMultiaddrs` and `dataWorkerStreamMultiaddrs`. Choose different port values from your old `dataWorkerMultiaddrs` since the old ports should not be publicly exposed while the new ports must be.

### Storage Changes in 2.1

- Workers now maintain their own store paths via `workerPathPrefix` (default: `.config/worker-store/%d`).
- Storage threshold triggers emit log events at configurable utilization percentages: `noticePercentage` (70%), `warnPercentage` (90%), `terminatePercentage` (95%). The node terminates if the threshold is reached to prevent an irreconcilable state.

### Rewards and Strategy Options

| Setting | Default | Description |
|---------|---------|-------------|
| `rewardStrategy` | `"reward-greedy"` | Optimizes for rewards. Use `"data-greedy"` for pure data redundancy |
| `dataWorkerFilters` | Auto-selected | Override specific bitmask filters for workers |
| `archiveMode` | `false` | Retain all historic frame data (useful for explorers) |
| `delegateAddress` | Derived from prover key | Override reward target address (hex format, no `0x` prefix) |
| `enableMasterProxy` | `false` | Proxy worker traffic through the master (only for small local clusters) |

## Frequently Asked Questions

### How often should I update my node?

Enable auto-updates for the most reliable approach. Auto-updates check every 10 minutes and only restart when a genuine update is available. If you prefer manual control, check for updates at least daily, especially around announced protocol upgrades.

### Will auto-update cause downtime?

The node restarts briefly when an update is applied. The restart only occurs after a successful download and install, so failed updates do not cause unnecessary downtime.

### How do I verify my node binary is authentic?

Run `qclient version --checksum` and compare the output against official release checksums published by the Quilibrium team.

### How much disk space do old node versions use?

This varies by the number of accumulated versions. Run `qclient node clean --node` periodically to remove old binaries while keeping the current version. Use `qclient node clean --all` to also clear logs.

### What happens if I lose my account aliases?

Aliases are stored locally in `~/.quilibrium/qclient-config.yml` and are not backed up automatically. If lost, you must recreate them manually. Back up this file as part of your regular backup strategy.

### Do I need to open extra ports for 2.1?

Yes. Workers need P2P ports (default starting at 50000) and stream ports (default starting at 60000) opened. The master node needs port 8340 opened. Failure to open these ports will cause the node to halt after its reachability test.

### Can I downgrade my node to a previous version?

Generally, upgrades are forwards-only. However, you can install a specific older version with `sudo qclient node install "<version>"` for situations where an optional update needs to be reverted.

*Last updated: 2026-02-11T15:00:00*
