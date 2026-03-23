---
title: "Quilibrium Node Provisioning & Service Setup Guide"
source: official_docs_synthesis
date: 2026-02-24
type: technical_reference
topics:
  - node provisioning
  - node service
  - systemd
  - launchd
  - installation
  - manual install
  - Linux
  - macOS
  - qtools
  - legacy methods
  - port configuration
  - firewall
  - service management
---

# Quilibrium Node Provisioning & Service Setup Guide

This guide consolidates all information about installing, configuring, and running a Quilibrium node as a persistent service. It covers every provisioning method (QTools, Manual Install, Legacy), platform-specific service setup for Linux (systemd) and macOS (launchd), port and firewall configuration, automatic updates, and key backup procedures.

---

## Overview of Provisioning Methods

There are three ways to provision a Quilibrium node. Choose the method that best fits your experience level and operational needs.

| Method | Description | Maintenance |
|--------|-------------|-------------|
| **QTools** (Recommended) | Automated provisioning and management tool for Quilibrium nodes. Handles installation, configuration, updates, and service orchestration. | Managed updates and service orchestration. |
| **Manual Install** | Download the binary directly, set up a system service (systemd or launchd), and manage updates yourself. Guides available for Linux and macOS. | You handle all updates and configuration. |
| **Legacy Methods** | Older scripts (release_autorun.sh, QOne) that may still work but are not actively maintained. | Limited or no ongoing maintenance. |

**Recommendation:** QTools is the recommended approach for most operators. If QTools is not available or you prefer full control, use the Manual Install method. Legacy methods are only documented for reference.

---

## System Requirements Reminder

Before provisioning a node, verify your server meets the minimum hardware requirements. Under-provisioned nodes will struggle to keep up with the network and may incur penalties.

| Component | Minimum |
|-----------|---------|
| CPU | 4 logical cores |
| RAM | 2 GB per core |
| SSD | 4 GB free space per core |

The general rule is **1 CPU core : 2 GB RAM : 4 GB storage**. For example, an 8-core machine needs at least 16 GB RAM and 32 GB free SSD space.

**Supported platforms:**

| OS | Architecture | Binary Suffix | Service Manager |
|----|-------------|---------------|-----------------|
| Linux | x86_64 | `linux-amd64` | systemd |
| Linux | ARM64 | `linux-arm64` | systemd |
| macOS | ARM64 (Apple Silicon) | `darwin-arm64` | launchd |

Windows is not natively supported. Windows users should use WSL (Windows Subsystem for Linux).

For the full system requirements specification, see the Quilibrium system requirements documentation.

---

## When Is `sudo` Needed?

Commands that write to system directories or manage system services require `sudo` (root privileges). Read-only commands and queries do not.

| Needs `sudo` | Example | Why |
|:---:|---------|-----|
| Yes | `sudo ./qnode-update.sh` | Writes binaries to `/opt/quilibrium/node` |
| Yes | `sudo systemctl start quilibrium-node` | Manages a system service |
| Yes | `sudo ln -sf ... /usr/local/bin/quilibrium-node` | Writes to a system `PATH` directory |
| No | `quilibrium-node -peer-id` | Read-only query, no system changes |
| No | `quilibrium-node -balance` | Read-only query, no system changes |

As a rule of thumb: **installing, updating, and controlling the service** need `sudo`, while **querying the node** does not.

---

## Linux Manual Install (systemd)

This section covers installing and running the Quilibrium node on Linux (x86_64 or ARM64) using a systemd service.

### Prerequisites (Linux)

- A Linux server meeting the system requirements
- Firewall ports opened (see the Port Configuration section below)
- Root or sudo access

### Step 1: Download the Node Binary (Linux)

The recommended approach is to use the provided update script, which automatically detects your platform, downloads the latest binary with all signature files, and sets up the symlink.

```bash
mkdir -p /opt/quilibrium/node && cd /opt/quilibrium/node
wget -O qnode-update.sh https://docs.quilibrium.com/scripts/qnode-update.sh
chmod +x qnode-update.sh
sudo ./qnode-update.sh
```

The script detects your architecture, fetches the latest release, and downloads the binary, digest, and all signature files into `/opt/quilibrium/node`.

This is the same script used for updating the node and for automatic updates via cron (see the Updating section below).

