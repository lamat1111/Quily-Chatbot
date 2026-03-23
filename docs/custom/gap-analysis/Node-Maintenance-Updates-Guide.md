---
title: "Quilibrium Node Maintenance — Updates, Monitoring, Configuration & Troubleshooting"
source: official_docs_synthesis
date: 2026-02-24
type: technical_reference
topics:
  - node maintenance
  - node updates
  - update script
  - automatic updates
  - cron
  - manual update
  - checksum verification
  - worker management
  - storage thresholds
  - port configuration
  - port range change
  - config management
  - logging
  - backup
  - systemd
  - launchd
  - troubleshooting
  - 2.1 upgrade
---

# Quilibrium Node Maintenance Guide

This guide covers the full lifecycle of maintaining a Quilibrium node after initial installation: updating node binaries, managing services, configuring workers, storage, ports, logging, backups, and troubleshooting common issues. It consolidates information from the Linux and macOS manual install guides, the advanced configuration reference, the 2.1 upgrade guide, and the port range change guide into a single operations reference.

---

## Overview of Node Maintenance Tasks

Running a Quilibrium node requires ongoing operational attention. The core maintenance tasks are:

- **Updating the node binary** to stay current with consensus-critical changes.
- **Managing the service** (starting, stopping, restarting, checking logs).
- **Configuring worker count** to match your hardware resources.
- **Monitoring storage** to avoid threshold-triggered termination.
- **Managing ports and firewall rules** to keep the node reachable.
- **Configuring logging** for debugging and disk management.
- **Backing up critical files** (keys, config, worker data).
- **Upgrading to new major versions** (e.g., 2.1) with configuration changes.
- **Managing prover operations** (status, pause, leave, delegate).

---

## Updating the Node Binary

Node updates deliver new features, consensus changes, and security patches. There are multiple methods to update: the update script, automatic cron scheduling, manual download, and the qclient self-update command.

### Using the Update Script (qnode-update.sh)

The recommended update method is the platform-specific update script. On Linux it is `qnode-update.sh`; on macOS it is `qnode-update-macos.sh`. Both are stored at `/opt/quilibrium/node/qnode-update.sh` after initial install.

Run the update script manually at any time:

```bash
# Linux
sudo /opt/quilibrium/node/qnode-update.sh

# macOS
sudo /opt/quilibrium/node/qnode-update.sh
```

The script performs these steps in order:

1. **Detects your platform** — `linux-amd64`, `linux-arm64`, or `darwin-arm64`.
2. **Queries the release server** for the latest version.
3. **Compares** the latest version against your currently installed version.
4. **Downloads the binary, digest, and all signature files** (up to 17 `.dgst.sig.*` files), skipping any files already present.
5. **Stops the service** (systemctl stop on Linux, launchctl unload on macOS).
6. **Updates the symlink** at `/opt/quilibrium/node/quilibrium-node` to point to the new binary.
7. **Restarts the service** (systemctl start on Linux, launchctl load on macOS).

If you are already on the latest version with all files present, the script exits with no changes and no service disruption.

### Automatic Updates via Cron

You can schedule the update script to run automatically using cron. This is the recommended approach for hands-off operation.

**Linux — check every hour:**

```bash
sudo crontab -e
```

Add the following line:

```
0 * * * * /opt/quilibrium/node/qnode-update.sh >> /var/log/qnode-update.log 2>&1
```

**macOS — check every hour:**

```bash
sudo crontab -e
```

Add the following line:

```
0 * * * * /opt/quilibrium/node/qnode-update.sh >> /opt/quilibrium/node/qnode-update.log 2>&1
```

If no update is available, the script exits quietly. If a new version is found, it downloads the binary, restarts the service, and logs the result.

To check the update log:

```bash
# Linux
tail -50 /var/log/qnode-update.log

# macOS
tail -50 /opt/quilibrium/node/qnode-update.log
```

**Cron schedule examples:**

