---
title: "Quilibrium Cluster Configuration Guide"
source: Community Contribution (Issue #28)
date: 2026-03-22
type: technical_reference
topics:
  - cluster
  - multi-server
  - workers
  - dataWorker
  - advanced configuration
  - p2p
  - stream
---

# Quilibrium Cluster Configuration Guide

Running a Quilibrium node as a **cluster** means distributing worker processes across multiple physical or virtual servers, rather than having the master node spawn them all locally. This is an advanced technique suited for operators who want to scale beyond what a single machine can handle.

## How Clusters Differ from Standard Operation

According to Cassie (Quilibrium founder), running a cluster differs from regular single-server operation in only two to four configuration areas:

### 1. Manual Listen Address Definitions

In a cluster setup, you manually define the listen addresses for both **p2p** and **stream** (dataWorker) interfaces on each worker machine, rather than relying on the defaults.

In your `config.yml` on each worker:

```yaml
engine:
  dataWorkerP2PMultiaddrs:
    - "/ip4/<WORKER_IP>/tcp/<P2P_PORT>"
  dataWorkerStreamMultiaddrs:
    - "/ip4/<WORKER_IP>/tcp/<STREAM_PORT>"
```

Replace `<WORKER_IP>` with the actual IP address of each worker server and choose appropriate port numbers.

### 2. Announce Parameters

If your workers are behind NAT or need to advertise a different public IP than they listen on, configure the announce multiaddrs:

```yaml
engine:
  dataWorkerAnnounceP2PMultiaddrs:
    - "/ip4/<PUBLIC_IP>/tcp/<P2P_PORT>"
  dataWorkerAnnounceStreamMultiaddrs:
    - "/ip4/<PUBLIC_IP>/tcp/<STREAM_PORT>"
```

### 3. Starting Workers Manually with `--core`

In a standard (single-server) setup, the master node process automatically spawns worker processes. In a cluster, **you start the workers manually** on each remote machine using the `--core` argument, because the master process cannot spawn processes on a remote machine.

```bash
# On each worker machine, start the worker with --core
./node-<version>-<os>-<arch> --core <CORE_NUMBER>
```

The `--core` flag tells the binary to run as a specific worker rather than as the master node.

### 4. Worker Count Configuration

Ensure the master node's `config.yml` reflects the total number of workers across all machines:

```yaml
engine:
  dataWorkerCount: <TOTAL_WORKERS_ACROSS_ALL_MACHINES>
```

## Key Configuration Reference

These are the relevant `config.yml` engine settings for cluster deployments:

| Setting | Description |
|---------|-------------|
| `dataWorkerP2PMultiaddrs` | Manual worker p2p multiaddresses |
| `dataWorkerStreamMultiaddrs` | Manual worker stream multiaddresses |
| `dataWorkerAnnounceP2PMultiaddrs` | Public IP multiaddrs for p2p peer-info broadcasts |
| `dataWorkerAnnounceStreamMultiaddrs` | Public IP multiaddrs for stream peer-info broadcasts |
| `dataWorkerBaseP2PPort` | Starting port for worker p2p (default: 25000) |
| `dataWorkerBaseStreamPort` | Starting port for worker streaming (default: 32500) |
| `dataWorkerCount` | Total number of data worker processes |
| `enableMasterProxy` | Proxy worker traffic through master (only for small local clusters) |

## Important Notes

- The `enableMasterProxy: true` option routes worker traffic through the master process. This is **only advisable for small local clusters** and adds latency.
- Each worker machine needs the same node binary and access to necessary keys.
- Port ranges must be opened on firewalls for all worker machines.
- Follow the 1:2:4 golden ratio (1 thread : 2 GB RAM : 4 GB storage) when sizing workers per machine.

## See Also

- [Advanced Configuration](https://docs.quilibrium.com/run-node/advanced-configuration) — full engine section reference
- [System Requirements](https://docs.quilibrium.com/run-node/system-requirements) — hardware sizing and worker count guidance
- [Port Range Change](https://docs.quilibrium.com/run-node/port-range-change) — port migration details for 2.1.0.19+