**Manual download alternative (Linux):**

Check the latest node release filenames at `https://releases.quilibrium.com/release`. Download the binary and signature files for your platform. Most Linux servers use `linux-amd64`:

```bash
mkdir -p /opt/quilibrium/node && cd /opt/quilibrium/node

# Replace <version> with the current version, e.g. 2.1.0.18
wget https://releases.quilibrium.com/node-<version>-linux-amd64
wget https://releases.quilibrium.com/node-<version>-linux-amd64.dgst
for i in $(seq 1 17); do
  wget https://releases.quilibrium.com/node-<version>-linux-amd64.dgst.sig.$i 2>/dev/null
done
```

The node binary has up to 17 signature files (`.dgst.sig.1` through `.dgst.sig.17`) from different signers. Not all signature numbers may be present for a given release -- missing ones are expected and can be ignored. All downloaded signatures must be in the same directory as the binary for verification to succeed.

Make the binary executable:

```bash
chmod +x node-<version>-linux-amd64
```

### Step 2: Create Symlinks (Linux)

If you used the update script in Step 1, the first symlink (`/opt/quilibrium/node/quilibrium-node`) is already created. You only need to create the `/usr/local/bin` symlink below.

Create a symlink so the service file always points to a consistent name, avoiding edits on every update:

```bash
ln -sf /opt/quilibrium/node/node-<version>-linux-amd64 /opt/quilibrium/node/quilibrium-node
```

Create a second symlink in `/usr/local/bin` so you can run `quilibrium-node` from anywhere:

```bash
sudo ln -sf /opt/quilibrium/node/quilibrium-node /usr/local/bin/quilibrium-node
```

### Step 3: Set Up the systemd Service

Create the service file:

```bash
sudo nano /lib/systemd/system/quilibrium-node.service
```

Paste the following content:

```ini
[Unit]
Description=Quilibrium Node
StartLimitIntervalSec=0
StartLimitBurst=0

[Service]
Type=simple
Restart=always
RestartSec=5s
WorkingDirectory=/opt/quilibrium/node
ExecStart=/opt/quilibrium/node/quilibrium-node
KillSignal=SIGINT
RestartKillSignal=SIGINT
FinalKillSignal=SIGKILL
TimeoutStopSec=30s

[Install]
WantedBy=multi-user.target
```

**Key fields explained:**

| Field | Purpose |
|-------|---------|
| `Restart=always` | Automatically restart the node on any exit |
| `RestartSec=5s` | Wait 5 seconds before restarting |
| `KillSignal=SIGINT` | Send SIGINT for graceful shutdown (avoids seniority penalties) |
| `FinalKillSignal=SIGKILL` | Last-resort kill after timeout |
| `TimeoutStopSec=30s` | Allow up to 30 seconds for graceful stop |

**Important:** The service uses SIGINT as the kill signal so the node can gracefully inform the network of its shutdown. If a node is killed without SIGINT (e.g., via SIGKILL), it will likely be penalized for not informing the network of its deliberate absence. Because `ExecStart` points directly at the node binary (via the symlink), systemd can send SIGINT to the node process. This avoids the penalty risk where wrapper scripts like `release_autorun.sh` do not trap SIGINT.

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable quilibrium-node
sudo systemctl start quilibrium-node
```

`systemctl enable` ensures the node service starts automatically on system boot.

### Step 4: Verify the Node Is Running (Linux)

Check the service status:

```bash
systemctl status quilibrium-node
```

Follow the logs:

```bash
journalctl -u quilibrium-node -f --no-hostname -o cat
```

### Useful Linux Commands

| Action | Command |
|--------|---------|
| Start node | `sudo systemctl start quilibrium-node` |
| Stop node | `sudo systemctl stop quilibrium-node` |
| Restart node | `sudo systemctl restart quilibrium-node` |
| Check status | `systemctl status quilibrium-node` |
| Follow logs | `journalctl -u quilibrium-node -f --no-hostname -o cat` |
| View recent logs | `journalctl -u quilibrium-node -n 100 --no-hostname -o cat` |
| Check version in logs | `journalctl -u quilibrium-node -r --no-hostname -n 1 -g "Quilibrium Node" -o cat` |

---

## macOS Manual Install (launchd)

This section covers installing and running the Quilibrium node on macOS with Apple Silicon using a launchd service.

### Prerequisites (macOS)

- A Mac with Apple Silicon (M1/M2/M3/M4)
- macOS meeting the system requirements
- Administrator access

### Step 1: Download the Node Binary (macOS)

Use the provided update script, which automatically downloads the latest binary with all signature files and sets up the symlink.

```bash
sudo mkdir -p /opt/quilibrium/node && cd /opt/quilibrium/node
sudo curl -L -o qnode-update.sh https://docs.quilibrium.com/scripts/qnode-update-macos.sh
sudo chmod +x qnode-update.sh
sudo ./qnode-update.sh
```

The script verifies you are on macOS, fetches the latest release, and downloads the binary, digest, and all signature files into `/opt/quilibrium/node`.

**Manual download alternative (macOS):**

Check the latest node release filenames at `https://releases.quilibrium.com/release`. Download the binary and all signature files:

```bash
sudo mkdir -p /opt/quilibrium/node && cd /opt/quilibrium/node

# Replace <version> with the current version, e.g. 2.1.0.18
sudo curl -LO https://releases.quilibrium.com/node-<version>-darwin-arm64
sudo curl -LO https://releases.quilibrium.com/node-<version>-darwin-arm64.dgst
for i in $(seq 1 17); do
  sudo curl -LO https://releases.quilibrium.com/node-<version>-darwin-arm64.dgst.sig.$i 2>/dev/null
done
```

Make the binary executable:

```bash
sudo chmod +x node-<version>-darwin-arm64
```

### Step 2: Create Symlinks (macOS)

If you used the update script in Step 1, the first symlink is already created. You only need the `/usr/local/bin` symlink.

Create a symlink so the service always points to a consistent name:

```bash
sudo ln -sf /opt/quilibrium/node/node-<version>-darwin-arm64 /opt/quilibrium/node/quilibrium-node
```

Create a second symlink in `/usr/local/bin` so you can run `quilibrium-node` from anywhere:

```bash
sudo ln -sf /opt/quilibrium/node/quilibrium-node /usr/local/bin/quilibrium-node
```

### Step 3: Set Up the launchd Service

macOS uses `launchd` instead of `systemd`. Create a plist file:

```bash
sudo nano /Library/LaunchDaemons/com.quilibrium.node.plist
```

Paste the following content:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.quilibrium.node</string>
  <key>ProgramArguments</key>
  <array>
    <string>/opt/quilibrium/node/quilibrium-node</string>
  </array>
  <key>WorkingDirectory</key>
  <string>/opt/quilibrium/node</string>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>/opt/quilibrium/node/node.log</string>
  <key>StandardErrorPath</key>
  <string>/opt/quilibrium/node/node-error.log</string>
</dict>
</plist>
```

**Key fields explained:**

| Field | Purpose |
|-------|---------|
| `RunAtLoad` | Starts the node automatically when the system boots |
| `KeepAlive` | Restarts the node automatically if it exits |
| `StandardOutPath` | Directs stdout to a log file |
| `StandardErrorPath` | Directs stderr to a separate error log |

Load and start the service:

```bash
sudo launchctl load /Library/LaunchDaemons/com.quilibrium.node.plist
```

### Step 4: Verify the Node Is Running (macOS)

```bash
sudo launchctl list | grep quilibrium
```

Follow the logs:

```bash
tail -f /opt/quilibrium/node/node.log
```

### Useful macOS Commands

| Action | Command |
|--------|---------|
| Start node | `sudo launchctl load /Library/LaunchDaemons/com.quilibrium.node.plist` |
| Stop node | `sudo launchctl unload /Library/LaunchDaemons/com.quilibrium.node.plist` |
| Check status | `sudo launchctl list \| grep quilibrium` |
| Follow logs | `tail -f /opt/quilibrium/node/node.log` |
| Follow error logs | `tail -f /opt/quilibrium/node/node-error.log` |

---

## Updating the Node

### Using the Update Script (Linux)

If you used the update script during initial installation, it is already in `/opt/quilibrium/node/`. Run it whenever you want to check for updates:

```bash
sudo /opt/quilibrium/node/qnode-update.sh
```

The script will:
1. Detect your platform (`linux-amd64` or `linux-arm64`)
2. Query the release server for the latest version
3. Compare it against your currently installed version
4. Download the binary, digest, and all signature files (skipping any already present)
5. Stop the service, update the symlink, and restart the service

If you are already on the latest version with all files present, the script exits with no changes.

### Using the Update Script (macOS)

```bash
sudo /opt/quilibrium/node/qnode-update.sh
```

The macOS script follows the same logic but:
1. Verifies you are on macOS with Apple Silicon
2. Unloads the launchd service, updates the symlink, and reloads the service

### Automatic Updates via Cron

You can schedule the update script to run automatically using cron. This example checks for updates every hour and logs the output.

```bash
sudo crontab -e
```

Add the following line:

**Linux:**
```
0 * * * * /opt/quilibrium/node/qnode-update.sh >> /var/log/qnode-update.log 2>&1
```

**macOS:**
```
0 * * * * /opt/quilibrium/node/qnode-update.sh >> /opt/quilibrium/node/qnode-update.log 2>&1
```

This runs the script at the top of every hour. If no update is available, the script exits quietly. If a new version is found, it downloads it, restarts the service, and logs the result.

To check the update log:

```bash
# Linux
tail -50 /var/log/qnode-update.log

