---
sidebar_position: 1
---

# Quick Start

:::tip Looking to interact with the network without running a node?
You don't need to run a node to check balances, transfer tokens, or perform other network operations.
See the [QClient](/docs/run-node/qclient/qclient-101) section to get started with the command-line client.
:::

## System Requirements

Your hardware directly determines how many workers your node can run, how quickly it completes proofs, and how much you earn in rewards.
Under-provisioned nodes will struggle to keep up with the network and may incur penalties.

Review the [system requirements](/docs/run-node/system-requirements) carefully before purchasing or renting a server.

## Node Install

See the [Node Provisioning](/docs/run-node/node-provisioning) page for a breakdown of all available install methods, including:

- [**QTools**](/docs/run-node/node-provisioning/qtools) (Recommended) — Automated provisioning and management
- [**Manual Install**](/docs/run-node/node-provisioning/manual-install) — Download the binary and set up a service yourself ([Linux](/docs/run-node/node-provisioning/manual-install/linux), [macOS](/docs/run-node/node-provisioning/manual-install/macos))
- [**Legacy Methods**](/docs/run-node/node-provisioning/legacy) — Release autorun script and QOne

## Default Ports to Open on Firewall

| **Port Range**       | **Protocol** | **Purpose**                          | **Notes**                                                                 |
|----------------------|--------------|--------------------------------------|---------------------------------------------------------------------------|
| 8336           | QUIC/UDP or TCP   | Master process p2p communication |                                         |
| 8340           | TCP   | Master process streaming communication  |                                        |
| 25000-25003* | QUIC/UDP or TCP   | Worker processes p2p communication      | Port range must be opened based on the number of worker processes. |
| 32500-32503* | TCP   | Worker processes streaming communication      | Port range must be opened based on the number of worker processes. |

*Using an example of 4 workers, 1 port for each, starting from the base port.

:::warning
As of version 2.1.0.19, the default worker port range changed from `50000`/`60000` to `25000`/`32500`.
If you are upgrading, see the [Worker Port Range Change](/docs/run-node/port-range-change) guide to determine if you are affected and how to update your setup.
:::

:::info

If you're running the node at your home (on a residential ISP), then you must additionally set up [port forwarding](https://portforward.com/router.htm) in order for your node to be reachable by the network.
For this use case, it's recommended to use TCP connection for your node.
This can be achieved by setting `listenMultiaddr` to `/ip4/0.0.0.0/tcp/8336` and `streamListenMultiaddr` to `/ip4/0.0.0.0/tcp/8340` in the [p2p section](/docs/run-node/advanced-configuration#peer-to-peer-networking-section) of the config, and `dataWorkerBaseListenMultiaddr` to `/ip4/0.0.0.0/tcp/%d` (don't omit the `%d`) in the [engine section](/docs/run-node/advanced-configuration#engine-section).

:::

## IP Address Ranges to Block with Firewall on a Hosted Server

Hosting providers commonly provide a public IP address while expecting the software running on your server to address other communication endpoints via public IP addresses. Any attempts to communicate with private address ranges are typically interpreted by the hosting provider as a network attack with the warnings being sent to the server operator and, if not corrected quickly, with the server network being suspended.
Properly configured servers running nodes behind NAT can start with a private IP address but will quickly learn their public IP with the peer assistance and start broadcasting it instead of the initial private IP address.
However, mis-configured nodes that cannot communicate with peers may end up broadcating private IP while provoking other nodes connecting to private IP address ranges.
To prevent connection attempts to the private IP ranges, the following firewalls rules can be added on Linux with `ufw` utility:

```bash
# Block RFC1918 private address ranges
ufw deny out to 10.0.0.0/8
ufw deny out to 172.16.0.0/12
ufw deny out to 192.168.0.0/16

# Block multicast
ufw deny out to 224.0.0.0/4

# Block broadcast
ufw deny out to 255.255.255.255
```

## Key and Store Backups

In order to run a node, access rewards or make token operations for your account, you need the node's **keyset** consisting of the `config.yml` and `keys.yml` files. You are strongly advised to maintain copies of these files in an encrypted backup.

**Worker data** is stored in `worker-store/[worker-id]`. It should also be regularly backed up, to make the node restoration faster (for example, in case of physical server failure) and avoid unnecessary penalties.

If this worker data is lost, it can be restored by running the node which will fetch the data from it's shard peers, but will result in missed rewards and penalties if the worker data is not restored in time.

Keyset and worker data are stored in your node's `.config` directory:

```text
.config/keys.yml
.config/config.yml
.config/worker-store/[worker-id]/
```
:::info
If you used the `release_autorun.sh` script, your config directory should be `ceremonyclient/node/.config`.
:::
