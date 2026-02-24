---
sidebar_position: 3
---

# Advanced Configuration

Configuration is managed via the `config.yml` file, located in the config directory either specified at runtime or defaulting to the `.config/` folder in the node project.

If there are multiple options listed for a configuration value, the first one is the default value.

## Enacting Config Changes

Be sure to restart your node after making any configuration changes.

## Key Section

The key section specifies the key provider configuration:

```yaml
key:
  keyManagerType: file – Key manager the node should use
  keyManagerFile:
    path: .config/keys.yml | <string> – Path to key file
    createIfMissing: false | true – If true, the node will (re-)create the missing key file
    encryptionKey: <hex string> – Hexadecimal encryption key (without 0x prefix)
```

By default, the file-based key manager is specified. Support for in-memory, PKCS11 and RPC will be enabled in a subsequent upgrade.

## Peer-to-Peer Networking Section

The p2p section specifies general connectivity and BlossomSub-specific parameters:

```yaml
p2p:
  d: 8 | <int> – Optimal degree for a BlossomSub bitmask mesh
  dLo: 6 | <int> – Lower bound on the number of peers in a bitmask mesh
  dHi: 12 | <int> – Upper bound on the number of peers in a bitmask mesh
  dScore: 4 | <int> – Number of high-scoring peers to retain when pruning mesh
  dOut: 2 | <int> – Minimum number of outbound connections to maintain in mesh
  historyLength: 9 | <int> – Size of message cache used for gossip (in heartbeats)
  historyGossip: 6 | <int> – Number of cached message IDs to advertise in IHAVE messages
  dLazy: 6 | <int> – Minimum peers to emit gossip to at each heartbeat
  gossipFactor: 0.25 | <float64> – Factor affecting how many peers receive gossip each heartbeat
  gossipRetransmission: 3 | <int> – Times a peer can request the same message before being ignored
  heartbeatInitialDelay: 100ms | <time.Duration> – Delay before heartbeat timer begins after initialization
  heartbeatInterval: 700ms | <time.Duration> – Time between heartbeats
  fanoutTTL: 60s | <time.Duration> – How long to track fanout state for unpublished bitmasks
  pruneBackoff: 60s | <time.Duration> – Backoff time for pruned peers
  unsubscribeBackoff: 10s | <time.Duration> – Backoff time when unsubscribing from a bitmask
  connectionTimeout: 30s | <time.Duration> – Timeout for connection attempts
  directConnectInitialDelay: 1s | <time.Duration> – Initial delay before opening connections to direct peers
  graftFloodThreshold: 10s | <time.Duration> – Time threshold for GRAFT following a PRUNE
  iWantFollowupTime: 3s | <time.Duration> – Wait time for message requested through IWANT
  connectors: 8 | <int> – Number of active connection attempts for peers from PX
  maxPendingConnections: 128 | <int> – Maximum number of pending connections from PX
  directConnectTicks: 300 | <uint64> – Heartbeat ticks for attempting to reconnect direct peers
  opportunisticGraftTicks: 60 | <uint64> – Heartbeat ticks for opportunistic grafting
  opportunisticGraftPeers: 2 | <int> – Number of peers to opportunistically graft
  maxIHaveLength: 5000 | <int> – Maximum number of messages in an IHAVE message
  maxIHaveMessages: 10 | <int> – Maximum IHAVE messages to accept from a peer per heartbeat
  maxIDontWantMessages: 5000 | <int> – Maximum IDONTWANT messages to accept per heartbeat
  iDontWantMessageThreshold: 1024 | <int> – Size threshold for sending IDONTWANT messages
  iDontWantMessageTTL: 60 | <int> – TTL for IDONTWANT messages (in heartbeats)
  validateQueueSize: 16384 | <int> – Size of the validation queue
  validateWorkers: [core-count] | <int> – Number of workers for validation (defaults to core count)
  subscriptionQueueSize: 16384 | <int> – Size of the subscription queue
  peerOutboundQueueSize: 128 | <int> – Size of outbound message channel per peer
  listenMultiaddr: "/ip4/0.0.0.0/tcp/8336" | <multiaddr> – Master process multiaddr to listen on for p2p connections
  streamListenMultiaddr: "/ip4/0.0.0.0/tcp/8340" | <multiaddr> – Master process multiaddr to listen on for streaming connections
  announceListenMultiaddr: <multiaddr> – [WARNING] Forced master process p2p multiaddr with public IP for peer-info broadcasts
  announceStreamListenMultiaddr: <multiaddr> – [WARNING] Forced master process stream multiaddr with public IP for peer-info broadcasts
  peerPrivKey: <hex string> – The private key for the peer (without 0x prefix)
  traceLogFile: <string> – Path to the trace log file
  network: <uint8> – The network identifier
  bootstrapPeers: <multiaddr[]> – List of bootstrap peer multiaddresses
  directPeers: <multiaddr[]> – List of direct peer multiaddresses
  lowWatermarkConnections: 160 | <int> – Low watermark for peer connections
  highWatermarkConnections: 192 | <int> – High watermark for peer connections
  grpcServerRateLimit: 10 | <int> – Rate limit for GRPC server
  minBootstrapPeers: 3 | <int> – Minimum number of bootstrap peers required
  bootstrapParallelism: 10 | <int> – Number of parallel bootstrap operations
  discoveryParallelism: 50 | <int> – Number of parallel discovery operations
  discoveryPeerLookupLimit: 1000 | <int> – Maximum number of peers to lookup during discovery
  pingTimeout: 5s | <time.Duration> – Timeout for ping operations
  pingPeriod: 30s | <time.Duration> – Period between ping operations
  pingAttempts: 3 | <int> – Number of ping attempts before considering a peer unreachable
  peerReconnectCheckInterval: 60s | <time.Duration> – Interval between peer checks after node start, retries peering if no peers are found
```
:::warning

