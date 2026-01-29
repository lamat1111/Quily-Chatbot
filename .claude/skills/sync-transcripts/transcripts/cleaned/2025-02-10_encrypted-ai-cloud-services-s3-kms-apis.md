---
title: "Encrypted AI, Cloud Services, and S3/KMS API Preview"
source: youtube
youtube_url: https://www.youtube.com/watch?v=vGee6DGTDwE
author: Cassandra Heart
date: 2025-02-10
type: livestream_transcript
topics:
  - S3 API
  - KMS API
  - MPC signing
  - encrypted AI
  - cloud services
  - trusted execution environments
  - privacy
  - beacon decommissioning
  - Quilibrium 2.1
---

## UK Encryption Order and Why TEEs Are Problematic

Apple has been served an order by the UK to give them the keys to the castle on decrypting all private data encrypted to iCloud's backups. This is obviously insane. Apple's going to continue to try to fight this, and if they have to pull out of the UK for their encrypted backups that would be a tremendous loss for everybody. It looks like the UK is going to be pushing harder trying to demand access for all encrypted backups.

This bit of news is relevant to Quilibrium for one important reason: Quilibrium is an American company incorporated in Delaware. We do not have any presence or jurisdiction in the UK, and so if we were ever served such an order we would tell them in less than polite words to go away. Similarly, if such a move was ever tried to be pushed upon us from the United States, that would be a very interesting situation, but it would be one that I would fight to my dying breath.

There is a trend in the field of crypto where a lot of projects have started to introduce privacy to their projects through what I consider to be a parlor trick: trusted execution environments (TEEs). There are a lot of projects relying on this to provide what they consider to be an adequate level of privacy.

The problem with TEEs, beyond the fact that practically every TEE that has ever been in existence has been broken, is that TEEs are operated by a company. Some company is hosting this in their server environments. If those TEEs happen to be in regions where said governments are now demanding keys to the castle, the whole purpose of providing privacy through TEEs is a moot point. Regardless of whether or not it has been compromised, you can effectively consider it compromised from that point forward.

There are a few projects that have been making use of TEEs. I have a great deal of respect for the teams involved in these projects, and I understand they're making certain trade-offs. But those trade-offs are essentially saying that because doing things in a privacy-preserving manner using mathematics rather than trusted execution environments is too hard or too slow for their purpose, they're choosing the easy route. By consequence, they are now putting themselves in a lot of danger, including certain regulatory issues.

## Quilibrium 2.1 Milestone 5 Status

Right now nodes on testnet are going through a mainnet dry run state import. The way that data is stored on Quilibrium is on an encrypted oblivious hypergraph. That data structure keeps all of the data that is put on Quilibrium's network encrypted end-to-end and stored on the network in a way that is blindly retrievable. If you want to make a request to fetch data from the network, you have to create a request in such a way that the nodes handling that query are essentially blind to what data is actually being queried. In return, you become aware only of the data you intended to fetch.

The next thing going on for Milestone 5 is surfacing the S3 and KMS API previews. The remaining Milestone 5 items are surfacing the schema repository, the QCL compiler, and the public release of Q Console. All of those things combined will unlock our 2.1 upgrade for mainnet.

The testnet is going through the dry run of the mainnet data import. So far so good, which is a fantastic sign. We just need to get through the process of doing this import and verifying that everything ends with the correct root hash of the total state of that data.

## Upcoming Developer APIs

The goal of Quilibrium, other than the mission itself, is to essentially take the entire TAM of cloud data infrastructure (AWS, Google Cloud Platform, Oracle Cloud, etc.). We're going to be providing a lot of API-compatible services on the network that utilize the features of Quilibrium to preserve privacy while simultaneously providing very easy-to-use familiar interfaces for people who have been building on traditional cloud services.

**S3 API and KMS API** - Coming right now

**Q Name Service** - Will be using the network, with the attestations API that makes it functional and accessible for other applications like Quorum

**Redis-compatible API** - Coming soon

**CQL-compatible API** - Amazon Keyspaces or Apache Cassandra compatible (like ScyllaDB)

**SQL-compatible API** - Starting with ANSI SQL compatibility. If you're using PostgreSQL-specific syntax or T-SQL-specific syntax for SQL Server, those won't be supported right away, but we're going to try to maximize coverage so that practically every variant of SQL is supported.

**Lambda-compatible API** - Important because while most crypto projects are doing a simple SPA that you can chuck onto S3 and expose through a domain name, there are applications even in the crypto space that rely on backend processing.

**MPC TLS Implementation** - When using the Quilibrium network, there are certain things that rely on external data sources not inside of Quilibrium. MPC TLS provides the same level of privacy that using a VPN does, with additional onion routing infrastructure and blinded messaging infrastructure. This also means you get on-network oracles, similar to how Chainlink operates on Ethereum.

**Streaming Data API** - Kinesis-compatible

