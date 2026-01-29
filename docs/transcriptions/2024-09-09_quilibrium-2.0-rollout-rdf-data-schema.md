---
title: "Quilibrium 2.0 Rollout Process and RDF Data Schema"
source: youtube
youtube_url: https://www.youtube.com/watch?v=Mr0BmAG7sBA
author: Cassandra Heart
date: 2024-09-09
type: livestream_transcript
topics:
  - 2.0 upgrade
  - bootstrap peers
  - privacy model
  - token custody
  - RPC interface
  - RDF schema
  - bridge suspension
  - hypergraph
  - account management
  - delivery concept
---

## Session Overview

Welcome to the dev call. The purpose of these dev calls is to show how to use Q, talk about current topics going on with the protocol, and answer questions. Tonight we'll cover the guiding philosophy behind Quilibrium, important notes about bootstrap peers for 2.0, how Quilibrium differs from other crypto networks, how the 2.0 rollout will proceed, how to use 2.0 directly, and what comes after 2.0.

## Guiding Philosophy

Quilibrium is a mission-oriented project. Our goal is to become the base fabric of the internet and secure every bit of traffic that runs through it. The mission is fueled by the notion that freedom of commerce, speech, privacy, compute, and peaceful assembly are all inexorable universal human rights.

We've held that perspective since the very beginning. Back in 2021, I was working on the Howler project and realized that the internet is fundamentally broken. We needed to essentially reinvent the internet from scratch. Cloud providers are alarmingly hostile, and trust isn't baked into protocols the way it should be. We've come so far in cryptography and verifiable computation, but we're not leveraging it to its fullest potential.

Many projects have started copying our messaging about the broken internet, but you can't just repeat an idea to hijack momentum. You have to actually be authentic. Being authentic about the mission means having that mission encoded into your entire project from the very beginning.

### Philosophy vs. Politics

When we talk about inexorable human rights - freedom of commerce, speech, privacy, compute, and assembly - there's an important distinction between philosophy and politics. In philosophy, nuance can evoke discourse and potentially solutions. In politics, nuance is used as a cudgel where goalposts get shifted and mission-driven projects get derailed.

We designed the protocol such that users have control over their own rights and are able to control the nuance needed for themselves in their jurisdiction. That's why from the onset I was very privacy-oriented with everything that was built, while also understanding that there are circumstances where you need to handle things in a way that is compliant with the law.

### Compliance Bundles

When engaging in commerce, especially in the United States, there are organizations you can't send funds to or receive funds from. Proving compliance historically required opening up your books. But with cryptography, you can do that and still preserve privacy.

That's why we have compliance bundles in the tokens themselves. The tokens accumulate the addresses that historically held those tokens, but that bundle only lets you show whether or not a coin has been held by a known bad address - not who else had it. You can prove that these known bad addresses never touched this money, but you don't get to find out who else had it. That's a pretty powerful tool.

## Bootstrap Peers for 2.0

As we prepare for 2.0, bootstrap peers are critically important. I cannot thank everyone who has been running bootstrap peers enough. It's always been a volunteer effort.

### The Problem with Previous Bootstrap Peers

We've had interesting challenges because bootstrap peers were not only the first point of contact in the network, but also acted like any other peer. As we scaled to tens of thousands to hundreds of thousands of nodes trying to communicate with bootstrap peers like any other node, it became overwhelming. The nodes repeatedly crashed because of the demand.

### New Bootstrap Peer Model

With 2.0, we made a firm bright line: if you're running a bootstrap peer, you'll be running in a special mode. It doesn't earn any tokens because it's strictly a directory service - a directory of all the other nodes in the network. It engages in peer exchange, which we use as a scoring mechanism to ensure bootstrap peers are behaving honestly.

We have to constrain how much traffic flows into bootstrap peers. They become a lookup service, and the rest of the network uses that lookup service to find other peers and settle into their position in the overall mesh.

If this is no longer a working situation for you and you need your peers to continue earning tokens, please file a pull request to remove your peer from the bootstrap peer list.

### Bootstrap Peer Requirements

