---
title: "Quilibrium 2.0 Launch Update and Network Architecture Deep Dive"
source: youtube
youtube_url: https://www.youtube.com/watch?v=tsv1i9x2VhM
author: Cassandra Heart
date: 2024-09-09
type: livestream_transcript
topics:
  - network architecture
  - 2.0 launch
  - proof of work
  - MPC
  - prover rings
  - transaction fees
  - cryptoeconomic security
  - sharding
  - network performance
---

# Quilibrium State of the Union

## The Problem: The Internet Under Attack

The internet is under a multi-sided attack. We've seen things like the recent indictment of the founder of Telegram, incidents in the past where the FBI has pressured Apple into dropping end-to-end encryption, people being deplatformed, entire infrastructures of services like AWS pulling people off of their platform. This is a multi-pronged attack on the web today.

What's problematic is these attacks come from so many different angles: from those who provide our identity, personal storage, communication, ISPs, Cloud providers, and of course governmental pressures. When I was saying this when I started talking publicly about this project years ago, people thought that was a little bit conspiracy-minded. But nowadays I feel more and more people are starting to actually see the mask come off from all of these and realizing how true this is, how serious of a problem this is, and how little time we have left before this problem is no longer able to be solved.

## Why Current Crypto Falls Short

The current era of crypto is very ineffective to fight this. The linearization of all content into singular blocks of transactions with execution caps really only succeeds at producing limited financialized applications. It can't reach out to internet scale applications.

To give you a very simple example: the greatest TPS (transactions per second) network, if you were to include all of the voting transactions as actual transactions, is only sitting around 6,000-7,000 TPS. iMessage for example in 2016 (and it's grown way beyond that since then) was at a rate of 200,000 messages a second. There is no crypto network out there that is under a blockchain-oriented protocol that can effectively provide internet scale applications.

It always leads to something that has to occur off-chain with some tiny on-chain component like identity. Very frequently by consequence it results in very financialized problems like limited namespaces becoming bidding wars. You end up with conversations around Harberger taxes. It ends up in a way that people don't feel like it's actually usable, which is why we end up with these situations where people say it's actually a solution in search of a problem.

## Our Alternative Thesis

We have an alternative thesis. There are ways we can leverage the research that has come from crypto in order to provide real solutions. Our core principle is to use the research that's come from crypto because there's been so much innovation in the space and a lot of it is only in paper form. There's a lot of really powerful ideas that have come about from all the research that's happened, and it hasn't all been put into actual use yet, or in the ways that it's been put into use hasn't been used very effectively.

Our mission is to become the base fabric of the internet that secures every bit of traffic over the web. That's an ambitious mission. One particular investor I admire dearly actually referred to it as Herculean. But I believe it's possible because I have been working in this space practically from the beginning. I was on the Metzdowd mailing list when the infamous Satoshi Nakamoto showed up to post the Bitcoin white paper.

## Project History

All this actually started because several years ago (seven at this point) I was actually getting really disappointed in Discord. Discord was starting to get really popular and by consequence they were starting to get a lot of media attention about certain communities that were starting to onboard on Discord. It was getting enough media attention that Discord was getting heavy-handed with banning people. Then there were talks about potentially Microsoft acquiring Discord.

These things started to lead to a concern that we needed a solution. It was becoming very clear that Discord was heading down a path where freedom of speech was not something that they were actually condoning. To me, I'm a very strict constitutionalist. I actually see intrinsic value in freedom of speech. I've seen how valuable it is. There's a person I deeply admire who has done a great deal of effort by leveraging just his simple ability to sit down with people and talk with people to change their minds on some of the worst possible beliefs a person can have.

So I set out with this plan. I had been running an educational stream where I was teaching people how to code, starting from simple principles and building all the way up to actual full-blown applications. How do you build things at the scale of Facebook? How do you build things at the scale of Apple? And so I created a Discord clone.

In doing so I realized if I wanted to launch this, I am actually now facing many demons. When you release an application on iOS or on Android, you have to deal with App Store policies. App Store policies are actually quite strict and very anti-free speech. They have things like reporting which you have to adhere to. At the end of the day, if there is too much political inconvenience, you will still find yourself deplatformed. And very similarly with Amazon Web Services or any of the other Cloud providers, if you are politically inconvenient they will deplatform you as well.

So I realized I'm facing actually a much bigger problem. If I'm wanting to actually solve the problem of promoting freedom of speech and privacy on the web, I actually need to solve the real problem of freedom of speech and privacy on the web. From there I started to pivot into how do I decentralize the web services that people rely on day-to-day.

## Evolution of the Design

A few years ago I created the first iteration of what Quilibrium is. It was very ambitious, very novel on a lot of different cryptographic constructs. I was deep in the weeds so far that I was coming up with new different kinds of algebraic structures that could provide cryptographic primitives. Ultimately, not only was it very complicated, it was also so novel that these were well beyond the realm of actual peer review.

To me what's important is ensuring that we actually achieve these goals. While these things could end up being very powerful tools, they need to go through peer review. So I started to refine the idea, shrinking into things that people already have well researched, have been in implementations in various ways, and ultimately started to converge on what Quilibrium is today.

The approach was to:
- Simplify, simplify, simplify
- Use peer-reviewed audited techniques only
- Launch small, iterate
- Unlock transactions once the network is stable
- Ensure that cryptoeconomic security remains stable with generations of technology
- Learn the lessons of other protocols

## The KZG Ceremony

About a year and some change ago we started with a KZG ceremony. For those unfamiliar with what KZG is, it is a commitment scheme that enables you to create a polynomial commitment. More simply put for non-cryptographers: it allows you to say "I have a lot of data, here is a tiny string that basically says this is proof of the data," and I can use some clever math to prove that I have all of the data and it relates to this. You can build all sorts of wonderful constructions on top of it including proving that an application was executed correctly.

But you have to actually have what's called a KZG ceremony or Powers of Tau ceremony in order to set up what is called a secure reference string. Around April last year we did the KZG ceremony. Even when I launched the ceremony, it was such an unbounded success in terms of how much attention it got that we had over 200,000 contributions to the ceremony providing randomness and entropy that helps keep that cryptographic reference string secure. It immediately knocked us over. I immediately had to fight the fires on that and get it back up.

We ran it for about a month and a half, maybe two months. For participating, we incentivized it by giving a voucher. Essentially you create a private key which you use to sign your contribution, and then it gets included into the transcript log of the actual ceremony. By doing so, you get 50 QUIL per voucher, and when everything is launched you were able to claim those 50 QUIL tokens.

## Network Launch and Growing Pains

After we did that, we then actually tried to go forth with launching the network. When I began that process, we immediately were again met with more surprises. Not only did we have a lot of interest, we had a lot of people with Kubernetes farms ready to go. We got hit with over 400 nodes, which was astounding to me at the time because very few networks even have that many nodes that are actively participating. To see 400 slam on day one was unexpected and it immediately stress tested the network.

## Learning from Other Networks

A couple months ago I gave a talk at Coinbase (and also a condensed version at the FarCon conference) where I talked about the structure of network designs like Ethereum and the iterations they went through: ETH 1.0, ETH 2.0, and then with the addition of L2s to increase the scalability of the overall Ethereum ecosystem. I made an observation casually that it kind of looked like the Commodore PET and had roughly about the same performance.

### The Problem with Flat Issuance Curves

One of the things that a lot of people don't know (especially if you weren't there near the beginning) is there's been this kind of behavior in cryptocurrencies where a lot of new protocols come out and sometimes it's because they don't want to stray too far off the beaten path, but they end up building structures that are mimicking what's already out there. This process is often called cargo culting, and this is finally starting to show the consequences of cargo culting by design.

