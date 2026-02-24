---
sidebar_position: 1
---

# 2.1 Upgrade Guide

The following guide is divided into two sections: Default Configuration (where nothing in .config/config.yml has been modified), and Advanced 2.1 Settings, for cases like specialized clusters.

## Default Configuration

### Worker Configuration

The default configuration utilizes a template string defined in the [engine section](/docs/run-node/advanced-configuration#engine-section), `dataWorkerBaseListenMultiaddr`. The default value for this is `/ip4/127.0.0.1/tcp/%d`. If this value is detected after the 2.1 cutoff frame, it will be replaced with `/ip4/0.0.0.0/tcp/%d`, as the updated workers must now have their ports opened. To safely allow the transition between 2.0 to 2.1 without needing to expose the 2.0 workers unnecessarily, the dual series of ports for libp2p and streaming for workers have two new base values: `dataWorkerBaseP2PPort` (default value of `25000` as of 2.1.0.19), and `dataWorkerBaseStreamPort` (default value of `32500` as of 2.1.0.19). For your workers, ensure those ports, for as many workers your node runs, are open, e.g. for four worker processes, the ports 25000, 25001, 25002, 25003, 32500, 32501, 32502, 32503 need to be open.

:::warning
As of version 2.1.0.19, the default worker port range changed from `50000`/`60000` to `25000`/`32500`.
If you were previously using the `50000`/`60000` range, see the [Worker Port Range Change](/docs/run-node/port-range-change) guide for details on who is affected and how to update your firewall, port forwarding, and configuration.
:::

### Master Configuration

The default configuration has an additional port required to be open for the master node process, defined in `streamListenMultiaddr` in the [p2p section](/docs/run-node/advanced-configuration#peer-to-peer-networking-section), with a default value of `/ip4/0.0.0.0/tcp/8340`. It is now mandatory that the ports for workers and master processes are open, if the node fails its reachability test, it will halt to inform you of this.

## Advanced 2.1 Settings

### Networking

#### Worker Configuration

If you have manually configured your workers by setting explicit values in `dataWorkerMultiaddrs` in the [engine section](/docs/run-node/advanced-configuration#engine-section), these values will be ignored after the 2.1 cutoff frame. Instead, the p2p and stream ports of the workers are defined respectively in `dataWorkerP2PMultiaddrs` and `dataWorkerStreamMultiaddrs`. We _strongly_ recommend choosing different values from the `dataWorkerMultiaddrs`, as the `dataWorkerMultiaddrs` in 2.0 should not be exposed to the outside world, and the new sets of ports _must_ be.

#### Master Proxy

If you wish to proxy traffic from the worker processes through the master process (typically not advisable unless the number of workers is small and local to the master), set `enableMasterProxy` to `true` in the [engine section](/docs/run-node/advanced-configuration#engine-section). If you enable this setting and the workers are using different configuration files, ensure it is set in all config files.

#### Master Configuration

The default configuration has an additional port required to be open for the master node process, defined in `streamListenMultiaddr` in the [p2p section](/docs/run-node/advanced-configuration#peer-to-peer-networking-section), with a default value of `/ip4/0.0.0.0/tcp/8340`. It is now mandatory that the ports for workers and master processes are open, if the node fails its reachability test, it will halt to inform you of this.

### Storage

#### Worker Stores

Workers now maintain their own store paths. This value is the `workerPathPrefix` in the [db section](/docs/run-node/advanced-configuration#database-section), with a default value of `.config/worker-store/%d`. Your worker core ids will be filled in for the `%d` value. If you wish to manually override the worker store directory, you may set them in `workerPaths`.

#### Threshold Triggers

Log events are emitted, in increasing severity, until the final trigger, where the process terminates, for values of storage capacity utilization. This ensures that the node does not end up in an irreconcilable state. These values can be overridden, but it may not be wise to override them. The values are also in the [db section](/docs/run-node/advanced-configuration#database-section): `noticePercentage` (default value `70`), `warnPercentage` (default value `90`), `terminatePercentage` (default value `95`). The determination of usage percentage is based on the partitions the stores live within.

### Rewards, Strategies and Archival Mode

#### Reward Strategy

By default, the `rewardStrategy` value is set to `"reward-greedy"` in the [engine section](/docs/run-node/advanced-configuration#engine-section). This is likely the preferred value, unless you are wanting to run the node for the purpose of strictly providing greater data redundancy. If so, change the value to `"data-greedy"`.

#### Override Shard Coverage

By default, the reward greedy strategy will pick shards automatically for the workers. If, however, you wish to override the specific bitmask filters split out for the workers, you can override them in `dataWorkerFilters` in the [engine section](/docs/run-node/advanced-configuration#engine-section).

#### Archival Mode

The node by default will also not hold historic frame data unless `archiveMode` is set to `true` in the [engine section](/docs/run-node/advanced-configuration#engine-section). This setting is primarily only useful for building network explorers and debugging purposes.

#### Delegate Reward Address

Workers by default will use the address derived from the prover key of the node for reward targets. If you wish to choose a different address for any reason, set the `delegateAddress` in the [engine section](/docs/run-node/advanced-configuration#engine-section). This value must be in the hexadecimal string (the account value from `qclient token balance` output) format, without the `0x` prefix.
