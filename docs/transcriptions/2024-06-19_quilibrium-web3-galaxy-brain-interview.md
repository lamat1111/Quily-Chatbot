---
title: "Cassandra Heart on Quilibrium: Privacy, Censorship Resistance, and a New Internet Architecture"
source: youtube
youtube_url: https://www.youtube.com/watch?v=9P3eTJl9ZlY
author: Cassandra Heart
date: 2024-06-19
type: interview_transcript
topics:
  - architecture
  - security
  - mpc
  - tokenomics
  - roadmap
---

## Why the Internet Needs Reinventing

It's kind of a remarkable shift that's happened over the past couple decades. We saw the emergence of AWS, and you have a lot of the traditional guard — back in the day when people were manually operating their own data centers, staffing teams to run all that. The whole reason they did this was because they had to. They had a lot of resources that they needed to put in a data center, and paying somebody else to do it — maybe you could get a third-party agreement with another data center, but there's still an extension of trust.

A lot of those people, when the advent of AWS and the like came along, were saying "this is someone else's computer, this is someone else's machine — cloud is just someone else's machine, why would I trust that?" Amazon spent a lot of time trying to build up that trust, and by consequence they've become quite the behemoth. The grand majority of the internet's traffic is served through cloud providers, and so it creates an interesting problem.

In several countries like the United States, there is this phenomenon where the federal government, through their various arms, in the event that they want access to something they can subpoena it, or they can do one of those FISA court actions, which is completely secret — you don't know about it — and they can coerce third parties to hand over data, hand over information, hand over raw machines, and you may never be any the wiser.

Because of these revelations by Edward Snowden and a whole bunch of other folks along the way, we've started to realize we're extending a lot of trust — and blind trust at that — in these providers. The problem with this is that while most people are never going to be subject to some sort of scrutiny for national security, or at least they don't think they will be, the reality is different. A lot of people end up having their data pulled in through these various dragnets. This is far more often in some other countries like China, obviously, but even in the US a lot of people who are law-abiding citizens who have done nothing wrong have ended up with their data being suctioned into the mass collection facilities of the federal government.

The problem is essentially that while most people believe that they have nothing to hide, because most people are genuinely good and they really don't have anything to hide, it doesn't matter. Metadata can frequently be seen in ways that project a bad light on someone, and so by consequence you could be labeled as a bad actor just by virtue of pinging a cell phone tower at the time there was a protest, or participating in a completely lawful protest even. There are lots of reasons why people who feel like they have nothing to hide actually should be very concerned about the way that their data is being collected and managed.

Trying to fight against this overall state apparatus is something that unfortunately kind of hearkens back to the phrase — "to bake an apple pie from scratch, first you must reinvent the universe." Very similarly, to reinvent the internet in a way that is secure, you must actually reinvent the entire internet.

## Censorship Resistance: Real-World Examples

A lot of social media companies — you'd think they'd have an interest in preserving the freedom of speech of their users, but in reality it actually ends up being kind of a struggle. A lot of public companies — we saw this with Twitter until Elon Musk took over the company — a lot of public companies end up facing pressure from shareholders and the general public alike, and that can obviously influence the overall value of the stock for that company to suppress things that the general public may consider harmful.

The problem with just submitting to pure pressure rather than actual legal pressure that is justifiable about what is acceptable discourse is you end up with this condition that you are subject to the tyranny of the masses. What is acceptable discourse today — if you read many rationalists' writings you'll find this is a phenomenon that has existed since time immemorial — what is acceptable discourse today is not necessarily acceptable discourse tomorrow. In order to resolve that, you have to remove the element that causes that public pressure from even being successful.

It gets actually a little bit more complicated than just advertisers. It's not just brands. It's all the way out to even infrastructure providers will pull the plug if you become politically inconvenient and potentially scar their reputation. A rather controversial example: in the 2020 political era, there was a social media empire being built — it was called Parler. A lot of people probably know it as right-wing Twitter or right-wing Facebook. Parler ended up getting unplugged by Amazon Web Services. AWS made a claim that there was a credible threat that was coming from Parler, but later data and studies that were conducted actually revealed that the January 6th incident was actually coordinated largely on Facebook, and so the justifications about why they had deplatformed this particular service was ultimately a political ploy.

