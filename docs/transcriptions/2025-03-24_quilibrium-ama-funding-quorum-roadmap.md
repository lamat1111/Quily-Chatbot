---
title: "Quilibrium AMA: Funding, Quorum Progress, and 2.1 Roadmap"
source: youtube
youtube_url: https://www.youtube.com/watch?v=PLad3SuLahc
author: Cassandra Heart
date: 2025-03-24
type: livestream_transcript
topics:
  - AMA
  - funding
  - Quorum Messenger
  - version 2.1
  - tokenomics
  - crypto VCs
  - ecosystem partnerships
  - privacy
  - developer onboarding
  - roadmap
---

## Recent Updates: 2.0.6 Release and Vulnerability Patch

Since the last session about one month ago, we released the 2.0.6 release. This was a vulnerability patch. As worker counts were raising higher, there were many eagle-eyed community members asking if these worker counts were real. We know there was a lot of overallocation happening - people doing batch operations of workers contributing to higher numbers. Competition in ring zero especially was getting very fierce.

Some community members started digging to see if there were any attacks that people were leveraging. The findings resulted in the 2.0.6 release. After its application, we saw no net change in worker counts. Immediately we did see changes because that happens every time we release an update that causes a breaking change in a network fork. But as the network continued getting more nodes updated, worker numbers actually increased.

This demonstrated that while there were things people found - and we are eternally grateful to them for finding it - there were actually no net outcomes indicating any cheating was going on.

## Improving Network Fairness

Because worker counts were still high, we started investigating ways to increase fairness of the network - making sure people running the stock client were not being grossly disadvantaged by individuals running custom nodes.

Many factors go into the success of a node, including the hardware itself. We cannot make hardware suddenly better than other hardware that is actually better. But we can close gaps in software between the stock client and customized clients.

We shrunk the processing time where we issued a patch to make nodes begin proving earlier in the process. We are working on an update that utilizes specialized processor intrinsics - the AVX-512 extensions - to get proving time even lower. Sometimes it is showing up about twice as fast. That is part of the 2.0.6 P3 release.

I want to give thanks to the individuals instrumental in these findings and improvements: Love Peace, Se Otter and his team, Big Evil, Solo Miner, Victor, and all the folks who continue to keep testnet alive, as well as the release signers.

## Quorum Messenger Launch

Since the last update, we released Quorum. Quorum Messenger has been our flagship application. Previously, we called it Howler - that was baggage from my coding sessions called CodeWolfpack. We had some naming conflicts, so we picked a name more in line with the Q ecosystem and renamed it to Quorum.

We tried to launch it on Christmas Day and quickly fell flat on our face. They say everybody has a plan till they get punched in the face - well, we got punched pretty hard. We continued to work around it, prevail, and then finally launched to rousing success.

In terms of crypto projects that launch a social product - especially one without a tokenized incentive like some previously hyped and then died things - we have done extremely well. We have been growing consistently day over day, growing especially week over week, which is our most instrumental measurement. We continue to grow in overall messages published to the network every single day.

That is a rousing success for an application so new, so novel, running on a new protocol that frankly not a lot of people know about yet.

We also launched our Q JavaScript Channels SDK. We will review that later in the stream.

## What Is Coming Next

Up next is Milestone 3 on testnet, a very important part of getting us to 2.1.

For those who have old pre-2.0 Andomints that are not completed yet - please go through the portal and get them uploaded because we will have a cutoff window of about January 28th. Please make sure you get those in time because they will not be able to continue into 2.1. I am not making any statements about when 2.1 is coming out, but read between the lines.

Coming next after Milestone 3:
- Quorum public invites
- Q Name Service
- S3 and KMS developer previews and SDKs
- Quorum Apex and Space subscriptions
- Quorum mobile app and desktop betas

---

# AMA Questions and Answers

## On Funding and Long-Term Sustainability

**Question from Highife:** Quilibrium remains a bootstrapped project with no VC backing. While this is great for decentralization, how do you ensure long-term sustainability? Are there plans for funding grants or other strategic partnerships?

We are in the process of fundraising with accredited investors. We are not making any statements or asks for investors in this AMA - that is not how we operate. We operate within the confines of US law. Our explicit stances: no token warrants and no willingness to engage with investors that demand them. There are many VCs who do not demand these - we talk to them.