If you want to run a bootstrap peer:
- The node will be running in a special mode and does not earn tokens
- You need at least 4 cores (preferably 8 cores)
- At least 16 GB of RAM
- 1 Gbps symmetric bandwidth (it might spike to 1 Gbps, especially when new updates come out)

### How to Set Up a Bootstrap Peer

1. Clone the repo under the release branch
2. Either use the auto-run script or pick the releases from our CDN
3. Once you've run the node, you'll get a peer ID (visible at first printout of logs, or use the `--peer-id` flag)
4. Open a pull request to add your multi-address to `node/config.go`

If you don't know what a multi-address is, I'd recommend not running a bootstrap node. This is a huge commitment and requires familiarity with system management and some coding experience.

### Bootstrap Peer Scoring

The scoring is simple - it's whether new node connections are being surfaced by that peer and whether they're properly engaging in peer exchange. Peer exchange is when a bootstrap peer gets oversubscribed and properly cleaves off those peers to others so the mesh can rebalance.

The score is 0 to 100. If you're at zero consistently enough, you'll be eliminated as a bootstrap peer. Bootstrap peers are no longer a concern for having special advantages - they're just a distributed hash table scored on whether they're behaving honestly.

## Comparing Quilibrium to Other Networks

### No Block Explorer

People ask if Quilibrium has a block explorer, or how to see the lineage of tokens like on Etherscan. The problem is: you can't do that on Quilibrium. The design is very privacy preserving.

We use different nomenclature - they're called frames rather than blocks because it's more in line with network behavior. We don't have the visible information that blockchains typically have. On Ethereum, you can see all transactions inside a block, the contents, the addresses, the affected state, the balances. You can't do that on Quilibrium.

To see a balance, you have to have the relevant keys for the relevant accounts. If you don't have that, you can't see it. The data is encrypted at rest.

### Privacy is Normal

Consider your daily transactions with fiat currencies - you don't broadcast to everyone what you buy or how much money you have. It's bizarre that crypto moved into the mindset where that's okay to be public information.

The original discussions around cryptocurrencies were oriented around never reusing an address, always using new addresses for every transaction, moving coins to new places, splitting and joining. There were concepts like coin joining and mixers - all built around enhancing privacy.

Quilibrium's mission is to make the internet more secure and bring privacy back to people. There won't be a block explorer or a centralized repository of public information because there is no public information. The chain is private.

## How to Use 2.0

### RPC Guide

I've been publishing guides, including the RPC guide. If you want to use raw programmatic calls instead of the Q client, this is the collection of RPCs you can interface with your node.

**Important security note:** This isn't like using a public RPC. Keep this within a secure trust boundary. If you're using the RPC, you're providing key material to that RPC. That key material isn't disastrous - it's a loss of privacy, not a loss of access to your data or funds. But if you're not using an RPC you control, don't have a secure connection to, and don't trust, run your own node.

### Account Management RPCs

The account service RPC includes operations for:
- What is my account's balance
- How many individual coin bundles do I have
- What are my pending transactions that I need to approve or reject
- Basic permissions management

### Two-Stage Transactions

If you've used Ethereum or other chains, you've probably been littered in garbage coins. Sometimes it's complicated because the tax man has objections to you being freely given tokens that apparently have value.

That's an unfortunate consequence of the truly permissionless design of being able to send to anybody at any time. Transactions on Quilibrium are two-stage:
1. You create the transfer, which creates a pending transaction
2. The other side has to approve or reject that transaction

If you want to do this implicitly, you can do a mutual receive and mutual transfer where the recipient says "I am expecting this transfer, here is the way you can send it" - kind of like giving wire instructions.

### Coin Service RPC

The coin service also has the ability to allow and revoke permissions for a given coin.

**Q: With QUIL being just an app, does this serve as something similar to an ERC-20 token API?**

Sort of. ERC-20s are a contract - an interface with specific methods that implementations must surface to be compatible. The difference is that ERC-20s don't have to actually obey the contract. Those garbage tokens that trick people into investing, then you find out you can't transfer or sell - that's different.

