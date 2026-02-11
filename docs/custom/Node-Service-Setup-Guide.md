---
title: "Quilibrium Node Service — Installation, Configuration & Management Guide"
source: official_docs_synthesis
date: 2026-02-11
type: technical_reference
topics:
  - node service
  - systemd
  - launchd
  - installation
  - environment variables
  - node management
  - Linux configuration
  - service commands
  - auto-start
  - qclient
  - troubleshooting
---

# Quilibrium Node Service — Installation, Configuration & Management Guide

## What Is the Node Service?

The Quilibrium node service is a system-level service wrapper that manages the lifecycle of the Quilibrium node application. It uses **systemd** on Linux and **launchd** on macOS to run the node as a persistent background process. All service operations are abstracted behind `qclient node service` commands, which automatically detect the operating system and invoke the appropriate underlying service manager.

Using a node service is not strictly required to run a Quilibrium node, but it is strongly recommended for production deployments. A long-lived process like the Quilibrium node benefits from the supervision, automatic restart, and boot-time startup that a system service provides.

## Why Use the Node Service?

Running the node through a service rather than a manual terminal session provides several critical advantages:

- **Automatic restart on failure** — systemd (or launchd) will restart the node if it crashes, keeping uptime high.
- **Auto-start on boot** — the service can be enabled to start the node whenever the server reboots, preventing missed proving windows.
- **Graceful shutdown via SIGINT** — the service sends a proper SIGINT signal on stop, allowing the node to inform the network of its deliberate absence and avoid seniority penalties.
- **Log management** — service logs integrate with the system journal (`journalctl` on Linux), making diagnostics straightforward.
- **Standardized management** — a single set of `qclient node service` commands works across both Linux and macOS.
- **Environment variable support** — runtime configuration can be changed without editing service files directly (Linux).

## Prerequisites and System Requirements

### Supported Operating Systems

| Operating System | Architecture | Service Manager |
|------------------|--------------|-----------------|
| Linux            | ARM, x86     | systemd         |
| macOS            | ARM (Apple Silicon) | launchd   |
| Windows          | Not supported* | N/A           |

*Windows users may use WSL (Windows Subsystem for Linux) to run a node.

### Minimum Hardware

| Component | Minimum |
|-----------|---------|
| CPU       | 4 logical cores |
| RAM       | 2 GB per core |
| SSD       | 4 GB free space per core |

The general rule is **1 CPU core : 2 GB RAM : 4 GB storage**. For example, an 8-core machine should have at least 16 GB RAM and 32 GB free SSD space.

### Software Prerequisites

On macOS, `launchd` is already present — no additional packages are needed. On Linux, the `systemd` package is required. If it is not already installed, the `qclient node install` process will install it automatically.

## Installing the Node Service

### Recommended: Install via qclient node install

The simplest path is to use the integrated node installation command. This installs the node binary, creates the service, sets up log rotation, and creates a symlink — all in one step.

```bash
sudo qclient node install
```

This command requires `sudo` because it writes to system directories. The install process performs the following in order:

1. Detects root or sudo privileges
2. Determines the version to install (defaults to latest)
3. Checks if the version exists
4. Creates `/var/quilibrium/bin/node/<version>/` directory
5. Detects if the version is already installed
6. **Creates the system service** (systemd unit file on Linux, launchd plist on macOS)
7. Sets ownership of `/var/quilibrium/` to the current user
8. Makes the binary executable
9. Creates a `quilibrium-node` symlink at `/usr/local/bin/quilibrium-node`
10. Sets up log rotation

To install a specific version instead of the latest:

```bash
sudo qclient node install "2.1.0"
```

### Manual Service Installation

If you already have the node binary but need to install only the service component:

```bash
qclient node service install
```

This creates the service file without re-downloading or re-installing the node binary.

## The systemd Unit File (Linux)

On Linux, the node service is managed via a systemd unit file. The `qclient node service install` command creates this file automatically. For reference, a typical Quilibrium systemd unit file looks like this:

