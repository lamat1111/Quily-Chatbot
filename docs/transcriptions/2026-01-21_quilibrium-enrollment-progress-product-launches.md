---
title: "Quilibrium Enrollment Progress & Product Launches: Q Storage, QKMS, Quorum Mobile"
source: youtube
youtube_url: https://www.youtube.com/watch?v=ggKX4rujkrg
author: Cassandra Heart
date: 2026-01-21
type: livestream_transcript
topics:
  - roadmap
  - q-storage
  - q-console
  - quorum
  - architecture
---


## Network Health Status (January 2026)

About 67 shards are at halt risk. 663 need coverage, but we now have over 2,000 healthy shards out of approximately 3,000 total.

Once we get to at least "needs coverage" instead of "halt risk," the network will be fully kicking into motion. The QUIL token shards will be unlocked and transaction processing will proceed.

Outside of those things, we support alt-fee basis app shards which enable some really cool things, including several features discussed today.

## QNS Updates

QNS received major updates over the last week. We added support for live auctions and offers. This will continue to get updates, and we keep taking in feedback and shipping improvements.

We've crossed the threshold of over $100,000 USD in transactions. We've breached 4 million wQUIL tokens transacted for names on QNS. That's been very healthy progress.

We had our first price update. We're taking feedback about the pricing tiers and the relationship between that and pricing in US dollars. We're going to continue to experiment and reach a sweet spot for where these prices should be and what the actual tiering will look like.


## Quorum Mobile: Multi-Chain Privacy Wallet

We're shipping an update to Quorum Mobile. It will be a full native update. On iOS, there's a TestFlight that should automatically download, but you might need to go into the TestFlight app to pull it. On Android Google Play beta, you can pull it from there. We'll also post links to the standalone APK for sideloading.

### Supported Blockchains

The big update is that we're supporting many different chains:
- **Quilibrium** (native support)
- **Ethereum** and EVM chains like Monad, L2s like Polygon, Arbitrum, OP, Base
- **Bitcoin**
- **Other L1s:** Solana, Kaspa, Bittensor

This may be the first wallet to handle all of those different networks in one.

### Privacy Preservation for Public Blockchains

When you use most wallets, every single one is talking to some public RPC service. Your wallet is not scanning the blockchain itself. You're talking to remote servers and giving away information.

For example, when using an Ethereum wallet, you're usually talking to some RPC provider. Almost all of them boil down to a handful like Infura or Alchemy. When requesting token balances, you're telling them your wallet address. If you're not behind a VPN, you're also giving away your IP address. They are logging this data.

This has been used in court cases across the world. People have had their privacy essentially rug-pulled away from them because they were using third-party APIs.

What we're doing with Quorum Mobile is privacy preservation. We run our own RPCs where possible and use our own proxies that provide privacy preservation when you check your balances or the value of currencies you're holding or trading.

### Mini App Support

Our mini app support continues to grow in features and functionality. We're adding extension APIs for developers specific to both core Quorum features and Farcaster integration.

For example, apps like Emerge let you generate pictures based on your profile picture. Using our extensions API in the mini apps SDK, you can set your profile picture from generated content. We're enhancing the ability to do cool social things with full mini app integration.

### Swap Functionality

Most wallets charge rough fees—usually baked into amounts and hidden behind info buttons. Some take upwards of 5% of transactions.

That's not how we operate. We're not an extractive company. Our swap functionality supports many different chains. Where possible, we support gasless integration. We do our best to give you the best price for swaps, plus control over the spread for advanced swap scenarios, especially with low liquidity pools.

### Security Partnerships

We're working with industry partners CoinGecko and Blowfish to provide up-to-the-minute price data and secure simulation while providing privacy preservation. You're not leaking metadata but still getting strong security guarantees through Blowfish's transaction simulation feature.

This provides a way to know if you're interacting with a sketchy mini app. It can tell you when something is about to ask you to do something insane like send all your tokens to them.

### Farcaster Integration

As a Farcaster-integrated app, if you use the Farcaster app, we support the full integration flow. You can import the Warpcast wallet and use it from Quorum instead of going back into Farcaster. All your Farcaster-based transactions and assets will flow over into Quorum if you choose to integrate.

