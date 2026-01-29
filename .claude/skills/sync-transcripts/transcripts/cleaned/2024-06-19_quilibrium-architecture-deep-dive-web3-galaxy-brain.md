---
title: "Quilibrium Architecture Deep Dive - Web3 Galaxy Brain Interview"
source: youtube
youtube_url: https://www.youtube.com/watch?v=9P3eTJl9ZlY
author: Cassandra Heart
date: 2024-06-19
type: podcast_interview
topics:
  - quilibrium-overview
  - architecture
  - censorship-resistance
  - privacy
  - proof-of-meaningful-work
  - verifiable-delay-functions
  - hypergraph
  - mixnet
  - sharding
  - quil-token
  - mpc
  - pass-keys
---

# Quilibrium Architecture Deep Dive - Web3 Galaxy Brain Interview

*Interview with Nicholas on Web3 Galaxy Brain podcast*

## Quilibrium's Mission

Quilibrium's mission is to secure every bit that traverses over the web. Whether that's on the Quilibrium network itself, a VPN that somebody's using, if somebody's interacting with another chain, or even if somebody's interacting with the clear web - our goal is to secure every bit that goes over the web. That's a pretty big hairy audacious goal, but we believe we'll get there.

### Becoming the Base Fabric of the Internet

It's a remarkable shift that's happened over the past couple decades. We saw the emergence of AWS, and you have a lot of the traditional guard - back in the day when people were manually operating their own data centers, staffing teams to run all that. The whole reason they did this was because they had to. They had a lot of resources that they needed to put in a data center, and paying somebody else to do it - maybe you could get a third party agreement with another data center, but there's still an extension of trust.

A lot of those people, when the advent of AWS and the like came along, were saying "this is someone else's computer, this is someone else's machine - cloud is just someone else's machine, why would I trust that?" Amazon spent a lot of time trying to build up that trust, and by consequence they've become quite the behemoth. The grand majority of the internet's traffic is served through cloud providers.

This creates an interesting problem because in several countries like the United States, there is this phenomenon where the federal government, through their various arms, in the event that they want access to something, they can subpoena it or they can do a FISA Court action which is completely secret - you don't know about it - and they can coerce third parties to hand over data, hand over information, hand over raw machines, and you may never be any the wiser.