Funding and grants are common components of coins that have pre-allocations. We did not do this. We had a completely fair launch. Q Inc. had to run miners in the same equal rules that everyone else had. By consequence, we have well under 1% of the total tokens on the network.

Our position on tokens as utility tokens has not changed. We do not engage or encourage speculation. Our purpose in holding tokens is to utilize the network for its intended purposes - Quorum being one case, providing AWS compatible services being another, and additional intrinsics for supporting machine learning.

We intend to help developers onboard and provide a free tier of access to these compatible services so people can see the ease of switching over before putting any money towards it.

We choose not to run miners right now because things are complicated and nebulous, and we do not want to be seen as having a strategic advantage when we do not.

## Strategic Partnerships

Our strategic partnerships have been focused on companies who need these services yesterday, let alone today. The biggest set of customers we have been talking to for immediate onboarding are wallet-as-a-service providers and decentralized apps using S3 to host their front end. This is part of the mission of being in service of other protocols.

For those who have never launched an app on networks like Ethereum or Solana - when you launch a decentralized app, you put a contract on the network. These networks cannot execute particularly complex applications, or if they do, they cannot do them cheaply. So a lot of the time it is focused on putting small amounts of data on the network, then a nice user interface wrapping around it, and sometimes a server-side component handling additional bookkeeping.

The biggest irony about all these decentralized applications is that they are not actually decentralized - at least on the front end side and sometimes not on the backend side. That is where Quilibrium provides a nice way to mesh with other networks. We provide the ability to host those frontends and backends. That is where we will fit in really well with the crypto ecosystem.

Many of these customers have spoken to us unprompted. We have not done much cold sales. Every time we talk about the unique advantages of the network, we get so many people entrenched in the space already who say "yes, this is the problem we want to solve. We cannot currently do this. We are relying on centralized things and cannot move them onto chains because they cannot support it."

## Experience with Crypto VCs

**Question:** Have you had serious discussions with investors or ecosystem partners? If not, what concerns have they raised preventing them from backing Quilibrium?

We have had many discussions with investors and ecosystem partners. In fact, it is the multitude of discussions with crypto VCs that led us to stop engaging with them entirely.

If you have never raised in this space without accepting a token warrant, this is a side of the industry you will be completely blind to. If the curtain were pulled back about how crypto VCs behave, you would find yourself as disgusted with them as I have been.

I have dealt with institutional crypto investors who took calls inebriated on multiple substances. One kept darting the camera around because he had a prostitute in his Airbnb. One leaked my pitch decks - taking the call just to gather intel because they were feeding it to their portfolio companies.

A lot of people do not talk about this because some crypto VCs operate back channels where the moment somebody starts talking about the truth, they blacklist you. We are probably fully blacklisted with crypto VCs because we are telling the truth.

Even among honest ones, one put it this way: "I can just buy the tokens on the market." They missed the point that Quilibrium Inc. is one of the primary builders of the protocol. Funding the company is crucial to letting the protocol succeed.

Traditional VCs have actually been very responsive to us in a positive way. That is why we pivoted our focus to no longer speaking with crypto VCs.

## Ecosystem Partners and Wallet-as-a-Service Problem

We have had a great time with ecosystem partners. Many immediately understand the value proposition. We solve a problem that for many of them they know is either coming, is here, or is very near.

Let me illustrate with one example: a wallet-as-a-service provider.

Every single company in this space whose primary product is a retail wallet-as-a-service is doing what I call MPC in name only. They have a wallet key split into three shards. Your browser holds one, they hold the other two with one being a recovery share. But even if they give you the majority shares, when you do signing operations, you send that share to them encrypted in a way that gets recombined in a trusted execution enclave.

Regulators do not care what kind of math you are doing. If at any time you hold enough key shares to constitute the key, it does not matter if it is in a black box or not - you are the custodian.

Do you know how many of them are properly licensed and insured to be custodians? Zero.

Quilibrium's MPC key management service solves that problem immediately by taking the trusted execution environment out of the equation and using the network to safely handle this process. Nothing speaks to a company greater than derisking them from being sued.

## Onboarding Large Communities to Quorum

**Question:** You have previously mentioned onboarding large communities to Quorum Messenger, but we have not seen any announcements. Can you provide specific names or timelines of communities moving to Quorum?

Onboarding large communities has required functionality to be available on Quorum - spaces being an obvious major part. Invites literally just went out last week and made it possible for communities to build and grow.