| Schedule Expression | Frequency |
|---|---|
| `0 * * * *` | Every hour (at the top of the hour) |
| `0 */6 * * *` | Every 6 hours |
| `0 3 * * *` | Once daily at 3:00 AM |
| `*/10 * * * *` | Every 10 minutes |

### Manual Update Procedure

When you prefer full control over the update process:

**Linux (systemd):**

1. Stop the node:

```bash
systemctl stop quilibrium-node
```

2. Download the new binary and signature files (replace `<new-version>` with the actual version, e.g., `2.1.0.18`):

```bash
cd /opt/quilibrium/node
wget https://releases.quilibrium.com/node-<new-version>-linux-amd64
wget https://releases.quilibrium.com/node-<new-version>-linux-amd64.dgst
for i in $(seq 1 17); do
  wget https://releases.quilibrium.com/node-<new-version>-linux-amd64.dgst.sig.$i 2>/dev/null
done
chmod +x node-<new-version>-linux-amd64
```

3. Update the symlink:

```bash
ln -sf /opt/quilibrium/node/node-<new-version>-linux-amd64 /opt/quilibrium/node/quilibrium-node
```

4. Start the node:

```bash
systemctl start quilibrium-node
```

**macOS (launchd):**

1. Unload the service:

```bash
sudo launchctl unload /Library/LaunchDaemons/com.quilibrium.node.plist
```

2. Download the new binary:

```bash
cd /opt/quilibrium/node
sudo curl -LO https://releases.quilibrium.com/node-<new-version>-darwin-arm64
sudo curl -LO https://releases.quilibrium.com/node-<new-version>-darwin-arm64.dgst
for i in $(seq 1 17); do
  sudo curl -LO https://releases.quilibrium.com/node-<new-version>-darwin-arm64.dgst.sig.$i 2>/dev/null
done
sudo chmod +x node-<new-version>-darwin-arm64
```

3. Update the symlink:

```bash
sudo ln -sf /opt/quilibrium/node/node-<new-version>-darwin-arm64 /opt/quilibrium/node/quilibrium-node
```

4. Reload the service:

```bash
sudo launchctl load /Library/LaunchDaemons/com.quilibrium.node.plist
```

No service file edits are needed on either platform because the symlink always points to the active binary.

### QClient Self-Update

The qclient binary can update itself independently of the node binary:

```bash
qclient update
```

To update to a specific version:

```bash
qclient update 2.1.0
```

To download signature files for the current or a specific version:

```bash
qclient download-signatures
qclient download-signatures --version 2.1.0
```

The `--signature-check` flag can be used to control signature verification during updates:

```bash
qclient update --signature-check=true
```

---

## Checksum Verification

To verify the integrity of your installed qclient binary, retrieve its checksum and compare it against official release checksums:

```bash
qclient version --checksum
```

Or using the short flag:

```bash
qclient version -c
```

Compare the output against the official checksums published with each release to confirm the binary has not been tampered with or corrupted during download.

The node binary also ships with up to 17 signature files (`.dgst.sig.1` through `.dgst.sig.17`) from different signers. Not all signature numbers may be present for a given release. All downloaded signatures must be in the same directory as the binary for verification to succeed.

---

## Service Management

### Linux (systemd)

The node runs as a systemd service named `quilibrium-node`. The service file is located at `/lib/systemd/system/quilibrium-node.service`.

| Action | Command |
|--------|---------|
| Start node | `systemctl start quilibrium-node` |
| Stop node | `systemctl stop quilibrium-node` |
| Restart node | `systemctl restart quilibrium-node` |
| Check status | `systemctl status quilibrium-node` |
| Enable auto-start on boot | `systemctl enable quilibrium-node` |
| Disable auto-start on boot | `systemctl disable quilibrium-node` |
| Reload service after config change | `systemctl daemon-reload` |
| Follow logs (live) | `journalctl -u quilibrium-node -f --no-hostname -o cat` |
| Check version in logs | `journalctl -u quilibrium-node -r --no-hostname -n 1 -g "Quilibrium Node" -o cat` |