Because of these revelations by Edward Snowden and a whole bunch of other folks along the way, we've started to realize we're extending a lot of trust - blind trust at that - in these providers. While most people are never going to be subject to some sort of scrutiny for national security (or at least they don't think they will be), the reality is different. A lot of people end up having their data pulled in through these various dragnets.

## Privacy and Censorship Resistance

### Why Privacy Matters

Most people believe that they have nothing to hide because most people are genuinely good and they really don't have anything to hide. But it doesn't matter because metadata can frequently be seen in ways that project a bad light on someone. You could be labeled as a bad actor just by virtue of pinging a cell phone tower at the time there was a protest, or participating in a completely lawful protest.

To fight against this overall state apparatus unfortunately kind of hearkens back to the phrase "to bake an apple pie from scratch, first you must reinvent the universe." Very similarly, to reinvent the internet in a way that is secure, you must actually reinvent the entire internet.

### Censorship by Platforms

Social media companies - you'd think they'd have an interest in preserving the freedom of speech of their users, but in reality it actually ends up being a struggle. A lot of public companies end up facing pressure from shareholders and the general public alike, and that can influence the overall value of the stock for that company to suppress things that the general public may consider harmful.

The problem with just submitting to pure pressure rather than actual legal pressure that is justifiable about what is acceptable discourse is you end up with this condition that you are subject to the tyranny of the masses. What is acceptable discourse today is not necessarily acceptable discourse tomorrow.

What Quilibrium does in order to provide censorship resistance is it gives greater anonymity but also makes it possible so that anybody who's participating in the network, if there is content that they wish to host and ensure that it stays up, they can continue to do so. Identifying them is essentially a very hard thing.

### Infrastructure-Level Censorship

It gets more complicated than advertising pressure. A great example: in the 2020 political era there was a social media empire being built called Parler. Parler ended up getting unplugged by Amazon Web Services. AWS made a claim that there was a credible threat coming from Parler, but later data and studies revealed that the January 6th incident was actually coordinated largely on Facebook. The justifications about why they had deplatformed this particular service was ultimately a political ploy.

Being subject to censorship due to political dynamics is already a very unacceptable position to be in. I may have my own personal beliefs, I may have certain viewpoints that will conflict with people on any of the political spectrum, but I will very much admit that in the United States, freedom of speech is a very powerful force for equalizing points of view in terms of whether or not they can actually be said.

Because companies are going beyond that measure, it's actually a credible threat from every step of the level - it's not just advertisers will pull the plug, it's actually all the way out to even infrastructure providers will pull the plug if you become politically inconvenient and potentially scar their reputation.

## The Lego Box Approach

You can think of the network as a box of Legos. There are certain components that, the way they can be mixed and matched, matter in important ways for certain types of applications.

We have an approach for providing group-level privacy and communications - not everything needs that. Sometimes it's just direct peer-to-peer communications and you don't need that particular component. Sometimes you need not long-term data storage but ephemeral data storage. For example, a streaming video conversation may wish to be recorded, but that doesn't necessarily mean that every single video call would desire to be recorded. The ephemerality of streaming data is one Lego piece that might not matter to every application.

We try to have as big of a Lego box as possible with enough strong opinions baked into those Lego pieces so that when they are composed, they're composed in a way that doesn't violate any sort of principles of the network - that people remain private, that people remain censorship resistant in whatever ways those are being composed.

## Philosophy: Privacy-Forward Design

Quilibrium's privacy-forward approach hearkens back to the original ethos around Bitcoin - the idea of cypherpunks coming together to say "we want uncensorable money, we want money that we're free to transact with anyone" and giving a strong layer of privacy around it.

There was this belief for a while in the early Bitcoin scene that Bitcoin was private, but the reality is that it is a public ledger. Those events are publicly traceable, and given enough metadata you can correlate those actions to identities. It's not as private as people thought it was.

That was a mistake on Satoshi's part because Satoshi had very specifically said that in order to retain this privacy level, you need to use the addresses in a disposable way - you just constantly cycle new addresses. People just didn't do that because the path of least resistance matters. If you make it easy to do things the right way to preserve privacy, then people will do it. It's just that Bitcoin did not make that easy.

By consequence, enough people started doing single address reuse, and ultimately it leads to the condition where there's this aspect called K-anonymity - hiding in large sets. Because enough people were actually just willingly identifying themselves by reusing addresses, the people who weren't are now easily identified.

## Why Quilibrium Is Not a Blockchain

I've been a massive observer giving hot takes in the industry to the general public for quite a while. I was building most of this all in private for many years - Quilibrium has been a seven-year mission at this point.

During that time, there was an observation I was making: the notion of a blockchain, true to the original definition - even Satoshi in the white paper didn't say "blockchain" as one word, they specifically just referred to the structure as "block space chain" and it was just an observational term, not an actual formal definition. Satoshi actually tried to argue "timechain" and that never took off.

### The Evolution Away from Blockchain Structure

A lot of chains don't even do the original Bitcoin structure anymore. A lot of chains do things like proof of stake, delegated proof of stake, or some other kind of thing. Solana has proof of history and proof of stake - but proof of history is actually just a hash chain that tries to provide decentralized sequencing of events, but nevertheless it's still singular leader election.

One thing I noticed about the evolution of all these various self-ascribed blockchains is that a lot of them are now starting to do things like having L2s or even L3s. Structurally, when we talk about blockchain as it is kind of formally understood to be, it is just a block with a bunch of transactions pointing to the previous block and it just continues on for a chain ad infinitum.

That structure specifically has been basically violated in every single stretch of measurement you can conceive of. With Ethereum, for example, you have two different sections of data that you're maintaining under the blocks - there's actually technically two blocks: the execution blocks in the execution layer, then the consensus layer for proof of stake under the Beacon chain. That has its own kind of sequencing as well. So you already have two parallel tracks - that is no longer a blockchain.

With the advent of using calldata and later KZG proofs as committed data stores for L2s, you now actually have a tree of blockchains that are fanning out potentially infinitely. Realistically no, because obviously there's gas limits and a number of blobs that you can have per block, but essentially you have this forest of blocks rather than a true blockchain.

### Quilibrium's Data Frame Structure

When I say that Quilibrium is not a blockchain, it's because in my opinion it isn't. But at the same time, you can look at the core data structure for how everything reaches consensus in coordination across the network, and that actually is a series of data frames that are linking historically backwards to one another.

The way that's produced - it's not proof of work, it's proof of meaningful work. It uses verifiable delay functions instead of hashes. The data frames themselves do not actually contain the overall contents of data of the network like a transaction-based history ledger would. That's why I say Quilibrium isn't a blockchain - you could think of it in that same way, but structurally it looks nothing like the original blockchain.

## Weak Subjectivity and Proof of Stake Problems

Weak subjectivity was an element of discourse for a little bit where it was popular to talk about and then everybody forgot about it. It's this notion that the nature of the network maintaining consensus is essentially two different contracts - not in the smart contract context, but an informal contract in society.

At the protocol layer you have consensus through proof of stake, but there is the possibility that either a consensus layer fault can develop or an execution layer fault can develop. They've been trying really hard to encourage people to adopt alternative execution clients and alternative consensus clients so that Geth and Prysm weren't the two big leaders of the network - so that there was some level of security against any sort of consensus faults that could cause very bad rippling effects that slash significant portions of the network.

### Liquid Staking Risks

We're starting to reach certain pressure points where this is a valid concern. Many people are now adopting liquid staking tokens, which means that they're delegating their expectation that you're not going to get slashed to that liquid staking token provider. There is a dangerous consequence of that - if you accumulate enough of the economic value in that and they do get slashed due to a protocol bug (because we'll assume that they'll be honest), then now you have completely screwed everything up.

### Social Layer Interventions

The very big incident that people probably don't even remember anymore was the DAO hack, and there were conversations that came out during the FTX lawsuit and a few times before where it was revealed that Vitalik was actually in a chat with several exchanges saying "stop trading."

There was very clear evidence even in the proof of work era of Ethereum that there's a higher level force at play here - it's not just the protocol, there's also thought leaders that have enough sway that they can actually make those kinds of judgment calls.

My take about subjectivity is that all of these things are problematic - to have any sort of social layer of trust on a protocol is intrinsically broken. The only way you can have a truly decentralized system that can preserve against any sort of societal pressure is it has to be strictly subject to the rules of the protocol. If you ever violate that in its finalized production state, that is not a decentralized protocol.

Spicy take - I'm sure a lot of ETH maxis would be very upset with that point of view, but that is a reality. If there are people who can make a judgment call and that changes the state of the network, even if it's a decent number of people in some sort of foundation or community, that's still not enough. You need to actually have some formally bound protocol rule for making those kinds of changes, making those kinds of forks if need be.

## Quilibrium's Technical Architecture

The structure of the network is basically taking the lessons learned from networks like Ethereum that have already gone through heavy utilization pain points, and also that layering Shard basis that has emerged.

Ethereum has some strong lessons learned. Solana has some strong lessons learned. Ultimately by consequence we've been able to take those lessons learned and evolve past what those protocols are kind of stuck in in terms of technical debt.

### Shards (Distributed Systems Context)

One of those things is the emergence of using shards on the network - not shards in the NPC context (I've found that has somehow created a new layer of confusion), but shards in the distributed systems context.

Ethereum has kind of dropped sharding from its roadmap. They have said that L2s are good enough, and that might be true for Ethereum's case, but there is this interesting economic reality: these L2s all have to compete for the same block space instead of a block space that is designed to comprehensively scale out to the number of L2s that are sufficient to fulfill the network's obligations.

### L2 Technical Debt

Why that's kind of a problem for Ethereum is that they've structurally taken this idea of "let's just recursively run Ethereum through the layers." Even the L2s are running essentially some fork of Geth for the most part. They are processing ETH transactions in the same way - either they are using their own proof of stake method, or in the case of Optimism it's just essentially proof of authority for now with some optimistic rollup that lands on the network.

There's this notion that they're delegating authority to individual organizations to in their own meaningful way try to scale out the network. But it is essentially the same EVM just at different layers in the network, and so you have to spend all of that same compute, spend all of those same resources for all of the same drawbacks and failings that have accumulated over time.

The EVM was originally a 19-year-old college student's idea that spiraled out of control into what it is today, and by consequence there's a lot of technical debt. They've adopted all that technical debt - so you end up with this condition where you're seeing a lot of the same problems that core ETH has, but all the way down into L2s on top of there being economic competition between L2s getting settlement.

### Blob Space Limitations

Right now there's only six maximum blobs per block for the KZG proofs, and for a brief period of time we actually saw that hit serious contention because we had blob inscriptions happen - there were people actively fighting for that blob inscription space against the people who were running L2s.

The fact that there is a permissionless dynamic where there's a separate fee market associated with blobs makes sense when compared against calldata, but it makes no sense when you're trying to scale out the network to a large number of L2s. Right now things are working, but as more and more L2s move to blobs, as more and more L2s exist, we start to hit those intrinsic scaling issues.

## Quilibrium's Scaling Approach

From Quilibrium's perspective, we have essentially 256 individual slots at the master level of the network - the thing that everyone must agree upon. That's roughly 19 kilobytes of data that everyone has to keep synced every 10 seconds.

There's lots of blockchain-oriented protocols that are pushing way more data than that, that are pushing block times as fast or faster than that - that's a reasonable amount of data to keep in check.

But what's unique about that is that unlike how Ethereum does it, where they have 4096 elements for a single blob, we have those 256 elements and we use that to collectively roll all of the proofs for all of the shards of the network up into it.

### Practically Infinite Shard Space

The nature in which we do this compressive rolling of proofs actually creates a shard space that is almost - it's not truly infinite, but for all intents and purposes of mankind, for the nearest millions of years, we will never encounter the end of that shard space.

It's very similar to IPv6 where there's more practical addresses available than there are actual atoms in the universe. Very similarly for Quilibrium, there's more shards possible than there are atoms in the universe. That gives us the capability of being able to scale out for that practical purpose infinitely.

Ethereum could have done the same thing if they had just used the blobs differently. They could have had 4096 and they could have had a different compression proof approach. But at the end of the day, it's the same box of tools - the way that we're using it is against the lessons learned from what they did wrong.

### Universal Consensus vs Universal Coordination

The network technically does have universal consensus to a certain degree - there's levels of replication lag that will exist between shards to some meaningful degree. The more relationships you have embedded across those, that's unavoidable - that's just a consequence of distributed networks.

As far as universal coordination goes, the network is constantly staying on the same heartbeat - that same 10-second interval for what is called the Master Clock.

There's essentially two different layers in which the network coordinates:
1. At the global level where everyone's keeping and maintaining that 256-element blob for global consensus and global coordination
2. Within the actual individual shards, where consensus is also being maintained

## Verifiable Delay Functions (VDFs)

A verifiable delay function was formally introduced - people have had various ideas about how do you cryptographically verify time since the late 70s, but more recently introduced by Dan Boneh and a few others to formalize what it means to be a verifiable delay function.

### Key Attributes

It comes down to essentially two really important attributes:

**First attribute:** It is guaranteed to be not parallelizable - you cannot run any of these operations in parallel, they're inherently sequential. You can see a predecessor to this in Solana with their proof of history - they use what they call a hash chain. It's literally just take a hash of a value, then take a hash of that, and so on. You can verify that in parallel much more easily because you have all the values up front, but you cannot actually produce that value initially in parallel.

**Second attribute:** Verifiable delay functions are succinctly verifiable, in contrast to Solana's implementation which requires all those thousands and thousands of hashes to be communicated in order to prove that the chain of hashes actually equates to that final value. There's no way to readily compress that - you need something efficiently verifiable and very succinct.

### How VDFs Work

Let's say we have our integers and you take a number, like the number two, and you square it. You get four. You square it, you get 16. You just keep repeatedly squaring that number ad infinitum - you do that T number of times.

If your number system does not let you rapidly just decide 2 to the power of 2 to the power of T and calculate that very quickly, then now you have something that is very easy to guarantee cannot be parallelized. On top of it, you also guarantee that from this number system you get some sort of succinctness.

Most VDFs are actually doing repeated squaring - it's complicated math in terms of the special kinds of numbers that they're working in, but the actual underlying math of what you're trying to verify is just repeatedly squaring a number.

### Time Verification on the Network

A VDF essentially takes just a few specific parameters - the most important one that most people can understand is some value to represent time. What that actually means is iterations. You're saying let's say this takes 10,000 iterations, and for most hardware that's roughly about 10 seconds.

Now you have a way to say: insert this random value, this challenge value, and then square it for 10 seconds worth of time. You give me back a value - maybe that value is some combination of an output value and a proof, or maybe it's just a proof. You give it to me and I'm able to plug it back into the verification step and confirm that yes, this is valid for that number of iterations. I now know that you have held on to this data for 10 seconds.

### Hardware Speed Calibration

The time is iterations, not human time. The network performs certain behaviors based on the parameters of the hardware. Over time, similar to how Bitcoin has recalibration of difficulty from the number of hashes being produced, Quilibrium has the same kind of notion - except instead of just simply saying "fastest hardware wins," we just take a rough average of what the current iteration steps to produce 10 seconds of VDF is and just cut it to the middle.

If you are a machine that is capable of producing these faster - great, but it won't do you any good. There's no sort of insertion of proof basis onto anything deeper that comes from just being able to produce this - it's just a sequencing mechanism. Until the median machine in the network has achieved, there's nothing you can do more.

### VDF as a Lamport Clock

A Lamport clock is a computer science concept originally designed by Leslie Lamport - the idea of how do you sequence events in globally distributed systems. You have basically a kind of timer counter that follows along with events being emitted in the system - some sort of sequencing basis.

In a traditional distributed data center version of a Lamport clock, there is an element of trust - essentially all actors of the system have to be honest in order for this to not go completely sideways.

The use of a VDF provides that same kind of Lamport clock-esque sequencing, but it's cryptographically verifiable instead. We don't have to actually trust that people are giving us the right time - we actually can just use the time generated from this clock.

### Randomness Beacon

The master clock provides two things:
1. A clock - a Lamport clock in the sense that you have events that follow these events and you have some degree of timestamping that you can essentially guarantee
2. A randomness beacon - because these numbers are inherently random, you can select leaders for different shards based on that pulse that comes out of the clock

## Proof of Meaningful Work

Proof of meaningful work is basically two things that are very important:
1. We want to prove that data is being held on to
2. We want to prove that that data was computed accurately

### Execution Proofs

The way the network operates for calculating anything on the network is either in an online MPC context or in an offline ZK context. That offline ZK context is actually just using that same MPC with a technique called "MPC in the head."

MPC in the head is basically treating - as a prover - imagining all these MPC participants and simulating them all, then taking the execution trace of what all of those are doing. That output value is your proof.

You're able to do things that you would normally use MPC on the network for, but if you need to be offline - say you're like Coinbase and you have cold custody and you have a Faraday tent that you're doing all your operations in - you can't just connect to the network live and perform your transactions. Instead you create this offline proof, it follows the same rules as the actual online network, you submit your proof, you've made your transaction.

### Data Storage Proofs

The data itself is proved through the VDF. You have this random pulse clock for the network issuing a heartbeat, and you are a prover holding some set of data. You want to prove that you've held on to that data for as long as it's existed.

Every heartbeat you emit that proof by taking a random selection using the randomness beacon to roll through that data set to create a KZG proof. That KZG output proof value is very succinct - it's only 74 bytes.

You take that 74 bytes and put that through your VDF step, and you just keep doing that over and over again. You emit those 74-byte values with the VDF proof on those intervals - and that is your proof that you've held on to that data for a period of time.

There's no way to cheat it because you have to emit new proofs that are constantly valid against new challenges on the data - so it proves you have to have the data, or else you couldn't generate the proof.

That's it - proofs of execution, proofs of data combined - that's proof of meaningful work.

## Bloom Filters

Bloom filters originally had two purposes. The first was how messages distribute across the network - this gives you a guaranteed level of shards that are reaching this data on the network and being able to replicate it.

The other aspect is that it provides a random distribution of who could possibly receive it - this creates better dissemination of data on the network to guarantee replication isn't being constrained to a specific set of data centers, because that creates an inherent risk the data may disappear.

Bloom filters are really effective tools for probabilistically guaranteeing that a subset of individual nodes have that data. Currently they're used specifically at the messaging and distribution level of where data goes for shards.

## Verifiable Computation and Malicious Security

In the online context, our MPC model is maliciously secure. There's lots of different MPC models out there - a lot of people operate under the semi-honest model where there's some number of trusted executors. For example, with an MPC wallet, the trust basis is very frequently just "one of N" - as long as one person's honest then everything's okay.

Semi-honest works in a lot of cases, but in Quilibrium we actually do need malicious security.

### Semi-Honest vs Malicious Security

In a semi-honest model, when you have a verifiable computation interaction but the data needs to remain private - if someone cheats, they either learn that entire piece of data or they learn some bits about the data, and with enough attacks can reveal that data.

In the malicious security model, you don't get that advantage. If the execution fails, it just fails to execute and there's no additional information that can be gleaned.

What that gives us is something really powerful - not only do we get security in the MPC online context that is just as sufficiently secure as anything else, we also get the advantage that we can now identify who is doing malicious behavior.

You can prove whether somebody was offline for a period of time when they were supposed to be online, or you can prove that somebody was trying to screw around with compute in a way that was trying to reveal data. That's a very powerful primitive because now you can have a very easy way to, at the protocol level, "Survivor style" vote them off the island.

## Fully Homomorphic Encryption

We don't use fully homomorphic encryption. Fully homomorphic encryption is a specialized version of homomorphic encryption that enables all types of operations on data in an encrypted context.

For example, you have a public key for ECDSA, you have a private key that corresponds to that public key. Public keys are literally just points on that elliptic curve, and you can add points together. There is an entire additive system for adding points together. When you are generating a public key, you're taking a public point that everyone knows (called the generator) and using your private key as a scalar value to multiply on that point. Those operations on public points that allow you to do additive points together despite not knowing the private values - that is a form of homomorphic encryption called additive homomorphism.

Fully homomorphic encryption lets you do any data operation on encrypted data. We do not use that because all of the current fully homomorphic cryptosystems that exist are slow - unusably slow. They literally cannot perform the scale that a network needs in order to sufficiently provide real value-added services. At best you might have really tiny subsets that work efficiently enough for certain use cases like private voting, but there's also approaches that can maintain the same privacy without having to do fully homomorphic encryption.

We just use MPC.

## Mixnet Architecture

A mixnet is a technique for providing privacy at the analytic level.

### Problems with Onion Routing

When you have, for example, Tor - Tor is an onion routing-based network. The problem with onion routing is that it relies on privacy through envelope encryption.

If I have a route to send a message to you through hop A, hop B, hop C - I will encrypt my message to you, then encrypt that entire message to hop C, then that entire message to hop B, then hop A. Then I send that message to hop A - all they see is that it goes to B, all B sees is that it goes to C, and then all C sees is it goes to you.

The problem is that creates a degree of trust. You have to have a sufficient number of nodes behaving honestly on the network in order to actually provide you privacy. Otherwise, if some government agency like the US government on Tor operates the majority of all the hops in the network, then they can actually just immediately see that I sent a message to you - they were able to trace that entire route.

### Random Permutation Matrix

What a mixnet provides is a greater degree of privacy on the network to resolve the K-anonymity problem.

The way we provide message routing in the network is that every node is participating in an MPC-oriented protocol where they are creating secret sharings of a permutation matrix.

A permutation matrix is essentially a matrix (collection of numbers in a grid) that is all zeros except ones that are uniquely placed in each row and column. If I have a one in the top-left of the matrix, there is nothing on that row or on that column that will be a one - the rest are zeros.

If you treat your input series of messages as a vector that can be multiplied against that matrix, you end up with an output value that uses those ones and zeros to essentially scramble the order of the messages.

If I was just doing this myself, I could lie - I could just put a straight diagonal of ones and the message list is preserved. But if the rest of the network also participates and creates secret sharings of a random permutation matrix of its own, when you recombine it you end up with the multiplication of all those permutation matrices against each other - a truly random permutation matrix.

But again, that means that all of the nodes on the network have to behave honestly, or at least one does. Where things get interesting is that in order to send a message on the network, you have to participate in that too.

If at least one sender of a message is being honest about their contribution to the random permutation matrix, then no one learns anything - the actual sort order of the messages is completely unknown and unlinkable to you. And the nice thing is that if everyone's dishonest, then no one learns anything anyway.

So that gives you a true mixnet over this onion routing-style network that gives you the full degree of IP-level privacy - nobody watching the network can see anything going on, and anybody who's actively trying to passively observe the network or even maliciously attack the network cannot see where your particular requests are being routed to.

## Hypergraph Data Structure

Hypergraph - this is one of the funniest things because I've been a big advocate for language that makes it easier to understand what's going on, and I mistakenly thought that hypergraph was going to be an easy term. By consequence there's all these memes like somebody with the "guy holding a butterfly saying 'is this a pigeon'" except instead it's a hieroglyphic and the text says "is this an oblivious hypergraph."

A hypergraph is literally just a graph where an edge can connect more than two vertices. That's it.

If you have a graph (most people know what a graph looks like - it's just points and edges that connect the points), if your edge can connect more than two, it's a hypergraph.

### Representing Multiple Data Types

Hypergraphs are a powerful mathematical construct because hypergraphs can actually represent a large number of different types of data sets.

There is a thing that almost every single computer science student learns in college - that you can represent a graph using a key-value store. You can easily represent the relationships of a graph just using keys and values. But that actually works the other way around too - you can use a graph to represent those keys and values.

For hypergraphs, you get that same thing - you're able to do that same relationship, but there's also many other relationships that you can represent in hypergraphs. Things like a relational database - a traditional SQL database - you can represent that as a hypergraph. If you want to do any sort of wide column-level storage, you can represent that on the hypergraph as well.

It's just an efficient data store that, because of the nature of how that data store is produced, you can leverage other techniques to give it the same kind of privacy that other oblivious data store types can also provide. It's a best of both worlds efficiency to serve many different purposes and do so privately.

## How the Components Come Together

One of the things we're actually publishing in the next couple days is a builder guide, because this has been one of the tragic ironies - I've told people over and over again that in order to build on the network you just write Go, and that has not been easy for people to grasp because they haven't grasped that it literally is that simple.

You literally just deploy Go code to the network and it turns into garbled circuits so that it can execute on the network. You don't have to think about any of that.

### For Developers

You treat the network like a big box of data that you can:
- Store code on
- Store objects on through very simple get and set
- Execute an application by loading that application and evaluating it in that MPC context

That is all completely opaque to the end user - they just add data, they remove data, they change data, or they execute data.

It's the same way that you think you operate when you use your laptop - you open up a terminal and you type in a command on bash. What is actually happening behind the scenes is it's loading that section of data into memory, then executing that section of data following whatever the execution context and ABI of your particular machine is. It's the same concept - it's just applied to a distributed network.

### For End Users

From the user's perspective, it's very simple. When you use Ethereum and you open up your wallet and connect to a dApp, you are presented with a whole bunch of transactions to sign.

In Quilibrium you're basically doing the same thing except:
- Instead of having to deal with a wallet application, you use PassKeys
- Instead of having to even think about a series of iterative executions as different transactions, they are stacked up for you and presented as a function call

It's much simpler in terms of the end-user experience. If you're building against it, you just write Go. If you are just dealing with the raw data store, you can use the oblivious hypergraph calls or you can just literally set and load.

## PassKeys Authentication

PassKeys are available in every operating system and every browser.

### How It Works

Application developers wanting to integrate Quilibrium with whatever their web application is - in the current state (long-term we're actually wanting to do TLS bridging so the applications will live in their entirety including the web server serving up HTTPS will live on the network) - but until then you would have an RPC bridge that that particular website would be embedding as part of the Quilibrium SDK.

For the end-user experience, they'd be prompted to use their PassKey for authentication. That authentication provides whatever authorized resources are allocated to that particular PassKey.

### Domain Isolation

PassKeys work on a per-domain basis - they're unique keys that are unique to the domains. There is no way to correlate one key on one domain with a key on a different domain unless you actually manually correlate the two.

That means if you were using two applications that were on Quilibrium, you would have different keys, different PassKeys. They're partitioned by your browser.

The nice thing about that is unlike a wallet where you have to manually do a lot of key operations yourself, because you're constantly being presented with transactions and then you also have to apply scrutiny to those transactions because you don't know if that transaction is real or if it's going to drain everything - with PassKeys they're limited to the domain in which they're operating within.

If I'm using a Discord clone, the worst case scenario I'm aware of is that I could potentially lose access to my account on this Discord clone, but I would not lose my funds.

### Cross-Application Identity

For cross-application identity, there's a multi-legged authentication called OpenID Connect. When you go to a site like Figma or whatever and you choose to log in, it presents you with a bunch of login options. You choose Google, it takes you to Google, you authenticate through Google to prove you are who you say you are, and then you also do the consent step where you are allowing Google to provide an authentication token back to Figma so that Figma can prove that you are who you say you are.

That same type of OpenID Connect-style authentication step is exactly what people will use in the Quilibrium design model. It makes it so much easier to just do things the way things have always been done because there's so much tooling that already integrates with things like JSON web tokens, there's so much tooling that already integrates with PassKeys.

If you just simply conform to those standards instead of trying to invent your own one like "Sign in with Ethereum" does, then you actually end up with a very composable natural fit for a decentralized network to integrate with things the way they currently are.

## Running a Node

If you want to participate in the network, you literally just clone the repository. You can either choose to run straight from source if you're a person that really wants to verify that the application is doing what it's doing.

Our node software is licensed AGPL, so if you want to fork it, if you want to modify it, if you want to try to PineApple the network (which there are definitely people trying), then by all means please do. The license lets you do whatever you'd like as long as you contribute code back.

### Current State

When you run a node, you're just participating in the base layer protocol. For now, while we're gearing up to get to the finalized 2.0 release, that means you are running the core Master Clock intrinsic. It means that at one point you're behaving in accordance to the MPC protocol that was basically just perf-testing the crap out of how fast we could actually evaluate MPC on the network and whether we'd hit any hiccups - and boy did we.

Through this stage, we're just testing a lot of different components and making sure that they behave according to spec, according to performance, and then of course people get rewarded for that.

### 2.0 Components

As we get towards 2.0, that includes all the other components in the network coming online:
- The hypergraph itself coming online
- The mixnet coming online
- The onion routing coming online

All those things have to be rolled out in stages so that we can actually vet that the protocol is behaving like it's supposed to, especially in the adverse conditions.

There's that famous phrase: "Show me the incentive and I'll show you the outcome." Well, by consequence, since this was an incentivized series of steps despite the network not being fully live yet, we have of course been Sybil attacked like crazy. We've had people trying all sorts of different ways to take the network down, we've been DoS'ed, we've been everything.

We've had to learn from that, we've had to adapt and find where things are going wrong and if any adjustments need to be made, make those adjustments.

## ScyllaDB Inspiration

When you're familiar with it, ScyllaDB is a reimplementation of the Apache Cassandra database (no relation) - it's based in C++ instead of Apache Cassandra which is built in Java. They have full compatibility with the CQL query language for Apache Cassandra but it's structured differently.

In the traditional CQL world, you have this idea of sharding that is based on varying configuration levels of consensus. ScyllaDB takes a much different route - they're much more pragmatic. In fact, ScyllaDB actually started off as a reinvention of an operating system and then they pivoted into building a database.

### Shared Nothing Approach

The way that they designed it all is this kind of shared-nothing approach. In traditional databases when you're sharding them out, you might actually have two different node instances that are contributing to the database's processing using the same underlying network-attached storage.

ScyllaDB takes the approach that the data is fully not shared. You might have replications of that data across different nodes, but the nodes are individually maintaining their own share of that data - there is no sharing of resources in that context.

Quilibrium does the same thing. The Bloom filter basis is something that adequately separates data out on the network so that it is covered for replication and also fully deduped out so that individual core shards - the individual nodes that are maintaining those core shards of the network - are fully segregating that data out.

They're effectively forced to, cryptographically, in order to provide that proof of meaningful work. You have to actually have a unique key that corresponds to that data such that you provide a unique proof. So you can't just say "I'm covering all three of these shards because I have the same data here" - you actually have to prove that you are in fact, if you are covering three shards that all have the same data, that you are encrypting them out into each of those three shards' expected key formats.

## QUIL Token Economics

The approach that we're taking is actually more of a free market. Ethereum has this notion of gas - gas fees according to the various opcodes that are being executed and according to the gas limit for a given block on the network. That works under a blockchain-oriented system.

But we scale out - we don't have to worry about individual nodes competing with one another for execution precedence. If they are the leader for that particular shard, they're the ones who are executing at that time.

### Dynamic Pricing

What that creates is a different kind of marketplace dynamic. If you have an open system where people are contributing more and more compute horsepower to the network, then you don't actually want to consolidate things into a singular gas market - that makes no sense.

Instead you end up with this dynamic where all the individual core shards are effectively competing to outbid each other for what the actual execution prices are. We expect for a very long time in this network that that price is actually going to be zero - kind of similar to how the gas fees for blob storage has been as close to zero as possible until the blob inscriptions thing happened, and that eventually petered out so now it's back to almost zero again.

### Token Issuance

The biggest source of why people would be incentivized to use the network is that there are a limited number of tokens per proof of meaningful work's actual tokenomics algorithm. The earlier you are to the network, the more tokens that you'll earn for that duration.

From that duration of tokens that you've earned, eventually it caps out around roughly two billion QUIL tokens. By consequence, the earlier you are, the more tokens you get.

It doesn't matter if you're not charging execution fees because you're actually just competing to earn tokens. Once that actually does peter out over time from the decay value, then you do end up with an actual marketplace where people are trying to outbid each other on execution fees.

### Proof-Based Minting

The nature of how rewards work on the network is different than what a lot of other networks do.

- Ethereum: when you produce a block, you are setting a reward value for that particular block producer
- Bitcoin: when you are producing a block, you set the coinbase transaction to the miner or the mining pool

On Quilibrium, instead of actually having an economic discrete unit that you are writing into the network as a protocol-native object, you are collectively producing proofs over that data (that proof of meaningful work proof).

From those proofs, you are able to interact with the QUIL token application that lives on the network as an application like any other application on the network. With that you have a mint function that you can provide that proof to, and it will mint out the tokens relative to the number of proofs that you provide for the data that's being proven over.

You have two different varieties of experiences:
1. As a node, have your node continually ping that mint function and continue to accumulate tokens exactly as you're producing the proofs
2. If you want to be more efficient, you can do it in batches

## Q Console

Q Console has been a very difficult thing to get out there. Basically there's an AWS console-style equivalent that we're wanting to launch. We've had many hang-ups along the way getting it out there because Quilibrium Inc is me, and trying to balance my time (because I also work part-time for Farcaster), trying to balance my time with actual releases of the network protocol, bug hunting and support and triage for the protocol, and then also trying to get Q Console fully available and out there - it's a challenge.

Q Console is basically like AWS Console but for Q resources. We have some integrations that make it really nice for things like Farcaster - for example, the Doom frame is actually a Q Console application, it's just kind of a CLI one at the moment because we need to get more things made more user-friendly.

## Quilibrium and Farcaster

Working at Farcaster part-time, there are times that I've had some hard lessons learned from Q. Because we had that incentives model, we hit a lot of those growing pains way faster.

People running hubs are generally doing so because they have some sort of value that they get out of the data of Farcaster hubs, but they're not getting any sort of economic value out of it unless you're Neynar running it as a service.

From the Q experience, we had hundreds of thousands of nodes immediately clanging on the network, whereas with hubs there's like a thousand - that's a much smaller quantity, easier to reason about. Whenever there's any sort of consensus faults, that's easier to figure out. When you're running hundreds of thousands of nodes and everyone is trying to submit proofs at the same time for this 10-second interval, you definitely find some bugs.

### Protocol Differences

Comparably the protocols are totally different. We do use the same kind of libp2p stack that everyone is basically using these days because it handles a lot of the headaches for you (although it does also bring some of its own headaches).

Outside of that, the big thing that Farcaster does that is interesting in how it could interact with Quilibrium comes down to frames. Because you have a decentralized authority that is tracking signatures and validating those signatures, you have a framework for validating those signatures that can be encoded also into Quilibrium in a way that you can do things like Farcaster frame support (like we do with Q Console).

### Future Integration

Right now Farcaster has a certain amount of data that it has to hold relative to the number of users, the number of storage slots that they purchased. That has a limit - anytime you add a new data type you are basically telling the hub operators "hey you now have to encode X number of extra bytes possibly per user" and that can get expensive.

With Quilibrium, the network itself is actually a distributed data store with a different economic model. I foresee a future where there is a lot of interaction between the two so that there are things that are very large data-consuming - like for right now if you post a picture to Farcaster, you're not posting a picture to Farcaster, you're posting a link, and that link has to live somewhere.

The various Farcaster apps out there have their own services that they're plugging into - whether it's Cloudflare, Imgur, or something in-house. Whereas with Quilibrium you can just use the data store of Quilibrium.

One of the long-term goals that we want to do is make it so easy to run anything on the network that you can just run full virtual machines on the network as well - which means that at that point you could run a hub on Q.

## Quilibrium Inc Products

From a business perspective, obviously Quilibrium is a protocol, but Quilibrium Inc is a company. We're not going into this with the expectation of just making a public good and that's it - obviously as a company our goal is to also make money.

What Quilibrium Inc is trying to do with the network is essentially use the technology of the network to deploy platform-oriented services that can either leverage the network in a way that is cost efficient or leverage the network in a way that provides additional privacy or security.

### Q Storage (S3 Compatible API)

The first product is basically following in Amazon's footsteps - the very first thing that Amazon provided was S3. Having an S3 compatible API is easy because the network is simply put and get - you store things on the network, you retrieve things on the network.

To generate an S3-style service where the data remains actually private to the end user that's storing the data - that's already a powerful primitive enough. That is something that Amazon can't even guarantee themselves.

They have this weird combination where you can use KMS to store data, but at the end of the day they also control the keys for KMS. So in order for you to actually have any sort of raw security of the data that you put on S3, you have to encrypt it yourself. Instead, you don't have to really worry about that because it's very seamless to you through the request model of Q.

That's already a value proposition that we provide that is intrinsically more helpful than what AWS currently does, but it's also something that we can compete on price around.

### Q KMS (Key Management Service)

The other tooling that we want to launch with 2.0 is essentially a KMS compatible API.

Amazon's Key Management Service is essentially trust-based - you're trusting that Amazon's employment of their various hardware security modules is actually secure, that they aren't engaging in any agreements with state actors to provide that data to them.

With Quilibrium, everything operates in an MPC context and so you actually get some immediate value-adds from it that you can't get from the trusted model.

#### MPC Wallets Done Right

A great example is for wallet-as-a-service oriented providers. A lot of them claim they're MPC wallets, but in reality they're not - or at least they're not really multiparty computation, they're multi-party key splitting.

In order to operate, they actually spin up a Nitro Enclave or another trusted execution environment, then have the user as part of their SDK submit the encrypted key shard to that trusted execution environment where it is decrypted, combined with the other key shard that the provider holds, and then they perform signing using the recombined key. They flush that from memory and then allegedly the key material was never recombined.

Unfortunately for a lot of those providers, they're wrong. Regulators don't see it that way - there are sophisticated regulators in the industry now, including the NYDFS. I would know because I was one of the people who built an MPC wallet at Coinbase.

They definitely understood what it meant to be custodial. If you do recombine the key material at any point, you are in possession of the key material regardless of whether or not you're flushing the memory of the system. That makes you a custodian - the NYDFS is very strict about that, and there are certain compliance obligations that you have to fulfill.

What Quilibrium offers as a huge value-add for our KMS service is that it basically enables you to de-risk yourself. Instead of using a trusted execution environment, you can actually be using Quilibrium as kind of like a Switzerland for data.

You have your user of your SDK sending the key shard to Quilibrium, you have the internal key share that you've held and send that to Quilibrium. Through the use of an MPC-oriented application - because you just write Go - you can actually encode an ECDSA signer literally in the simplest Go case where you have two inputs for your application, you recombine however you need to recombine it and then you perform the ECDSA sign operation using that recombined private key.

Codewise that's very simple - even somebody who has no familiarity with MPC can at least recognize that is very easy, that is very straightforward. I just recombine those values and sign.

The nice thing is that when this actually goes through the circuit garbler of Quilibrium, this gives you the actual MPC execution of all of that code without having to actually understand how to turn it into an MPC-oriented application.

Our KMS service just takes that one step higher with a simple SDK where you just have the user integrate one half of the SDK, you integrate one half of the SDK, and you send those shards in to perform that sign operation. Even the simple part is made even simpler for developers.

### Encrypted Communications

One of the very first inventions that came about from building a decentralized Discord clone was designing triple ratchet, which is a group-wise encryption protocol.

What that provides as part of our collection of Lego block elements is that you actually do have that primitive for easy communication over the network. You can either use it in an ephemeral context (sending data over the network to a bunch of peers that can identify themselves by their rendezvous points, kind of like Tor hidden services), or you can actually use the network itself as an asynchronous broker of that data.

If you are, for example, writing a Signal equivalent, you treat Q as the Signal server and you provide that message inbox/outbox approach through applications that you deploy to the network. Then everyone running this Signal equivalent application on their phones or computers or whatever can connect just like they would be connecting to Signal's APIs to retrieve their particular inbox's set of data, and then perform all the decryption locally in the application.

## Data Replication and Durability

I don't know if you're familiar with the approach that Ethereum was going to use for their sharding - they were basically going to do a complete 100% data re-replication through the network.

In the world of RAID (hard drive RAID), there is this thing called striping, and the striping uses what's called parity bits in order to reconstruct data - basically just extra bits that mathematically relate to the data that you're storing such that you're able to reconstruct it.

They created a construction that uses a 50% ratio - essentially half the data is how much you're actually storing, the other half is all parity bits. That's 200% blowup of the actual data - that's quite expensive. But it's nice though because it guarantees that at the very least the data is going to be sufficiently replicated through the way they shard data through the network (or at least planned to).

### Quilibrium's Approach

What Quilibrium does is something very similar except we take the actual raw RAID-6 approach with striping over that Bloom filter basis of the network.

Because - as I described earlier - there is this notion that if you have the data and you want to prove it for each shard, you immediately have an intrinsic benefit to do so (to just claim all three of those shards that they can land on) and then try to produce a proof for it. That doesn't work though because you actually have to end up replicating that data in a specific way based on which shard it lands on, so that you're guaranteeing that you are in fact actually replicating that data out three times over.

From an economic incentives value for the network, it actually is much cheaper (incentives-wise) to actually just evenly distribute it out. That gives us the ability to shard data out in a very simple way that encourages replication.

### Replication Depth

The shards are supported by multiple nodes such that if an individual node were to drop, the shard's integrity is retained - and even those nodes that dropout would be replaced by new nodes coming online.

It's actually a replication rate that is quite extensive. It's not just the three individual Bloom filter subsections that lead to that reconstruction - it's also within those individual subsections there's many, many provers for that subsection of data.

There's roughly anywhere between 128+ nodes that are all collectively reassembling that data at any time. So there is a significant bar that has to be met for data to be considered replicated throughout the network.

## Self-Indexing Data

One of the things that I considered a lesson learned from Ethereum - and this is something that others in the space have brought up, like Moxie when he was talking about trying to understand web3 for what it really is - he pointed out very acutely that if the goal is decentralization, there are a lot of centralizing factors of the network.

The reason why Ethereum, for example, has resulted in indexers like Infura or even entire protocols that relate to specific indexing use cases like The Graph - the reason why these have all emerged is because:

1. The construction of Ethereum prices reading in entirely the wrong way - either you run a node or you are reading directly from the network as part of a contract call and paying a lot of gas for it
2. Even the indexing of data is broken - the way that data gets indexed on the network is not a natural fit

You actually have to end up, per application, coming up with your own way to index this data. Not only is that not developer-friendly at all, it's also not user-friendly at all because they're unable to actually access any of that themselves unless they build an indexer themselves or use an indexer that is tuned for it.

### Schema-Bound Data

What we do with Quilibrium that's different in the design is that every single type of data that lands on the network has some sort of schema attached to it.

You can think of Ethereum as having its own kind of schema attached to it too - when you have a contract you provide the source code to that contract, but you do also have this notion of things like events that end up in the event logs of an Ethereum execution.

These things are intrinsically bound to a schema on Q. We have this mutual construction that relates the concept of schema and the data relationship of that schema to elements on the hypergraph.

By consequence, we are constantly providing data in a fully schema-encoded way that relates onto the hypergraph in a way that is very efficient to query. So:

- The cost of querying is lower
- The ability to rely on the network as a self-indexing primitive is now possible
- You get the ability to relate to this data like you would a relational database

Because of the nature of how we're indexing that data intrinsically through interacting with the network, you do get all the indexer benefits that you've had to rely on third parties to do for you for other networks.

Our economic model is meant to make that data not expensive to retrieve. If you are running of course a node of your own, you can query it for free - you can set your own price for yourself and get it for free. But if you are just interacting with the network, it's still really cheap in order to actually execute those query calls, and you can do advanced query calls on it instead of having to pull all of the data down and perform a specific evaluation of that data set.

## Building Quilibrium

### Longevity in Crypto

I've been in crypto for a very long time. I was a CPU miner in the early days of Bitcoin. I was on the Metzdowd mailing list when the original white paper landed. I was an active participant in the discourse of what it meant to be a cypherpunk, what the future of that type of stuff would end up like.

Seeing it all play out in real time has been really cool, but it's also been something that because I've been in it so long, it's not that hard to start to relate some of these ideas together and think about things from a much longer span time of view.

### Ruthless Compartmentalization

In terms of how I keep that all in my head - one, I've been in it for a long time, but also I ruthlessly compartmentalize my life. I run my life on Jira - my personal life. My spouse is disabled and so I have to also do various things in service of that, and that means I really have to ruthlessly compartmentalize my life.

I live on a schedule, I live on Jira for task tracking - everything. When I have something that comes up or something I need to accomplish or some longer story of something that needs to be achieved that is smaller tasks, I just put it in Jira and I just don't betray that because otherwise I would lose track of everything.

### Growing the Team

On the developer side of things and people contributing to the code base - I would love to hire people. I do actually have one person that is working part-time to help keep nodes online and help manage some of the overall key management functions that we have to do, but I don't have any full-time employees that are strictly working on Q.

I'd love to do that, but investors have been a very tricky subject for Q. We've been very open about telling them how we feel about them. By consequence, we haven't always gotten a favorable response because we just simply don't do things in the way that a lot of investors want. They want tokens, they want liquidity, they want us to betray all of the core values of what Q is trying to do, and we just refuse to compromise.

That has made it hard to get an investment, but we're getting closer. From that point we'll be able to hire people. In the meantime, there have been really large outpourings of people who have actually been contributing to the open source repository, and we're going to be bringing a few on as dedicated maintainers this week because they've shown constant care and compassion in forward thinking about how to make the protocol stay secure.

### Company vs Protocol Investment

I've been approaching investors from the perspective of investing in the company, not the protocol. The company is one of 17 individual signatories that cuts releases of the protocol - there must be at least nine signers in order for a protocol release to be accepted.

By consequence, we are not the only authority (if you would give that title at all in the first place) that is managing releases of the network. You wouldn't be investing in Q Inc if you're investing in the protocol - that's an entirely different context.

If you believe that Q Inc is going to make money in service of the work that they provide for the protocol, that's why you would invest in Q Inc. We liken it to: you would not invest in Intel because you really believe in AWS - you would invest in Amazon because you really believe in AWS.

### Long-Term Focus

I've seen a lot of bulls, I've seen a lot of bears, and you just keep building and ignore all of it.

I'm not a big fan of short-term thinking in this industry, and so I've never really been so keen to participate in a lot of that. Sometimes I get dragged into it against my will, but I definitely never intend to participate in it in any sort of meaningful aggregate.

There's a phrase that often gets used - it might be a Y Combinator-ism of some kind that proliferated through all of their various children companies - it's: "It's never as good as it seems, it's never as bad as it seems."

Everyone with the "we so back" and "it's so over" - depending on what their current bipolar state of the industry viewpoint is - it just doesn't mean anything to me because math is eternal. Whether or not someone's opinion about an economic industry or the economic output of an industry is in some certain state doesn't change whether or not math will continue to work.

I just stay focused more on that side of things and not so focused about whether or not a particular narrative is now imploding.

## Getting Involved

If you want to get involved:

- We have an open Telegram community
- There are actual community-driven communities (they engage in discourse that I legally need to stay away from)
- The official QUIL Node Runners Telegram is available - just reach out to me on Farcaster, happy to add you in
- We've got obviously the repository on GitHub
- We've got lots of documentation and lots of documentation that needs to be written
- Lots of work to be done - there's plenty of opportunities for people who just want to raise their hands and say "I want to help"
- Lots of low-hanging fruit to do that - we welcome contributions for practically everything

---

*Updated: 2026-01-29*
