---
sidebar_position: 3
title: "macOS"
---

import ScriptViewer from '@site/src/components/ScriptViewer';

# macOS Manual Install

This guide covers installing and running the Quilibrium node on macOS with Apple Silicon using a launchd service.

## Prerequisites

- A Mac with Apple Silicon (M1/M2/M3/M4)
- macOS meeting the [system requirements](/docs/run-node/system-requirements)
- Administrator access

## 1. Download the Node Binary

The recommended approach is to use the provided update script, which automatically downloads the latest binary with all signature files and sets up the symlink.

<ScriptViewer src="/scripts/qnode-update-macos.sh" title="qnode-update-macos.sh" />

```bash
sudo mkdir -p /opt/quilibrium/node && cd /opt/quilibrium/node
sudo curl -L -o qnode-update.sh https://docs.quilibrium.com/scripts/qnode-update-macos.sh
sudo chmod +x qnode-update.sh
sudo ./qnode-update.sh
```

The script will verify you're on macOS, fetch the latest release, and download the binary, digest, and all signature files into `/opt/quilibrium/node`.

:::tip
This is the same script used for [updating the node](#using-the-update-script) and [automatic updates via cron](#automatic-updates-via-cron).
:::

<details>
<summary>Manual download (alternative)</summary>

Check the latest node release filenames:

```
https://releases.quilibrium.com/release
```

Download the binary and all signature files:

```bash
sudo mkdir -p /opt/quilibrium/node && cd /opt/quilibrium/node

# Replace <version> with the current version, e.g. 2.1.0.18
sudo curl -LO https://releases.quilibrium.com/node-<version>-darwin-arm64
sudo curl -LO https://releases.quilibrium.com/node-<version>-darwin-arm64.dgst
for i in $(seq 1 17); do
  sudo curl -LO https://releases.quilibrium.com/node-<version>-darwin-arm64.dgst.sig.$i 2>/dev/null
done
```

:::note
The node binary has up to 17 signature files (`.dgst.sig.1` through `.dgst.sig.17`) from different signers.
Not all signature numbers may be present for a given release — missing ones are expected and can be ignored.
All downloaded signatures must be in the same directory as the binary for verification to succeed.
:::

Make the binary executable:

```bash
sudo chmod +x node-<version>-darwin-arm64
```

</details>

## 2. Create Symlinks

:::info
If you used the update script in step 1, the first symlink (`/opt/quilibrium/node/quilibrium-node`) is already created. You only need to create the `/usr/local/bin` symlink below.
:::

Create a symlink so the service always points to a consistent name:

```bash
sudo ln -sf /opt/quilibrium/node/node-<version>-darwin-arm64 /opt/quilibrium/node/quilibrium-node
```

Create a second symlink in `/usr/local/bin` so you can run `quilibrium-node` from anywhere:

```bash
sudo ln -sf /opt/quilibrium/node/quilibrium-node /usr/local/bin/quilibrium-node
```

## 3. Set Up a launchd Service

macOS uses `launchd` instead of `systemd`. Create a plist file:

```bash
sudo nano /Library/LaunchDaemons/com.quilibrium.node.plist
```

Paste the following:

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

Load and start the service:

```bash
sudo launchctl load /Library/LaunchDaemons/com.quilibrium.node.plist
```

:::info
`RunAtLoad` and `KeepAlive` ensure the node starts automatically on boot and restarts if it exits.
:::

## 4. Verify the Node Is Running

```bash
sudo launchctl list | grep quilibrium
```

Follow the logs:

```bash
tail -f /opt/quilibrium/node/node.log
```

## Updating the Node

### Using the Update Script

If you followed [step 1](#1-download-the-node-binary), the update script is already installed.
It automatically checks for a new release, downloads any missing files, and restarts the launchd service.

<ScriptViewer src="/scripts/qnode-update-macos.sh" title="qnode-update-macos.sh" />

Run it whenever you want to check for updates:

```bash
sudo /opt/quilibrium/node/qnode-update.sh
```

The script will:
1. Verify you're on macOS with Apple Silicon
2. Query the release server for the latest version
3. Compare it against your currently installed version
4. Download the binary, digest, and all signature files (skipping any already present)
5. Unload the launchd service, update the symlink, and reload the service

If you are already on the latest version with all files present, the script exits with no changes.

### Automatic Updates via Cron

You can schedule the update script to run automatically using cron.
This example checks for updates every hour and logs the output:

```bash
sudo crontab -e
```

Add the following line:

```
0 * * * * /opt/quilibrium/node/qnode-update.sh >> /opt/quilibrium/node/qnode-update.log 2>&1
```

This runs the script at the top of every hour.
If no update is available, the script exits quietly. If a new version is found, it will download it, restart the service, and log the result.

To check the update log:

```bash
tail -50 /opt/quilibrium/node/qnode-update.log
```

:::tip
Adjust the schedule to your preference. For example, `0 */6 * * *` checks every 6 hours, or `0 3 * * *` checks once daily at 3:00 AM.
:::

### Manual Update

1. Unload the service:

```bash
sudo launchctl unload /Library/LaunchDaemons/com.quilibrium.node.plist
```

2. Download the new binary (replace `<new-version>` accordingly):

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

## Useful Commands

| Action | Command |
|--------|---------|
| Start node | `sudo launchctl load /Library/LaunchDaemons/com.quilibrium.node.plist` |
| Stop node | `sudo launchctl unload /Library/LaunchDaemons/com.quilibrium.node.plist` |
| Check status | `sudo launchctl list \| grep quilibrium` |
| Follow logs | `tail -f /opt/quilibrium/node/node.log` |
| Follow error logs | `tail -f /opt/quilibrium/node/node-error.log` |