```ini
[Unit]
Description=Quilibrium Node Service
StartLimitIntervalSec=0
StartLimitBurst=0

[Service]
Type=simple
Restart=always
RestartSec=5s
WorkingDirectory=/var/quilibrium
ExecStart=/usr/local/bin/quilibrium-node
KillSignal=SIGINT
RestartKillSignal=SIGINT
FinalKillSignal=SIGKILL
TimeoutStopSec=30s
EnvironmentFile=/var/quilibrium/quilibrium.env

[Install]
WantedBy=multi-user.target
```

Key fields to understand:

| Field | Purpose |
|-------|---------|
| `Restart=always` | Automatically restart the node on any exit |
| `RestartSec=5s` | Wait 5 seconds before restarting |
| `KillSignal=SIGINT` | Send SIGINT for graceful shutdown |
| `TimeoutStopSec=30s` | Allow up to 30 seconds for graceful stop |
| `EnvironmentFile` | Load runtime environment variables from file |

**Important:** The service uses SIGINT as the kill signal so the node can gracefully inform the network of its shutdown. If a node is killed without SIGINT (e.g., via SIGKILL), it will likely be penalized for not informing the network of its deliberate absence. The service file is configured with `FinalKillSignal=SIGKILL` only as a last resort after the timeout.

## Service Commands Reference

All commands follow the pattern `qclient node service <command>`. The qclient detects whether the system uses systemd or launchd and runs the appropriate underlying command.

### Start

Start the node service:

```bash
qclient node service start
```

This initiates the node process and connects it to the Quilibrium network.

### Stop

Gracefully stop the node:

```bash
qclient node service stop
```

**Important:** Wait for this command to finish. It may take up to 2-3 minutes depending on the current node process state. The service sends SIGINT to allow graceful shutdown.

Before stopping, consider using `qclient node prover pause` to manually inform the network of the upcoming downtime and avoid seniority penalties.

### Restart

Stop and then start the node:

```bash
qclient node service restart
```

Useful for applying configuration changes or recovering from issues.

### Status

Check whether the node is running:

```bash
qclient node service status
```

### Reload

Reload service configuration without fully stopping the node:

```bash
qclient node service reload
```

This is rarely needed — only required when there have been changes to the service file itself (not `config.yml`).

### Enable (Auto-Start on Boot)

Configure the node to start automatically when the server boots:

```bash
qclient node service enable
```

This is highly recommended for production nodes to ensure the node resumes operation after system restarts.

### Disable (Remove Auto-Start)

Prevent the node from starting on boot:

```bash
qclient node service disable
```

### Update Service File

When new qclient versions are released, the service file template may change for optimization. By default, existing service files are not automatically replaced. To update:

```bash
qclient node service update
```

### Uninstall

Remove the service entirely:

```bash
qclient node service uninstall
```

This removes the service file but does not delete the node binary or data.

## Environment Variables

The node service can read environment variables at launch to change runtime settings. On Linux, these are loaded from an environment file rather than being hardcoded in the service file.

### Environment File Location

```
/var/quilibrium/quilibrium.env
```

Variables set in this file are read by the systemd service on each start. Edit this file to change runtime behavior without modifying the service unit file itself.

### Platform Limitation

As of current releases, only the Linux version supports dynamic environment variables read from a file. On macOS, environment variables are hardcoded in the launchd plist file and require service file changes to modify. Dynamic environment file support for macOS is planned for a future release.

### Applying Environment Variable Changes

After editing `/var/quilibrium/quilibrium.env`, restart the service to pick up the changes:

```bash
qclient node service restart
```

If you edited the service file itself (not the environment file), you must reload first:

```bash
qclient node service reload
qclient node service restart
```

## Viewing Logs

### Using journalctl (Linux)

Since the service runs under systemd on Linux, logs are accessible through `journalctl`:

Follow logs in real time:

```bash
journalctl -u quilibrium-node.service -f --no-hostname -o cat
```