# macOS
tail -50 /opt/quilibrium/node/qnode-update.log
```

You can adjust the cron schedule to your preference. For example, `0 */6 * * *` checks every 6 hours, or `0 3 * * *` checks once daily at 3:00 AM.

### Manual Update (Linux)

When a new version is released and you prefer to update manually:

1. Stop the node:
```bash
sudo systemctl stop quilibrium-node
```

2. Download the new binary (replace `<new-version>` accordingly):
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
sudo systemctl start quilibrium-node
```

No service file edits are needed because the symlink always points to the active binary.

### Manual Update (macOS)

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

---

## General Node Commands

These commands work on any platform once the `quilibrium-node` symlink is on your `PATH`:

Print node peer ID:
```bash
quilibrium-node -peer-id
```

Print node info:
```bash
quilibrium-node -node-info
```

Print node balance:
```bash
quilibrium-node -balance
```

---

## Port Configuration and Firewall Rules

### Default Ports to Open

The Quilibrium node requires several ports to be open for network communication.

| Port Range | Protocol | Purpose | Notes |
|------------|----------|---------|-------|
| 8336 | QUIC/UDP or TCP | Master process p2p communication | |
| 8340 | TCP | Master process streaming communication | |
| 25000-25000+N | QUIC/UDP or TCP | Worker processes p2p communication | One port per worker. E.g., 4 workers = 25000-25003 |
| 32500-32500+N | TCP | Worker processes streaming communication | One port per worker. E.g., 4 workers = 32500-32503 |

Adjust the port count to match the number of worker processes you are running.

### Worker Port Range Change (version 2.1.0.19+)

As of version 2.1.0.19, the default worker port ranges changed:

| Setting | Old Default | New Default |
|---------|-------------|-------------|
| `dataWorkerBaseP2PPort` | 50000 | 25000 |
| `dataWorkerBaseStreamPort` | 60000 | 32500 |

**Why the change:** The old `50000-60000` range overlaps with the default ephemeral (dynamic) port range on all major operating systems (Linux: 32768-60999, macOS: 49152-65535). This caused intermittent connectivity failures when the OS assigned outbound connections from the same range. The new defaults (`25000`/`32500`) sit below the ephemeral range on all platforms.

**Who is affected:**

- **Config created before 2.1.0 (no explicit port entries):** The node will automatically pick up the new defaults. Your existing firewall rules still reference the old `50000`/`60000` range, so workers will be blocked until you update them.
- **Config generated at 2.1.0 (explicit port entries):** The explicit values `50000`/`60000` are retained. You may still experience intermittent connectivity failures from ephemeral port overlap.

**Recommended fix -- adopt the new port range:**

1. Update firewall rules (example using `ufw` with 4 workers):

```bash
# Remove old worker port rules
sudo ufw delete allow 50000:50003/tcp
sudo ufw delete allow 50000:50003/udp
sudo ufw delete allow 60000:60003/tcp

# Add new worker port rules
sudo ufw allow 25000:25003/tcp
sudo ufw allow 25000:25003/udp
sudo ufw allow 32500:32503/tcp
```

