---
sidebar_position: 1
title: "Manual Install"
---

# Manual Install

This guide covers downloading the node binary, running it as a service, and managing updates yourself.

Before proceeding, make sure your server meets the [system requirements](/docs/run-node/system-requirements) and you have opened the required [firewall ports](/docs/run-node/quick-start#default-ports-to-open-on-firewall).

## Available Platforms

The node binary is available for the following platforms:

| OS | Architecture | Binary suffix | Guide |
|----|-------------|---------------|-------|
| Linux | x86_64 | `linux-amd64` | [Linux](/docs/run-node/node-provisioning/manual-install/linux) |
| Linux | ARM64 | `linux-arm64` | [Linux](/docs/run-node/node-provisioning/manual-install/linux) |
| macOS | ARM64 (Apple Silicon) | `darwin-arm64` | [macOS](/docs/run-node/node-provisioning/manual-install/macos) |

Check the latest release filenames at:

```
https://releases.quilibrium.com/release
```

## When is `sudo` needed?

Commands that write to system directories or manage system services require `sudo` (root privileges).
Read-only commands and queries do not.

| Needs `sudo` | Example | Why |
|:---:|---------|-----|
| Yes | `sudo ./qnode-update.sh` | Writes binaries to `/opt/quilibrium/node` |
| Yes | `sudo systemctl start quilibrium-node` | Manages a system service |
| Yes | `sudo ln -sf ... /usr/local/bin/quilibrium-node` | Writes to a system `PATH` directory |
| No | `quilibrium-node -peer-id` | Read-only query, no system changes |
| No | `quilibrium-node -balance` | Read-only query, no system changes |

As a rule of thumb: **installing, updating, and controlling the service** need `sudo`, while **querying the node** does not.

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