Outside of what we already have, three pressing problems need solving before we can onboard them:
1. Public invites
2. Usernames
3. Token gating (but especially the first two)

To migrate from Discord, a community needs a fast way for people to onboard that does not require DMing somebody, especially in crypto where impersonation is a concern. We also need a non-forgeable handle to distinguish real users.

That is why the username marketplace will be very important. Once those first two items are in place, we will begin the onboarding process and start announcing communities moving in.

## Quorum User Metrics

**Question:** What is the actual daily active user count for Quorum? Can you provide retention data to show whether users are staying after signing up?

The way Quorum is designed as an application on Q, it is a privacy-preserving application. We cannot see messages. We cannot see content about what spaces are being created. We cannot see content about the users.

Obtaining precise daily active user count is effectively impossible. We can only infer that new users have joined, new spaces have been created, the overall volume of activity and messages over a given day, and week-over-week retention by virtue of data dropping off of the one-week retention window designed into the application.

## Applications Being Built on 2.1

**Question:** Version 2.1 is the biggest update yet, but what applications are actually being built on it? Are developers actively working on real use cases?

Most applications planning their move already exist today. It is the adaptation or migration to Q that is key. Net new applications are being built. Quorum itself will remain a good showcase of how to utilize the network.

As part of Quorum's symbiosis for Quilibrium, we intend to make it easy for applications to embed their functionalities into interactive components:
- A link to a DEX presenting a swap inside a conversation
- A game lobby invite
- Gifting somebody a skin that is a collectible on the network
- Sending somebody a token

An interesting example of this composability: there is an individual already building an LLM integrating with Quorum, ready to hook into DEXes as soon as they deploy to Q.

## Token Demand and Q Name Service

**Question:** With current emissions, who is actually buying QUIL? What use cases exist today that create real demand beyond mining?

This gets into speculation. We have consistently discouraged that and do not endorse it. But I can speak to facts on the Ethereum chain with wrapped QUIL.

The largest transactional movement of wrapped QUIL day over day has been predominantly large volume traders, especially individuals caught up in memecoins.

Regarding network-related token usage, we are launching the Q Name marketplace, crucial to providing unforgeable identities on the network. Getting Q names requires purchasing them in either QUIL or wrapped QUIL.

This is immediately useful for Quorum but will be useful for other applications because unique unforgeable identity is very valuable - as seen with Ethereum Name Service on Ethereum, although their data is completely public. We prefer privacy preserving.

Due to the exponential nature of social connections and public invite links we are adding to Quorum, the immediate need for Q names will quickly transform into an existential need for Q names for communities to properly operate.

## Biggest Risk to Quilibrium Success

**Question:** What is the biggest risk to Quilibrium success and how are you addressing it?

The biggest risk is usage, and we are directly addressing that. That is why we are pushing hard on growing the application that made Quilibrium need to exist in the first place. We are rolling out API-compatible services to help companies address their own existential risks.

On product: Quorum is constantly growing in usage. In less than three weeks, the application has grown more weekly active users than most crypto social products - including several who raised tens of millions of dollars from VCs. Our feature set has now outclassed all of them.

## Comparison with XMTP

Let me illustrate with the state of the industry - one of the poster children for chat-based apps, XMTP.

Their team raised nearly $50 million over two rounds. Given who is on their cap table, you know the answer to the token warrant question. They partnered with a staggering number of big names. By virtue of those integrations, they boast 2 million connected users (19 million actual, but they remove accounts with no connected ETH identities).

They do not talk about how many messages go over their network. Let me show you why.

This is what it is like to use XMTP on Coinbase Wallet: it is all spam. I have had maybe a couple messages come over XMTP on Coinbase Wallet. That is what it is like to actually use that product.

Their flagship application Converse, which enables group conversations, is currently so buggy that sometimes messages pop on top of your own messages and go in and out of order.

That is $50 million of crypto VC money at work.

Compared to Q, which has a round in progress not yet closed - some people call us a one dev team even though that is not true - we are working from our cave with a box of scraps. And if you have seen Quorum Messenger, the difference is night and day.

(Note to Shane at XMTP: I only mean this comparison to demonstrate what is table stakes for a chat app. It is not meant to be a drag targeting your team. I know you have a brilliant team. I pitched Triple Ratchet to you guys. Every single crypto chat app until Quorum has been exactly like this.)

## Comparison with Dusk Network

