---
title: "Quilibrium 2.1 Release Timeline and Q Console Walkthrough"
source: youtube
youtube_url: https://www.youtube.com/watch?v=nJ3Ny94CGCU
author: Cassandra Heart
date: 2025-04-02
type: livestream_transcript
topics:
  - Q Console
  - Q Storage
  - Q KMS
  - version 2.1
  - S3 compatibility
  - node configuration
  - website hosting
  - encryption
  - MPC
  - templates
---

## Quilibrium 2.1 Release Timeline

We got through QCL and consensus sidecar testing over the past week and we are now in a good state to set a date for 2.1 to be available on mainnet. We are planning on doing the cut of the build roughly April 9th, and then that'll give some time for folks to get upgraded and reconfigure their nodes to handle the relative setting changes.

Targeting a cutover date for mainnet at April 14th. That frame number has been announced - it's frame 244,000, roughly April 14th at 12:00 AM UTC.

### Configuration Changes for 2.1

The reason we have such a long frame to go over before the update rolls out is that there are some configuration changes, especially if you're running a cluster. The nature of 2.1 is a shard-based model - the workers are going to be maintaining their own shards, they're going to have their own stores, unless you choose to configure the master worker node being the primary store. There's a few configuration settings that will need to be handled.

There's also networking-related settings that will need to be handled. Currently everything has been going over libp2p and that has worked really well for the message passing layer, but as our testing has been going on testnet, we found that certain things we've been using with P2P - namely the streams feature for streaming data over individual connections between peers - has some serious issues depending on the OS it's running on.

I've noticed this issue is less prominent on Mac OS but is very apparent on Linux. What seems to be happening is that it's causing it to stutter as data is being sent over and it's not a very reliable transport. Instead, we're going to be having a secondary port that node operators will need to expose.

We're going to be releasing an upgrade guide. When this build is cut and people will be able to upgrade to it, we're going to have a detailed instruction set on what you need to do in order to change your node to work functionally with this. If you have a relatively standard build - if you've basically just been using one of the community scripts or you've been using the auto-release script - it should be a pretty seamless upgrade. But if you do have a relatively bespoke system that's on a cluster, you're going to want to pay attention to that upgrade guide.

## Kora Mobile Beta

The Kora mobile beta is coming out this week. We got a form out there and it very quickly got hit through the limit, which was cool to see, so I had to raise up the limit to unlimited so people could continue to put their email address on that to be enrolled into the beta.

When the beta is released you will get an email with instructions on how to set that up on TestFlight, or if you're on Google through the Google Play beta, or if you're running just a regular Android phone we'll just send you the APK directly and have a separate feedback channel for that.

## Q Console Overview

For those who have been very familiar with the development of Quilibrium, you'll know that our big hairy audacious goal is to essentially replace Amazon Web Services. Part of that has been building out services that are compatible with AWS's offerings.

The way we're targeting our initial offering is primarily Amazon S3 and Amazon Key Management Service. The reason we target those two is because they are very low hanging fruit - they're very expensive to use on Amazon, they're very easy to fit into the Quilibrium network as native offerings, and by consequence it's one of the easiest go-to-market strategies with the highest amount of potential immediate growth for a customer base.

### Cross-Account Asset Sharing

One unique component of Q Console that we find really cool is the ability to share assets between different accounts. With Amazon Web Services you can do IAM account linking and delegate downwards to a series of accounts, but in terms of cross-sharing there's a very limited surface area.

The reason from Amazon's perspective is that the people using AWS traditionally are going to be in a silo - they put their projects on AWS, launch them, expose them, and the world uses them. In the decentralized world there's a lot of places where you would actually want to have composability between assets.

## Q Storage Demo

Q Storage uses a very simple management interface. The API itself is actually 100% compatible with the Amazon S3 API. If you use the existing AWS tooling, you can do whatever type of configuration you want.

### Creating and Using Buckets

You create a bucket, name it whatever you want following the same naming conventions and rules as AWS, and we have a nice drag and drop interface for you to put your assets into. When you have it in public bucket mode, you just literally drag and drop your assets over.

### Website Hosting

The files in a public bucket are very straightforward - you literally point at the given endpoint bucket name and then access that index path. The same thing you do with S3 APIs: when you create a bucket and want to make it a website bucket, you can link it to a domain name.

The basic process is you set your DNS records up accordingly so that the CNAME is pointing to the bucket domain name. In the ultimate case of where the Q Console APIs live, it'll be essentially `bucketname.qstorage.quilibrium.com`.

### Full S3 API Compatibility

