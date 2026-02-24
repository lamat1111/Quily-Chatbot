---
sidebar_position: 2
title: "Release Autorun Script"
---

# Release Autorun Script

The release autorun script automatically downloads the latest `node` binary, runs it, checks for new version in the background and, if found, triggers the update including `node` restart.

## Installation

Create the node directory:

```bash
mkdir -p ceremonyclient/node && cd ceremonyclient/node
```

Download the release autorun script and validate that its content is in line with your expectations:
```bash
wget https://github.com/QuilibriumNetwork/monorepo/blob/release/node/release_autorun.sh
```

Make the script executable:
```bash
chmod +x release_autorun.sh
```

Run the script:
```bash
./release_autorun.sh
```

This script is intended to help get started quickly, but for robust deployments it is recommended to use some service orchestration solution (e.g. `systemd` on Linux).

## Running as a systemd Service

See the [Linux Configuration](/docs/run-node/linux_configuration) page for how to run the node as a `systemd` service with the autorun script.