What Satoshi Nakamoto had mentioned very offhandedly was that that limit, that upper limit of 21 million Bitcoin, was effectively a guess. Just a casual guess that has been replicated in other protocols, putting flat issuance curves that have an intrinsic limit. That structure has been replicated and copied over and over again.

Now we're starting to see what happens when you reach the endpoint. We have finally hit another halving for the network. Essentially what happens when you have a flat issuance curve is that inevitably as you get closer and closer to the end of that issuance curve, you hit this intrinsic variability where transaction fees are insufficient alongside the actual emission rate of the network, such that miners become disincentivized and will start dropping out.

The ratio that we're looking at today is one where Bitcoin has a price that is insufficiently high enough to reward the miners to continue to keep operating. There are miners that are now shutting down. When you have this tremendous hash power behind something like proof of work, you end up with a scenario where you start to lose some of that hash power and it becomes reserved, tossed over to other networks or simply just discarded.

When you have that happen, you end up in this state where what is called cryptoeconomic security of a network becomes threatened. One of the core attacks, one of the core problems with proof of work or schemes very similar to it, is what's called a 51% attack, which means that if somebody controls more than 51% of the mining power of the network, they can rewrite history.

We're reaching a point now where the miner's revenue is getting sufficiently low and miners are starting to drop out that if the hash rate continues to trend downward but all that hash power remains still in existence somewhere, you now have the possibility (not necessarily the actuality) that a 51% attack could be conducted on what is considered the most valuable crypto asset.

## Correcting Common Misconceptions

What did those lessons amount to? People said:

- "We need better tooling" - No, we need a better dev environment
- "We need better infra" - No, we need a design that doesn't centralize indexing
- "The UI just needs to be improved" - No, we need actual abstractions that are baked into the network design that are actually skeumorphic

