---
title: "Quilibrium 2.1 Post-Enrollment Kickoff: Technical Deep Dive"
source: youtube
youtube_url: https://www.youtube.com/watch?v=Ey8-H6uxfXI
author: Cassandra Heart
date: 2025-11-12
type: livestream_transcript
topics:
  - roadmap
  - architecture
  - node-operation
  - security
  - mpc
---


## The History of Quilibrium

Over eight years ago, this project started as "Howler"—an alternative to Discord for teaching others how to build applications at world scale. Through that process, I was building what I thought was a cooler Discord.

At the time, there was significant censorship on Discord. The Wall Street Bets community got banned over in-group terminology that Discord didn't find acceptable. This reflected something important: arbiters of content control is not an acceptable solution when operating at world scale.

There's governmental pressure, as we saw during COVID with what Elon exposed after buying Twitter—governmental pressure pushing platforms to suppress content. Different governments push social media providers to suppress content and monitor citizens. This comes from being a centralized service.

### Why Not Existing Blockchains?

Looking at crypto at the time (Bitcoin, Ethereum, Solana), none were capable of processing transactions at a rate comparable to a reasonable messaging service. Dozens of projects tried decentralized messaging, but they always converged on: put it on a blockchain and charge fees for every message.

We learned before Bitcoin existed that paying money to send messages doesn't work. There was this concept called HashCash—iterating through a hash function to reach a random number with enough leading zeros, proving sufficient computation. That's the foundation of proof of work.

This was useful for spam prevention because it wasn't financial—anyone sending messages at a regular rate could produce it, but spammers couldn't.

### Building Decentralized Infrastructure

How do we solve decentralized distributed messaging? From a decentralized perspective, we need something capable of operating at scale. Blockchains have bandwidth constraints too limited for sufficient throughput.

I started piecing together crypto inventions that enabled trustless compute at reasonable scale without global consensus coordination issues that cause scaling limitations.

As I built out the underpinnings for this decentralized Discord clone, I realized I was building a decentralized AWS. Around 2019, I renamed the project to Quilibrium to focus on what it's actually trying to achieve.

## How Node Enrollment Works

When enrollment processes, nodes will decide to join and then wait. They wait until (in network time) the 24th hour frame has passed. That's what enables them to confirm.

### The Confirmation Process

In confirmation, nodes make one of two choices:

1. **Confirm**: Re-examine state from all allocation attempts based on seniority. If you joined early with low seniority and provers with higher seniority joined your shard, they end up at ring zero while you end up at ring one (worth less in QUIL gain).

2. **Reject and Re-propose**: Your node could benefit by re-proposing for a different shard. If rejecting, it produces a reject and join message simultaneously to avoid wasting time finding the most valuable shard.

### Allocation Strategies

The default configuration is **reward greedy**—optimizing for maximum rewards. The alternative is **data greedy** (default for archive nodes)—maximizing data collection and coverage for the network.

At the beginning, these strategies are basically the same for rewards. Over time, the reward optimization will produce meaningful differences in shard allocations.

## Technical Deep Dive: Consensus and Anti-Gaming Mechanisms

### Lessons from 2.0: The Probabilistic Proof Problem

In 2.0 as a proof-of-work protocol, people tried to game the system. The proofs were probabilistic—choosing a random set of workers to produce small enough proofs without doing VDF verification for every worker.

Each proof is 516 bytes. For a 100,000 worker cluster, that's precisely 49 megabytes every frame—absurdly expensive traffic. So we used probabilistic proofs: taking a challenge based on the next proof iteration, working backward through the tree, finding log(n) entries and producing a Merkle proof.

This meant if one of 100,000 workers failed, you could insert zero or random bytes. The commitment would have 99,999 valid commitments, one invalid, but by pure chance it's unlikely to be picked.

People optimized this, producing frequent proofs even with frequently failing workers. Technically within the rules, this caused a schism.

We introduced logarithmic proofs more likely to detect failures. Detection resulted in complete removal from the proofing system—heavily weighted against misbehavior.

### The VDF Multi-Proof Solution

We went further by amending how app shards produce output frames.

On the global side, proving the next state produces a Wesolowski VDF proof—convincing a verifier that the node spent that amount of time.

On the app shard side, with up to 36 provers per shard, if one of 36 is the leader, 35 provers aren't actively contributing that round.