On protocol, Quilibrium's mainnet launched before Dusk Network. Our major version codename for 2.0 was Dusk - totally coincidental, unfortunate. It has led people to compare.

Some fudded our project saying it is not mainnet, it is glorified testnet. That is not accurate. It is a production network. It has users actively sending transactions. It is processing more transactions successfully than Solana managed to handle before it broke down in memecoin madness. It has a production application integrated with the network in Quorum.

Dusk waited longer than us. They started in 2018. Quilibrium Inc. got founded two years ago, but the project's first inception was roughly 2019.

They launched this month with $10 million in crypto VC money behind it. They announced multitudes of demos, partnerships, hackathon events. They announced partnerships by name rather than working with them in private.

What does Dusk look like now that it is launched? Their transaction explorer shows no activity. They have had roughly a few hundred total transactions in 100,000 blocks produced. Zero transactions in the last 100 blocks.

## On Narratives and FUD

A lot of crypto at this current time has a very strong social component active on platforms like Twitter. A lot of it is narrative driven. It is important that people stop falling for metas. Metas are very temporary - they do not stick around. By the time most people hear about it, they are going to be the reason that thing fails and they are going to be holding the bag.

When it comes to projects actually trying to build and push through despite narrative battles, understand: it is never as good as it seems when things are great, but it is also never as bad as it seems when things are not.

We are continuing to build. We are continuing to deliver. We are continuing to ship.

Whenever you hear somebody engaging in FUD on this project, I strongly encourage you to not only stop and consider their motivations, but also see what they are saying outside of the project. I have done that. Some of the most virulent anti-QUIL posters have also been posting wildly anti-semitic global conspiracies. You also have the crowd just hyping up memecoins. Their attention is focused on the meta, or they are posting about a competing project.

Places like Twitter have their entire business model focused on extracting as much attention from you as possible. They found that the most attention comes in the form of what they consider engagement, but what really is conflict.

## On Transparency and Community Engagement

**Statement:** We believe in you, but transparency is key. Engaging publicly on Discord or Quorum space would strengthen that. Staying in the node runners channel creates distance.

I have been necessarily in a walled garden to protect the project. We have a very specific set of rules in how we discuss things because of lack of regulatory clarity. We are in an environment with an explicitly malicious, arbitrary and capricious regulator shaking down builders with mafia-style tactics. Even Uniswap got sued.

But very importantly that ends tomorrow. I cannot wait to be a part of those spaces and speak more freely.

## Team Size and Growth

**Question from Aquarium:** How many core contributors are there right now? How committed are you to expanding into a large team? Is there any chance this will end up being a lone-wolf operation for a long time?

Zero chance it is a lone-wolf operation for a long time because it is not even one today.

The one dev team narrative is tired because not only do we have 17 release signatories, we have many named and unnamed individuals:
- Running testnet nodes and giving feedback
- Pen testing
- Giving direct commentary about how to make things more performant

Most crucially, where we are in the project's lifecycle - the number of years since the project began and the number of people who have individually contributed to the codebase - is basically in step with the largest crypto networks that exist today at the same point in time.

We have deadlines around closing a round. Those deadlines are nearing. With respect to ramping up recruiting, we already have a candidate pipeline way larger than we need.

## On Development Speed

**Question from El Toro 47:** What is stopping you from doing the equity round and starting recruiting immediately? Why is everything taking so long?

I am not sure where you are in the world or your experience with founding a company in the United States and raising for it or building a net novel protocol with aims of scale.

To answer directly: we are doing the round right now. It is in the process of completing. We already have a candidate pipeline. The rate of progress on the protocol itself is extremely fast given all that is in flight.

## Plans After 2.1

**Question from Wave Painter 687:** What are the immediate plans for after 2.1? How will we generate traffic in the network?

Immediate plans after 2.1 is essentially triated:

1. **Developer evangelism** - getting devs onboarded and building amazing applications they could not build anywhere else
2. **Unlocking new primitives** for applications that are hard or not yet possible to build on Q
3. **Deeper integrations with other networks** to help improve privacy of those protocols - things like trustless bridging from Solana, trustless bridging for all ERC20s on Ethereum

## Apps Being Built

**Question from Gaon:** How many app launches are already planned for 2025?

**Question from Slick:** How many dev teams have already built apps waiting for 2.1 launch?

There are ones I am aware of and ones that have surprised me.