The systemd service file sends `SIGINT` to the node process via `KillSignal=SIGINT`, allowing graceful shutdown. `RestartSec=5s` and `Restart=always` ensure the node automatically recovers from crashes.

### macOS (launchd)

The node runs as a launchd daemon. The plist file is located at `/Library/LaunchDaemons/com.quilibrium.node.plist`.

| Action | Command |
|--------|---------|
| Start/load node | `sudo launchctl load /Library/LaunchDaemons/com.quilibrium.node.plist` |
| Stop/unload node | `sudo launchctl unload /Library/LaunchDaemons/com.quilibrium.node.plist` |
| Check status | `sudo launchctl list \| grep quilibrium` |
| Follow stdout logs | `tail -f /opt/quilibrium/node/node.log` |
| Follow error logs | `tail -f /opt/quilibrium/node/node-error.log` |

The launchd configuration includes `RunAtLoad` (start on boot) and `KeepAlive` (restart on exit).

---

## Worker Management

### What Is a Worker?

The node spawns worker processes to perform computations and generate proofs. By default, the node creates one worker per available CPU thread. Each worker requires its own dedicated allocation of CPU, RAM, and storage.

### The 1:2:4 Golden Ratio

The recommended resource allocation per worker is:

| Resource | Per Worker |
|----------|------------|
| CPU | 1 thread |
| RAM | 2 GB |
| Storage | 4 GB SSD |

This **1 thread : 2 GB RAM : 4 GB storage** ratio is the balanced allocation for Quilibrium v2.1 and beyond. Your most constrained resource determines how many workers your node can run.

### Calculating Your Worker Count

Divide each resource by its per-worker requirement and take the lowest result.

Example with 16 threads, 24 GB RAM, 100 GB SSD:

| Resource | Available | Per Worker | Max Workers |
|---|---|---|---|
| CPU | 16 threads | 1 thread | 16 |
| RAM | 24 GB | 2 GB | 12 |
| Storage | 100 GB SSD | 4 GB | 25 |

RAM is the bottleneck, so this node should run **12 workers**.

### Setting Worker Count in config.yml

If the default (one worker per thread) exceeds what your hardware can support, manually limit the worker count:

```yaml
engine:
  dataWorkerCount: 12
```

The config file is located at `.config/config.yml` relative to the node's working directory (typically `/opt/quilibrium/node/.config/config.yml`). Restart the node after changing this value.

### Checking Running Workers

To count the number of currently running worker processes:

```bash
ps aux | grep "\-\-core" | grep -v grep | wc -l
```

Worker processes are launched with a `--core` flag, so this command counts them accurately. You can also check during startup via the node logs, which report how many workers are being spawned.

---

## Storage Management

### Storage Threshold Triggers

The node monitors disk utilization for the partitions where the stores reside and emits log events at configurable thresholds. If the final threshold is reached, the node terminates to prevent an irreconcilable state.

| Threshold | Default | Behavior |
|---|---|---|
| `noticePercentage` | 70% | Emits a notice-level log event |
| `warnPercentage` | 90% | Emits a warning-level log event |
| `terminatePercentage` | 95% | Terminates the node process |

These values are set in the `db` section of `config.yml`:

```yaml
db:
  path: ".config/store"
  workerPathPrefix: ".config/worker-store/%d"
  noticePercentage: 70
  warnPercentage: 90
  terminatePercentage: 95
```

You can override these values, but doing so is not recommended unless you understand the risk of running with very high disk utilization.

### Worker Store Paths

Workers maintain their own store paths. The default format string is `.config/worker-store/%d`, where `%d` is replaced with the worker core ID. To manually override individual worker store directories, use `workerPaths`:

```yaml
db:
  workerPaths:
    - "/mnt/ssd1/worker-store/0"
    - "/mnt/ssd2/worker-store/1"
```

---

## Port Configuration

### Default Ports

