---
title: How Does Quilibrium Maintain Decentralization?
description: How Quilibrium's Proof of Meaningful Work, data sharding, difficulty calibration, and adaptive issuance prevent mining centralization and keep the network accessible.
---

# How does Quilibrium Maintain Decentralization?

One of the biggest problems in **blockchain mining** is **centralization** — where a small number of **powerful miners** dominate the network and control most of the rewards. This happens in **Bitcoin** and other Proof-of-Work (PoW) systems because of how mining rewards are distributed.

Quilibrium **2.1** introduces a new model called **Proof of Meaningful Work (PoMW)** that **fundamentally changes how mining works**. Instead of allowing **a few large players to dominate**, it ensures that mining rewards are **fairly distributed among many participants**, keeping the network **decentralized, secure, and resistant to manipulation**.

## The Problem: How Traditional PoW Leads to Centralization

### How Bitcoin & Other PoW Networks Become Centralized

* In **Bitcoin**, miners compete to solve **mathematical puzzles** to add blocks to the blockchain.
* The **first miner to solve the puzzle wins** and gets the entire reward.
* **Larger mining pools** (with more computing power) have a **higher chance of winning**, so:
  * **Small miners** almost **never win** and **join large mining pools** to get a share of rewards.
  * Over time, **a few mining pools control most of the network**.
  * Today, **the top 6 Bitcoin mining pools** control **over 80% of the network**, making it less decentralized.

### Why This is Dangerous

* **51% Attack Risk** – If one or two mining pools control the majority of the network, they could **manipulate transactions** or **double-spend coins**.
* **Power Concentration** – A few large entities effectively **decide how the network operates**.
* **Hardware Barrier** – Small miners **can’t compete**, making mining **only profitable for big corporations**.

### Quilibrium’s Solution: Proof of Meaningful Work (PoMW)

Quilibrium **2.1** completely redesigns the mining system to prevent these issues. Instead of a **single winner-takes-all model**, it:

1. **Splits mining tasks into small, unique shards**
2. **Makes every miner do verifiable work**, preventing fake participation
3. **Incentivizes decentralization by preventing mining pool dominance**

## How Quilibrium 2.1 Prevents Centralization

### Data Sharding – Distributing Mining Across the Network

Quilibrium 2.1 introduces a **sharded mining structure**, where the network is broken into **millions of potential shards** (approximately 2.5 million initially with the release of 2.1).

Instead of having all miners compete to process the same dataset, **data is distributed across multiple shards, each containing a portion of the network state**.

Miners can choose which shards to work on, but each shard has its own **unique proof structure**, making it computationally expensive to dominate multiple shards at once.

Miners working within a shard must generate **specific cryptographic proofs** related to the data in that shard.

The nature of these proofs ensures that simply increasing computational power does not guarantee dominance nor a linear increase in rewards.

This is due to that each shard contains **store and process verifiable data unique to each shard** so if a worker is enrolled into another shard, it has a completely different dataset and tasks.

And in the event that a miner allocates multiple workers into the same shard manually, it will not guarantee a similar shard enrollment position and there is reduced rewards the more workers there are in a shard. With the mixnet in play, network fees are not constant to any one worker in a shard, which results in miners allocating workers to more profitable shards.

And this incentive further enhances the point that **the cost and complexity of proving across multiple shards create a natural decentralization effect**.

##### Further Exploration
An in-depth explanation of this decentralizing incentive is highlighted by the fact that each worker must maintain their own set of encrypted data.

Each worker has it's own set of encrypted data it must encrypt with it's own unique key.

This prevents a miner from trying to be clever and using a single store for multiple workers in the same shard.

This means that there is no way to reduce the amount of resources each worker must have on hand.

Also, in consideration is that the "reward-greedy" default operation mode that most node operators will use to manage their worker deployments.  Using "reward-greedy" mode means that the network will automatically shift workers to enroll in any shards that will earn them more than their current rewards.