The `announce` parameters should only be used on situations when regular P2P mechanism for determining the public IP address of your node do not produce consistent correct results. Use these with caution as errors in their values can make your master process unreachable to peers.

:::


## Engine Section

The engine section specifies attributes which define protocol engine defaults.

```yaml
engine:
  provingKeyId:  – The identifier of the proving key, retrieved by the key manager, e.g. default-proving-key
  filter:  – The section of the bloom filter the node will listen to (without 0x prefix)
  genesisSeed:  – The seed value used for the first frame (without 0x prefix)
  pendingCommitWorkers:  – The number of goroutines used to perform worker operations
  minimumPeersRequired: 3 – Minimum number of peers required for the node to function
  statsMultiaddr:  – The multiaddress for the stats server
  dataWorkerBaseListenMultiaddr: "/ip4/0.0.0.0/tcp/%d" – Format string for worker listen addresses, if the prior default using localhost addresses is present, it will switch to the new default automatically.
  dataWorkerBaseP2PPort: 25000 – Starting port number for worker p2p communication (changed from 50000 in 2.1.0.19)
  dataWorkerBaseStreamPort: 32500 – Starting port number for worker streaming (changed from 60000 in 2.1.0.19)
  dataWorkerMemoryLimit: 1880981504 – Memory limit for each worker process (1.75 GiB)
  dataWorkerP2PMultiaddrs: <string[]> – Manual specification of worker p2p multiaddresses
  dataWorkerStreamMultiaddrs: <string[]> – Manual specification of worker stream multiaddresses
  dataWorkerAnnounceP2PMultiaddrs: <multiaddr[]> – [WARNING] Forced worker process p2p multiaddrs with public IP for peer-info broadcasts
  dataWorkerAnnounceStreamMultiaddrs: <multiaddr[]> – [WARNING] Forced worker process stream multiaddrs with public IP for peer-info broadcasts
  dataWorkerFilters: <string[]> – Manual specification of shard filters chosen by workers
  dataWorkerCount: <int> – Number of data worker processes to spawn
  multisigProverEnrollmentPaths: <string[]> – Paths to enrollment keys for multisig proving
  syncTimeout: 4s – Maximum wait time for frame downloads from peers
  syncCandidates: 8 – Number of candidate peers per category to sync with
  syncMessageLimits:
    receiveLimit: 1048576 | <int> – GRPC message receive limit (1 MiB)
    sendLimit: 629145600 | <int> – GRPC message send limit (600 MiB)
  enableMasterProxy: false | true – Whether to proxy worker traffic through master process
  rewardStrategy: "reward-greedy" | "data-greedy" – Strategy for rewards ("reward-greedy" or "data-greedy")
  archiveMode: false | true – Whether to retain historic frame data
  delegateAddress: <hex string> – Hexadecimal address for rewards (without 0x prefix)
```

:::warning

The `announce` parameters should only be used on situations when regular P2P mechanism for determining the public IP address of your node do not produce consistent correct results. Use these with caution as errors in their values can make your worker process unreachable to peers.

:::

:::info

Worker `announce` parameters can be used with automatic worker spawning using `basePort` parameters. Make sure to match the port number for each worker process.

:::

## Logger Section

The logger section specifies optional configuration for logging master and worker process messages to process-specific files instead of printing all processes' messages to standard output.