| Port Range | Protocol | Purpose | Notes |
|---|---|---|---|
| 8336 | QUIC/UDP or TCP | Master process p2p communication | |
| 8340 | TCP | Master process streaming communication | Required since 2.1 |
| 25000-25000+N | QUIC/UDP or TCP | Worker processes p2p communication | 1 port per worker, starting from base |
| 32500-32500+N | TCP | Worker processes streaming communication | 1 port per worker, starting from base |

For example, a node with 4 workers needs ports: 8336, 8340, 25000-25003, and 32500-32503.

### Port Range Change (v2.1.0.19)

Starting with version 2.1.0.19, the default worker port ranges changed:

| Setting | Old Default | New Default |
|---|---|---|
| `dataWorkerBaseP2PPort` | 50000 | 25000 |
| `dataWorkerBaseStreamPort` | 60000 | 32500 |

**Why the change:** The `50000-60000` range overlaps with the default ephemeral (dynamic) port range on all major operating systems:

| OS | Default Ephemeral Range |
|---|---|
| Linux | 32768-60999 |
| macOS | 49152-65535 |
| Windows | 49152-65535 |

When the OS assigns outbound connections from the ephemeral range, it can conflict with the node's listening ports, causing intermittent connectivity failures. The new defaults (`25000` / `32500`) sit below the ephemeral range on all platforms.

**Who is affected:**

- **Config created before 2.1.0** (no explicit port entries): The node automatically picks up the new defaults. You must update your firewall rules to allow the new port ranges.
- **Config generated at 2.1.0** (explicit `50000`/`60000` entries): The node continues using those values. You may still experience intermittent connectivity. Consider migrating to the new range.

### Firewall Commands

**Adopting the new port range with `ufw` (4 workers example):**

```bash
# Remove old worker port rules (if applicable)
ufw delete allow 50000:50003/tcp
ufw delete allow 50000:50003/udp
ufw delete allow 60000:60003/tcp

# Add new worker port rules
ufw allow 25000:25003/tcp
ufw allow 25000:25003/udp
ufw allow 32500:32503/tcp

# Master ports
ufw allow 8336/tcp
ufw allow 8336/udp
ufw allow 8340/tcp
```

**Using `iptables` (4 workers example):**

```bash
# Remove old worker port rules (if applicable)
iptables -D INPUT -p tcp --dport 50000:50003 -j ACCEPT
iptables -D INPUT -p udp --dport 50000:50003 -j ACCEPT
iptables -D INPUT -p tcp --dport 60000:60003 -j ACCEPT

# Add new worker port rules
iptables -A INPUT -p tcp --dport 25000:25003 -j ACCEPT
iptables -A INPUT -p udp --dport 25000:25003 -j ACCEPT
iptables -A INPUT -p tcp --dport 32500:32503 -j ACCEPT

# Master ports
iptables -A INPUT -p tcp --dport 8336 -j ACCEPT
iptables -A INPUT -p udp --dport 8336 -j ACCEPT
iptables -A INPUT -p tcp --dport 8340 -j ACCEPT
```

Persist `iptables` rules on Debian/Ubuntu:

```bash
sudo apt install iptables-persistent && sudo netfilter-persistent save
```

**Keeping the old port range (not recommended):** If you prefer to keep `50000`/`60000`, pin them in `config.yml` and exclude them from the ephemeral range:

```bash
sudo sysctl -w net.ipv4.ip_local_port_range="32768 49999"
echo "net.ipv4.ip_local_port_range = 32768 49999" | sudo tee -a /etc/sysctl.d/99-quilibrium.conf
sudo sysctl --system
```

### Verifying Ports

After restarting the node, confirm workers are listening on the expected ports:

```bash
ss -tlnp | grep node
ss -ulnp | grep node
```

### Residential / Home Network

If running the node behind a residential router, set up port forwarding for all required ports. Use TCP for the `listenMultiaddr` configuration:

```yaml
p2p:
  listenMultiaddr: "/ip4/0.0.0.0/tcp/8336"
  streamListenMultiaddr: "/ip4/0.0.0.0/tcp/8340"
engine:
  dataWorkerBaseListenMultiaddr: "/ip4/0.0.0.0/tcp/%d"
```

---

## Logging Configuration

The logger section in `config.yml` configures file-based logging for master and worker processes instead of printing all output to stdout:

```yaml
logger:
  path: ".logs"
  maxSize: 50
  maxBackups: 0
  maxAge: 10
  compress: true
```

| Setting | Description | Example |
|---|---|---|
| `path` | Directory where master and worker log files are stored | `.logs` |
| `maxSize` | Maximum size of a log file in megabytes before rotation | `50` |
| `maxBackups` | Maximum number of rotated log files to retain (0 = no limit) | `0` |
| `maxAge` | Maximum number of days to retain rotated log files (0 = no limit) | `10` |
| `compress` | Compress rotated log files using gzip | `true` |

When the logger section is not configured, all process messages are printed to standard output (captured by journalctl on Linux or log files on macOS).

---

## Backup Procedures

### Critical Files to Back Up

You must maintain encrypted backups of these files. Without them, you cannot access your node's rewards or perform token operations.

| File/Directory | Purpose | Location |
|---|---|---|
| `config.yml` | Node configuration, peer key, engine settings | `.config/config.yml` |
| `keys.yml` | Cryptographic keys for the node | `.config/keys.yml` |
| `worker-store/` | Worker data for each worker core | `.config/worker-store/[worker-id]/` |

The `.config` directory is relative to the node's working directory, typically `/opt/quilibrium/node/.config/`.

### Backup Recommendations

- **config.yml and keys.yml** are essential. Without these files, you lose access to your node's identity and rewards. Back them up to an encrypted offsite location.
- **worker-store** should be regularly backed up to speed up node restoration after hardware failure. If worker data is lost, the node can fetch it from shard peers, but this results in missed rewards and potential penalties during the recovery period.
- Use encrypted storage for all backups, especially `keys.yml`.

### Example Backup Command

```bash
tar czf quilibrium-backup-$(date +%Y%m%d).tar.gz \
  /opt/quilibrium/node/.config/config.yml \
  /opt/quilibrium/node/.config/keys.yml \
  /opt/quilibrium/node/.config/worker-store/
```

---

## 2.1 Upgrade Notes

The 2.1 upgrade introduced significant changes to networking, storage, and worker configuration.

### Worker Configuration Changes

The default `dataWorkerBaseListenMultiaddr` value of `/ip4/127.0.0.1/tcp/%d` is automatically replaced with `/ip4/0.0.0.0/tcp/%d` after the 2.1 cutoff frame. Workers must now have their ports opened externally.

Two port bases control worker networking:

```yaml
engine:
  dataWorkerBaseP2PPort: 25000    # Worker p2p (changed from 50000 in 2.1.0.19)
  dataWorkerBaseStreamPort: 32500  # Worker streaming (changed from 60000 in 2.1.0.19)
```

For a node with 4 workers, open ports: 25000-25003 and 32500-32503.

### Master Configuration Changes

A new mandatory port was added for the master process:

```yaml
p2p:
  streamListenMultiaddr: "/ip4/0.0.0.0/tcp/8340"
```

If the node fails its reachability test for either master or worker ports, it will halt and inform you.

### Advanced 2.1 Networking

If you previously configured explicit worker addresses in `dataWorkerMultiaddrs`, these values are ignored after the 2.1 cutoff frame. Replace them with:

```yaml
engine:
  dataWorkerP2PMultiaddrs:
    - "/ip4/0.0.0.0/tcp/25000"
    - "/ip4/0.0.0.0/tcp/25001"
  dataWorkerStreamMultiaddrs:
    - "/ip4/0.0.0.0/tcp/32500"
    - "/ip4/0.0.0.0/tcp/32501"
```