Because the enrollment periods for shards is long enough and this process is handled by the network automatically, there will always be competition for any open/high-reward slots and obtaining all top-tier slots (Ring 0) unlikely to happen and if it does happen, it's an unreliable strategy.

So even if a miner decides to place a handful of workers into a single shard, they will not gain any performance benefits and, in most cases, lead to sub-optimal rewards.

#### Why This Prevents Centralization:

* **Large mining pools cannot dominate the network easily** because each shard requires **separate verifiable work**, making it inefficient for a single entity to take control.
* **Smaller miners remain competitive** since they are not forced to compete with the entire network, but rather work within **localized proof structures** that make it harder for large players to outscale them.
* **Sharded proofs and encryption mechanisms prevent miners from faking multiple identities**, ensuring that decentralization remains intact.

### **Difficulty Calibration – Adapting Mining Based on Hardware**

One issue with **Bitcoin** is that it only rewards those who have **the most powerful and expensive computers**.

In Quilibrium **2.1**, the **difficulty of mining adjusts based on the hardware used**. **Low-power miners (like Raspberry Pi devices) can still participate**, but they **work on smaller tasks**. High-power machines **are given more difficult tasks**, but **won’t dominate all rewards**.

#### Why This Prevents Centralization:

* **People with basic computers can still mine**, making Quilibrium more accessible.
* No single **type of hardware gives an unfair advantage**, reducing the risk of centralization.

## **Adaptive Issuance Model – Preventing Long-Term Centralization**

One of Bitcoin’s biggest challenges is the gradual reduction of mining rewards, which makes it increasingly difficult for new miners to compete.

Over time, as profitability declines, mining becomes concentrated among those with the most powerful and efficient hardware, leading to centralization and a weaker security model.

This is often referred to as Bitcoin’s "shrinking security budget" problem, where fewer active miners result in a less secure and more vulnerable network.

Quilibrium addresses this issue with a **dynamic issuance model** that adjusts mining rewards based on real-time computational progress rather than fixed time-based halvings.

