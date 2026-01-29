---
title: "Quilibrium 2.1 Emissions, Q Storage Pricing, and Quorum Mobile Beta"
source: youtube
youtube_url: https://www.youtube.com/watch?v=yd2Kqckc5VI
author: Cassandra Heart
date: 2025-04-04
type: livestream_transcript
topics:
  - 2.1 update
  - emissions
  - Q Storage
  - Quorum mobile
  - QUIL token utility
  - web hosting
  - privacy
  - scalability
---

## 2.1 Update Testing and Mainnet Transition

We have quite a bit of specific cases we're going to test out as we roll this out. The core premise is that this is going to be what essentially the network will proceed to do on mainnet the moment that the cutoff frame has been reached. We just have preempted the rebuild of the store into the hypergraph already, so we can skip that conversion step as we test this out.

## Emissions After the 2.1 Update

Will emissions drop after the 2.1 update and how much do you expect them to drop if so? I can answer that directly. Because we have been doing the conversion of the mainnet state in the testnet environment, we actually have a really good measurement of what the overall network state will look like in terms of total storage.

At this point, given how many gigabytes of data have roughly been encoded into world state in the overall hypergraph of the network, we're actually looking at an emissions rate of roughly 102 QUIL per emission interval, which is 10 seconds globally. So we're seeing a very significant drop off with the 2.1 update.

## Quorum Mobile Beta Launch

When can we use the Quorum mobile beta? If you haven't signed up for the beta, we have a form that we've posted a few times on Twitter. Feel free to sign up. All it asks for is an email so that we can get you set up on either TestFlight or Google Play Store for the beta. If you want to use an unlocked, de-Googled Android phone, we can also send you the APK directly.

To answer the question of when: we are going to start rolling this out the evening of Friday, in other words tomorrow. Stay on the lookout if you already signed up for the beta. You should be getting an email around how to access that tomorrow.

## History of Quilibrium Development

How long have you been building Quilibrium for? This is more of the deep lore. I actually started the origins of what Quilibrium came to be about seven years ago, which is really crazy to think about now. Obviously at that time it was not even remotely what it is today. It was more of a hobby project and the original goal was to just build an alternative to Discord. We didn't even have the notion of a peer-to-peer version at that time. It was a federated version, felt kind of similar to Matrix. But yeah, it definitely changed a lot over seven years in ultimately becoming an AWS alternative.

## Q Storage Pricing Comparison with AWS

Can you make an approximate cost comparison between Q Storage and AWS S3 or other cloud providers? We're trying to stay as competitive as possible with AWS. AWS has relatively cheap pricing for the storage itself; where they get you is the egress. If you have a lot of requests on that data, it ends up getting really expensive really fast.

What we're doing is we're going to emulate their free tier in terms of how much data you can store without having to pay a fee. We're going to be offering 5 GB of storage free, and then subsequent data added on will have its own pricing tiers.

How that pans out with respect to egress is that the network itself has a model where when you're doing queries, you're paying to evaluate the query for that data. The way that we do that with our S3 compatibility layer is we do have some upper level caching. If you're doing a public S3 bucket, we have additional layers of caching that makes the data readily available without having to reexecute queries.

The overall cost is going to be very deeply competitive in terms of egress because we're essentially underwriting the egress when it comes down to executing the query on the network. At the proxy layer where the data is being served up exactly like if you put S3 through an API gateway or some other kind of layer to proxy to it, we're cutting past all the costs around that so that it is as cheap as humanly possible. Our target is to compete with the current cheapest alternative to S3, which is Cloudflare's R2.

## QUIL Token Utility

What is the utility of the QUIL token? The utility of the QUIL token is to deploy data, deploy applications, and execute applications on the network. It's the network's equivalent to a unit of interchange for performing whatever interaction needs to be done on the network.

If companies and users can pay in fiat or stablecoins for services, how do you see the token's utility evolving? That actually comes back around to the notion of what is distinct between Quilibrium Inc. and Quilibrium the protocol.

Quilibrium the protocol is the decentralized MPC platform as a service. Quilibrium Inc. is a company that provides managed services that run on top of Quilibrium the protocol. Our S3 compatibility API is a convenience layer so that people can store data on a hypergraph in an efficiently packed format that retains all the security properties that the encrypted hypergraph offers.