Being subject to censorship due to political dynamics is already a very unacceptable position to be in. I may have my own personal beliefs, I may have certain viewpoints that will conflict with people on any of the political spectrum, but I will very much admit that in the United States, freedom of speech is a very powerful force for equalizing points of view in terms of whether or not they can actually be said. Because companies are going beyond that measure, it's actually a credible threat from every step of the level — it's not just advertisers will pull the plug, it's actually all the way out to even infrastructure providers will pull the plug if you become politically inconvenient.

## The Lego Box Architecture

You can kind of think of the network as a box of Legos. There are certain components, and the way they can be mixed and matched matters in important ways for certain types of applications. We have this approach for providing group-level privacy and communications — not everything needs that. Sometimes it's just direct peer-to-peer communications and you don't need that particular component. Sometimes you need not long-term data storage but ephemeral data storage. For example, a video call — you may wish to choose to record it, but that doesn't necessarily mean that every single video call would desire to be recorded. The ephemerality of streaming data is one other Lego piece that might not matter to every application.

We try to have as big of a Lego box as possible with enough strong opinions baked into those Lego pieces so that when they are composed, they're composed in a way that doesn't violate any sort of principles of the network — that people remain private, that people remain censorship resistant, in whatever ways those are being composed.

## How Quilibrium Differs from Existing Blockchains

Quilibrium's privacy-forward approach is something that actually kind of hearkens back to the original ethos around Bitcoin and the like — this idea of cypherpunks coming together to say "we want uncensorable money, we want money that we're free to transact with anyone," and giving a strong layer of privacy around it.

There was this belief for a while in the early Bitcoin scene that Bitcoin was private, but the reality is that it is a public ledger. Those events are publicly traceable, and given enough metadata you can correlate those actions to identities. It's not as private as people thought it was. That was kind of a mistake on Satoshi's part because Satoshi had very specifically said in order to retain this privacy level you do need to use the addresses in a disposable way — you just constantly cycle new addresses — and people just didn't do that.

The problem comes around to a very basic principle which is the path of least resistance. If you make it easy to do things that are the right way to preserve privacy, then people will do it. It's just that Bitcoin did not make that easy, and so by consequence enough people started doing just single address reuse and ultimately it leads to the condition where there's this aspect called k-anonymity — hiding in large sets — and because enough people were actually just willingly identifying themselves by reusing addresses, the people who weren't are now easily identified.

## Why "Blockchain" No Longer Applies

Quilibrium has been a seven-year mission at this point. During that time, there was an observation I was making that the notion of a blockchain — even Satoshi in the white paper didn't say "blockchain" as one word. He specifically just referred to the structure as "block space chain" and it was just an observational term, not an actual formal definition. Satoshi actually tried to argue as a "time chain" and that never took off.

The whole point of these decentralized systems is to reach consensus on a sequencing of data. Blockchain does that through essentially randomized lottery — having people churn through hashes to meet some difficulty bar. That works, but the problem is it's very slow, very computationally expensive.

A lot of chains don't even do this anymore. Solana has proof of history and proof of stake — but proof of history is actually just a hash chain that tries to provide decentralized sequencing of events, but nevertheless it's still singular leader election.

One thing I was noticing is that a lot of them are now starting to do things like having L2s or even L3s. With Ethereum, you have two different sections of data that you're maintaining under the blocks — the execution layer and the consensus layer for proof of stake under the beacon chain. So you already have two parallel tracks. That is no longer a blockchain. Then with the advent of using KZG proofs as committed data stores for L2s, you now actually have a tree of blockchains that are fanning out — essentially a forest of blocks rather than a true blockchain.

When I say that Quilibrium is not a blockchain, it's because in my opinion the term is no longer relevant. Pretty much nothing is a blockchain anymore. And calling Quilibrium a blockchain when it doesn't look remotely like it just doesn't make any sense.

## Ethereum's L2 Economics Problem

