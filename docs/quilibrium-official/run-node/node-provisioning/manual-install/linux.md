---
sidebar_position: 2
title: "Linux"
---

import ScriptViewer from '@site/src/components/ScriptViewer';

# Linux Manual Install

This guide covers installing and running the Quilibrium node on Linux (x86_64 or ARM64) using a systemd service.

## Prerequisites

- A Linux server meeting the [system requirements](/docs/run-node/system-requirements)
- Firewall ports opened per the [Quick Start](/docs/run-node/quick-start#default-ports-to-open-on-firewall) guide
- Root or sudo access

## 1. Download the Node Binary

The recommended approach is to use the provided update script, which automatically detects your platform, downloads the latest binary with all signature files, and sets up the symlink.

<ScriptViewer src="/scripts/qnode-update.sh" title="qnode-update.sh" />

```bash
mkdir -p /opt/quilibrium/node && cd /opt/quilibrium/node
wget -O qnode-update.sh https://docs.quilibrium.com/scripts/qnode-update.sh
chmod +x qnode-update.sh
sudo ./qnode-update.sh
```

The script will detect your architecture, fetch the latest release, and download the binary, digest, and all signature files into `/opt/quilibrium/node`.

:::tip
This is the same script used for [updating the node](#using-the-update-script) and [automatic updates via cron](#automatic-updates-via-cron).
:::

<details>
<summary>Manual download (alternative)</summary>

Check the latest node release filenames:

```
https://releases.quilibrium.com/release
```

Download the binary and signature files for your platform.
Most Linux servers use `linux-amd64`:

```bash
mkdir -p /opt/quilibrium/node && cd /opt/quilibrium/node

# Replace <version> with the current version, e.g. 2.1.0.18
wget https://releases.quilibrium.com/node-<version>-linux-amd64
wget https://releases.quilibrium.com/node-<version>-linux-amd64.dgst
for i in $(seq 1 17); do
  wget https://releases.quilibrium.com/node-<version>-linux-amd64.dgst.sig.$i 2>/dev/null
done
```

:::note
The node binary has up to 17 signature files (`.dgst.sig.1` through `.dgst.sig.17`) from different signers.
Not all signature numbers may be present for a given release — missing ones are expected and can be ignored.
All downloaded signatures must be in the same directory as the binary for verification to succeed.
:::

Make the binary executable:

```bash
chmod +x node-<version>-linux-amd64
```

</details>

## 2. Create Symlinks

:::info
If you used the update script in step 1, the first symlink (`/opt/quilibrium/node/quilibrium-node`) is already created. You only need to create the `/usr/local/bin` symlink below.
:::

Create a symlink so the service file always points to a consistent name, avoiding edits on every update:

```bash
ln -sf /opt/quilibrium/node/node-<version>-linux-amd64 /opt/quilibrium/node/quilibrium-node
```

Create a second symlink in `/usr/local/bin` so you can run `quilibrium-node` from anywhere:

```bash
ln -sf /opt/quilibrium/node/quilibrium-node /usr/local/bin/quilibrium-node
```

## 3. Set Up the systemd Service

Create the service file:

```bash
nano /lib/systemd/system/quilibrium-node.service
```

Paste the following:

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

:::tip
Because `ExecStart` points directly at the node binary (via the symlink), systemd can send `SIGINT` to the node process for graceful shutdown.
This avoids the penalty risk described in the [Linux Configuration](/docs/run-node/linux_configuration) page where `release_autorun.sh` does not trap `SIGINT`.
:::

Enable and start the service:

```bash
systemctl daemon-reload
systemctl enable quilibrium-node
systemctl start quilibrium-node
```

:::info
`systemctl enable` ensures the node service starts automatically on system boot.
:::

## 4. Verify the Node Is Running

Check the service status:

```bash
systemctl status quilibrium-node
```

Follow the logs:

```bash
journalctl -u quilibrium-node -f --no-hostname -o cat
```

## Updating the Node

### Using the Update Script

If you followed [step 1](#1-download-the-node-binary), the update script is already installed.
It automatically detects your platform, checks for a new release, downloads any missing files, and restarts the service.

<ScriptViewer src="/scripts/qnode-update.sh" title="qnode-update.sh" />

Run it whenever you want to check for updates:

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

### Automatic Updates via Cron

You can schedule the update script to run automatically using cron.
This example checks for updates every hour and logs the output:

```bash
sudo crontab -e
```

Add the following line:

```
0 * * * * /opt/quilibrium/node/qnode-update.sh >> /var/log/qnode-update.log 2>&1
```

This runs the script at the top of every hour.
If no update is available, the script exits quietly. If a new version is found, it will download it, restart the service, and log the result.

To check the update log:

```bash
tail -50 /var/log/qnode-update.log
```

:::tip
Adjust the schedule to your preference. For example, `0 */6 * * *` checks every 6 hours, or `0 3 * * *` checks once daily at 3:00 AM.
:::

### Manual Update

When a new version is released:

1. Stop the node:

```bash
systemctl stop quilibrium-node
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
systemctl start quilibrium-node
```

No service file edits are needed because the symlink always points to the active binary.

## Useful Commands

| Action | Command |
|--------|---------|
| Start node | `systemctl start quilibrium-node` |
| Stop node | `systemctl stop quilibrium-node` |
| Restart node | `systemctl restart quilibrium-node` |
| Check status | `systemctl status quilibrium-node` |
| Follow logs | `journalctl -u quilibrium-node -f --no-hostname -o cat` |
| Check version in logs | `journalctl -u quilibrium-node -r --no-hostname -n 1 -g "Quilibrium Node" -o cat` |