If you are wanting to store data in a private bucket versus a public bucket, you'd be storing it on the hypergraph in the verifiably encrypted format. You can rest assured that the data is stored exactly the way you intend it to be, but is only accessible to you.

When it comes to how Quilibrium Inc. is surfacing that, we try to make it feasible for people who want to have predictable billing in terms of whatever their regional currency is. It's not as much of a mental shift to move from a platform like AWS where they are paying in fiat to using the Q Console and the related managed services. Same concept, you're paying in fiat, but we also do offer the ability to pay in the QUIL and wrapped QUIL tokens.

## How QUIL Token is Used for Network Fees

When data is being stored to the hypergraph, that directly corresponds to a fee. When applications are deployed to the network, in terms of these QCL-based applications, that also requires a fee. When you execute applications on the network, that requires a fee. When you query data on the network, if you're not running a node that is holding that data yourself, that also requires a fee. Just like any other crypto protocol out there, it is a fee consumption-oriented network. You still have to pay to use the network.

## Quorum Apex Subscription Service

What is Quorum Apex and how will it work exactly? Quorum Apex is going to be our alternative to Discord Nitro. There's going to be some unique benefits in terms of what an Apex subscriber can do on Quorum.

One of the most compelling things that is surprisingly not something Discord really does is: when you boost a server on Discord or subscribe to a space on Quorum, both of those things have very similar perks associated with it. But the distinction for Quorum is that if you are a subscriber to a space, the space actually gets a revenue split of the overall QUIL tokens that were used to pay for the Apex subscription.

In other words, it's what Nitro Boosting should have been in the first place. If you make a really great community, why wouldn't you get some sort of reward in the subscriptions that you've received? That's the way that we're approaching it with Quorum Apex. You pay for a month of Quorum Apex and it splits out to up to four subscriptions to different spaces that you're in. You can obviously subscribe multiple times to the same space, same way you would do with Nitro Boosting.

## Privacy and Anonymity on Quilibrium

Someone living in a dictatorship country that has no freedom of speech, being an activist can put them in jail for trying to express political opinions. Hosting a blog on Q for journalists, will it make it impossible for governments to track any IPs? Will they be safe 100%?

I'll break that down into a couple of different concepts that are important to understand. People try to find privacy on the web in different ways today. They'll use proxies, either a VPN service or something like Tor, and depending on the nature of where you are, what you're doing, what you're intending to do over that proxy, and how you're doing it all has different effects that can potentially expose you.

Tor in of itself is kind of notoriously known as something that's botted to hell by state actors. But those state actors are in certain countries, they're not in all countries. For example, if you are a journalist that is wanting to expose a report from a whistleblower that is based out of Brazil or Chile or something like that, on Tor you don't have state actors that are flooding the network with peers from those countries. Demasking the identity of that journalist or the whistleblower is practically impossible.

Whereas if it was somebody based out of the US or Germany, which are the two major countries that have dominated Tor in terms of node coverage to unmask identities, you could consider yourself compromised.

Why I mentioned this is that Quilibrium is a permissionless protocol. People can run nodes anywhere. We leverage approaches that make it much harder in comparison to something like Tor to unmask the identity of somebody who has transmitted data on the network. That being said, there's still going to be some degree of self-sufficiency and self-awareness that you're going to have to have when you are engaging in any sort of interaction on the network.

One thing I can explain in simpler terms is if somebody hosted a website on Q for example, and that website had JavaScript that does browser fingerprinting and identifies a user, that's what the creator of that site can do. Quilibrium does not prevent that because all of what Quilibrium is being used for in that case is hosting a website. I want to be very explicit that being safe 100% still requires some self-sufficiency in terms of understanding what you're doing in order to avoid any sort of overall surveillance.

## Scalability for Large User Bases

If a big tech company has a big number of users, let's say 100 million daily active users, if they wanted to migrate to Q, will Q be able to handle such high traffic of users? And if we said two billion users like Facebook, is this theoretically possible?

Realistically, the way that we have designed Q is very similar to the shared nothing architecture of Silo. What is important to understand about that approach in the design is that the resource locking that would be required to manage an individual user's resources does not interfere with any other user's resources.