For those who don't understand what skeumorphic is: if you remember the old days of the iPhone, the very first iPhone apps that came out were allomorphic, which just means that they replicate things that existed before. So if you had an app that listened to radio, it looked like one of those old school radios with a dial.

When it comes to crypto, we did actually have a skeumorphic abstraction at the beginning. The very first crypto network that existed, Bitcoin, was a decentralized ledger. That's it. What we've done since then is just extended on top of a ledger but not actually created an abstraction over generalized compute instead. This weird hybrid bolt-on thing that happened with a ledger is very far beyond anything that is actually skeumorphic. So you don't need to improve just the UI; you need to improve the network itself.

- "Proof of work has diminishing returns" - It's not that proof of work has diminishing returns; it's that we need a better form of proof of work, not proof of stake
- "Just generate manage wallets for users" - No, we need to rethink that. This comes back to the skeuomorphic abstractions problem. Why use wallets at all?

## The Quilibrium White Paper

December 25th, 2022 I published the original Quilibrium white paper. I do not like LaTeX. LaTeX has never been a friend of mine when it comes to writing papers. The white paper's hard to read, I agree. There's a lot of people who said that it was incomprehensible. It's not incomprehensible. Where it's really rough to read, I did make references to the papers that I was building on top of so you could see far better formatted versions. But if you're not a cryptographer at all, even then it's still very hard to read. Once 2.0 comes out, I do want to have a better, easier to read white paper.

What I was trying to answer through this white paper was: How do you actually architect a different form of network that isn't a distributed ledger, instead it's a different kind of distributed compute system? Something that is forming around a different object for consensus than a distributed ledger? How do you achieve the same principles of general cloud compute but in a distributed, private, secure context?

## Network Development Phases

We launched the first phase of the network, ended up with 400 nodes to start off, everything crashed, it was a big chaotic mess. But over time I started building and solving those problems as they arose. We ended up with some of the core components that ultimately became the basis of Quilibrium.

We had around 17,786 peers which was still insane to me at the time. Show me the incentives and I'll show you the outcome. Because it was an incentivized testnet phase of the network, people ran nodes. Even if they couldn't necessarily use those rewards yet, people ran nodes, and they ran a lot of nodes.

We got past that point and started to move into the next phase of the network, which is the Dusk phase of upgrades. This is what we're currently within. Those components that we're building on top of from the original Dawn part of the network essentially turn it into that decentralized cloud platform.

So far we've had over 250,000 reward peers. The highest peer count we've had was over 200,000. Thankfully that shrank a little bit so it's been a little bit easier to manage some of those peers. We've had some interesting issues trying to deal with Sybils, but ultimately we are getting closer and closer to the point of 2.0 being ready to go.

## Current Network Status

Today the network has thankfully shrunk in size, but there's a little asterisk there. The latest count was roughly around 29,000 live peers. But one thing I noticed that is unique from our previous stats where we were sitting around 200,000 peers is that they were hovering at about roughly an average of 11 cores a node. Now it's about 48 cores per node.

What does that mean? It means one of two things: people have either consolidated multiple nodes into a larger more powerful node, or they are actually running in what we've supported as a clustered mode. So if you were to try to translate that to the equivalent of the types of nodes that we're running in the Dawn era, we're actually sitting at around roughly 125,000 physical nodes. But in terms of peers on the network, it's about 29,000.

That's actually a nice thing. More that we have as logical peers is actually better because it means less traffic has to actually go over the network in order to fulfill the objectives of the network.

## Network Architecture Deep Dive

Structurally we have a very different design from other blockchains. In fact that's why there is the running statement that I have iterated over and over again that we are not a blockchain.

What the network is effectively creating is something a bit different. I've used the term historically of an "oblivious hypergraph" and ultimately that has been memed to Helenback because it is a very obscure construct both in the terms of mathematics and cryptography. Since then I have just instead called it a distributed network. You can treat this as a distributed database with compute. That makes things a little bit easier for folks to grasp.

## Performance Improvements

We have forked practically all of the components of the libp2p libraries that we use and a lot of this has drilled down into performance. For example, we've had instances where we found that the use of `defer` in Golang is actually slightly slower. It causes different penalties in terms of performance compared to actually just taking whatever that deferred statement is and issuing it at a time that is sufficiently safe to issue.

We've actually achieved performance increases to the point now where the network is capable of handling a load of over 100 million messages a second. Now, messages aren't transactions - I want to be clear about that. But there are a lot of applications that are message-only oriented. You don't need transactions in terms of actual data settlement to still be useful.

Being able to support over 100 million messages a second as a base case is something that immediately unlocks many internet-scale applications to run on the network efficiently. That is already monumentally better than what exists.

We've also fixed some really weird broken things in the go-multiaddr library. In these libraries they make use of what's called the panic-recover pattern instead of actually tossing an error back when an error occurs. They just panic and then the outside calling function will defer the evaluation of it such that if there is a panic it catches it and then it returns an error.