```yaml
logger:
  path: <string> – Path to the directory where master and worker log files should be stored, e.g. ".logs"
  maxSize: <int> – Maximum size of the log file in megabytes before it gets rotated, e.g. 50
  maxBackups: <int> – Maximum number of rotated log files to retain, 0 to disable, e.g. 0
  maxAge: <int> – Maximum number of days to retain rotated log files, 0 to disable, e.g. 10
  compress: <bool> – Compress the rotated log files using gzip, e.g. true
```

## Database Section

The database section specifies configurations of the underlying store.

```yaml
db:
  path: ".config/store" | <string> – Path to the database directory
  workerPathPrefix: ".config/worker-store/%d" | <string> – Format string for worker store paths, %d is replaced with worker core ID
  workerPaths: <string[]> – Manual override for worker store paths
  noticePercentage: 70 | <int> – Storage capacity threshold for emitting notices (percentage)
  warnPercentage: 90 | <int> – Storage capacity threshold for emitting warnings (percentage)
  terminatePercentage: 95 | <int> – Storage capacity threshold for terminating the process (percentage)
```

## Additional Fields

This section denotes all additional configuration values at the root of the config file.

```yaml
listenGrpcMultiaddr: <multiaddr> – local multiaddr the master process will listen on for gRPC calls
listenRESTMultiaddr: <multiaddr> – local multiaddr the master process will listen on for REST requests
```

## 2.0 Combined Seniority Prover Keys

The upgrade to 2.0 introduced the concept of seniority with respect to precedence in joining prover rings. Seniority is a special global-level value which the network uses to resolve conflicts on enrollment attempts on a prover ring. During the first 24 hours of the upgrade's release, no transactions can happen on the network, and no prover ring enrollment occurs. Afterwards, when the network is unlocked, nodes will automatically attempt to join the prover rings they are capable of supporting, based on the data workers of the node. This process requires no action on the part of the node operator, unless you specifically wish to combine keys previously used to increase seniority.

Note, you can only combine _one_ set of keys from 1.4.19 and above with older keys, and seniority of the older keys is not a pure summation – overlapping ranges are not counted multiple times, and their use for prover enrollment can only occur _once_ (you cannot use older keys twice for multiple sets of 1.4.19 keys). If you use multiple sets of keys from after 1.4.19, only one will be used for seniority for post-1.4.19 seniority.

Each bundle of keys/store files should live in separate folders (e.g. 1.4.19 config in `.config/`, older keys in `.config1/`, `.config2/`, `.config3/`).

### Merging keys with qclient

For the example provided, it is assumed qclient lives in the `client/` folder alongside the `node/` folder where the `.config*/` folders are contained:

```yaml
qclient config prover merge ../node/.config ../node/.config1 ../node/.config2 ../node/.config3
```

Be sure to restart your node after running this command.

The 1.4.19+ config folder should be the first folder in this series.

To see what seniority this combination yields (minus the effective range for the 1.4.19+ keys, which is determined after stasis unlock) without making permanent changes, append `--dry-run` to the end of the command.

### Merging keys in the config.yml file

Under the `engine` section noted above, add the optional field `multisigProverEnrollmentPaths`:

```yaml
engine:
  # ... other items omitted ...
  multisigProverEnrollmentPaths: [
    "/path/to/.config1/",
    "/path/to/.config2/",
    "/path/to/.config3/"
  ]
```

## Direct Peers

The `directPeers` field is used to specify a list of multiaddrs to use for direct connections.  This is useful for where you have one or more trusted peers that can aid in keeping in sync or bringing your node up to date.

This needs to be specified in the `config.yml` file <ins>for all connecting nodes</ins>. Otherwise the recipient will start scoring the sender really low for misbehavior.

For instance, if you have two nodes, peerA and peerB, you would edit the `config.yml` file for both peerA and peerB to include the other peer in the `p2p.directPeers` field.

This is useful for if you already have a node running and want to add a new node to the network.  It will allow the new node to quickly sync up with the existing network due peering with your already up-to-date node.

Both nodes do not need to be on at the same time or be started/stopped together.  The only requirement is that they are both defined in the other node's `p2p.directPeers` list.

### Example
```yaml
p2p:
  directPeers:
    - /ip4/192.168.1.100/udp/8336/quic-v1/p2p/Qm1234567890abcdef
    - /ip4/192.168.1.101/tcp/8336/p2p/Qm1234567890abcdef
```

## Using yq to update the config.yml file

The `yq` command line tool can be used to update the `config.yml` file.  This tool is useful for making changes to the `config.yml` file without having to manually edit the file.

Install help and examples can be found on [yq docs](https://mikefarah.gitbook.io/yq).