Ethereum has kind of dropped sharding from its roadmap. They have said that L2s are good enough, and that might be true for Ethereum's case. But there is this interesting economic reality that comes from that — these L2s all have to compete for the same block space, instead of a block space that is designed to comprehensively scale out to the number of L2s that are sufficient to fulfill the network's obligations.

Why that's kind of a problem for Ethereum is that they've structurally taken this idea of "let's just recursively run Ethereum through the layers." Even the L2s are running essentially some fork of Geth for the most part. They're delegating authority to individual organizations to in their own meaningful way try to scale out the network, but it is essentially the same EVM just at different layers. You have to spend all of that same compute, all of that same resources, for all of the same drawbacks and failings that have accumulated over time. Because, you know, Ethereum was originally a 19-year-old college student's idea that kind of spiraled out of control into what it is today, and so by consequence there's a lot of technical debt. They've adopted all that technical debt all the way down into L2s.

There's only six maximum blobs per block for the KZG proofs now. For a brief period of time we actually saw that hit serious contention because we had blob inscriptions happen, and there were people actively fighting for that blob inscription space against the people who were running L2s.

## On Decentralization and the Social Layer

My take about subjectivity is that all of these things are problematic — that to have any sort of social layer of trust on a protocol is intrinsically broken. The only way you can have a truly decentralized system that can preserve against any sort of societal pressure is it has to be strictly subject to the rules of the protocol. If you ever violate it in its finalized production state, that is not a decentralized protocol.

Spicy take: I'm sure a lot of ETH maxis would be very upset with that point of view. But that is a reality — if there are people who can make a judgment call and that changes the state of the network, even if it's a decent number of people in some sort of foundation or community, that's still not enough. You need to actually have some formally bound protocol rule for making those kinds of changes, making those kinds of forks if need be.

There were conversations that came out during the FTX lawsuit and a few times before where it was revealed that Vitalik was actually in a chat with several exchanges saying "stop trading." There was very clear evidence even in the proof-of-work era of Ethereum that there's a higher-level force at play here — it's not just the protocol, there's also thought leaders that have enough sway that they can actually make those kinds of judgment calls.

In Bitcoin, it comes down to literally just people who are part of the core development team — and technically there is no truly official core development team, there's just an informally-recognized-as-official core development team. From that group of people, they actually have a diverse set of opinions. There are people who are core developers, like Luke Dash Jr, who's very adamant about fighting what he considers a bug in Bitcoin — ordinals. That kind of balance and interplay and open discourse and complete ability to disagree is something that doesn't quite work in Ethereum.

## VDFs: Lessons from Chia and Harmony

Nothing we do is actually that new — we're just doing things in new ways. The Chia Network is probably the most popular network that uses the Wesolowski VDF that we're using, but there are others like Harmony. Some of these have had problems — not just implementation bugs.

If you look at Chia Network's code, for example, they basically have this VDF engine they call "Time Lord." What they do with it is, when it runs and it produces proofs, if there is an invalid proof submitted they just let it crash. They actually just let it crash — if you submit a proof that causes it to divide by zero and it crashes, it just crashes. It doesn't have any special checks or handlers. They just let it crash and restart it and keep going. That sucks, and so we don't do that.

Harmony has an issue with their implementation of the same Wesolowski VDF where they didn't actually put in the time — the iterations parameter — into the inputs of the proof generation, and so technically you actually have many possibilities for generating things that will verify as a proof that are not actually proofs. We fixed that bug.

The VDF is essentially a Lamport clock — it's kind of like the mob boss taking a photo with a newspaper to prove that they weren't somewhere for some time as part of their alibi. You have these particular proofs that are being generated, rolling in data into those proofs in order to prove that this data existed for at least this period of time. Instead of just simply saying "fastest hardware wins" like in Bitcoin, we take a rough average of what the current iteration steps to produce 10 seconds of VDF is and just cut it to the middle. So if you are a machine that is capable of producing these faster — great — it won't do you any good. Until the median machine in the network has achieved it, there's nothing more you can do.

