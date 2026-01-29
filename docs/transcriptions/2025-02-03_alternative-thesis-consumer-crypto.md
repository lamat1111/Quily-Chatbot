---
title: "The Alternative Thesis of Consumer Crypto"
source: youtube
youtube_url: https://www.youtube.com/watch?v=GeuZsX6dC08
author: Cassandra Heart
date: 2025-02-03
type: livestream_transcript
topics:
  - consumer crypto
  - Quilibrium architecture
  - blockchain history
  - personal computing parallels
  - KZG commitments
  - verifiable delay functions
  - garbled circuits
  - passkeys
  - decentralized applications
---

# The Alternative Thesis of Consumer Crypto

## Background and Introduction

I was a senior staff engineer over at Coinbase, originally on Crypto Foundations and then Core Cryptography. While I was on the team, I was building out some of the mobile MPC tooling that got used in the Web3 wallet built into the Coinbase retail app. I've been very excited about the future of both crypto and the research that's come from it in the field of MPC.

While at Coinbase, I did give a talk on what I thought the future of crypto would look like, and after giving that talk, it wasn't much longer that I left to go build it. I also worked part-time on the Farcaster team, helping build out the Farcaster protocol and the client side Warp Cast app. If you've used direct casts, I had a heavy hand in that, originally on the encrypted direct cast side as well.

I was actually working on Quilibrium before I joined Coinbase. I was in a small startup that I co-founded. We were doing a lot of very advanced crypto stuff at the time, and then as we started to pivot away from it during the peak ICO bust era, nobody was into crypto anymore and the investors weren't either, so we did a lot of pivots. Ultimately I found myself on my way out and into Coinbase because I wanted to stay crypto-focused through and through.

## The Homebrew Computer Club: A Historical Parallel

I am a firm believer that history may not repeat but it certainly rhymes. Let me show you how that rhyme is playing out before us.

Let's rewind the clock back to 1975, Menlo Park, California. The Homebrew Computer Club was a small group of enthusiasts who saw a future on the horizon in transforming the ubiquity of mainframe computers into the ubiquity of microcomputers as an inevitable next step. But what were the microcomputers of that day? Bulky, expensive, and they required extensive manual work to make them function. You needed to not only have a real deep passion for technology and hardware but a really deep understanding to make them work.

Nevertheless, there were people who saw this as the future and they dreamed of what the next step was going to look like. Even before The Homebrew Computer Club, some of those steps were major blunders from people who couldn't see that consumers wanted personal computers for the flexibility they could provide, but instead saw them as just advancements on their bottom line. They envisioned a world where computers were force-fit into specific functions such as the absolutely bizarre idea of a kitchen computer in the 1960s.

## The Birth of Apple and the Personal Computer Revolution

In The Homebrew Computer Club in 1976, Steve Jobs, Steve Wozniak, and Ron Wayne introduced their first personal computer: the Apple One. Wozniak's brilliance in playing hardware like a Stradivarius to the conduction of Jobs' consumer vision led to beautiful symphonies of lower cost hardware rivaling the more expensive products for consumers, with an approachability that has been a storied tradition in Apple's legacy.

At the same time, sales were extremely limited and only a scant 50 of the devices remained to this day. But it kicked off something special - it led to a brand new industry of personal computers which did not require the manually wrapped breadboards and extensive schematic debugging of the prior era.

Apple, Commodore, and so many others began to seize this new market. Commodore, swinging with the might of large fortunes, brought forth the PET. The PET was much like many products - a series of incremental improvements cramming more advanced hardware to achieve their aims of doing more powerful operations. Yet with a monochrome display and limited peripherals, there was little creativity to be had outside the walls of spreadsheets and tabulations. Personal computers were still largely a reflection of their most optimal use at the time: handling finance.

Their design was also complicated, and that complexity begat even more complexity. Just to deliver disk drives and the controlling hardware required two full-fledged processors matching the PET's own main CPU, and deeply complicated hardware to make it all work together.

## Apple's Innovation: Doing More with Less