On Quilibrium, those contracts can't be violated. The expectations have to be met.

### UTXO-Style Model

With ERC-20s and ETH itself, balances work as a mapping of addresses to a quantity. Quilibrium doesn't work like that - it's more similar to the unspent transaction outputs (UTXO) model of Bitcoin.

If I'm Alice and I get sent different QUIL tokens from different people, those will all be distinct coin entities. My account will have a balance reflecting the total, but they're not lumped together. To combine them, you have to merge them (or split them if you want separate entities).

### Merge and Compliance Bundles

This matters because of contamination on account-based models like Ethereum. When you receive a token, the entire history of that token is contaminating. A great example is the griefing from Tornado Cash - a mixing service that let you have privacy on Ethereum by detaching the sender from the recipient.

A token on Quilibrium contains a compliance bundle - a collection of all addresses that previously touched that coin, smashed into an opaque number like a black box. You can query whether a specific address ever touched this coin, and it gives you a yes or no. It won't tell you who all touched it.

The only way you can query that bundle is if you have the rights to read the coin, which means you need the key. It's a dual-layer solution: keeping user information private while solving the compliance burden.

**Technical detail:** We use a Bloom filter for this. When you transfer a coin, it applies the Bloom filter to the account references. There's a function on the pending transaction that performs a set intersection using the provided lineage intersection versus the actual coin's lineage.

When you merge or split coins, you inherit all that intersection data. When you combine two Bloom filters, you OR them together - the same happens with the private set intersection bundle.

Most people won't want to merge if they need to manage funds in particular ways. Just transfer coins individually if needed. The RPCs are raw interfaces - the intended model is through user interfaces that do all this work for you.

### Pending Transaction Management

For pending transactions: approve or reject. If you approve, it goes to your address. If you reject, it goes to the refund address.

**Privacy note:** If you don't provide a refund address when sending a transaction, you're putting your address in the refund address section. If you intend to send a coin to somebody anonymously, manually define a refund address that is not your current address.

**Anti-griefing:** You can't set the refund to the receiving user - it checks before executing the transfer. If someone tries to grief you by setting destination to one address and refund to another (so refusing forces you to take custody), it creates another pending transaction that still has to be accepted. You can leave pending transactions sitting forever.

Pending transactions can have expirations. If you try to grief people, you're going to have a bad time.

## Custody Models

### Cold Custody

For cold custody environments, there's an audit trail process to meet regulatory burdens for properly managing keys. Generally this is done through signatures.

For Quilibrium cold custody, it's easier for your initial signature (proving you have custody of the private key) to simply be an allow account request. You don't give it permissions to control the account, delegate, or approve transactions. The only thing you're doing is giving read rights to a warm wallet as a permitted account to list pending transactions.

By doing this:
1. You've proven you have the private key for cold custody purposes
2. You've originated the account on the network so it's a distinct entity that can have data flows

From there, you take your managing account (read-only) and continue reading pending transactions.

### Warm and Hot Custody

Much simpler - you can just generate a key and use the derived Poseidon-hashed public key value as the address.