QM Creme surprised me with how quickly they came up with a wallet, an explorer, and what they call a bridge (but is really a DEX). I had no conversation with them beforehand and did not even know they existed. Always be careful, but that was wild to see.

Of ones I am aware of:
- Two teams building custody wallets outside of KRM
- Two different teams focused on building DEXes (one will be much closer to the 2.1 launch)
- Another social media application outside of Quorum, closer to old MySpace days
- One wallet-as-a-service company
- A few collectibles projects
- Another protocol planning a migration to Q because they have an existential risk with their protocol design that Q solves for them

Many indie developers are also diving into Quorum's codebase to get a better understanding of building on Q - which I assume they are realizing is roughly the same as building for the web at large.

## On Mining Concentration

**Question:** With such a large amount of emissions today, most is being mined by a few large farms. Are you concerned that output is becoming too concentrated? With so much emission, why are you confident these outputs will be steadily consumed?

One of the core principles of this project is its permissionless nature. If you are running nodes, you have equal footing to participate with anybody else. We have tried to address this through various means by making it harder to do things like expanded overallocated workers.

At the end of the day, if people are putting more resources towards it, they will get more out of it.

Regarding similarity to Bitcoin: while normal people can participate in Bitcoin, Bitcoin works as a lottery system. You get the right hash that is smaller than the difficulty target. But statistically, if you are running Bitcoin on a CPU, you will never mine a bitcoin anymore. People running home miners are running highly optimized ASICs competing with other ASICs.

That is the same with Q. You are meaningfully competing with everybody else running this hardware. The difference is the number of workers at play.

What is unique about Q with how rewards are distributed: they are distributed fractionally based on the number of individuals actively proving at any given time. Instead of somebody running a single home miner for Bitcoin hoping someday they nail the magic number - with Quilibrium, the likelihood of you actually earning QUIL is essentially guaranteed. If you are running a miner, you will get rewarded in QUIL every single frame that you submit a proof on.

The quantity works out a little differently but maintains the same probabilistic outcomes.

Regarding output concentration: there are people mining a lot of QUIL and holding on to it (you can validate this in the current network state and bridge activity). There are people who do not. I cannot speak to their motivations.

Because many larger miners are not holding on to it, it creates an open opportunity for people who do not want to run miners to obtain it in some way. When the username marketplace is online, they will be able to obtain things like a unique Q name without running a node themselves.

As more applications emerge using QUIL for their own app purposes, you will see the conversation shift.

## Marketing to Developers

**Question from JPB:** What is your marketing plan towards developers? Are you planning to directly reach out to prominent developers and product teams? When are we going to have a QUCON?

We are already marketing towards developers on an individual basis, reaching out to see how we can uniquely provide something they are struggling with. We have more to announce soon.

We maintain the privacy of companies and individual developers we work with until they are ready. That is the nature of the beast. I have seen projects that do not do that - it goes very badly for them. I have seen projects that announce partnerships and they do not materialize. Dusk Network announced all these partnerships, mainnet exists, and nobody is using it. Where are those partnerships?

We do not announce individuals until they are ready.

As for a conference: I think people may have taken my acknowledgement of the NyQuil conference name joke as an announcement. It is not. We have not scheduled a conference yet. When we do, it would need to be a balanced use of company resources to be effective.

One amazing example of a conference done well but community-executed was Farcon for the Farcaster ecosystem. That was incredible - a very amazing conference with brilliant people and just enough focus on people actually building cool things instead of partying. A lot of crypto conferences focus more on partying and a little networking. We would want to be like Farcon - focused on people building, interested in Quilibrium, wanting to see Quilibrium succeed.

## Governance After 2.1

**Question:** How is governance going to work after 2.1? How are improvement proposals going to be decided?

Governance in 2.1 is a matter of protocol consensus. As a variant of being in the proof-of-work family of protocols, ultimately mining operators hold sway in decisions on what receives the most hardware resources. But social consensus is ultimately the community factor that holds sway in which fork is the most respected if a fork ever arises.

## Industry Awareness

**Question from Serbiano 93:** Are known crypto players like Vitalik aware of the project?

Many respected players in the space are aware of the project. I am in a lot of group chats with founders of very substantial projects.

They are probably not happy about being drive-by tagged on Twitter about it. I am not sure Vitalik appreciates that - what is he going to say right at this moment? That would be very rude.