Apple, on the other hand, as they were building their successor in the Apple II, had Steve Wozniak realize the controller hardware supplied by the vendor for the disk drives was over-engineered and could be made to work much more efficiently and much more cheaply with a more harmonic arrangement with the hardware of the computer itself.

But Apple did more - they kept the hacker spirit alive from The Homebrew Computer Club. Utilizing the color signal capabilities of well-timed frequency modulation, they did something no other personal computer could dare try at that price point. The cheaper hardware tuned to a slightly slower clock speed than their contemporaries enabled them to match the frequencies required to emit signals at just the right rate to bring color to the home computer in the Apple II.

This and other successes led International Business Machines to respond to the subsequent introduction of the Apple II and its contemporaries by continuing to dismiss microcomputers altogether, saying they were "too small to do serious computing and therefore unimportant to our business."

This type of sentiment is pretty familiar with a lot of us here because we've heard very similar criticisms in crypto even to this day.

By 1981 IBM realized their mistake and entered the fray. And what did they bring? A cheaper imitation of the same storied predecessors with no vision for the consumer. By 1983 the Apple II became the world's most popular personal computer and most of the contemporaries had died. The lower hardware costs and incredibly optimized balance made them a cornerstone in places of education, art, and for consumers wanting to do more than handle finances and make spreadsheets.

But consumers needed something more. Hearkening straight from the beginning of their strategy to do more with less, to blend hardware and software in ways that delivered more power and control to the user in new ways thought impossible - in 1984 Apple introduced the Macintosh. Every step of the way the prevailing idea was to do more with less.

## The Cypherpunk Movement and Bitcoin

Let's advance the reel of time forward to 2001. The Metzdowd mailing list, known by the OGs back then by a different name at the time (Satoshi Systems until 2003), was a small group of enthusiasts who saw a future on the horizon in transforming the ubiquity of secure and verifiable compute at the research level into the ubiquity of being embedded into the consumer realm and finance as an inevitable next step.

But what were the dreams of that day? Digicash (later eCash Technologies) by David Chaum was intended to enable transactions between customers of banks, replicating the anonymity of cash transactions. Secure communications between groups of people was part of the discourse. Criticisms of government interference and surveillance programs - this was the spirit of the cypherpunk ethos that drove the research and discussion for years, with many ideas, debates, and papers.

And then there was one paper posted to the Metzdowd list in 2008 that without its existence, none of us would be here on this call today.

For those who need a refresher: it's a simple concept. You take transactions as they come in, sort them in whichever order you prefer (generally by the highest fee descending), and construct a Merkle tree. You take the root of the tree, the version, the previous block hash, timestamp, current difficulty, and random nonce to generate the new block hash, which feeds into the next block creating a chain. For the OGs who have been here for at least the beginning of cryptocurrency, Satoshi called this a "timechain" but later acceded to the community's adoption of the phrase "blockchain."

## Bitcoin as Computer Architecture

Let me put the framing into context by considering this in terms of hardware, treating a singular transaction as an instruction. It might seem a little bit off at first given the complexities of the transactions themselves, but a good parallel for processors is that many instruction set architectures frequently do many complex operations in a singular step for multiple sets of data (either SIMD or MIMD).

When we talk about this in terms of computer architecture parallels:
- **Clock speed**: About 7 transactions per second, thus about 7 Hertz
- **Addressable space**: It makes more sense to consider this computer as one without disk, but rather all balance info is a portion of a very low bandwidth durable RAM bus - one that is now towering over half a terabyte in size

The speed is a strange factor, as many chains which followed very quickly experimented and found faster block times alone was able to enable greater transaction throughput. But Satoshi's motivations in allowing greater latencies and longer durations of disconnected peers was a trade-off for the time which made some sense. Unfortunately, the weight of the miners in many of the decisions made on the network kept many decisions ossified, which prevented such speed improvements and thus also, of course, maintained higher fees.

## Ethereum and Smart Contracts

Enter the second era of crypto as the dreamers began to dream more. The cypherpunk ideals began to find their way into the discussion. Smart contracts were revived from the theoretical talks of the 1990s and early 2000s, and Ethereum was born.