We amended how signatures work. For voters on the global side, signing creates a BLS signature. On the app side, you also inject a proof.

Instead of generating proofs at sign time (which would timeout every consensus phase), we use a proof cache. Proofs generate when the dedicated leader is chosen. We call the same `leader_for_rank` function as every other participant.

If we're not the next leader, we get our prover address, confirm it's correct, get our index position (e.g., 24 of 36), and calculate a **VDF multi-proof**.

This isn't like KZG multi-proofs—it's a VDF multi-proof leveraging quadratic imaginary integer algebra. You generate a VDF proof contribution using the same compute the next leader is doing. This output concatenates with your signature payload in the vote.

When votes are tallied into the quorum certificate, it includes a combinatorial VDF proof verifiable to confirm every participant is actively participating—not faking it.

## Roadmap: What's Next

### Version 2.1.1
- Encrypted query evaluator using ORAM-based lookup (instead of pairwise hypergraph walks)
- Full analytic privacy through ORAM query support (K-anonymity through onion routing isn't enough)

### Version 2.2
- Supporting certain types of encrypted streaming data

### Version 2.3 (or 2.2)
- Iterative execution for continuations
- MetaVM support

### Alt-Fee Basis App Shards

A powerful feature: you can run a shard that isn't consensus-bearing. It imparts a commitment at the global level but doesn't participate in normal consensus. Data is addressable and provable by network participants without maintaining the cost of paying for that shard.


## Bidirectional Ethereum Bridge

The bridge uses alt-fee basis app shards. We run an Ethereum execution node, generate output execution state into KZG polynomial commitment format, and pull it in as an alt-fee basis app shard—costing only 74 bytes rolled into consensus as part of 19 kilobytes of global proof state.

With this, you can prove anything about Ethereum's network state, enabling bidirectional bridging.

**Finality considerations**: Ethereum has probabilistic finality. After two epochs, it's truly finalized. Many accept 6-7 blocks for low-value transfers. Exchanges wait the full time. For Q, same approach.

### What Can Be Bridged

Once state is imported, we can support bidirectional bridging of:
- QUIL and wQUIL tokens
- Any standard ERC-20 (except weird rebasing tokens)
- ERC-721 collectibles (NFTs)

**The privacy advantage**: You can take IPFS data, the ERC-721, bridge it into a collectible on Q including the data—and it all stays private. Data bridges in encrypted format. The network knows your transaction was real and correct but doesn't know what you actually did.

Any EVM-compatible collectible or token can become a private token immediately. No other network has done this before.

### Expansion Plans

This process extends to:
- Solana (SPL tokens)
- Other chains
- Social media chains like Farcaster

## Quorum Mobile: Farcaster Integration

Quorum Mobile is now also a Farcaster client. For conversations and messages, they stay private. For public posts you want to share, you can post and then bridge into Quorum protocol.

### Mini-App Flywheel

You can:
1. Create applications on Q
2. Expose them as privacy-preserving encrypted mini-apps (like Tor hidden services)
3. Present a portal as a mini-app in a Farcaster post
4. Bring Farcaster users over to Quorum or your Q app

All pieces accumulate into something larger than individual components.

## Q&A Highlights

### How Private Are Transactions?

**Short answer**: Yes, transactions are private.

**Real answer**: It depends on application design. This is a generalized compute engine—someone could make a DEX that's not properly designed for privacy. We make it hard, but it's possible.

If you build correctly using QCL for atomic swaps or tripartite order book arrangements, storing data encrypted (not using publicly known read keys), then:
- All transactions are private
- A screener like DEX Screener would know only "this trading application had transactions"—not what, how many, or who

### Why Tokens Are Secure by Default

We hardcoded the token application as a specific pattern with configurable knobs and levers that prevent mistakes. For tokens built with the token intrinsic (not custom QCL):
- Transactions are private
- Quantity is private
- Destination is private
- Refund recipient is private

### Can Web Apps Run on Q?

Q Storage hosts static files. But using Q Storage as a loader for single-page applications with Q SDKs in JavaScript, you can build dynamic web applications.

Unlike Ethereum (too expensive for state), Q can handle this. We'll demonstrate this in dev streams.

**FFX** (like AWS Lambda) is coming—it will use similar concepts but more polished for JavaScript developers.