Using `iptables` instead:

```bash
# Remove old worker port rules
iptables -D INPUT -p tcp --dport 50000:50003 -j ACCEPT
iptables -D INPUT -p udp --dport 50000:50003 -j ACCEPT
iptables -D INPUT -p tcp --dport 60000:60003 -j ACCEPT

# Add new worker port rules
iptables -A INPUT -p tcp --dport 25000:25003 -j ACCEPT
iptables -A INPUT -p udp --dport 25000:25003 -j ACCEPT
iptables -A INPUT -p tcp --dport 32500:32503 -j ACCEPT
```

To persist `iptables` rules on Debian/Ubuntu: `sudo apt install iptables-persistent && sudo netfilter-persistent save`

2. If your `config.yml` has explicit old port values, update or remove them:

```yaml
engine:
  dataWorkerBaseP2PPort: 25000
  dataWorkerBaseStreamPort: 32500
```

Or comment them out to use the new defaults:

```yaml
engine:
  # dataWorkerBaseP2PPort: 50000
  # dataWorkerBaseStreamPort: 60000
```

3. Restart the node after making changes.

**Alternative -- keep the old port range:** If you prefer not to change firewall rules, pin the old values in `config.yml` and adjust the OS ephemeral port range to avoid collisions:

```bash
sudo sysctl -w net.ipv4.ip_local_port_range="32768 49999"
echo "net.ipv4.ip_local_port_range = 32768 49999" | sudo tee -a /etc/sysctl.d/99-quilibrium.conf
sudo sysctl --system
```

**Verifying the fix:** After restarting, confirm workers are listening on the expected ports:

```bash
ss -tlnp | grep node
ss -ulnp | grep node
```

### Firewall Rules for Hosted Servers

Hosting providers commonly assign a public IP while expecting all communication to go through public addresses. Misconfigured nodes may broadcast private IP addresses, which providers interpret as a network attack. To prevent connection attempts to private IP ranges, add these rules on Linux with `ufw`:

```bash
# Block RFC1918 private address ranges
sudo ufw deny out to 10.0.0.0/8
sudo ufw deny out to 172.16.0.0/12
sudo ufw deny out to 192.168.0.0/16

# Block multicast
sudo ufw deny out to 224.0.0.0/4

# Block broadcast
sudo ufw deny out to 255.255.255.255
```

### Port Forwarding for Home/Residential Users

If you are running the node at home on a residential ISP, you must set up port forwarding on your router for the node to be reachable by the network. Forward all required ports (8336, 8340, 25000+, 32500+) to your node's local IP address.

For residential ISP users, it is recommended to use TCP connections. This can be achieved by setting in `config.yml`:

- `listenMultiaddr` to `/ip4/0.0.0.0/tcp/8336`
- `streamListenMultiaddr` to `/ip4/0.0.0.0/tcp/8340`
- `dataWorkerBaseListenMultiaddr` to `/ip4/0.0.0.0/tcp/%d` (do not omit the `%d`)

---

## Legacy Provisioning Methods

These methods are older and not actively maintained. They are documented for reference but the Manual Install method (or QTools when available) is recommended for new deployments.

### Release Autorun Script

The release autorun script automatically downloads the latest node binary, runs it, checks for new versions in the background, and triggers updates including node restarts.

```bash
mkdir -p ceremonyclient/node && cd ceremonyclient/node
wget https://github.com/QuilibriumNetwork/monorepo/blob/release/node/release_autorun.sh
chmod +x release_autorun.sh
./release_autorun.sh
```

This script is intended to help get started quickly, but for robust deployments a service orchestration solution (e.g., systemd on Linux) is recommended. The autorun script does not trap SIGINT, which means stopping a node running through this script may result in seniority penalties because the node cannot gracefully inform the network of its departure.

### QOne Script

QOne was another provisioning script used in earlier versions of Quilibrium. It is no longer actively maintained. If you are currently using QOne, consider migrating to the Manual Install method or QTools.

---

## QTools (Recommended, Coming Soon)

QTools is the recommended method for provisioning and managing Quilibrium nodes. It automates installation, configuration, updates, and service management.

QTools documentation is currently under development. Check the official Quilibrium documentation for full installation and usage instructions when they become available.

