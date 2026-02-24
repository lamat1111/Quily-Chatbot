---
title: How Quilibrium Protects Privacy Without Enabling Crime
description: How Quilibrium balances user privacy with compliance using bloom filters, verifiable encryption, and decentralized blacklisting to prevent misuse without compromising security.
---

# How Quilibrium Protects Privacy Without Enabling Crime

Quilibrium is designed to **protect user privacy** while also ensuring that it isn’t misused for illegal activities.

Each coin in the network includes a special cryptographic marker that allows users to prove their funds are **not from illicit or sanctioned sources**. This means the system maintains both **privacy and compliance**—ensuring legitimate use without compromising security.

We do **not** support or promote criminal activity.

Instead, Quilibrium has built-in safeguards to help users **legally and responsibly** maintain their privacy.

## How Quilibrium’s Privacy Works

One of Quilibrium’s key privacy features is **“nescience”**—which means that the network itself doesn’t “see” the data it stores.

This is similar to how encrypted messaging apps or cloud storage services work: **the provider has no direct access to user data**—or at least, they shouldn’t.

However, a completely hidden system **could** attract bad actors, so Quilibrium has built-in protections that prevent it from being abused.

Let’s break it down.

## Security Measures Against Money Laundering

Quilibrium's built-in privacy creates a challenge: traditional banks and financial institutions won’t accept its coins unless there’s clear proof they’re legitimate, yet people still want to keep their financial details private.

To address this, Quilibrium uses a special feature called a **bloom filter**.

### Bloom Filters
Bloom filters are used in the intersection data of the token, i.e. each time a token is transferred the accepting party computes their address through the hash function that maps to bits on the token's bloom filter.

This could be thought of as a token's lineage, however it's not like a blockchain's ledger.

If someone wants to check if the coin is linked to illegal activity (like money laundering), that token can be queried against a public (or private) list of known bad actors, e.g. one provided by a financial institution, and that query will result in a "yes" or "no" if the token has been owned by at least one address in that list.

Bloom filters are inherently probabilistic, but Q's modified Bloom filter works out that the probability of accidentally finding an address via a filter to be akin to specifying a single, specific atom and it's coordinates in a universe larger than our own.

:::note
When querying against a list, there response doesn't indicate which address (or addresses) it found in the list in the history, nor is there a way to tell when that happened.

Also, if somebody were to query a list of one to try make a list of addresses a token has been owned by, it's limited by known account addresses.
:::
Based on the bloom filter's response (has it been associated any of these addresses on this list), a receiver can choose to accept the coin or reject it.

If rejected, the coin is sent back to a refund address.

### Further Bloom Filter Considerations During Token Operations
Coins can also be combined or split:

| Action | Token Bloom Filter Result | Note |
|--------|---------------------|------|
| Merge  | The final token will have bloom filters from all tokens included in the merge | The owner may explicitly exclude certain tokens with certain target addresses in their lineage as to avoid merging tainted tokens in with clean.|
| Split | Resulting tokens have the same bloom filter as the original | `-` |

This system helps protect privacy while offering a way to screen for suspicious activity, like money laundering, making it easier for users and institutions to cooperate.

## Balancing Privacy and Security in Different Use Cases

### Messaging and Financial Transactions

For **text-based messages, social media, and financial transactions**, Quilibrium is designed to provide a good balance between privacy and usability. Messages are structured so that they can be **indexed and searched efficiently**, while still remaining private from outsiders.

### File and Image Hosting

Handling images is **more complicated** because they aren’t searchable in the same way as text. If someone tried to store images by breaking them into tiny text fragments, it would be **extremely inefficient and costly**, discouraging misuse of the network for hosting illegal content.

To process images efficiently **while staying compliant with the law**, Quilibrium will use **privacy-preserving techniques** similar to those Apple designed for detecting illegal content in iCloud (without scanning private data). These methods ensure that images:

* **Remain private** while being processed.
* Can be checked for **compliance with strict laws** without revealing user data.
* Do not slow down the network or compromise security.

Before Quilibrium supports **any image hosting apps**, these safeguards will be in place.

## Preventing Criminal Use: Why Quilibrium Is a Bad Choice for Bad Actors


As a basic consideration, most criminals take the **path of least resistance** — and Quilibrium is **not** the easiest option for illegal activities. Many crimes happen **in public, unencrypted chat groups** simply because it’s faster and easier.

That being said, if someone attempts to misuse Quilibrium for illegal activities, the network includes a unique mechanism to detect and isolate problematic content **without breaking encryption or compromising privacy**.

**Here’s how it works:**

### Identifying Problematic Shards Without Decryption

Each shard in Quilibrium is **encrypted** by default, meaning its contents are hidden from everyone, including network operators.
However, Quilibrium incorporates **verifiable encryption** — a cryptographic method that allows a third party (such as a compliance organization) to **confirm the presence of illegal content without decrypting the data**.

For example, a compliance entity like the **National Center for Missing & Exploited Children (NCMEC)** or a similar authority can verify that a shard contains illicit material based on pre-established cryptographic proofs.

### Blacklisting and Network-Wide Enforcement

Once a shard is flagged as containing illegal content, **node operators can blacklist it**, preventing it from being replicated across the network.

Quilibrium’s architecture allows **multiple blocklists to exist**, meaning different jurisdictions or compliance bodies can maintain their own lists, which network participants can synchronize with based on **local regulations**.

Unlike **centralized social media**, where content moderation can be inconsistent or inefficient, Quilibrium's approach is **cryptographically verifiable and decentralized**, ensuring compliance without arbitrary censorship.

By combining **privacy-preserving encryption** with **selective, verifiable blacklisting**, Quilibrium prevents illegal content from spreading while **preserving the privacy and integrity of legitimate users**.

:::info

For a more technical explanation please see this [forum post](https://quilibrium.discourse.group/t/how-does-q-preserves-privacy-without-opening-the-doors-to-criminal-activities/112/3?u=lamat).

:::