## Emissions and Network State

**Question from G7:** Coin emission will depend after 2.1 on data storage. How will you record it and where can we track this data?

It is baked into the consensus bundle. If you wait until the tree shard topic later, you will see what I mean. The size of the polynomial dictates the amount of space being utilized (or vice versa). That ultimately rolls up to the global network state as an implicit sum of the total state being used.

## Team Recruiting

**Question:** Have you started recruiting other developers or are you waiting for the equity raise? When can we expect the team to grow significantly?

As previously mentioned, the candidate pipeline is longer than we will have room to hire for. Once the raise is announced, we will very quickly grow the Q Inc. team.

## On FUD and Project Concerns

**Question:** The FUD on the project is at its worst. How can you reassure the community? What would you say to people crying scam?

As I said earlier, it is never as good as it seems, but it is never as bad as it seems.

I will not speak to price because we do not encourage or endorse speculative activities. But greater utility on QUIL is emerging in the form of Quorum, the upcoming AWS APIs, and broader features of 2.1.

People saying rude things on Twitter and speculator sentiment does not change the fact that we continue to ship, we will continue to ship, and we will not stop shipping.

## Online Marketplaces and Applications

**Question from Jimmy A9538:** Could something like an online market be created on Quilibrium? What other useful applications could be made to bring people into the space?

The Q Name Service will be a demonstration of an online marketplace hosted and supported by Quilibrium.

We are after the broader TAM of the whole web, not just crypto. Our mission is aligned to supplanting Amazon Web Services. Online marketplaces, storefronts - all the basic things people use AWS for right now are things we want to host on QUIL in the long run.

## Running Linux Servers on Quilibrium

**Question from Slick / Playdropped.io:** Will we be able to run a remote Linux server on Quilibrium with a fixed IP address? Is this likely to be price competitive with existing cloud solutions?

The metavirtualization runtime is needed to do that. In terms of competitive pricing, it comes down to real-world data when launched.

Our dynamic fee market will ultimately rule how much QUIL needs to be spent for certain things on the network. There is a baseline fee for execution for metavirtualization. What that baseline fee's multiplier will be remains to be seen as the network continues to grow.

## Roadmap: Dawn, Dusk, Equinox, Event Horizon

**Question from One Time:** Can you share a brief overview of the current roadmap: Dawn, Dusk, Equinox, and Event Horizon? Also, any details on QCL?

- **Dawn** happened a while ago
- **Dusk** is what is currently in progress
- **Equinox** is after we are done with 2.1 - starts to ramp out a lot of primitives for AWS-style services

With our QCL application runtime, we support general application development. But there will always be things that in a generic MPC execution runtime will be slower than having purpose-built primitives.

For Equinox we are planning:
- Metavirtualization runtime
- Video processing, image processing, and sound processing

**Event Horizon** is where we will start getting into complicated machine learning primitives.

The tech is already technically built into QUIL today. If you look at the RPM crate inside the repository, that is one of the most crucial pieces required as a primitive for supporting secure machine learning. Most machine learning operations are essentially matrix multiplication, and the RPM library is a secure matrix multiplication library.

## AI and Machine Learning on Quilibrium

**Question from G7:** When the network is truly decentralized, will it be possible to have a real AI agent training and inference capable of assisting us in everyday tasks while preserving anonymity and privacy?

We are aiming for the Event Horizon release to focus on machine learning primitives - primarily because they require a lot of compute and we are going to continue to grow overall compute on the network. Focusing on that this soon would potentially strangle the network in terms of where most resources are being utilized and would not be very good for application growth.

## QCL Status

Regarding QCL: that is part of our combined Milestone 5 release for testnet. We will be doing the Milestone 3 release for testnet tonight - in the following hours after this AMA. Milestone 4 and 5 combined is when QCL will pop up.

## NFT Deployment Costs

**Question from Slick:** Assuming I make an NFT contract for Quilibrium (a 10,000 NFT pixel collection with 1.48 megabytes total) - how much QUIL would this cost to deploy? What are ongoing QUIL fees for keeping this collection on the network? Are fees for minting and ownership changes incurred by users?

I appreciate specific numbers to work with.

Roughly for the baseline fee based on current network state - that small a size would be roughly 0.02 QUIL. The multiplier of the dynamic fee market is probably going to be close to about 100x at the near beginning. So to deploy that contract would cost roughly 0.02 QUIL under permanent deployment.