When you're using an ERC-20 on Ethereum, for example, the way that works is it's a smart contract that has storage that provides a mapping of all the user addresses to a given balance of whatever ERC-20 that contract is referring to. If you make a modification like you transfer a token, you're just updating the balance values on those two different accounts in the mapping of those account addresses to the balances. In order to do that at a contract level on Ethereum, this is happening in a single-threaded execution context. They don't have to do any locking, but the downside is you can literally look at how many transactions per second under high load that Ethereum can actually handle. It ends up being a very severe bottleneck.

Our application design is meant to be as relatively conflict-free as possible so that if you did have two billion users that are individually creating transactions that do not have conflicts with one another, they can all happen in parallel instead of having to be processed in serial.

## Web Hosting on Q Storage

There were two questions around cost: one is the cost of hosting a website on Q, the other is if there's free hosting options available. As I mentioned earlier, our Q Storage service does have a free tier that is essentially 5 gigabytes of data free. While not every website would necessarily be able to take advantage of that to host their website in full for free, there's certainly quite a few out there that have relatively minimal payloads that could fit within the free tier.

Are there additional costs for security backups or performance upgrades? No, that's not something that we tack on. The notion of replication amongst peers is baked into the protocol. You will not have consensus if you don't have a sufficient coverage of data on the network. Security is also a mandatory component of the network. The nature of how data is stored on the network itself is through verifiable encryption. These are not value adds; these are table stakes for us.

How does Quilibrium ensure fast loading times for websites? That's a little bit more complicated of a question. The Q Storage API in the public bucket proxy, which is what would be used to ensure fast loading times for websites, that's more of an engineering question of the managed service rather than Quilibrium the protocol itself. In terms of fast execution of queries on the network, that's obviously going to be contingent on a number of factors including the nodes that are processing that query at a given time. But it's something that as the network continues to grow will improve.

In short, yes, you can host websites on Q Storage. The overall response time, the latency that we're measuring for Q Storage, we're trying to keep it in terms of tens of milliseconds in response times. We employ a lot of layered caching techniques to try to minimize the amount of time it takes to serve a response.

Can people migrate an existing website? Yes, as long as it's a static page, that's what Q Storage can support. In terms of running a back-end service on Q, that's something that would have to happen at a later time.

Do I need to buy a domain separately? Yes, we're not offering domain hosting or domain management yet. We'll give you the necessary CNAME values you have to configure in order to route your domain to the public bucket, but in terms of actually offering domain services, no. There's several good hosts out there, and depending on the nature of your concerns with respect to domain providers, there's certainly good recommendations out there.

Is there a step-by-step guide or tutorial videos available? Not yet. We are going to start doing a lot of developer-facing content after the 2.1 release.

## Q Console and Fiat Payments

Will customers pay in the QUIL token and if yes, are they buying it in the background or paying in dollar, what exactly is happening there? This is related to questions about Q Console. The way that we're handling that in terms of what users are paying: if a user pays Quilibrium Inc. in fiat to utilize the network with the managed services, Quilibrium Inc. has its own amount of tokens that we have earned by running nodes the same as everyone else.

In terms of how we actually pay for services on the network directly, we are paying for services on the network directly the same as anybody else deploying anything to the network. We're not a specially privileged actor in this space. Literally, if somebody is wanting to host a website and they're using the Q managed services and deploying it through Q Console, it's still ultimately settling to the network as data on the hypergraph. That means that we have to pay for that data on the hypergraph, and that data gets paid for in the network native token.

## Website Rebrand Timeline

When can we expect the website revamp with the new brand design? More on that soon. It's still in progress, but we're getting pretty hopeful about the timing of things. I can't say for sure when all of it will be ready, but we're going to roll it out all at once rather than piecemeal things out so that it doesn't cause any confusion because we're applying this rebranding and redesign to everything. Very excited to present that, but we're going to wait until everything is all in one ready to go.

## Upcoming Week and Closing

This week's going to be a very intense week. We're going to be rolling out the release candidate of 2.1. Tomorrow we're going to be rolling out the Quorum mobile beta. There's a lot in flight. Very exciting week to follow, and I look forward to seeing you all again this Sunday where I'll be going through how to build applications directly on Q with QCL.

---
*Last updated: 2026-01-29*