The API supports:
- The ability to tag items
- All sorts of esoteric configurations with different policies at the bucket or object level
- Object lock and legal hold policies (more important for enterprise style customers)
- S3 Select (this is probably the weirdest one we have because it's a little complicated and there may be some edge cases)

## Q KMS (Key Management Service)

Q KMS allows you to create different key types either for the purpose of encryption and decryption, signature verification, or producing message authentication codes.

### Symmetric Encryption Example

For a simple encryption case using symmetric default (AES to encrypt data):
1. Create a key and give it a name
2. Provide tags the same way you do with AWS
3. Put in plain text data (we'll have a switcher for plain text or hex)
4. Encrypt your data using the interface or APIs directly
5. Get an output cipher text

We provide that cipher text immediately in a test decryption mode so you can decrypt that text and verify it works. You can schedule deletion, and at that time it will actually delete the key material. You can cancel it and reenable it. Key rotation is also supported.

### Elliptic Curve Keys for Crypto

For those in the crypto sphere, handling elliptic curve keys is very relevant. For those unfamiliar with AWS KMS, one important thing to understand is that the output data from the AWS APIs is in DER (Distinguished Encoding Rules) format. This has a lot more bytes packed around the actual data that most people would care about.

If you are typically a wallet developer building a crypto wallet, your familiarity with keys is almost always in the raw format. While the AWS-compatible APIs remain 100% compatible with DER encoding, our actual outputs include the raw format. If you want to utilize the raw format for interacting with crypto protocols, you can get that directly. We offer both the raw output and the DER encoded output.

### MPC Integration

Keep in mind this is doing MPC. In demo mode, I have it running the corresponding client-side MPC operation within Q Console itself, but as a configuration step you can dictate where that lives and how that runs.

## Templates and Composability

The way templates essentially work is: when you've created a bucket that contains something like a virtualizer with a target name for the file type, you can publish that as a template. Other people can clone that bucket, drop in the exact file that is specified as the pluggable item, and when they expose their own bucket they're exposing a fully contained virtualizer.

### Farcaster Frames Integration

For the Farcaster community with the advent of Frames V2 mini apps, we're wanting to support the ability to make it very easy to convert an existing website into a frame. We have a template available that will let you drop in your website (as long as it has assumptions about root path) and it will wrap that and provide the relevant meta tags necessary to expose it as a frame. We'll also step you through the process of generating the signature needed to make it appear correctly in the mini apps section of the Farcaster app.

## Verifiable Encryption

The way that data is stored on Q Storage uses a process called verifiable encryption. If you don't have a public bucket where you don't have the key basically provided through the Q Storage proxy, then this data is encrypted at rest and only accessible to those who hold the key material themselves.

When you're using the browser interface you are essentially creating a delegate key that allows you to do that through the browser, but at the same time the encrypted data remains encrypted on the actual S3 API level. If you're trying to use the standard S3 APIs without using a Q Console-created key to dispatch all the proxy calls for you, you'll end up not being able to decrypt the data you're getting back.

## Migration Plans

### Quilibrium Website Migration

The Quilibrium website will be migrated over to Q Console as part of the 2.1 rollout. We are currently using GitHub Pages for hosting a lot of different web assets. We're also using Cloudflare's R2 to handle releases of our nodes themselves.

When we launch with 2.1, we're going to be migrating all of Quilibrium's web app assets, our documentation, and the releases themselves entirely onto the network so it will become self-hosting.

### Quorum Migration

We're also going to move Quorum onto this as well. One important thing to think about with the nature of how the web app for Quorum works is that right now the way we're hosting it today is a centralized place - the website itself is hosted on a centralized domain service, we have a singular DNS for accessing it, we have a singular file host for where that web app is hosted.

While all of the stuff on the back end is itself decentralized because it's using the Q network, the front end stuff isn't - and that is actually a potential vector of what could be attacked theoretically. So we're moving Quorum to it as well. Basically anything we're using current static file hosts for - whether it's GitHub Pages or otherwise - we're moving it all onto Q Storage itself.

## Performance and CDN-Level Speed

From a user experience perspective, we put a lot of engineering work into the way that static hosting and buckets exposed for public consumption works. We have several layers of tiered caching involved in the design so that it's actually very amenable to high-throughput requests. You're essentially going to be seeing CDN-level performance in terms of how fast the response times are.

## Multi-Account Hierarchy Support

We do support the AWS-style multi-account hierarchical feature now on the Q Storage API and the Q KMS API.

## Censorship Resistance

Quilibrium is basically the embodiment of this notion that the internet perceives censorship as damage and routes around it. If there's a host for it and you can route to the host, you can access the data on QUIL. If a node does not wish to propagate a public asset (which means there is a known address associated with it), nodes can choose to not host it. But at the end of the day, if there is a node that's hosting it and you have a route to that node, you have access to that information regardless of whatever censor says you shouldn't.

---
*Cleaned: 2025-04-02 | Updated: 2026-01-29*