When QTools documentation is published, it will be the simplest and most complete way to provision and manage Quilibrium nodes, handling all the steps described in the Manual Install sections automatically.

---

## Key and Store Backups

To run a node, access rewards, or make token operations for your account, you need the node's **keyset** consisting of the `config.yml` and `keys.yml` files. You are strongly advised to maintain copies of these files in an encrypted backup.

**Worker data** is stored in `worker-store/[worker-id]`. It should also be regularly backed up to make node restoration faster (for example, in case of physical server failure) and to avoid unnecessary penalties.

If worker data is lost, it can be restored by running the node which will fetch the data from its shard peers, but this will result in missed rewards and penalties if the worker data is not restored in time.

Keyset and worker data are stored in your node's `.config` directory:

```text
.config/keys.yml
.config/config.yml
.config/worker-store/[worker-id]/
```

If you used the `release_autorun.sh` script, your config directory should be `ceremonyclient/node/.config`. If you used the Manual Install method with the recommended paths, it will be `/opt/quilibrium/node/.config`.

---

## Graceful Shutdown and Penalty Avoidance

One of the most important aspects of running a node via a service is proper shutdown behavior. If a node process is killed without a SIGINT signal, the network may penalize it for not informing peers of its deliberate absence.

**Best practice before planned downtime:**

1. Stop the service (which sends SIGINT):
```bash
# Linux
sudo systemctl stop quilibrium-node

# macOS
sudo launchctl unload /Library/LaunchDaemons/com.quilibrium.node.plist
```

2. Wait for the stop to complete. The graceful shutdown can take up to 2-3 minutes depending on the current node process state.

Never force-kill the node process with `kill -9` or `SIGKILL` unless absolutely necessary. The systemd service file is configured with `FinalKillSignal=SIGKILL` only as a last resort after the 30-second timeout.

---

## Frequently Asked Questions

**Q: Which provisioning method should I use?**
A: QTools is recommended when available. If QTools is not yet documented or you prefer full control, use the Manual Install method with systemd (Linux) or launchd (macOS). Avoid legacy methods for new deployments.

**Q: Do I have to run the node as a service?**
A: No. You can run the node binary directly in a terminal or screen/tmux session. However, the service approach is strongly recommended for production because it handles automatic restarts on failure, boot-time startup, and graceful shutdown via SIGINT.

**Q: Will my node auto-update through the service?**
A: The service itself does not auto-update the node binary. You can set up automatic updates by adding the update script to cron (see the "Automatic Updates via Cron" section). The cron job runs the update script on a schedule, and the script handles downloading new versions and restarting the service.

**Q: What happens if my server reboots unexpectedly?**
A: If you have enabled the service (`systemctl enable` on Linux, or `RunAtLoad` in the launchd plist on macOS), the node will start automatically on boot. The network is designed to handle unexpected disconnections, but there may be temporary seniority impact.

**Q: My workers are not connecting after upgrading to 2.1.0.19. What happened?**
A: The default worker port range changed from `50000`/`60000` to `25000`/`32500`. Your firewall rules probably still reference the old ports. Update your firewall rules to allow the new port ranges (see the Port Configuration section).

**Q: Can I run multiple nodes on one server?**
A: The standard service setup manages a single node. Running multiple nodes requires custom service files and separate configuration directories.

**Q: Does the node work on Windows?**
A: Windows is not natively supported. Use WSL (Windows Subsystem for Linux) to run a node with systemd service management.

**Q: How do I check which ports my node is actually using?**
A: After starting the node, run `ss -tlnp | grep node` and `ss -ulnp | grep node` to see all listening ports.

**Q: I used the release_autorun.sh script. Should I migrate?**
A: Yes. The autorun script does not trap SIGINT, which means stopping the node may cause seniority penalties. Migrate to the Manual Install method with a proper systemd service to get graceful shutdown, automatic restarts, and boot-time startup.

**Q: Where are my node keys and config stored?**
A: In the `.config` directory under your node's working directory. For Manual Install: `/opt/quilibrium/node/.config/`. For legacy autorun: `ceremonyclient/node/.config/`. Always keep encrypted backups of `keys.yml` and `config.yml`.

*Last updated: 2026-02-24T12:00:00*