**Implicit accounts:** Account refs can either be an originated account (like the cold custody case) or an implicit account - either a default key-derived account (doesn't yet exist on the network) or a specialized implicit type. Type 0 is default key derived (Poseidon hashed), Type 1 is WebAuthn-derived (address is still Poseidon hashed to the public key but signatures are handled differently because WebAuthn has its own internal nonce management).

### MPC Custody

For MPC-based custody with your own internal signing infrastructure, use it the same way you always have. We don't do anything funky with Type 0 signatures or regular signatures under an originated account. You can use standard Ed448 signatures, Ed25519 (not recommended), or BLS-48-581.

If you're doing MPC and want to use decentralized MPC-based signing over the network, that's an option. If you're a wallet provider doing MPC light (split key shares recombined in an enclave) and want to be legitimately MPC-oriented using a decentralized network for signatures, reach out.

## Why No Wallets

There will not be a GUI wallet. The notion of wallets doesn't make sense on Quilibrium.

Account and key management is diversified. Accounts are a reflection of a key centralized to you. Coins are delegated to an account, and from that account you can have many keys. But accounts are domain-bounded.

When using passkeys, you have your primary node account holding QUIL tokens, but applications built on QUIL don't use the same account. Think of it like traditional web: when I go to Google I log in with my Google account, when I go to Figma I could log in with my Google account (consent-driven OAuth flow) or my Figma account.

### The Problem with Wallets

Wallets are an abstraction no longer needed. We needed wallets when browsers didn't support private keys - now we have WebAuthn.

Worse, wallets never had domain-driven abstraction. When you had a key, your key was everything. That's why someone can make an imitation scam site with wallet drainers. Those drainers rely on one simple thing: you taking your wallet (connected to everything you own) and hitting sign.

If you instead abstract keys such that they're tied to accounts that are tied to domains, that one indirection makes everything much more secure. Replace wallets with using browser passkeys.

You can do manual key management via RPCs or Q client with raw keys, but the idea of using a single key for everything is insane. We don't encourage it, don't support it, and intentionally make it high friction. You have to intentionally shoot yourself in the foot to shoot yourself in the foot.

### Cross-Domain Consent Flow

There's a consent flow for cross-domain interactions. If you've done OAuth before (sign in with Google, Facebook, Twitter), it's the same concept: you have an account somewhere else and want to grant permission to another website to access certain details.

If someone tried to make a scam site to steal QUIL tokens using the browser-based custody model, they'd have to produce a redirect flow. You'd access your private node RPC to generate that request - and it will tell you explicitly "I am asking for permission to steal everything in your account."

This is very different from wallets which give opaque information. On Quilibrium, you're told explicitly what permissions are being asked for. Any sane person would then ask "why would I give away everything I have?"

## Post-2.0 Roadmap

### Q Console

The first thing after 2.0 is Q Console - our AWS console equivalent for the network. It's an integrated development environment for building on the network.

If navigating raw RPC articles and example token application code is too much, Q Console makes things more graphically oriented. The Q network operates as a decentralized network for shuttling data in privacy-preserving ways that can run code to mutate or derive from data. That's a great opportunity for a UI-driven development paradigm.

### Better Browser-Oriented Flows

Better user experience for key management related processes when using passkeys - how passkeys are created, how to use a passkey without being intrinsically bound to a domain.

### Q Proxy

To replace overall services on the internet, we need to be easy to navigate the same way people currently do. Q Proxy is like IPFS gateways - a Q light bridge into things on Quilibrium as long as you have relevant key information.

It's limited - deep application interactions won't work with Q Proxy. But if you want to host a single-page application website on Q, you can do that.

### Web Schema Resources

Codifying web schema resources for the network so it becomes easy to move things from the classical web onto Q and interact with them as native hypergraph objects.

### Improved White Paper

The current white paper is a cluster for anybody trying to read it. LaTeX is not my strong suit. I will make the white paper better, more legible, and more accessible - it's on my radar, just a matter of priority.

### Broader Bridge Support

We're already importing ETH data - the bridge monitors the Ethereum blockchain for mint and burn events. Why not extrapolate and support certain ERC-20 style tokens, NFTs, and ETH itself? Make it easy and trustless to bridge over to Q.

When you bridge something to Q, the entry point is public (because Ethereum is public). But where it goes on Q, what address takes possession - that's completely private.

You can give privacy to every single ERC-20 on Ethereum through Q. Coins can come in and come out where you can't link sender to recipient. If you send 100 Shiba Inu over to Q and bridge back 100 Shiba Inu to the same address, that's clear. But to another address, it depends on how much has been bridged and time transpired.

### AWS API Compatible Services

Quilibrium Inc will be rolling out AWS API compatible services:
- S3 targeting
- KMS targeting
- Elastic targeting (likely ElastiCache)
- SQS
- API Gateway
- Lambda

These are the super core fundamental things people need to build common internet services easily.

### Farcaster Integration

Q Console has integration with Farcaster accounts. While this isn't an official Quilibrium native concept, being able to bridge over Farcaster account data is something Quilibrium Inc is working on. You could build a Farcaster client on top of Q or build an ingestion pipeline that takes in Farcaster data.

## On Project Independence

**Q: When will the network cease to depend on your personal efforts?**

Quilibrium is no longer a single-dev project. The VDF implementation in Rust was built by an entirely different person. There's work on the protocol that hasn't been just me.

Over time, especially with better resources like an improved white paper that people can pick up and understand without sitting down for days, more people will start becoming acclimated and comfortable building on and building Quilibrium itself.

I want to reach a "Satoshi point" - with Bitcoin, after about a year and a half, Satoshi became distant and eventually separated from the project, feeling it was left in good hands. I don't want to ever leave this project, I have no intention of leaving. But I want the project to be healthy enough with maintainers that I could - not that I would, but that I could - and there would be no detriment.

Everything in service of that: making tools easier to build on, making things more accessible for documentation, getting more people building Q itself. The answer is: sometime in the future, when I don't know yet.

## Keys and Node Requirements

**Q: Do keys rely on an active node? If decommissioned, are keys and QUIL tokens inaccessible?**

No. The Q client command-line tool doesn't require running a node at all - it embeds a mini-node (a light client) to construct network interactions.

The RPC is if you're running a node and want to do interactions more easily, letting your node shuttle things around. It's primarily for people with many keys so they don't have to use Q client with many config flags.

The browser model is another option. You don't have to have your node alive to use account data. But for privacy, you'd want to leverage a node you control (or a light node through Q client) to interact securely. In an MPC-oriented process, somebody has to handle your data - you'd rather it be yourself to complete the garbled circuit processing.

## RDF and Data Schema

RDF (Resource Description Framework) is an important attribute of Q. I've joked that Q is a combination of "web3" (crypto) and "Web 3.0" (Tim Berners-Lee's semantic web achieved via RDF).

