---
sidebar_position: 1
---

# System Requirements

## Supported Operating Systems

| Operating System | Architecture |
|------------------|--------------|
| Linux            | ARM, x86      |
| MacOS            | ARM           |
| Windows          | Not Supported* |

* You may use WSL to run a node on Windows.

## Minimum Hardware Requirements

The following requirements are for a single node.
These can be split across multiple servers if you are clustering, which is an advanced technique not suited for beginners.

The node software is designed to run on the supported operating systems listed above, assuming dedicated resources for the node:

| Component | Minimum Requirements |
|-----------|----------------------|
| CPU       | 4 threads            |
| RAM       | 8 GB                 |
| Storage   | 16 GB SSD            |

These minimums follow the [1:2:4 golden ratio](#workers-and-the-golden-ratio) — each thread the node uses requires 2 GB of RAM and 4 GB of storage.

### CPU

CPU specifications commonly list both cores and threads (e.g. "8C/16T" means 8 physical cores and 16 threads).
The node allocates work per thread, also referred to as a logical core or vCPU on virtual machines.

Hyperthreaded threads may not perform equally to physical cores.
Node operators should benchmark and monitor node performance, comparing proof start-to-completion times with different thread counts to find the optimal configuration for their hardware.

Higher clock speeds generally produce faster proof completions.
Hardware that supports **AVX2** or **AVX512** instruction sets performs significantly better than hardware that does not.
To take advantage of these instructions, you must use the AVX512 build of the node binary.

Performance varies by architecture: AMD Ryzen and Apple Silicon tend to outperform older Intel Xeons at comparable core counts.
Hardware with tightly integrated CPU, RAM, and caching — such as Apple Silicon or AMD Ryzen 9 series — tends to be more efficient due to vendor-specific optimizations.

### Memory (RAM)

Each thread the node uses requires a minimum of **2 GB of RAM**.
Insufficient memory leads to worker process crashes, degraded proof performance, and potential node instability.

### Storage

Each thread the node uses requires a minimum of **4 GB of SSD storage**.
Storage needs vary depending on whether the node stores data or operates as a compute-only node.
Many operators opt for 1 TB as a comfortable default, but this is not strictly required on a budget.

### Graphics Cards, ASICs, and FPGAs

GPUs are not used by the node software and are not natively supported.
Running hardware with an integrated or dedicated GPU will not impact performance positively or negatively — it is ignored entirely.

As the network evolves, support for ASICs, FPGAs, or other specialized hardware may emerge, but none are currently utilized.

## Workers and the Golden Ratio

### What Is a Worker?

The node spawns **worker processes** to perform computations and generate proofs.
By default, the node creates one worker per available thread.
Each worker requires its own dedicated allocation of CPU, RAM, and storage.

### The 1:2:4 Golden Ratio

The recommended resource allocation per worker is:

| Resource | Per Worker |
|----------|------------|
| CPU      | 1 thread   |
| RAM      | 2 GB       |
| Storage  | 4 GB SSD   |

This **1 thread : 2 GB RAM : 4 GB storage** ratio is the balanced allocation recommended for Quilibrium v2.1 and beyond.
Your most constrained resource determines how many workers your node can run.

### Calculating Your Worker Count

To find your maximum worker count, divide each resource by its per-worker requirement and take the **lowest** result.

**Example 1 — RAM is the bottleneck:**

| | Available | Per Worker | Max Workers |
|-|-----------|------------|-------------|
| CPU | 16 threads (8C/16T) | 1 thread | 16 |
| RAM | 24 GB | 2 GB | 12 |
| Storage | 100 GB SSD | 4 GB | 25 |

RAM is the most constrained resource, so this node should run **12 workers**.

**Example 2 — CPU is the bottleneck:**

| | Available | Per Worker | Max Workers |
|-|-----------|------------|-------------|
| CPU | 4 threads (4C/4T, no hyperthreading) | 1 thread | 4 |
| RAM | 32 GB | 2 GB | 16 |
| Storage | 200 GB SSD | 4 GB | 50 |

CPU is the most constrained resource, so this node should run **4 workers**.

### Setting Worker Count

If the default (one worker per thread) exceeds what your hardware can support, you should manually limit the worker count.

You should consider limiting workers if:
- You see memory warnings in your node logs
- Your system is running out of RAM or disk space
- You want to reserve resources for other applications
- You are testing with minimal hardware

To set the number of workers, edit your `config.yml` file (located in `.config/config.yml` relative to your node's working directory):

```yaml
engine:
  dataWorkerCount: 12
```

After editing, restart your node for the changes to take effect.

:::tip
If you are unsure about your current worker count, check your node logs during startup — it will show how many workers are being spawned.

You can also check the number of running worker processes directly.

Worker processes are launched with a `--core` flag, so you can count them on any system:

```bash
ps aux | grep "\-\-core" | grep -v grep | wc -l
```

If you are running the node as a **systemd** service on Linux:

```bash
systemctl status <your-service-name>
```
:::

For more details on the `engine` section configuration, see [Advanced Configuration](/docs/run-node/advanced-configuration#engine-section).

## Hardware Selection

The minimum hardware requirements above are a bare minimum.
Any node that uses just the minimum will find that rewards are minimal.
Minimums may be useful for setting up a local testnet for development, testing, experimentation, or just for fun.

You can increase your rewards by using hardware with more threads (and the corresponding RAM and storage), as well as finding hardware combinations that perform better at high-performance CPU workloads.

### Clock Speeds

Higher clock-speed CPUs are generally faster for the node software, and more modern CPUs may have additional features that improve performance.

More cores may not always produce better results, especially with older hardware, but generally when comparing two servers with similar architecture and clock speed, more cores yield better overall performance.

More cores also generate more heat, which may lead to thermal throttling and lower performance.

When a node must provide a computation, it needs to submit its proofs in a relatively short period of time.
When using many cores on the same unit, the node will by default use as many as possible, which can cause throttling and slow down overall performance.
This may require manually [setting the worker count](#setting-worker-count) below the total available threads.

Some hardware may not be able to meet the computation speed requirement even at minimum specs if it is too slow or old.

### Renting vs Owning

Many people use VDS's or rent servers from service providers, however it should be noted that this may not be the best long-term strategy as it generally is more cost-prohibitive than purchasing hardware and using co-location services.

Using VPS services to run a node is not recommended at all due to poor performance and many service providers throttle your hardware either due to other shared software and how performance intense Node resource usage can be.

VDS's offer better performance, but often are price prohibitive than renting bare-metal (dedicated hardware for rent) or outright purchasing your own hardware.

Some bare-metal providers (for renting entire servers) offer low prices, but often are kept secret due to competitive reasons, so some amount of leg-work to find suitable price-points is needed. Also, cheaper is rarely better in terms of reliability and node runners who choose to engage in bottom-dollar dealers may find themselves scammed, poor customer service, and/or poorly configured servers.

Owning requires you to use your own network connection(s) or to utilize co-location services to host your server.  Not all service providers are the same.

Owning also requires more hands-on work to maintain, run, and configure/set up.

There are trade-offs to both approaches and many may find themselves starting with renting for ease of starting and eventually migrating to owning as they are more comfortable.

It would be a viable strategy to test node performance on rented servers before committing to purchasing.

## Network Requirements
Network requirements are made up of network speed (how fast your data can be transmitted), network hardware (routers, switches, network cards), which impacts your overall bandwidth (amount of data being ingressed/egressed).  Network latency will also impact how your node is seen by others.

### Bandwidth
The bandwidth requirements are case-dependent.

Higher bandwidth is not necessarily better, as the amount needed is more around supply/demand and how much storage the shard is using that the node is proving over.

In the case that a shard has a high amount of storage, a node would need more bandwidth to send/receive the data on demand.

### Network Speeds
Often times a hosting provider will describe their services with just bandwidth, but a savvy node operator should know the difference between bandwidth and network speed.

The network provider may allow say, 1 TB of bandwidth, this may not actually reflect how fast your network speed is.

Think of it this way, in a month, if your node's connection is high bandwidth, it does not actually mean your upload/download speeds will be fast.

If your hardware is connected with a 100Mpbs connection it will be slower to actually download than using a fully optimized 1Gbps connection, even if the bandwidth is 1TB/month for both.

Providers may or may not advertise this, so inquires may be needed, and hosting providers may charge additional fees to use higher speeds.

### Network Latency
When meshing in the network, nodes often will drop really slow/unrepsonsive peers that do not meet a certain latency threshold.

When running a node behind a home network, poorly optimized provider, or in a remote location with few peers, finding peers that will regularly connect to your node may be difficult, preventing or delaying your node from recieving updated network information.

## Changes in Quilibrium v2.1

Quilibrium v2.1 changes how hardware impacts rewards compared to v2.0.

In v2.0, faster CPUs increased rewards by supporting more worker processes, but v2.1 introduces higher memory and storage demands per worker, reducing the CPU's primary role.

A balanced setup following the [1:2:4 golden ratio](#workers-and-the-golden-ratio) is now recommended for v2.1's long-term design, making earlier CPU-heavy over-allocation less effective.

Low-end options like Raspberry Pis function (with modest rewards and clustering potential), while modern hardware like AMD Ryzen, Apple Silicon (e.g., Mac Minis), and high-core servers excel; older Xeons typically underperform.

### Hardware Expected Performance in v2.1


| Hardware Type                  | Expected Performance (v2.1) | Notes                                      |
|--------------------------------|-----------------------------|--------------------------------------------|
| Raspberry Pi                   | Low                        | Viable for testing or clusters; modest rewards |
| Older Xeon (2000s)             | Very Low to Unusable       | Struggles with slow memory/disks; needs optimization |
| AMD Ryzen/7702 Series          | Moderate to High           | Strong in v2.0; still good but less dominant |
| Apple Silicon (e.g., M1/M2, Mac Mini) | High                | Efficient, integrated; excels standalone or clustered |
| Modern High-Core Server (e.g., AMD EPYC) | High              | Best with modern CPUs, ample RAM/storage   |