View recent log entries:

```bash
journalctl -u quilibrium-node.service -n 100 --no-hostname -o cat
```

Check the node version from logs:

```bash
journalctl -u quilibrium-node.service -r --no-hostname -n 1 -g "Quilibrium Node" -o cat
```

### Log Rotation

The `qclient node install` process sets up log rotation automatically. You can also configure in-application log rotation via the `config.yml` logger section:

```yaml
logger:
  path: ".logs"
  maxSize: 50          # MB before rotation
  maxBackups: 0        # 0 = no backup limit
  maxAge: 10           # days to retain
  compress: true       # gzip old logs
```

## Configuration After Installation

The node reads its runtime configuration from `config.yml`. After making changes to this file, restart the node service:

```bash
qclient node service restart
```

Key configuration sections relevant to node operators include:

- **p2p** — network connectivity, listen addresses (default port 8336), direct peers
- **engine** — worker counts, memory limits, reward strategy, delegate address
- **db** — database paths, storage capacity thresholds
- **logger** — log file paths, rotation settings

For the full configuration reference, see the Quilibrium advanced configuration documentation.

## Graceful Shutdown and Penalty Avoidance

One of the most important aspects of running via a service is proper shutdown behavior. If a node process is killed without a SIGINT signal, the network may penalize it for not informing peers of its deliberate absence.

**Best practice before planned downtime:**

1. Pause the prover to notify the network:
   ```bash
   qclient node prover pause
   ```
2. Then stop the service:
   ```bash
   qclient node service stop
   ```
3. Wait for the stop to complete (may take 2-3 minutes).

The `qclient node service stop` command sends SIGINT, which triggers a graceful shutdown. Never force-kill the node process with `kill -9` or `SIGKILL` unless absolutely necessary.

## Troubleshooting

### Node service fails to start

- Check status: `qclient node service status`
- Check logs: `journalctl -u quilibrium-node.service -n 50 --no-hostname -o cat`
- Verify the node binary exists and is executable at `/usr/local/bin/quilibrium-node`
- Ensure `/var/quilibrium/` is owned by the correct user

### Service file is outdated after qclient update

Run `qclient node service update` to refresh the service file, then `qclient node service reload` to apply.

### Node keeps restarting in a loop

Check logs for the root cause. Common issues include missing configuration files, insufficient disk space (the database section has `terminatePercentage` set at 95% by default), or port conflicts on 8336/8340.

### Environment variable changes not taking effect

On Linux, ensure you edited `/var/quilibrium/quilibrium.env` (not the service file), then restart the service. On macOS, you must modify the launchd plist and reload the service.

### Stop command hangs

The graceful shutdown can take up to 2-3 minutes. If it exceeds this, the service will eventually send SIGKILL after the `TimeoutStopSec` (30 seconds) elapses. If this happens repeatedly, check the logs for issues preventing clean shutdown.

## Frequently Asked Questions

**Q: Do I have to use the node service to run a Quilibrium node?**
A: No. You can run the node binary directly in a terminal or screen/tmux session. However, the service approach is recommended for production because it handles restarts, boot-time startup, and graceful shutdown automatically.

**Q: Will my node auto-update through the service?**
A: The service itself does not auto-update the node binary. You can install new versions with `sudo qclient node install` and update the service file with `qclient node service update`. The qclient may support auto-update features separately.

**Q: What happens if my server reboots unexpectedly?**
A: If you have enabled the service with `qclient node service enable`, the node will start automatically on boot. The network is designed to handle unexpected disconnections, but there may be temporary seniority impact.

**Q: Can I run multiple nodes on one server?**
A: The standard service setup manages a single node. Running multiple nodes requires custom service files and separate configuration directories. See the advanced node management documentation for clustering techniques.

**Q: Does the service work on Windows?**
A: Windows is not natively supported. Use WSL (Windows Subsystem for Linux) to run a node with systemd service management.

*Last updated: 2026-02-11T15:00:00*