## Proof of Meaningful Work: The Coinbase Example

The way the network operates in order for calculating anything is either in an online MPC context or in an offline ZK context. That offline ZK context is actually just using that same MPC with a technique called MPC-in-the-head — you are imagining all these MPC participants and simulating them all, and then taking the execution trace of what all of those are doing, and that output value is your proof.

You're able to do things that you would normally use MPC on the network for, but if you need to be offline — say you're like Coinbase and you have cold custody and you have a Faraday tent that you're doing all your operations in — you can't just connect to the network live and perform your transactions. So instead you create this offline proof, it follows the same rules as the actual online network, you submit your proof, you've made your transaction, good.

The data itself is proved through the VDF. Every heartbeat, you emit a proof by taking a random selection using the randomness beacon to roll through your data set to create a KZG proof. That KZG output proof value is very compact — it's only 74 bytes. You take that 74 bytes and put that through your VDF step and you just keep doing that over and over again. There's no way to cheat it because you have to emit new proofs that are constantly valid against new challenges on the data. You just have proofs of execution plus proofs of data combined — that's proof of meaningful work.

## Quilibrium: The Only Production MPC Network

Quilibrium is the only production MPC network that I know of. Nobody has done that.

Our circuit garbler takes ordinary Go code, identifies the different inputs and outputs, assigns random labels to represent bit values, and creates encrypted truth tables for each gate. You write Go, it turns into garbled circuits, and it executes in an MPC context so that no single party ever sees the full computation.

The specific approach we use for oblivious transfer leverages hash-based constructions, and there was actually a secure machine learning paper that generated the seed of the idea. The nice thing is that it gives us a mix for now and it's really fast, but it also gives us one of those tools in the Lego box that we can later use for secure machine learning on the network.

## What Is a Hypergraph?

This is one of the funniest things, because I've been a big advocate for language that makes it easier to understand what's going on, and I mistakenly thought that "hypergraph" was going to be an easy term. By consequence, now there are all these memes — like somebody with the guy holding a butterfly saying "is this a pigeon?" except instead it's a hieroglyphic and somebody in place of the text says "is this an oblivious hypergraph?"

A hypergraph is literally just a graph where an edge can connect more than two vertices. That's it. If you have a graph — which most people know what a graph looks like, just points and edges that connect the points — if your edge can connect more than two, it's a hypergraph.

Hypergraphs are a powerful mathematical construct because they can actually represent a large number of different types of data sets. You can represent a graph using a key-value store, and that works the other way around too. For hypergraphs, you get that same thing, but there's also many other relationships that you can represent — things like a relational database, wide column level storage. It's just an efficient data store that, because of the nature of how it's produced, you can leverage other techniques to give it the same kind of privacy that other oblivious data store types can also provide. A best-of-both-worlds efficiency to serve many different purposes and do so privately.

## How All the Components Come Together

One of the tragic ironies is that I've told people over and over again that in order to build on the network you just write Go, and that has not been easy for people to grasp because they still haven't grasped that it literally is that simple. You literally just deploy Go code to the network and it turns into garbled circuits so that it can execute on the network. You don't have to think about any of that.

You treat the network like a big box of data that you can store code on, or you can store objects on, through very simple get and set, or you can execute an application by loading that application and evaluating it in that MPC context. But that is all completely opaque to the end user — they just add data, they remove data, they change data, or they execute data.

The same way that you think you operate with your laptop — you open up a terminal and you type in a command on bash — what is actually happening behind the scenes is it is loading that section of data into memory, then executing that section of data following whatever the execution context and ABI of your particular machine is. It's the same concept, just applied to a distributed network.

## Passkeys: OpenID Connect for Quilibrium

All of Quorum was originally created to be a clone of Discord — a decentralized Discord clone. The difference between passkeys and wallets is that unlike a wallet, which is one singular key that corresponds to all of your finances — and if your seed phrase is stolen your entire wallet is forfeit — passkeys work on a per-domain basis. They're unique keys that are unique to the domains, and there is no way to correlate one key on one domain with a key on a different domain unless you actually manually correlate the two.