Even the developers on those projects have actually listed as issues historically that these are things they needed to fix. But the problem is the only way to fix it is to break the interfaces of those particular libraries. These are forked so far beyond what they previously looked like that we actually have to maintain a wholly separate fork of the go-libp2p stack, and it is an enormous amount of code changes.

### Blossom Sub

For those who have been in the P2P oriented space for a while, you're aware of some of the similar libraries for peer-to-peer communication like gossip sub. We have a forked variant that has been forked and modified so much at this point that it no longer resembles gossip sub at all. It is called Blossom sub.

### Random Permutation Mixnet

We have translated certain things under Rust. For example our random permutation mixnet that provides unlinkability of sender and recipient for messages on the network. We have done a lot of performance drills that have increased the performance of this such that we can actually securely mix millions of messages without any impact to the user experience. It can basically just run in real time.

## Q&A Section

### Network Admissions and Monitoring

I am monitoring network admissions. One of the things that's actually been really interesting: if you watch your logs enough you'll start to see a certain pattern that's occurring. There has been a number of people who are not maintaining their nodes correctly. It's getting to the point now where most of the messages that are passing over the network are from peers that have not updated their nodes.

While yes there are more powerful nodes on the network and it is possible to swap to a larger more powerful node in order to gain more rewards, the rough estimate from the actual most up-to-date correctly running nodes is: once you get past the 700,000 iteration mark we're actually still within the emission curve. So far so good. By the time we reach the end of the month we'll still be within safe boundaries. I am monitoring, so far we are okay.

### Prover Rings

The structure of the network itself is sharded. There's essentially three tiers of shards. Each one of those shard levels has its own ability to be a ring.

When the network first starts out with 2.0 launch, we're assuming that the network will converge on the highest layer. You can think of it kind of like a tree. There's essentially 256 global synchronized commitments (or global shards). Then from each of those there's 65,536 core shards. Then inside those core shards there's the actual data blocks.

Each one of those layers of that tree can have prover rings around it. But the deeper you go, the more rewards you get (assuming there's data to actually prove over), which is why it incentivizes network growth and people actually providing the greatest range of replication.

Basically what happens is at those different tiers, at the highest layer of the protocol, the only messages that go over the protocol are essentially these commitments for the global shards, which is why we're able to have minimal traffic. The global shards have 19 kilobytes data in total for all 256 shards. So there's very minimal traffic that goes over that channel.

When any node is trying to declare a membership of the prover ring on that, it's another message that goes over that channel. It is essentially prioritized based on seniority - effectively the longer you've been participating in the network, the higher your message is prioritized when it's being included in the set of who is in the prover ring for that given shard.

If you choose to fragment (when a given global shard has become too large), then when it fragments you can actually get the same level of priority in choosing out which shards you want to cover.

### How Newer Nodes Join Prover Rings

When a node joins the network post-2.0, there's essentially an announcement that says "this is my node, this is my peer ID, these are the capabilities that my node can offer, these are the specs that my node can offer."

Then it makes a declaration. First it queries the network for what is most in need of coverage. The default mode of a node (there will definitely be forks where people will go into specialized modes that are seeking different cryptoeconomic incentives, but I'm not diving into that) for our official node client is going to be data greedy.

So the idea is going to be providing the greatest replication at the greatest ability for it to do so. The focus of the node will be declaring "these are the particular shards that are not replicated the most, I'm going to target those, and I'm going to announce my intention to join the prover rings for those." Then when those get included into that particular level of shard basis of the network is when they'll actually be accepted and inducted into the prover ring.

### Does This Change Affect Capacity?

No. That doesn't change capacity at all. The only thing it does is it changes the cryptoeconomic basis on which that capacity is disincentivized.

When it comes to storing data on the network and how it impacts the overall issuance curve, a malicious operator could just store a bunch of stuff and that would decrease the issuance. But that costs money. Whereas before we weren't including proofs as part of that, and so by consequence including proofs in that now and also forcing transaction fees to be required, it is now essentially a forcing function that prevents somebody from adversely acting in such a way that would do that, because they would be disincentivized - they'd actually be spending more tokens than they would be earning.

### Minimum Upload Rate for Home Nodes

The way that we use MPC: if you are running on a low speed connection you can operate in just a replicating prover model. You can take offline proofs instead of having to do interactive MPC, because interactive MPC uses a lot of bandwidth. It's roughly capped at around 10 megabits per second. That's the peak optimization - past that it's diminishing returns in terms of performance.

So if you don't have a good connection you can run your node without actually doing the online prover model. You can just be strictly offline prover plus data.

### CUDA Support

Not yet. That was one of the interesting side effects of investigating some of the other offline provers - technically they already have CUDA integration and that would have been really cool. But they're just so slow, even with CUDA.

---

*Last updated: 2026-01-29*