Regarding fees for minting and ownership changes: if you are creating this pixel collection and pre-structuring all 10,000 NFTs with all the ownership info in terms of overall size, then the actual change for minting and transferring that content would be much lower.

But the act of actually interacting with an application and producing new data on the network would cost more because it is creating new data on the network.

## Mining and CPU vs GPU

Mining is using CPU. All of this is using CPU and we can see clear evidence of that. If you were to implement the Wesolowski VDF on CUDA-based runtimes like GPUs, you just cannot execute it as fast as a CPU can.

Individuals running very large clusters are running very large CPU-based clusters. Mining pool operations that cover many coins including QUIL - as part of onboarding for people running flex miners - are running CPU mining code, not deploying CUDA-based code for QUIL. It does not make any sense to.

## Exchange Integration

**Question:** Based on your experience at Coinbase, how easy is it for exchanges to implement native QUIL trading from a technical perspective? Will the fact that QUIL is not a blockchain cause issues?

No.

That is actually the key point about Quilibrium's design - I am coming from experience working at institutions like that.

What causes them to decide whether to list or support an asset has nothing to do with technical complexities. While it matters for how they do it, it does not change the fact that if it is interesting enough they will do it provided they legally can.

Quilibrium being privacy-preserving creates an interesting problem for a highly regulated, risk-averse exchange like Coinbase. When you talk about something privacy-preserving, legal departments immediately hit the brakes.

But the unique attribute of Quilibrium - one of the reasons we designed it the way we did - is that it enables compliance. It enables proving that a token has not been transferred from a particularly known bad actor.

## Emissions and Network State

**Question:** What does the emission of 2.1 depend on? If emissions expand infinitely without consumption, how can confidence be established?

Ultimately emissions do not expand infinitely.

The nature of proof of meaningful work token issuance and emissions behavior is intrinsically bound to the state of the network. As miners operate on the network, they are growing the state of the network.

Even if the only activity was just miner activity (which obviously will not be the case because Quorum exists today), you will eventually incur enough state that emissions would completely halt for this generation.

It is a certainty that emissions will continue to decrease.

## Network Continuation

**Question from Gaon:** Can the Quilibrium network continue to grow in the event that the token no longer has much value? Could node runners have to stop their activity and jeopardize the functioning of the network?

The network will continue to grow regardless of the number of miners. If there are fewer miners, then there are fewer miners. But as long as there is enough to continue replicating the storage of the network, then the network will obviously continue to go.

## How Quorum Uses the Token

**Question from AWAP:** Can you explain in more detail how the native token is used when using different apps? If I understand correctly, node runners receive fees when messages are sent. As a user, do I have to pay a fee every time for sending a message?

With respect to Quorum and how it relates to the network: messages are transient on the network. They do not incur fees.

But data storage on the network does. Things like the image upload service - which handles images larger than message level limits - will incur fees on the network, and node runners receive those fees.

That is the relationship with the token with respect to Quorum. Things like the name market work the same way because you are incurring permanent state.

## User Metadata and Privacy

**Question:** How does Quilibrium Inc. handle user metadata in the Quorum ecosystem? Specifically, does the network inherently detect if a user is connected on multiple devices?

No.

**Question:** Can Quilibrium Inc. or anyone else access details like the number of connected devices, their names, or their activity?

No.

**Question:** What measures ensure that this metadata is either inaccessible or anonymized?

It is encrypted. The only thing that exists as public data is public keys.

## App-Level Metadata Collection

**Question:** How does Quilibrium ensure that applications running on the network cannot collect sensitive metadata such as user location, IP address, or device details?

We cannot stop an app from doing that.

However, by preloading all data slots (as mentioned in the NFT topic earlier), that would be a more expensive operation and has consequences depending on how it is constructed to be much slower.

The nature of building applications on Quilibrium - in order to be efficient and useful - actually encourages designs way less oriented around capturing and having access to as much data as possible.

It actually becomes more expensive to do the evil thing than to do the right thing.

If a user is using an application at the application level of QUIL - interacting with the protocol - they do not have access to that information. An application does not have access to that user's location or IP address or device details.

If somebody builds an application that collects that information, you cannot stop them. But at the same time, people would choose not to use them because they would be very expensive.

## Privacy-First Applications

