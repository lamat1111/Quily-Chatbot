---
title: Quilibrium Tokenomics
description: Overview of QUIL token economics, including the generational emission model, adaptive issuance tied to network difficulty, and long-term supply projections.
---

# Quilibrium Tokenomics

Quilibrium employs a generational token issuance model that dynamically adjusts based on network-wide computational progress, ensuring long-term sustainability and decentralization. Instead of a fixed emission schedule, new $QUIL emissions are triggered when the network surpasses predefined computational milestones.

## $QUIL Token

:::info

$QUIL is a utility token designed for use within the Quilibrium network. It is not intended for speculation, investment, or financial gain. Quilibrium Inc. does not endorse or facilitate any trading activities related to $QUIL or $wQUIL.

:::

$QUIL native tokens can only be mined. There was no allocation to VCs, no premine, and no airdrops.\
$wQUIL is the official token bridged to Ethereum, contract: `0x8143182a775c54578c8b7b3ef77982498866945d`

## Token Emissions for the Current Generation

The current generation will last until 100 millions iterations are reached. This is roughly estimated to happen around 2033.

* Circulating Supply (10.02.25): \~ 1.3 Billions - please see the [dashboard](https://dashboard.quilibrium.com/) for the most updated value
* Inflation: 1.6 to 1.7 Billions in 2033 (estimation)
* Token emissions diminish according to network growth (storage demands)
* As the network grows and emissions flatten out in each generation, transaction fees play a bigger role in miner incentives. See also [Gas fees and dynamic fee market on Quilibrium](/docs/discover/gas-fees-and-dynamic-fee-market-on-quilibrium).

![Q emissions curve chart](/img/docs/discover/Q-emissions-curve.jpg)
*The above chart is a conservative estimation, based on comments from the development team. Actual emission rate will depend on network storage demands.*

## Adaptive Emissions and Generational Thresholds

Quilibrium's emission model prevents mining centralization by ensuring that emissions adjust as computing power improves. Instead of a fixed schedule, emissions are tied to network difficulty, which increases as better hardware, optimized software, and improved algorithms enhance computational efficiency.

Each generational milestone temporarily increases emissions before tapering off again. This prevents a scenario where only the most advanced miners can compete, as seen in Bitcoin.

Quilibrium's model ensures that both early and later participants remain incentivized, fostering long-term decentralization.

:::info

To understand why this adaptive issuance model is important, please read [How does Quilibrium maintain decentralization?](/docs/discover/how-does-quilibrium-maintain-decentralization)

:::

### Current and Future Generations

* **Generation 1 (Current):** The network is currently in its first generation, with difficulty levels steadily increasing as more powerful hardware is deployed.
* **Generation 2:** Will begin when the network-wide average difficulty reaches its first major threshold, estimated around 2033.
* **Generation 3:** Will be triggered by the next significant difficulty threshold after Generation 2.
* **Future Generations:** Will continue to be determined by increasingly higher difficulty thresholds, reflecting exponential improvements in computational capabilities.

Each generational reset results in a temporary emissions increase before gradually declining again, ensuring sustained miner incentives and long-term network security.

<details>
<summary>What determines network generations?</summary>

A new generation in Quilibrium is triggered when the network reaches a specific average difficulty threshold across all shards. Each shard's difficulty is dynamically adjusted based on the average of node's compute engaged in proofs for that shard, with more powerful equipment naturally achieving higher difficulties.

As participants deploy more powerful hardware over time and older equipment is replaced, the average difficulty across all shards will gradually increase. When this network-wide average difficulty reaches predetermined thresholds, it triggers the start of a new generation.

This adaptive system ensures that the network's progression to new generations is tied to actual computational advancement rather than a fixed number of iterations or frames. It naturally reflects the overall improvement in the network's computational capabilities over time.
</details>

:::info

For a detailed technical explanation please read this article on [Proof of Meaningful Work (PoMW)](https://paragraph.xyz/@quilibrium.com/proof-of-meaningful-work).

:::