RDF is how we define the schema of an application, the data, the requests and responses, and ultimately what gets encoded onto the hypergraph in an efficiently queryable format.

### Why Schema Enforcement Matters

Schema enforcement on a network that retains privacy is crucial - you'd run into serious issues if you couldn't verifiably store information without seeing that information.

RDF is a queryable language - there's SPARQL, a query language for RDF data. RDF as a queryable dataset is most efficiently queried using hypergraphs. This is why all these pieces fit together and why RDF is naturally suited for formatting data on Quilibrium.

### RDF Structure

Structurally, RDF is simple - it's a triple language. You have subject, predicate, object. That's the entire basis of this language.

For example, an Account is an RDF schema class with distinct attributes that flow from it:

```
Account (rdf:type rdfs:Class)
├── totalBalance (property, type: qcl:U, size: 32)
└── publicKey (property, type: qcl:U, size: 57)
```

Properties have:
- **Domain**: What type the property belongs to
- **Range**: What it applies to
- **Size**: In bytes
- **Order**: The order in which properties appear in the type

### Fixed Sizing for Security

When defining an application over Q and scoping out the schema using RDF, the sizing is constant. You cannot have variably sized structures. You're maximally defining the size if something is variable in content.

For example, a message type with content has text with a fixed size. If you didn't use fixed size for message types, there's a huge field of cryptanalysis where you can infer details about data - especially for text-based communications.

If there's two bytes coming over the wire, is it "ok" or "no"? It's probably one of those, but certainly not "yes." By eliminating that factor with fixed width, you eliminate an entire class of vulnerabilities.

### RDF to QCL Pipeline

We have an immediate pipeline that goes from RDF into QCL types. Converting between two different formats relating to the same data without a conversion pipeline is a massive pain - you'll make mistakes. It's much easier to do it by code.

For example, `qcl:U size 32` comes out to `qcl_u256`. Sizes in RDF for this QCL size property are consistently in bytes, whereas in QCL the types are bit-sized (rounded to 8 bits). The sizing and ordering are important.

### Secure Design by Default

This is part of the design intentions of Q - it's intended to make you make secure design decisions by default, making insecure design decisions harder to do.

---

*Updated: 2026-01-29*