The same type of OpenID Connect style authentication step is exactly what people will use in the Quilibrium design model. It makes it so much easier to just do things the way things have always been done because there's so much tooling that already integrates with things like JSON Web Tokens, there's so much tooling that already integrates with passkeys, and if you just simply conform to those standards instead of trying to invent your own one — like "sign in with Ethereum" — you end up not having to create more education material, you don't have to create more tooling, and you don't have to wait until tooling is produced for your chain or protocol to be able to actually develop for it.

## QKMS: Why "MPC Wallets" Aren't Really MPC

For wallet-as-a-service oriented providers, a lot of them claim they're MPC wallets, but in reality they're not — or at least they're not really multi-party computation, they're multi-party key splitting. What they actually do is spin up a Nitro Enclave (a trusted execution environment) and then have the user submit the encrypted key shard to that TEE where it is decrypted, combined with the other key shard that that provider holds, and then they perform signing using the recombined key. They flush that from memory, and then allegedly the key material was never recombined.

Unfortunately for a lot of those providers, they're wrong. Regulators don't see it that way. There are sophisticated regulators in the industry now, including the NYDFS. I would know because I was one of the people who built an MPC wallet at Coinbase. They definitely understood what it meant to be custodial — if you do recombine the key material at any point, you are in possession of the key material regardless of whether or not you're flushing the memory of the system, and so that makes you a custodian.

What Quilibrium offers as a huge value-add for our KMS service is that it basically enables you to de-risk yourself. Instead of using a trusted execution environment, you can actually be using Quilibrium as kind of like a Switzerland for data. Through the use of an MPC-oriented application — because you just write Go — you can actually encode an ECDSA signer. In the simplest Go case, you have two inputs for your application and user, you recombine them and perform the ECDSA sign operation. Code-wise, that's very simple — but when this actually goes through the circuit garbler of Quilibrium, it gives you the actual MPC execution without having to understand how to turn it into an MPC-oriented application.

## Triple Ratchet: Group Encrypted Communications

Because this all started to build a decentralized Discord clone, one of the very first inventions that came about was designing triple ratchet, which is a group-wise communication or group-wise encryption protocol.

What that provides is that you have a primitive for easy communication over the network. You can either use it in an ephemeral context — you're just sending data over the network to a bunch of peers that can identify themselves by their rendezvous points, kind of like Tor hidden services — or you can actually use the network itself as an asynchronous broker of that data. If you are for example writing a Signal equivalent, you treat Quilibrium as the Signal server and you provide that message inbox/outbox approach through applications that you deploy to the network. Then everyone running this Signal equivalent application on their phones or computers can connect, just like they would be connecting to Signal's APIs, to retrieve their particular inbox's set of data and then perform all the decryption locally.

## QUIL Token: Retroactive Proofs and Intrinsic Value

The nature of how rewards work on Quilibrium is different from other networks. On Quilibrium, instead of having an economic discrete unit that you are writing into the network as a protocol-native object, you are collectively producing proofs over data — proof of meaningful work — and from those proofs you interact with the QUIL token application that lives on the network as an application like any other application. You have a mint function that you can provide that proof to, and it will mint out the tokens relative to the number of proofs you provide.

You actually have two different varieties of experiences: you could either, as a node, have your node continually ping that mint function and continue to add to your balance, or you could perform it retroactively later. The proofs are always valid, so you could submit them a month later if you wanted to. It wouldn't change the amount of tokens that your proofs would receive — it doesn't matter when you submit the proofs, the proofs have an intrinsic value.

## Query and Indexing Built In

One of the powerful differences from other networks is that the oblivious hypergraph gives you the ability to relate to data like you would a relational database. Because of the nature of how we're indexing that data intrinsically through interacting with the network, you do get all the indexer benefits that you've had to rely on third parties to do for you for other networks.

Our economic model is meant to make that data not expensive to retrieve. If you are running a node of your own, you can query it for free. But if you are just interacting with the network, it's still really cheap to execute those query calls, and you can do advanced query calls on it instead of having to pull all of the data down and perform a specific evaluation of that data set.