**MPC Machine Learning Library** - This is where things get exciting.

## Claru: MPC Machine Learning Performance Breakthrough

We are relying on an entirely different form of machine learning. The way we're conducting machine learning to fulfill functions like your traditional softmax is done in a way that is actually functional on CPUs. There's a lot of research behind it.

What you're looking at in this graph is a standard dataset trained using a model that works on traditional TensorFlow implementations. At the bottom is the amount of time in seconds to train a relatively small model (670k parameters). On a CPU implementation of TensorFlow it takes 50,000 seconds to train this small model. On a V100 it takes a little less time (this is a logarithmic graph, so we're still talking about hours). On an A100 you end up with still faster time.

But our implementation is actively competitive against an A100 using traditional CPUs. The reason is that we're not doing the same types of matrix multiplication techniques that A100s, V100s, or any other implementations of traditional models do. We're performing this mathematics through another technique.

What is most important for Quilibrium is that it can also be encrypted. These operations can work on encrypted data without revealing the private inputs of that data. It works well in an MPC scheme and still retains the performance. That is the absolute killer element.

That's how we're going to be operating in a machine learning world when machine learning is very slow for multi-party computation (which is why a lot of MPC-oriented projects end up just shoving it in a TEE). I can't wait to publish the full paper on what is being called Claru. It is insanely fast and very exciting.

## S3 API Technical Deep Dive

### What is a Hypergraph?

A hypergraph is the same thing as a graph except the difference is that instead of an edge connecting only two vertices, it can actually connect multiple vertices. What's really cool about hypergraphs is that on top of providing a way to relate a lot of data together in a very efficient data structure, it maps really well to a lot of other types of data structures we want to use. For a relational database, you can express that as a hypergraph. For a basic key-value store, you can still express that as a hypergraph. For S3, we can express this as a very simple graph.

### Verifiable Encryption