With Turing completeness, programmable finance was now feasible. Ethereum's design borrowed greatly from Bitcoin with a focus on tweaking certain aspects to handle supporting Turing completeness and the execution of these applications more readily. This resulted in a somewhat interesting block design with three separate Merkle Patricia trees corresponding to:
1. The finalized world state
2. Transactions
3. Receipts

The world state's leaf nodes contain minimal info: balance, code (if applicable), and corresponding state data under an address confined to yet another tree all its own.

Proof of work consensus remained a part of Ethereum's history until many years later, at a time where some of us who are actually on this call today were present to witness The Merge, which finally separated consensus from execution and adopted proof of stake as the new model for securing the network.

### Ethereum Hardware Specs Analogy

Looking at Ethereum under the lens of hardware specs, transactions do not directly correlate as a singular instruction. Instead, we'll consider the gas limit per block and the average gas per opcode to be the basis of speed.

Taking an average around four gas units per opcode, and a maximum gas limit that was initially roughly 3 million, then 8 million, then 12.5 million, then 30 million spaced at various points in the protocol's history, and a roughly 12-second block time, we're looking at something that performs at:
- Roughly 62.5 kHz (initial)
- 167 kHz
- 250 kHz
- Finally about 650 kHz

Once again we're finding a parallel in this concept of durable RAM, as all the balance info and contract data is accessible at any time. That full history is about one terabyte in size as of right now.

### Ethereum 2.0 and KZG Blobs

The separation of consensus from execution is not all that has come to pass with Ethereum 2.0's architecture, but it did immediately introduce its own level of complexity with additional states to track relating to deposits, then later withdrawals, attestations, finalizations, and epochs.

This complexity was further extended with the Dencun update, which recently added support for KZG blobs. KZG blobs were great - they minimized costs for L2s over using call data for storing data. But blob retention is a very interesting dynamic because it actually changes the concept of data availability such that we find ourselves with a new element to consider in these hardware parallels.

All things considered, the hardware stats remain relatively locked in unless maximum gas increases again. Except now with the addition of blobs, we have an indirection. This indirection is in a way kind of like long-term storage - it's detached, like a hard disk. The maximum capacity of this hard disk, however, is essentially limited by the 18-day window offset by backups to external data availability providers, whether within the L2s themselves or other DA layers.

## Solana's Architecture

Solana's execution model is a declarative of effective addresses, which is essentially a locking scheme that enables parallelism in a way that's kind of similar to hyperthreading rather than true multicore.

When mainnet isn't down, with a compute budget of about 48 million compute units per block, each opcode costing typically one compute unit, and an average block issuance at about 450 milliseconds, the theoretical max speed would essentially be about **106 megahertz**.

Realistically though, it's a much lower figure, especially when factoring in that the majority of transactions are just vote transactions, and of the non-vote transactions, many fail.

There's also a data availability consideration in that historic transactions required to truly verify the chain reach out into the hundreds of terabytes. A validator, beefy as they may be, only needs to hold about 100 gigabytes of state. There is pruned history involved here, so there is that kind of separation in the same way that there is for Ethereum - to truly validate it, you may have to retain data in a kind of disjointed manner, and that full history is quite massive.

## The Finance-Centric Problem

It is painfully obvious for anyone in the space long enough to see that the grand majority of the projects that have truly survived for long periods of time are financially oriented. It's easy to argue that because costs to use these platforms are a consideration of any action, throughput being too low to move more functionality into the networks themselves, and of course all this started as a peer-to-peer digital cash.

But what I actually see in this argument is a different story. I see what drives to the heart of what I believe is the future of consumer crypto and what that's going to look like, and where that inflection point begins.

**It begins today.**

It's a consequence of the architectures that we're looking at. It's the need to move data further down into equally if not more complicated layers, reflecting the shape of the overall global computer itself. We have the L2s connecting to Ethereum through the KZG blobs, and something just stands out to me. It just looks so familiar. It looks like I'm seeing the same complexity, the same disk drives to manage that complexity.

