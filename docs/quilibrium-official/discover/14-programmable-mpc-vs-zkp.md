---
title: Programmable MPC vs ZKP
description: How Quilibrium's programmable multi-party computation solves the first-mover problem by enabling conditional disclosure, and why MPC is better suited than ZKPs for multi-party coordination.
---

# What If You Could Agree Without Revealing Intent?

In many real-world situations, the best outcomes happen when multiple people agree — but only if everyone involved consents. The catch? No one wants to go first.

Whether it's negotiating a deal, submitting feedback, or expressing interest, revealing your intent prematurely can come with risks: rejection, retaliation, or lost leverage.

This is the classic **first-mover problem**, and it limits how openly we can collaborate.

Quilibrium addresses this by embedding **programmable multi-party computation (MPC)** at the core of its protocol. It allows multiple parties to participate in a shared, private computation — one where **inputs remain hidden unless a certain condition is met**.

## The First-Mover Problem

Let’s look at a few everyday examples:

- A startup is open to acquisition — but only at a certain price.
- An employee wants to flag an issue — but only if others have similar concerns.
- A company wants to explore a partnership — but doesn't want to tip its hand too early.
- Two people might be interested in each other — but neither wants to risk the embarrassment of a one-sided signal.

Each case involves **intent that’s only worth revealing if the other side agrees**. Until then, staying silent feels safer.

## Quilibrium’s Answer: Conditional Disclosure

With programmable MPC, parties can contribute their inputs — ideas, preferences, votes, or offers — to a shared process. But nothing is revealed unless a pre-agreed condition is satisfied.

For example, in a dating scenario:

- You indicate you're interested in someone.
- They do the same.
- A private computation runs securely on the Quilibrium network.
- If there's a match, you're both notified. If not, no one ever knows the other tried.

This same logic applies to any system where **reciprocity matters**. It’s not just privacy for privacy’s sake — it enables people to act honestly, without fear of unilateral exposure.

## Why Not Just Use ZKPs?

Zero-Knowledge Proofs (ZKPs) are great for letting someone prove they know or own something without revealing the data. But they don’t solve coordination problems involving **shared inputs and mutual conditions**.

ZKPs work well in one-directional trust models. But **MPC is built for two-way (or multi-way) trust**, where **everyone contributes privately**, and outputs are only produced if certain logic is satisfied.

This is what Quilibrium’s protocol is optimized for.

## Broader Use Cases

The underlying idea — conditional mutual consent — powers a wide range of applications:

- **Governance**: Voting that only reveals results if participation thresholds are met.
- **Research**: Joining medical or academic datasets without leaking sensitive individual data.
- **Negotiation**: Sharing deal terms that only surface if multiple parties align.
- **Anonymous feedback**: Collective reporting that protects individuals unless a pattern emerges.
- **Dating**: As shown above, mutual matches without public rejection.

In each case, **trust isn't assumed — it's structured into the protocol itself.**

## Building Systems That Respect People’s Boundaries

The web wasn’t designed for nuance. Too often, platforms force us into binary choices: share everything, or stay silent.

Quilibrium introduces a third path — systems where **intent, interest, and agreement can be expressed safely and privately**, and revealed only when appropriate.

For developers, this opens up new design primitives. For users, it means finally being able to act without fear of exposure.

The result is not just better apps — but better interactions.

---

For a more engaging take on the same problem — and a poetic analogy involving love, coordination, and cryptography — watch Barry Whitehat’s talk <em>“2PC is for Lovers”</em> from the PROGCRYPTO conference

<div class="video-responsive">
  <iframe 
    src="https://www.youtube.com/embed/PzcDqegGoKI" 
    frameborder="0" 
    allowfullscreen>
  </iframe>
</div>