When you encode data on the network (and this is actively what's happening with mainnet right now), you're encoding that data in a format using verifiable encryption. Verifiable encryption is a way that you can take data, encrypt it against a target decryption key without even knowing the decryption key, and then that data bundle you produce is verifiable. Any other node on the network can see that encrypted data and know that the target decryption key can absolutely decrypt it. It uses a bunch of funky math, but the basic premise is that it's a clever proof structure that lets you say this data was transformed into this encrypted format and you can verify it mathematically.

### Data Structure

We have two types of objects in terms of network structure: a vertex (a point) and a hyper edge (an edge that connects multiple vertices). A vertex contains a blob of data that is an encoding of a Verkle tree.

When encoding data onto the hypergraph, we have a tree that is a collection of nodes. Those nodes are either branches or leaves. The leaves at the end contain the actual chunks of data, and those chunks are verifiably encrypted data. Each segment of data is 54 plain text bytes encoded into each leaf (113 bytes encrypted).

Those roll up to a commitment. The commitment at the branch level contains the total commitment over that entire range of leaves. The root node contains a commitment of all those commitments. This gives you a way to prove any of the data in there, and you can even prove some properties of the plain text data as well.

### File Chunking

The total size that a data shard on Quilibrium can have is up to 1 GB. S3 allows multiple gigabytes per file (there is an upper limit but it's incredibly high). To support that functionality, we have another chunking mechanism that chunks data into smaller concrete sizes around 256 MB per chunk. So you end up with chunk one, chunk two, chunk three, chunk four, and a metadata chunk. That represents the entire collection of information necessary to represent an object in our S3-compatible API.

### Encryption and Signed Requests

Regarding encryption and decryption, when you produce an object on S3 and you're not using a public bucket, you're using signed file requests. AWS uses an HMAC, but it's realistically just an opaque blob. Most things don't expose the inner workings of that HMAC, so for broader S3 tooling we don't have to worry about compatibility.

For our use case, we use that opaque blob to store the decryption key. When you want to get the file out, instead of doing a normal signed request validating that you're authorized to access that file, you're providing the chunk data necessary to decrypt that file. It's a neat trick, a clever hack that makes us compatible with all the S3 tooling that exists out there.

## KMS API and Wallet-as-a-Service Compliance Issues

### Current Industry Problems

A lot of companies creating wallet-as-a-service integrations follow one of three approaches:

**Option 1:** Split the key into shards. The shard split happens sometimes on the client, sometimes on their backend services. Those shards get distributed. Popular ones do a two-of-three threshold split: shard one is kept local on the user's device, shard two they send to their infrastructure, and shard three is sometimes an optional local backup or encrypted backup in their infrastructure.

**Option 2:** Multiple shards created inside a trusted execution environment. They might give you a shard or they might not. They might have multiple TEEs.

**Option 3:** No shards at all. They're just YOLOing keys into their database using some encryption key that is likely TEE-backed. It's a singular key protecting all the keys of their customers. A lot of them won't tell you about that in their documentation. Some will go as far as to still label this as "non-custodial."

### Regulatory Implications

While the UK is doing something crazy with forcing Apple to give over encryption keys, even in the United States (especially New York State because they're really picky about this): if you are operating in the United States and you have customers' keys that you are holding on their behalf - it does not matter if you're combining it in a TEE from shards that people are sending to you, doesn't matter if you're holding it in full key format - your mathematics don't matter at all to the State of New York. According to the Department of Financial Services for the State of New York, that makes you a custodian. So not only are they lying to people, they are also breaking compliance laws. Their basic premise is that they're not big enough to get caught. That day is coming soon for a lot of these folks.

### Quilibrium's MPC Approach

What makes Quilibrium unique is that the key shards are independently held by the individual users and the actual steps of signing is done using an MPC scheme instead of using a trusted execution environment. We don't compress all that data into the actual key, sign it, put out the signature bundle, and then erase all the memory. We are doing MPC where the output is a signature, and it only occurs mathematically from each of these individual machines.

Think of this as a concert. These devices are different instruments in a grand symphony, and only when you hear them all together you get the beautiful music that is a signature output. What they're doing instead is basically YOLOing an MP3 into a garage, playing it out, recording that recording, and playing that back to you. That is nowhere near safe, nowhere near sound.

### KMS API Demo Highlights

The AWS API format is used, just pointing the endpoint to the QKMS API. You can:

- Create SEC p256k1 keys (Bitcoin or Ethereum keys)
- Get public keys
- Create signatures using MPC signing

One thing the AWS KMS API doesn't do is support some of the things Quilibrium's KMS API does. For example, Ethereum uses Keccak-256 (SHA3-256). AWS KMS doesn't support those at all. You have to pigeonhole the data into the right format.

The KMS API lets you sign either the raw message (where it does the hash inside the KMS service infrastructure) or you can pass it the hash. What's dangerous about passing raw hashes: if the KMS API is compromised, all those keys can have any hash sent to them and signed, meaning they can do any signature operation for any of those keys and potentially drain a wallet.

What's unique about Quilibrium is that you can choose to enforce which operations you allow: SHA3-256 signature, SHA-256 signature for Bitcoin, or additional rules like "I will only allow signatures for this key if it follows whatever structural format." When you go into Q Console you can set those kinds of rules. Every party has to adhere to those rules or the key does not get used to sign - you cannot construct the signature.

We do not have to worry about custodianship because the user holds the key, the other user holds the key if it's a two-of-two. If a wallet-as-a-service company wants to make themselves compliant, they can use us: their user passes in their key shard, they pass in their key shard into Quilibrium's MPC infrastructure, and get the signature output without trusting a TEE and worrying about having to give the keys to the castle to regulators.

### Supported Key Types

- **ECDSA SHA3-256** (Keccak-256) - for Ethereum
- **Ed25519** - for Solana
- **Ed448** - for Quilibrium keys

The Ed448 support is relevant for Quilibrium. If you want an MPC Quilibrium wallet where some number of parties have to all co-sign together to move funds, this is a great way to do it. When running a node and you want the rewards to go to a given key but you don't want that key to be hot, you can use the KMS API to produce MPC keys so you don't have to worry about funds being lost if that node were compromised.

## Beacon Decommissioning

With the final phase of Milestone 5 and the broader release of 2.1 on mainnet, the beacon will finally be decommissioning. The way that works is a two-step operation:

1. Quilibrium 2.1 is released
2. The beacon will continue to produce frames for a short period while converting the entire store of the network into this encrypted hypergraph format
3. Once completed, it will send that to the rest of the network and basically sign off
4. When it signs off, the network will become fully decentralized in every single way
5. Nodes will be collectively building the network instead of relying on a centralized sequencer

### Why the Beacon Was Necessary

In the pre-2.0 era (1.4.9, 2.0, 2.0.1 versions), the proofs accumulating were so massive in overall size that if we were to have the network hold all of the data of those proofs to fully reconcile them, it would have been around 250-300 terabytes of total storage used on the network. That would have cut emissions to practically nil immediately. The beacon was our way of working around that.

### Options for Node Operators

If you want to run the node in true verifier form and calculate that same hypergraph yourself as a way to add resilience to anything that could go wrong, you're totally able to do so. We will have steps on how to do that. However, some nodes would take so long to produce the hypergraph that they would basically be locked out of joining into all the new shards being created and actively participating. This is our final compromise to get rid of the beacon.

## Quorum and Public Links

Fixing Quorum public links is equally prioritized alongside the S3 API and KMS API rollout. We will get that solved as fast as possible.

## Git Compatibility Note

If you wanted to take an application like Git and convert its LevelDB implementation to target the hypergraph instead, you would basically convert the Git application into a decentralized app that is Git-compatible. It wouldn't be free, but it's possible.

---
*Last updated: 2026-01-29*