It's all over again - it's the monochrome terminal, it's the spreadsheets, it's the PET.

## Envisioning the Apple II of Crypto

But what's the Apple II? What's the simple disk controller? What's the color? Where's the user? Why is everything finance? Why can't the spreadsheet just be another application instead of the whole purpose?

**What would Woz do? And what more can we do with less?**

If you could take a step back with all the lessons learned, innovations, advances in consumer hardware evolution and regulation, how would you start fresh? What would an Apple II look like? Or a step further, a Macintosh?

You would:
- Deliver smarter, faster, cheaper storage
- Enable a greater variety of applications
- Make tools that developers can use off the shelf that abstract away all the complexities, rather than leaving footguns for things like reentrancy bugs

And if we're really going to emulate Apple here, other than just having a greater harmony with user experience, you would steal the hell out of the Xerox PARC user experience research and give the user a mouse.

## The Integrated Circuits of Crypto

So how do we work backwards? What are the integrated circuits? What are their timings, their importance, their functions?

### Hard Drive: KZG Commitments
The KZG commitment scheme used by Ethereum and Quilibrium enables storage for vast amounts of data. It can replace Merkle trees (in the Ethereum case, Verkle trees which they're going to be adding soon). It can be combined with zero-knowledge proof schemes to prove function evaluations, and most importantly, it's very compact in size.

### Timer Chips: Verifiable Delay Functions
The classic 555 timer chip and hardware RNG chips that exist together can actually be combined in the form of **Verifiable Delay Functions (VDFs)**. It provides:
- Timing data
- Deterministic ordering
- Unforgeable randomness

### RAM: Single Slot Finality
The RAM in the system should only actually hold that which is immediately important to the actively running applications. Through **Single Slot Finality (SSF)**, the immediate state is the only state that's actually required to be maintained in the global computer. This is something that is at the forefront of research on Ethereum, but there are other networks out there that have come up with their own approaches to single slot finality.

### CPU: Garbled Circuits
General computation has a proxy in virtual machines but also in **garbled circuits**. You also get one bonus with these garbled circuits: **input privacy**.

### Key Management: Hardware Security Modules
All this involves cryptographic keys. We're not in the days of needing custom hardware or custom software to manage special keys. Practically every device we have today has some form of Hardware Security Module present. So why not just use those devices?

We're talking:
- Smarter storage
- Greater variety of applications
- More developer power
- Greater harmony with the user and their devices

These are important integrated circuits that are accessible to us here and now.

## Quilibrium's Architecture

So how do you use them most efficiently to construct a new system? **You keep the highest level of consensus as lightweight as possible.**

Using a VDF as the global sequencing timer allows the network to maintain order and yield randomness for leader selection, instead of having to either burn through electricity to compete in hashing for random leader selection or using economic weight-based selection schemes.

As for leader selection itself, the leaders are instead within their own dedicated shard subsets, much like a sharded database. Then, using KZG polynomial commitments to merge the collective global shards into a small set of globally synchronized commitments, you can maintain global consensus with strict inter-shard ordering.

At the global shard level, you have sub-shards further deepening the degree to which you are able to store and process data. The degree of indirection costs very little in global communication. That pure RAM point of view is **only 19 kilobytes of data**, but due to the extra dimensionality of the depth of the shards involved, it produces a data addressing width that provides you the ability to **address more data in terms of bits than there are atoms in the universe** - but only one that needs to grow with the size of the network growing alongside it.

### Garbled Circuits for Compute
Performing compute over stored applications using garbled circuits instead of having a formal VM gives you the ability to:
- Provide input privacy
- Output encrypted data
- Remove the prying eyes from seeing the actual coins that exist in one's account, the collectibles that one owns, the content one posts - unless they choose to share that publicly

### Flexible Data Lifespan
In addition to long-term storage, users can denote the lifespan of data accordingly. That addition means you get the ability to provide new types of services such as streaming data - like for streaming video or audio.

### Parallelization
On top of this, this is all a massively parallelized scheme. You can steal Solana's advanced address declaration technique to lock the relevant shards, which are already quite fast in this approach, to bring the horizontal scaling capacity to brand new heights.

### Passkey Integration
Finally, you can leverage the large blob or sign random function of consumer HSMs that are built into phones and desktops to provide the key management needs required - **removing the wallet as an intermediary** that's needed at all.

This is ultimately the design philosophy that I have put into place in building Quilibrium.

## Quilibrium Performance Metrics

Bringing this into the real-world scope: Where have our real-world tests that we've been conducting for the network in the past year brought us? On the precipice of actually finally fully launching, we've achieved:

### Single Slot Finality BFT
Over **26,000 nodes** at the time of this talk, drilled all the way down into a single shard.

### Compute Speed
Using FERET, which is an oblivious transfer primitive for garbled circuits, as our OT construction, we can obtain a maximum of **54 million OTs** (oblivious transfers, kind of like instructions, binary operations), yielding a clock speed of approximately **54 megahertz**.

Not quite Solana, but it's **per shard**. The CPU thus becomes deeply symmetric in terms of multi-processing/multicore with an astronomically large maximum core count possible using these garbled circuits.

### RAM Requirements
Thanks to our single slot finality approach, RAM becomes physically mirroring real-world RAM use, needing:
- **19 kilobytes** just for global consensus
- Each shard individually usually needs a maximum of **1 gigabyte**

### Storage Capacity
At the hard disk level, we get something kind of like a RAID 6 arrangement, realizing a maximum capacity for more bits than atoms in the universe.

## Rearranging Existing Technology

Ultimately what you have there is the forefront of cryptographic research, but just rearranged. It's all the same stuff that's existed in all these other networks:
- The VDF is from Chia
- The locking scheme is from Solana
- The KZG commitment scheme might be a different curve, but it's essentially the same thing that Ethereum is doing

Instead of just having it in the order the way people are doing it now, we simply move things around to have greater efficiency. That's a powerful tool because that means a whole bunch of new things can be realized in the world of crypto. There's fewer moving pieces to do more, and all it takes is just a rearrangement of those same parts - and even kicking out some of the pieces we don't need for efficiency.

In other words: **goodbye blockchain, but hello to Satoshi's old timechain vision.**

## What This Unlocks

So what does this actually unlock?

1. **Storage** becomes as cheap or cheaper than S3 or R2
2. **Signal level privacy** at every single step of the way
3. **Users no longer have to fumble around with wallets** or even understand them - they just use Face ID
4. **Passkeys adoption** has been simple for the user because they've already been trained to do Touch ID or Face ID or whatever authentication scheme their device gives them
5. **Extreme censorship resistance** because there's no single point of failure - you don't have to worry about a dedicated RPC like Infura going down, you don't have to worry about a wallet potentially banned from an app store. These are all built into the hardware that users use, and if you were to remove those components, you would drastically destroy people's lives even outside of the crypto world
6. **Truly serverless applications**

These are powerful unlocks that bring forth the next generation of web applications.

## Real-World Example: Farcaster Frames

For some of you who have been on Farcaster, you might have actually seen a small demo of this. We're seeing these realizations now in nascent forms with applications like Farcaster itself.

Farcaster is not a blockchain. Farcaster interacts with a blockchain to provide the very specific account management functionalities, but the network itself is actually an entirely different idea - it's a Delta graph.

The enablement of different flexible structures based on the needs of an application, and being able to support that in a genericized level, is something that we have considered the core premise of what Quilibrium should enable.

From that, you can get this incredibly powerful composability. This composability ends up being demonstrated in an incredibly simple example: just putting Doom in a frame on Farcaster. Pretty soon we'll start to see more experimentation and invention using that new composability, letting people leverage that composability and remixability.

## Conclusion

That's my thesis of consumer crypto and it's what I'm building towards.

To give you the classic Coinbase-ism of a TL;DR:

**Bitcoin inverted finance. The future of crypto inverts the computer.**

I look forward to building that future with all of you together.

---
*Last updated: 2026-01-29*
