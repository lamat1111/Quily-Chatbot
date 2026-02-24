---
sidebar_position: 6
---

# Linux Configuration
## Running the node as systemd service

To run your node via `systemd`, create the service file:

```bash
nano /lib/systemd/system/ceremonyclient.service
```

Paste the following code and update the node working directory, if necessary:

```bash
[Unit]
Description=Quilibrium Node Service
StartLimitIntervalSec=0
StartLimitBurst=0

[Service]
Type=simple
Restart=always
RestartSec=5s
WorkingDirectory=/root/ceremonyclient/node
ExecStart=bash -e /root/ceremonyclient/node/release_autorun.sh
KillSignal=SIGINT
RestartKillSignal=SIGINT
FinalKillSignal=SIGKILL
TimeoutStopSec=30s

[Install]
WantedBy=multi-user.target

```

:::warning

The above setup allows easy management and auto-updates of the node by executing the release_autorun.sh, but won't work to stop the node gracefully (SIGINT), which could cause your node to receive penalties. The reason is that the SIGINT command is not trapped by the release_autorun.sh, which is the one running your node process.\
A better setup would be to change the ExecStart line of the service file and use the correct node binary file name there. If you do this, you will have to manually update the node as well as edit your service file with the new binary name.

:::

Save the file and close the text editor.

Enable the service, so it starts automatically upon each reboot:
```bash
systemctl daemon-reload && systemctl enable ceremonyclient
```

Start the node service:
```bash
systemctl start ceremonyclient
```

## Useful node commands

### Service commands
*The below commands will work when running a node via systemd service file*

Start node service
```bash
systemctl start ceremonyclient
```

Stop node service
```bash
systemctl stop ceremonyclient
```

Restart node service
```bash
systemctl restart ceremonyclient
```

Check node service log
```bash
journalctl -u ceremonyclient.service -f --no-hostname -o cat
```

Check node version via service log
```bash
journalctl -u ceremonyclient -r --no-hostname  -n 1 -g "Quilibrium Node" -o cat
```

Check node service status
```bash
systemctl status ceremonyclient
```

### General node commands
:::info
Replace `<version>`, `<os>` and `<arch>` placeholders accordingly, e.g. `node-2.1.0.4-linux-amd64` or `node-2.1.0.4-macos-arm64`
:::

Printing node peer ID
```bash
./node-<version>-<os>-<arch> -peer-id
```

Printing node info
```bash
./node-<version>-<os>-<arch> -node-info
```
Printing node balance
```bash
./node-<version>-<os>-<arch> -balance
```