Choose different port values from your old `dataWorkerMultiaddrs` since the old ports should not be publicly exposed while the new ports must be.

### Master Proxy

To proxy worker traffic through the master process (only advisable for small local clusters):

```yaml
engine:
  enableMasterProxy: true
```

If workers use different config files, set this in all config files.

### Reward Strategy and Archival Settings

| Setting | Default | Description |
|---|---|---|
| `rewardStrategy` | `"reward-greedy"` | Optimizes for rewards. Use `"data-greedy"` for pure data redundancy. |
| `dataWorkerFilters` | Auto-selected | Override specific bitmask filters for workers. |
| `archiveMode` | `false` | Retain all historic frame data (useful for explorers). |
| `delegateAddress` | Derived from prover key | Override reward target address (hex format, no `0x` prefix). |

Example config:

```yaml
engine:
  rewardStrategy: "reward-greedy"
  archiveMode: false
  delegateAddress: "abcdef1234567890abcdef1234567890abcdef1234567890"
```

---

## Prover Operations

The qclient provides commands for managing prover operations:

| Command | Description |
|---|---|
| `qclient node prover status` | Lists prover worker statuses, shard assignments, and storage availability |
| `qclient node prover status <WorkerId>` | Status for a specific worker |
| `qclient node prover pause` | Emergency pause for all prover workers |
| `qclient node prover pause <WorkerId>` | Emergency pause for a specific worker |
| `qclient node prover leave` | Initiates graceful prover leave from network |
| `qclient node prover leave <WorkerId>` | Graceful leave for a specific worker |
| `qclient node prover delegate <Address>` | Delegates prover rewards to an alternative address |
| `qclient node prover merge <PrimaryConfig> [<AdditionalConfigs>...]` | Merges config files for seniority preservation |

### Merging Prover Keys for Seniority

If you have older key sets from before 1.4.19, you can combine them with your current keys to increase seniority:

```bash
qclient config prover merge .config .config1 .config2 .config3
```

The 1.4.19+ config folder should be listed first. Append `--dry-run` to preview the result without making permanent changes. Restart the node after merging.

Alternatively, configure merging in `config.yml`:

```yaml
engine:
  multisigProverEnrollmentPaths:
    - "/path/to/.config1/"
    - "/path/to/.config2/"
    - "/path/to/.config3/"
```

---

## Troubleshooting Common Issues

### Node fails reachability test and halts

The node tests whether its master and worker ports are reachable from the network. If the test fails, the node halts.

**Fix:** Verify that all required ports are open in your firewall and port forwarding rules:
- Master: 8336 (TCP/UDP), 8340 (TCP)
- Workers: 25000+N (TCP/UDP), 32500+N (TCP)

Check with:

```bash
ss -tlnp | grep node
ss -ulnp | grep node
```

### Workers fail to start or show connectivity errors

This usually means the firewall rules do not match the ports the node is using.

**Fix:**
1. Confirm your firewall allows inbound traffic on the correct port ranges.
2. Verify port forwarding rules (if behind a router) match the node's ports.
3. Ensure the OS ephemeral port range does not overlap with node ports. If using the old `50000`/`60000` range, set `net.ipv4.ip_local_port_range` to exclude them.

### Node terminates unexpectedly with storage warning

The node terminates when disk utilization on the partition containing the store reaches the `terminatePercentage` (default 95%).

**Fix:**
1. Free disk space by removing unnecessary files.
2. Move worker stores to a larger partition using `workerPaths` in the `db` section.
3. Reduce the number of workers to lower storage demand.
4. Do not override `terminatePercentage` to a higher value unless you understand the risk.

### Out of memory or worker crashes

Each worker requires a minimum of 2 GB RAM. Running too many workers for your available memory causes crashes.

**Fix:**
1. Check your worker count: `ps aux | grep "\-\-core" | grep -v grep | wc -l`
2. Calculate the correct count using the 1:2:4 golden ratio.
3. Set `dataWorkerCount` in `config.yml` and restart.