Instead of cutting emissions at set intervals, Quilibrium uses it's **Verifiable Delay Function's (VDF's)** global proof difficulty to track the state of the network’s processing power.

A VDF can have it's difficulty adjusted to speed up or slow down it's completion. The faster and/or more efficient a processor is, the higher the difficulty is for a data worker that uses that processor. And vice-versa.

To determine which difficulty a data worker will need to use for it's proofs, Quilibrium utilizes an algorithm called ASERTi3-2d, which is also used in Bitcoin Cash.  When the average difficulty of all nodes surpasses a threshold, a predefined computational milestone, the protocol will unlock a new emission phase.

For example, when the average difficulty reaches **100 million**, Quilibrium will trigger a new generation of emissions. This creates a temporary increase mining rewards before they gradually taper off again.

This is estimated to happen around 2033, and it ensures that mining remains profitable as technology advances, preventing an arms race where only those with the most sophisticated hardware can compete.

### How This Prevents Centralization

* **Sustained Mining Incentives:** Rewards adjust dynamically, preventing a sharp decline in miner participation over time.
* **Fair Entry for New Miners:** Unlike Bitcoin, where later miners face diminishing returns, Quilibrium ensures that new participants still have opportunities to mine profitably.
* **Balanced Rewards Across Generations:** Mining incentives are tied to actual network progress, preventing early adopters from having an unfair advantage over time.

By making token issuance responsive to real-world computational advancements rather than enforcing artificial supply cuts, Quilibrium creates a more sustainable, decentralized, and secure mining ecosystem.

:::info
To learn more about this adaptive issuance model, see [Quilibrium Tokenomics](/docs/discover/quilibrium-tokenomics).
:::

## Can Q Be 51% Attacked?
The short answer is simply, "no."

Quilibrium employs a different model of Proof-of-Work (PoW) that blends long-running positive behaviors that you see with Proof-of-Stake (PoS) networks with an intractably hard trapdoor function of PoW networks.

What this means is that for node runners who have a long-standing history of correct behavior build up a "seniority" score that means a higher chance of securing more rewarding positions in the network, combined with if a node submits some message that does not validate it misses out on rewards and will not accrue seniority after the network rejects it.

If the network finds a node misbehaving (e.g. going in direct opposition to protocol, like equivocation, which is sending conflicting messages/transactions to different parts of the network at the same time), it will be outright blacklisted.

The network also ignores and drops unsupported message types.

Another part of why the 51% attack vector doesn’t work is also due to liveness.

In order to maintain seniority, nodes have to continue to process transactions mutually with its peers under a given shard.

This processing is an MPC protocol itself, more simply: a peer does not get to uniquely decide the order of transactions – it’s a permutation mixnet, so to conduct the equivalent of a 51% attack, they’d have to have sufficient peers collude in a shard to present a different set of transactions from a mixnet.

However, in doing so would immediately identify that they had done so because their results would differ from any one other node who is not colluding in the entire network because detection happens on the individual shard level and also with a secondary check at the global level.

To successfully make such an attack happen, a coordinator would need all provers in a shard, all provers at a global level, and would require cooperation (or be holders of the funds in the given shard) at both source and destination shards to be able to produce a conflicting transaction in order to participate in the mixnet twice.

If it wasn't obvious, you should note that the above means such an attempt would be quite costly.  It would mean that not only do all colluding nodes get seniority stripped, evicted (kicked from the shard), blacklisted from network participation, their attempt would not have any "loot" or payoff.

Reordering transactions, is simply put, not possible.

### Impact of Seniority Loss
It is also worth exploring the impact of seniority loss in this calculus of risk versus reward.

Seniority is used to determine who wins in competitive "bids" for openings in higher earning shards/ring positions as well as maintaining them over time.

A node's peer ID starts at zero seniority and can only gain seniority by running the node long-term which means long-running operating expenses.  The length of time a node participates fairly and correctly increases it's seniority.  This idea can be correlated to the PoS mechanism, where the more trustworthy the node, the more advantages it has in the network.

Particularly, increased seniority means more odds of winning a bid for consecutively higher earnings as time goes on.

A node-runner who is interested in earning long-term rewards and earning more lucrative/profitable positions would not want to ever lose their seniority under any scenario (particularly on this fool's errand of an idea) as it would be a staggering loss in potential income, as well as a node may not be profitable* for a long period of time while it is accruing seniority.

*Profitability as in being able to pay for it's running costs with proving rewards and/or transaction fees.

Not only is there significant ongoing resource costs to run so many nodes in 51%-like attack on Q, this attempt would guarantee the loss of what is essentially their entire "network stake." In other words, it means the burning of their seniority for each participating node and, along with it, their higher earning rates. They then would have to start over from a seniority score of zero on a fresh peer ID.

### Can node miners change the network by running custom code
The short answer is, "yes."

This type of event of 51% of nodes running custom code that is not official releases that alters the nature of the network would actually be considered a forked network.

Which, in a sense would lead to the question of, "would it even be Q at that point?"

That said, it should be noted that there is an option for nodes to operate on what we call an "alternative fee basis" with their own non-native applications over Q that are network-adjacent.

This means that while they are integrated into Quilibrium's network they contain additional features that do not conflict with Q's base-functionality.  This could be seen as an expansion pack for a video game.

These types of nodes would be opt-in and paid for separately with a token of the application designer's preference.  These types of functionality may be something like a testnet, pre-releases of Q's future network primitives, a settlement layer for an Ethereum-based network, etc.

#### Does that mean that running custom node code is bad?
No.  Miners are free to customize and build their own binaries that suit their needs.

The nature of the network is that as long as the core functions of the network are met, optimizations, custom integrations, etc. to clients can be perfectly acceptable.

Benefits of doing such vary from person to person, and could be, although not limited to, customizing personal node analytics, custom node management preferences, or streamlined for joining a pool.

Optimizations for rewards for base network behaviors are estimated to be marginal and due to the project's license being AGPL, node-runners who make direct alterations to the client are legally obligated to share their changes back upstream to the project's code-base.