**Question:** Does Quilibrium Inc. intend to create a portfolio of privacy-first applications to showcase the network's capabilities? For example, could you envision an open-source decentralized e-commerce app where sensitive information is cryptographically deleted after use?

Yes.

That is actually a very common type of application I expect people to move onto the platform. It showcases the unique strengths: being able to keep data in an encrypted context and verifiably prove to the person who provided that data whether or not it is deleted afterwards.

**Question:** How might Quilibrium encourage similar privacy practices from third party developers?

At the end of the day, third party developers will do what they will do. But the nature of how the protocol works makes it more expensive to do the wrong thing just because it is more data.

## Open Source Commitment

**Question:** Will Quilibrium Inc. exclusively develop open source applications?

Yes.

**Question:** How will Quilibrium maintain its commitment to open source values over time and avoid risks seen in organizations like OpenAI which began with open source ambitions but shifted to a closed model?

This is very important and is the reason we chose the AGPL license.

Historically, some projects that became very popular (like databases licensed in more permissive licenses like the GPL itself) ended up getting co-opted by companies like Amazon. They would make their own improvements but because of the license nature, they do not have to contribute back - literally bootstrapping their own company services on the backs of people working on an open source project not being paid for it.

Quilibrium Inc.'s approach is different. We use the AGPL exclusively to prevent companies like Amazon from encroaching on our space and being uncompetitive.

Additionally, we are not using a Contributor License Agreement. Many projects with the AGPL will have a CLA that says if you contribute to this project, you are assigning all copyright to us. That lets a company relicense and become closed source at any time.

That is why we do not do it. We have the AGPL in effect because we want to ensure that everything stays open source and people are required to contribute back - and that includes Q Inc.

## Equal Treatment on the Network

**Question:** Will Quilibrium Inc. operate under the same rules as any other entity on the network? Will it need to pay transaction fees for messages on Quorum or running apps?

We always have. We always will.

With respect to Quorum, when people upload files or images, we have to pay those fees in QUIL. That is partially why we are doing Quorum Apex (our answer to Discord Nitro) - so that when something does have to incur state on the network, we have the ability to pay those fees.

**Question:** Will it be possible to build apps and use them instantly after 2.1 or will it be like spaces which had to wait for an invite?

It is possible for people to build apps and use them instantly after 2.1. It is possible to create spaces on Quorum.

The invite system was just a consequence of trying to roll things out. Public invite links basically work the same way as current invite links - the difference is the roundtrip of communication between peers required to complete the loop.

## Incentivizing Developer Contributions

**Question from Oz:** Are incentives to developers that contribute to open source software like Quorum a common occurrence? What if all needed features were put on an official list and there was a reward for everyone to see?

I cannot speak to the community fund on that - that would be an open question.

We are wanting to incentivize contributions to Quorum. Finding the right way to do that is an interesting challenge.

If you have seen protocols in the ecosystem with bounties (not bug bounties but protocol rewards - you complete this, you get rewarded in the protocol's token), it creates perverse incentives. It results in a lot of low-effort PRs that are just ChatGPT fed. It also creates contention about how those PRs are reviewed, judged, assessed, and given rewards.

For example, the Optimism ecosystem's retroactive grants have so much drama around them because they do not have a good series of concrete rules about what gets rewarded, how it is rewarded, how it is assessed, and how it is transparently assessed.

When we do this, we want to do it thoughtfully, meaningfully, and fairly.

## Timeline for 2.1

**Question:** Will we reach 2.1 at the beginning of February?

There is something I said at the beginning. Rewind and check that.

---

## Closing Thoughts

That wraps up the Q&A. I appreciate people asking hard-hitting questions. As a leader of a project, it is not always fun to hear criticism, but that is literally what every project founder should do. If you are not doing it, you are doing something wrong.

When it comes to concerns about big mining operations, I was very concerned and very responsive and quick to adapt. That is why there are things like the 2.0.6 release and patches that increased time for people running the stock client to issue proofs on time.

We are not always going to get things right. That is the nature of the beast. But we will always try to do things in service of the greater good of the protocol.

Do not fall for narratives because those narratives eventually bite you. When you try to always chase narratives - whether it is memecoins or anything else - you always end up on the losing side if you continue to do it. Narrative plays are gambling. When it comes to any sort of gambling, the house always wins. And in this case, you are not the house.

That is just not a responsible thing to do as a protocol. We are going to continue to do the right thing.

---

*Last updated: 2025-01-29*