### Node cannot find peers or sync

The node needs a minimum number of peers to function (default: `minimumPeersRequired: 3`).

**Fix:**
1. Verify network connectivity and that firewall rules allow outbound traffic.
2. Consider adding trusted peers via the `directPeers` configuration:

```yaml
p2p:
  directPeers:
    - /ip4/192.168.1.100/tcp/8336/p2p/QmPeerIdHere
```

Both nodes must list each other in their `directPeers` configuration.

3. Check `peerReconnectCheckInterval` (default 60s) — the node retries peering if no peers are found.

### Logs are too large or filling disk

Without file-based logging configured, logs go to stdout (captured by systemd journal on Linux).

**Fix:** Configure the `logger` section in `config.yml` with rotation:

```yaml
logger:
  path: ".logs"
  maxSize: 50
  maxBackups: 3
  maxAge: 7
  compress: true
```

On Linux, you can also limit journald storage:

```bash
journalctl --vacuum-size=500M
```

### Config changes not taking effect

All config changes require a node restart to take effect.

**Fix:**

```bash
# Linux
systemctl restart quilibrium-node

# macOS
sudo launchctl unload /Library/LaunchDaemons/com.quilibrium.node.plist
sudo launchctl load /Library/LaunchDaemons/com.quilibrium.node.plist
```

---

## Frequently Asked Questions

### How do I check what version my node is running?

Check the logs for the version string:

```bash
# Linux
journalctl -u quilibrium-node -r --no-hostname -n 1 -g "Quilibrium Node" -o cat

# macOS
grep "Quilibrium Node" /opt/quilibrium/node/node.log | tail -1
```

### How often should I update my node?

Set up automatic updates via cron for the most reliable approach. If you prefer manual control, check for updates at least daily, especially around announced protocol upgrades.

### Will automatic updates cause downtime?

The node restarts briefly when an update is applied. The restart only occurs after a successful download, so failed updates do not cause unnecessary downtime. The cron script exits quietly when no update is available.

### How do I verify my node binary is authentic?

Run `qclient version --checksum` and compare the output against official release checksums published by the Quilibrium team. The node binary also includes up to 17 signature files from different signers that are verified automatically.

### Do I need to open extra ports for 2.1?

Yes. Workers need P2P ports (default starting at 25000) and stream ports (default starting at 32500) opened. The master node needs port 8340 opened in addition to 8336. Failure to open these ports causes the node to halt after its reachability test.

### What is the worker port range change in 2.1.0.19?

The default worker ports changed from `50000`/`60000` to `25000`/`32500` to avoid conflicts with OS ephemeral port ranges. If your config was created before 2.1.0, the new defaults apply automatically but your firewall rules need updating. If your config explicitly sets `50000`/`60000`, those values are preserved but you should consider migrating.

### What files must I back up?

At minimum: `config.yml` and `keys.yml` from the `.config/` directory. These contain your node's identity and keys. Also back up `worker-store/` to speed up recovery after hardware failure and avoid penalties.

### How do I set the worker count?

Edit `config.yml` and set `engine.dataWorkerCount` to the number matching your hardware using the 1:2:4 golden ratio (1 thread : 2 GB RAM : 4 GB storage). Restart the node after changing.

### Can I run a node on Windows?

Windows is not natively supported. You may use WSL (Windows Subsystem for Linux) to run a node on Windows.

### What happens if I lose my worker data?

If worker data is lost, the node can fetch it from shard peers. However, this results in missed rewards and potential penalties during the recovery period. Regular backups of the `worker-store/` directory are strongly recommended.

### How do I delegate rewards to a different address?

Set `delegateAddress` in the engine section of `config.yml` (hex format without `0x` prefix), or use the qclient command:

```bash
qclient node prover delegate <DestinationAddress>
```

### How do I check my node's prover status?

```bash
qclient node prover status
```

This shows worker statuses, shard assignments, and storage availability for each worker.

*Last updated: 2026-02-24T12:00:00*