As always, we never do anything without user consent. Even importing the Warpcast wallet is something you have to choose to do. This philosophy extends to features like video calls and voice calls—all require your consent.

## Q Storage: S3-Compatible Storage API

Q Storage is our S3-compatible API offering, rolling out in the next few hours.

### What's In the Box

- Object versioning
- Multipart uploads
- ACL and policies
- CORS
- Website hosting with full host redirection (CNAME to Q Storage bucket)
- QNS integration (your name.q resolves to your Q Storage website)
- Lifecycle rules
- Encryption (everything is encrypted)
- Object lock (important for enterprises with legal holds)
- Basic logging
- Inventory and some analytics
- S3 Select compatibility (most S3-compatible APIs don't support this, but we do)

### Pricing Tiers

**Free tier:** 5 gigabytes or less in total data stored. Free tier data is replicated within Q Inc's infrastructure across multiple data centers in multiple geographic regions. Data is encrypted at rest, even for public buckets.

**Paid tiers:** Pay-as-you-go in crypto or fiat billing, plus monthly billing options. Paid tier data gets full-blown replication through the network.

### Network Replication Details

For network storage, replication happens according to the same standard as any data on the protocol, including tokens. For a given shard, that's anywhere between 24 to 28 geographically distributed nodes, up to 32. Past 32 nodes, it breaks down into smaller shards.

The data is constructed using Reed-Solomon encoding through verifiable encryption so you can lose some nodes and still reconstruct data. Strong availability guarantees mean if nodes go down and reach a certain threshold, it can induce network halts—part of the incentive model ensuring nodes participate and store data.

## QKMS: Key Management Service

QKMS is also rolling out in the next few hours.

### What's In the Box

- Basic symmetric support
- Asymmetric RSA
- Asymmetric ECC
- Edwards curves (AWS doesn't support these, but we do)
- secp256k1 (for Ethereum, Bitcoin, Tezos)
- HMAC
- SM2 (for the Chinese community)
- Integration with Q Storage (use QKMS keys for encryption of data going into Q Storage)

### What's Not In the Box

- Cloud HSM (we don't have hardware security modules; plus the security model of cloud HSM is super shaky)
- XKS

### Pricing

QKMS has its own free tier. Amazon charges a dollar per key per month—that's obscene. We don't do that. There's no fee per key. It's broken down into per-request pricing with its own free tier.

### MPC-Based Architecture

QKMS uses MPC (Multi-Party Computation). It uses the oblivious transfer primitive inside our compute operation to achieve multi-party compute of keys, providing distributed key management without being a key custodian ourselves.

There's additional tooling needed alongside the SDK when using the KMS API. Q Console will give instructions, as will our doc site.

## Q Console Updates

Q Storage and QKMS are supported in Q Console. It's very easy to drag and drop files and immediately launch your site.

We're proud of the flow—essentially two clicks to launch a website. It's an engineering challenge to make work, but we believe it's the easiest way to host a website and one of the cheapest.

## Quark: 3D Asset Integration Library

These Quilibrium primitives are very composable. When you create a storage object inside the hypergraph, that's an addressable object that can be referenced by other intrinsics.

For example, if you store a key shard encrypted on the hypergraph, QKMS can use that by pulling it through to the compute primitive, using it for MPC steps to perform signatures.

### What is Quark?

Later this week, we're publishing Quark. Quark is a library that enables integration with Q Storage. It supports:

- 3D objects with motion primitives (bones, animation steps)
- Integration with our token primitive for tokenized ownership
- Marketplace integration for buying, selling, and trading

### Supported Game Engines

First integrations support:
- Unity
- Unreal
- Fyrox
- Godot

This is a powerful example of how these integrations become force multipliers as development proceeds.

## QClient Release Timeline

QClient is targeted alongside the release of 2.1.0.18.

We haven't released it yet because as we've rolled out 2.1.0 variants, there have been subtle protocol changes required to fix issues. Architecture needed tweaking to resolve bugs.

With earlier QClient versions during the 2.0 era, people kept using old versions even when new versions were available. We didn't want to release QClient until we could be fully confident this is the version we're willing to support without dealing with support questions for older versions.
