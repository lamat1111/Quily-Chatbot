---
title: FAQs
description: Frequently asked questions about Quilibrium, covering the protocol, QUIL token, tokenomics, Q Storage, technical capabilities, and Quorum Messenger.
---

# FAQs

## General Questions

### What is Quilibrium?

Quilibrium (Q for short) is a protocol under active development with a core mission to secure every bit of traffic on the web. It's a censorship-resistant peer-to-peer network for app infrastructure, combining multi-party computation and privacy-preserving end-to-end encryption. Q uses a novel Proof of Meaningful Work consensus and a hypergraph structure for scalability. It aims to provide a substrate for private, censorship-resistant communication, storage, and computation at web scale.

### How long has Quilibrium been in development?

Quilibrium’s origins date back about seven years (2018), starting as a hobby project aimed at creating an alternative to Discord. Initially, it was a federated system similar to Matrix, not yet peer-to-peer. Over the years, it evolved significantly into what it is today — an alternative to AWS — reflecting a substantial transformation from its early concept.

### What is Quilibrium's roadmap?

*See this [detailed article](/docs/discover/q-story).*

### What are the official Q socials? How come there is no official Telegram, Discord?

We have an official account on X for Quilibrium Inc.: [@QuilibriumInc](https://x.com/QuilibriumInc).
The [Discourse forum](https://quilibrium.discourse.group/) is intended to be the primary communication channel in the near term for long-form discussions.  
[Quorum Messenger](https://www.quorummessenger.com/) (the first fully private messaging app developed on Q) will serve as the official channel for short-form discussions, acting as an alternative to Telegram and Discord.  
It was a decision early in the project to embrace as many decentralized tools as possible, and if not present, that their absence serves as a forcing function to make them exist. 
Discord especially, as the project started from a discord alternative.

### How does Quilibrium balance privacy with preventing criminal activities?

Q balances privacy and crime prevention by embedding a cryptographic accumulator bundle in each coin to confirm funds don’t come from illicit or sanctioned addresses, ensuring traceability without compromising anonymity.

It also adopts a suboptimal default interaction model for core shards to deter abuse, making misuse less appealing. The network plans to integrate specialized intrinsics for content moderation, particularly for image hosting, to address problematic content proactively. 

Additionally, node operators can maintain blacklists of troublesome core shards, identified by revealed decryption keys or compliance entity certifications, giving the community tools to curb exploitation. This approach preserves user privacy while weaving in compliance measures and deterrents against criminal use.

Key material is never stored on the network, and nodes operate without access to user data. End-to-end encryption is performed client-side, preserving data integrity and confidentiality.

*See also this [detailed article](/docs/discover/how-quilibrium-protects-privacy-without-enabling-crime).*

### Can Quilibrium protect users in restrictive environments from government tracking?

The network architecture includes mixnets and onion routing to obscure traffic patterns, making surveillance and traffic analysis significantly harder.

Quilibrium’s permissionless protocol lets nodes run anywhere, using methods that make it harder to reveal identities compared to tools like Tor. Tor can be undermined by state actors in countries like the US or Germany, where they run many nodes to monitor traffic and unmask users, though this is less feasible in regions with fewer such nodes, like Brazil or Chile. 

For users in restrictive environments relying on Q for activities like hosting sites or communicating, this could make IP tracking nearly impossible unless local state actors flood the network with nodes. However, complete safety isn’t guaranteed — websites on Q might still use JavaScript for browser fingerprinting, so users need to stay vigilant to avoid surveillance.

### Can Quilibrium handle traffic from a big tech company with millions or billions of users?

Q’s shared-nothing architecture, similar to ScyllaDB, allows parallel transaction processing without resource conflicts, unlike Ethereum’s single-threaded model, which bottlenecks under high load. This design theoretically supports high traffic and is built to be as relatively conflict-free as possible. Quilibrium could support 100 million or even 2 billion daily active users (like Facebook), enabling massive scalability as long as transactions don’t conflict and the network grows sufficiently.

### How fast is Quilibrium?

Q was designed to support ultra-scale applications like social networks and messaging apps fully on-chain.  
The network has been tested to handle up to 100 million messages per second (MPS). While MPS is not exactly the same as transactions per second (TPS), they are closely related. The actual TPS depends on the number of nodes available to handle the load. Initial estimates, based on previous node count statistics, suggest a realistic upper bound of 1.5–2.5 million TPS. Transaction finality: 0.2–10 seconds, depending on transaction complexity and hardware optimization.

*Note: These figures will need to be confirmed when apps begin to be hosted on Quilibrium, starting with v2.1.*

### How does Quilibrium prevent centralization?

Q prevents centralization by ensuring consensus doesn’t demand expensive hardware, making it possible for even a Raspberry Pi to handle the necessary calculations. It also embraces a range of hardware types for mining, thanks to the flexible complexity of its applications, opening participation to more users. To maintain decentralization, the network enforces minimum replication thresholds for core shards and halts operations if these drop too low, safeguarding data distribution. 
Additionally, its tokenomics are crafted to welcome new miners when the network hits specific milestones, keeping entry barriers low and participation broad.

*See also this [detailed article](/docs/discover/how-does-quilibrium-maintain-decentralization).*

### What types of applications can be developed on Quilibrium?

Q will be able to host any type of application, but the first generation of applications will probably fall in these categories:
1. Social Media: image hosting, long-form content, social graphs
2. Financial: tokenized assets, DeFi
3. Common Web Dev: SPAs, file hosting

### What are Quilibrium Tokenomics?

*Please see this [detailed article](/docs/discover/quilibrium-tokenomics).*

### What is the QUIL token?

QUIL is a utility token designed for use within the Quilibrium network. It is not intended for speculation, investment, or financial gain. It acts as the network’s core currency, enabling users to deploy data and applications, execute them, and interact within the system. Essentially a usage fee, it’s required for tasks like storing data on the hypergraph, launching QCL-based apps, running them, or querying data when not hosting it on your own node.

### What is the wQUIL (ERC20) token?

wQUIL is the official token bridged to Ethereum, contract: `0x8143182a775c54578c8b7b3ef77982498866945d`
Via the [official bridge](https://quilibrium.com/bridge), users can bridge QUIL to wQUIL and viceversa.

### Is there a Q wallet?

Q doesn't use traditional wallets. Instead, it uses passkeys built into your browser or device. This system lets you interact directly with the network without a separate wallet app or seed phrases. It's designed to be more secure and user-friendly, working similarly to how you might log into websites with your Google account. This approach makes it easier for new users to join while keeping your digital assets safe.
That said, developers can still create applications  for managing QUIL tokens with an user experience similar to regular crypto wallets.

### Is there a Q explorer (like Etherscan)?

Not yet, but there can be one to a limited degree.
The network has overall active proof state, prover rings, total supply. These are things that anyone can see. 
The contents of transactions or their settled states are however invisible unless you possess relevant key material to the transaction. 
Note the above applies only to native QUIL. wQUIL remains queryable via block explorers.

### Where can I download the logo kits for Quilibrium, Quorum, and Q Community?

Right here! [Quilibrium logo kit](https://quilibrium.com/Quilibrium-logo.zip) - [Quorum logo kit](https://quilibrium.com/Quorum-logo.zip) - [Q Community logo kit](https://quilibrium.com/Q-Community-logo.zip)

---

## Quilibrium Inc. and Q Storage

*Quilibrium Inc. is a company founded by Cassie Heart, Quilibrium's founder. It offers managed services such as the Quorum messenger, Q Storage (S3-compatible), and a Key Management Service (KMS). The company operates separately from the Quilibrium protocol itself. In fact, anyone can establish their own company and leverage the protocol to provide services.*

### How do customers pay for Quilibrium Inc.’s managed services?

Customers can pay Q Inc. in fiat or stablecoins for predictable billing in their regional currency, easing the transition from platforms like AWS.
Quilibrium Inc. uses its own earned QUIL tokens (from running nodes) to settle network fees, ensuring the token retains utility for direct network interactions.

### How does Q Storage cost compare to AWS S3 or other cloud providers?

Q aims to be highly competitive with AWS S3, particularly by emulating AWS’s free tier, offering 5 GB of storage at no cost, with additional tiers for subsequent data. Unlike AWS, where egress costs (charges for data retrieval) can escalate quickly, Quilibrium underwrites egress costs through its query execution model and upper-level caching for public S3 buckets. This makes it potentially cheaper than AWS for high-request scenarios, targeting competitiveness with Cloudflare’s R2, currently the cheapest S3 alternative.

### What are the costs and options for hosting a website on Q Storage?

Hosting a website on Q Storage includes a free tier of 5 GB, sufficient for minimal-payload static sites, with additional costs for larger sites based on tiered pricing. There are no extra fees for security, backups, or performance upgrades — replication and verifiable encryption are built into the protocol as standard features, not add-ons.

### How does Q Storage ensure fast website loading times?

For websites hosted via Q Storage’s public bucket proxy, fast loading relies on engineering solutions like layered caching to minimize response times, targeting tens of milliseconds for data retrieval. On the protocol level, query execution speed depends on node performance and network growth, improving over time but varying by conditions.

### Can users migrate an existing website to Q Storage, and what’s needed?

Yes, existing static websites can be migrated to Q Storage, though dynamic back-end services aren’t yet supported. Users need to buy a domain separately, as Q Storage doesn’t offer domain management, but it provides CNAME values to route the domain to the public bucket.

---

## Technical Questions

### What software knowledge will be required for applications to be developed on Quilibrium?

For network native development, QCL, as a subset of GoLang, is the primary language. Building new intrinsics can be done in many different languages, ideally GoLang, Rust, or C++. Local simulator and SDKs are coming up shortly.

### What are the core technologies used in Quilibrium?

1. VDFs: For timestamping and proving block storage - [learn more](/docs/learn/block-storage/vdfs)
2. Oblivious Transfer: Enables private data querying - [learn more](/docs/learn/oblivious-hypergraph/oblivious-transfer)
3. Oblivious Hypergraph: Stores data while maintaining privacy - [learn more](/docs/learn/oblivious-hypergraph/)
4. E2EE Encryption: Secures communication between participants - [learn more](/docs/learn/communication/e2ee)
5. Triple-Ratchet: Provides secure group communication - [learn more](/docs/learn/communication/mixnet-routing)
6. SLRP: Allows anonymous message routing - [learn more](/docs/learn/communication/mixnet-routing)
7. RPM: Enhances anonymity in message routing - [learn more](/docs/learn/communication/mixnet-routing)
8. BlossomSub: Efficiently propagates messages across the network - [learn more](/docs/learn/communication/p2p-communication)

These technologies work together to create a secure, private, and efficient decentralized network.

### How are private keys stored on client devices?

The storage of private keys depends on the client implementation. For example, Quilibrium's JavaScript SDK utilizes passkeys, which typically leverage secure enclaves or hardware security modules (HSMs) when available. This provides hardware-level protection for key material.

### How does Quilibrium handle malicious nodes or network trust?

Q uses a zero-trust model and includes one of the most maliciously secure consensus algorithms in the space. It minimizes the impact of adversarial nodes through cryptographic enforcement and protocol-level defenses.

### Is Quilibrium resistant to quantum computing threats?

Q currently uses elliptic curve cryptography (ECC) in some areas, which is not inherently post-quantum secure. However, these implementations use double the bit strength compared to typical networks, greatly increasing the computational cost of quantum attacks. As a result, less robust networks are likely to be compromised first, offering Quilibrium a critical early warning window. Thanks to its use of flexible proof systems like MPC-in-the-head, Quilibrium can migrate to post-quantum algorithms such as PICNIC with minimal disruption when the need arises.

### How much does CPU power affect reward amounts in Quilibrium 2.0 versus 2.1?

CPU power is just one factor influencing node rewards, and its role shifts significantly between Quilibrium 2.0 and 2.1. In 2.0, a faster, more efficient CPU allows a node to run more workers — additional processes that boost reward generation — making CPU performance a key driver of earnings. The more workers you can stack, the higher the rewards, directly tying output to CPU capability. However, the 2.1 upgrade changes this dynamic. It introduces substantial memory and storage requirements for each worker, shifting the bottleneck away from CPU power. While a more efficient CPU still helps, you can’t simply max out workers to leverage it as in 2.0 — memory and storage demands now play a larger role, reducing the CPU’s dominance in determining rewards.

### If Q is fully encrypted, how can you prove that some data actually exists?  

**Cryptography-based Answer**

- Create a Shamir split of the plaintext block (the data is cut into smaller pieces) as a **Feldman verifiable secret share**.
- Encrypt each split using **ElGamal encryption**.
- Apply a **Fiat-Shamir transform** to the encryption process to create a challenge that picks random indices to reveal partial shares. (These revealed shares are insufficient to reconstruct the full data, but enough to set a high statistical security threshold.)
- Verification confirms the Fiat-Shamir transform is valid, reconstitutes ciphertexts from revealed indices, confirms Lagrange interpolation of polynomial from ciphertext statements is equal to the statement of the proof.

**Non-Cryptography-based (Simple Analogy)**

- Imagine cutting a valuable object into multiple pieces.
- Lock each piece inside its own secure lockbox.
- Take a picture showing all the closed lockboxes.
- Split the photo into pieces, where each piece corresponds to a lockbox  —  like faces on fair dice.
- Roll the dice to decide which lockboxes to open and reveal.
- By revealing only certain lockboxes you can't see the whole object, but you have enough proof that the object inside is real and intact, **without** ever needing to fully open or disclose it.

---

## Quorum Questions

### What is Quorum Messenger and how do I start using it?

[Quorum Messenger](https://www.quorummessenger.com/) is the world’s first secure, peer-to-peer, end-to-end encrypted (E2EE) group messaging app. It’s free to use, requires no phone number or payment, and lets you join conversations instantly. To start, simply open the app — no sign-up barriers or fees stand in your way, making it accessible for anyone looking to connect securely with groups or communities.

### How does Quorum support freedom of speech?

Quorum champions freedom of speech by letting you speak freely within your communities without fear. Its Spaces are self-moderated, meaning your friend groups or communities — whether gamers, crypto enthusiasts, journalists, researchers, religious groups, political affiliates, or those avoiding politics — set their own rules. Unlike platforms with top-down censorship, Quorum hands control to users, ensuring your voice aligns with your community’s standards, not a central authority’s.

### What does it mean that Quorum is peer-to-peer?

Quorum operates on a peer-to-peer system, meaning your chats don’t rely on a central server that could be shut down. Powered by Quilibrium and the libp2p stack, it connects users directly, letting you message from anywhere, anytime. It supports multiple protocols like TCP, QUIC, Websockets, and even LoRa, offering flexibility and resilience — no single point of failure can disconnect you.

### Why is Quorum being open source a big deal?

Quorum’s open-source nature means its code is public, free for anyone to inspect, modify, or enhance. Without a central authority dictating how the client works, you can run custom versions, create unique themes, or tweak minor features to suit your needs. This openness fosters user control and creativity, ensuring the app evolves with its community rather than a corporate agenda.

### How private are my messages on Quorum?

Quorum keeps your messages private through end-to-end encryption, ensuring only your intended recipients can read them — no one else, not even Quorum itself, can peek inside. Beyond that, its message brokering protocol hides who’s talking to whom, so even your contact list stays confidential. This dual-layer privacy protects both your words and your connections from prying eyes.

### What is Quorum Apex, and how does it work?

Quorum Apex is an alternative to Discord Nitro, offering unique subscriber benefits on the Quorum platform. A key feature is revenue sharing: when a user subscribes to a space with Apex, the subscription fee (paid in $QUIL tokens) is split, with a portion going to the space’s community. Users can subscribe to up to four spaces per Apex payment, similar to boosting servers on Discord, but with the added incentive of financially rewarding community creators.