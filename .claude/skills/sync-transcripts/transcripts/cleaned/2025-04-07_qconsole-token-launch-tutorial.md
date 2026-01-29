---
title: "Q Console Token Launch Tutorial - Schema Definition and QCL Methods"
source: youtube
youtube_url: https://www.youtube.com/watch?v=Dvxnlm0nMhU
author: Cassandra Heart
date: 2025-04-07
type: livestream_transcript
topics:
  - Q Console
  - token launch
  - QCL programming
  - schema definition
  - RDF
  - hypergraph
  - Q Storage
  - MPC
  - tokenomics
---

## Market Context and Historical Parallels

Obviously, as a lot of people have noticed, the economy is absolutely bonkers right now. Both the traditional stock markets, foreign, domestic, doesn't really matter. Everything's kind of going chaotic right now. One thing that's really important to understand even when we're in situations that have never happened, it's important to keep in mind that no matter what, it's never as good as it seems and it's also never as bad as it seems. Things always keep moving.

In the past I've drawn some parallels to three major industry crashes. One I point to a lot and I have a much broader talk about on YouTube is the hobby computer market and the similar nature it has to the current crypto market of today. But I've also drawn comparisons to the video game industry collapse in the 1980s and also the .com bust in the early 2000s.

There are a lot of cases that history likes to repeat itself. The first of course is one of the most infamous. We have one of the largest industry titans out there today, Amazon. In Amazon's early days during the dotcom bust era, Bezos was taking this fledgling company and bringing it to newer heights. But people who felt like they knew better than him kept telling him that the peak was in and he should sell now, that he should just sell to Barnes & Noble and call it a day. He didn't and we now know Amazon to be an industry behemoth.

Similarly, during the early days of the hobbyist computer era, there were two young scrappy hippie-looking individuals that wanted to bring personal computers into everyone's home and investors just couldn't understand these people. They didn't believe it was even possible because what they knew as computers were just too industrial. And of course, that company was Apple.

And last but not least, the game industry. In the 1980s, when the video game industry had collapsed, Atari was the previous titan that took the industry down with them essentially. And nobody really expected that a company that was known mostly for its trading cards and some arcade cabinets was going to completely change the way that the gaming industry was from that point forward. And that was of course Nintendo.

I draw these parallels because it's important to understand that during these types of turbulent times, these are the times that dynasties are made.

## 2.1 Launch Update

2.1 is slated for the 14th, at frame 244,200 as the cutoff frame. It's looking like it's going to be more midday on the 14th now. It was originally slated for midnight but obviously the network's frame rate is not consistently at a stable rate, so it's hard to guesstimate when that cutoff's actually going to land, but right now it looks like it's going to be the 14th midday.

## Proof of Meaningful Work Emissions Clarification

This is something that came up from the previous space and I wanted to add some clarity to it because there was some confusion. There was a question where somebody asked what emissions are going to look like in 2.1 and I pointed out that the proof of meaningful work algorithm and the overall global state that we're going to be launching into 2.1 with is going to put it roughly at 102 QUIL per interval maximum.

Somebody aptly noted that the current frame rate of the network and the current issuance rate per frame in conjunction with the new frame rate of 10 seconds and 102 QUIL per interval is actually roughly the same. So what people were wondering about is how can I say that the issuance rate is actually going to be diminished.

The reason is because of the nature of how proofs work. If the network fully has all of the shards individually accounted for with workers, then the maximum issuance rate can be met. But if it can't and workers are doing what I have referred to as multiproofs (multiple shards within a single proof), then the issuance rate is actually lowered such that it follows an inverse square root rule.

For example, if the network were at 102 QUIL per interval and there were only enough workers such that two shards had to be covered for every single worker instead of one shard per worker, then you're dealing with 102 QUIL divided by the square root of two. It's very easy for me to come to that conclusion when there is significantly more shards than there presently are workers today.

## Q Storage Static Web Hosting Demo

This is the onboarding experience and I wanted to walk people through what that's like because this is actually a really strong reflection of what using the Quilibrium SDK for your own projects is going to produce in terms of how onboarding experiences work.

On the Q Console itself, dealing with the same type of infrastructure, we create an account and it uses the same passkey style flows that people have already become familiar with.

One of the things that I brought up in the last stream was how we utilize Q Storage to do static web hosting. We have since actually moved a whole bunch of stuff over to Q Storage. All of the main Q assets have been migrated, we just need to do the total DNS flip.

To demonstrate that, if you go to www.quilibrium.com you end up with the Quilibrium website hosted on Q Storage and similarly with all the other assets.

### Creating a Static Website Bucket

The way that basically works is you create a bucket. We have the documentation for Quilibrium, it's a static page that's built using the tool Docusaurus.

When you create a bucket, you have an endpoint like qstorage.quilibrium.com/docs-demo. If we were to try to visit that right now, we would get the typical response of not being allowed for public usage because it's not been permitted.

Originally I had it set so that the defaults on buckets created on Q Console were public and I quickly realized that the number of people that were going to run into issues with that not being familiar with the nature of S3 buckets being public being an issue would be quite a problem. So now they are default non-public but you can configure it.

To configure the bucket, you set the website with a 404.html as the error document. Then you can drop files over, very simple process. You can see that we got it very fast. This is actually using the production Q Storage APIs even though the Q Console instance is running localhost.

And that's it. That's how simple it is to put a static website on Quilibrium. This obviously is a much easier experience than people might be familiar with when you're using Amazon or even Cloudflare's R2. We tried to make this as smooth of a process as possible for people who want to do the most basic things most quickly.

However, the Q Storage APIs are 100% compatible with the S3 APIs minus some very specific edge cases that require Amazon infrastructure to work in the first place, but a lot of surprising things work as well. If you have really complex business requirements that you weren't able to use R2 for example but you had to use S3 because of things like legal holds or object locks, we support them and you're able to use it the same way you use the S3 APIs.

## Q Console Projects

The nature of how Q Console works is you manage things in terms of either the raw services that you're interacting with to just get straight to the point of whatever it is that you're trying to launch, or if you have a more comprehensive project where you need to assemble a couple of resources and may require resources from other projects, you would construct a project.

What we're going to do with this test project is something that a lot of teams have wanted to know how to do: how do I launch a token on Quilibrium?

## Schema Definition with RDF

Now that we have this project, I'm going to go ahead and define a schema. This is our schema editor. Should feel very right at home if you've ever used something like Visual Studio Code. It's a full syntax highlighted editor, actually using the Monaco editor from Visual Studio.

We have a basic RDF schema that defines a token. I'm going to walk through what the RDF syntax looks like because there's a couple of different syntax varieties and we're using the turtle syntax.

### Why RDF for Quilibrium Schemas

In RDF you are defining a document schema that tells you how to relate over data. We define schema here and the reason is because there's not going to be flat data that we incorporate through a schema itself. Instead we're actually going to define that in code.

Having these types is really valuable. If you read the white paper, one of the things that I mentioned is the notion of how RDF types are very efficiently mappable to overall hypergraph structures. Because of the nature of that mapping, you actually get implicit queryability for free. When you have types that are bound to RDF triples, it actually becomes a very efficient way to self-index without having to define those indices yourself.

### The Problem with Centralized Indexers

One of the things I noted about the nature of a lot of web3 protocols is that in those protocols, you end up having to build out a lot of boilerplate. For example, let's say I deployed an ERC20 on Ethereum. Great. Now, how do I ask who all has these ERC20s? How do I know the addresses? How do I get the balances? How do I do anything to interact with this?

What ends up happening is you either have to write an indexer yourself, which is an application that will take the series of events that happen on Ethereum and then index them into a data structure that you can more efficiently query, or you end up paying to use a centralized indexer, which is what almost everybody does.

This is actually one of the most profoundly centralizing aspects of most cryptocurrencies today. They don't have efficient self-indexing. By consequence you end up having to rely on just a handful of parties which devalues the whole purpose of a decentralized protocol.

What we did is we opted instead to use RDF as the basis for how types are defined on our network because it becomes efficiently self-querying or self-indexing. That way you don't have to rely on a third-party indexer. You can talk to the protocol itself and you can get that data indexed efficiently.

### Schema Structure

When we define a schema, the first thing you need to do is have a base type that dictates what all non-prefixed entities are going to be namespaced under. In this case we default to the basic schema repository as our base.

We have a few prefixes which are relatively standard. We define our RDF and RDF schema prefix as the given sources and then there is a prefix of QCL. If you are writing an RDF schema that has nothing to do with tokens, you will need at least these four things.

When we're defining types, it's really helpful to individually categorize those types with a distinct namespace, especially if you're going to be having those types shared across multiple applications that might not necessarily use all of the types. That way it creates less overload of what you have to import and what relationships are constructed.

## Token Schema Design: Account and Coin Types

### Account Type

The most basic is an account. An account would hold a lot of tokens. The purpose is that you have a single unitary basis from which you can get some simple primitive data. What does an account have? It has a balance. It has a public key. But the balance is going to be something that's a calculated property, something that we're going to continually update through interactions with coins.

### Why Separate Coins from Accounts

Why would we use coins instead of a pure account balance like Ethereum does? The problem, and this has actually been a real issue with Ethereum, is that when it comes to doing any sort of compliance related concerns, you end up having an issue.

If you have a single singular balance that represents all of your account's coins, you have a compliance problem. Say for example, you have a business, you have an account on a given network like Ethereum and you are receiving tokens from a whole variety of different potential customers. Let's say that one of those customers is actually a sanctioned entity in your country, you can't do business with them, but because it's a permissionless network, they can just send you tokens and you can't do anything about it.

In a case where tokens are individually partitioned into discrete quantities that came from different individuals, that's fine. You just have something that is essentially stuck, frozen, don't interact with it, and you're done. But on Ethereum, everything's mixed together. The moment that a sanctioned entity sends you a token, you have had your account poisoned and now you have to go through this long process to actually be in the clear when you want to actually use your funds.

So that's what we essentially did here: we have a coin as a separate unit from the account. We do have a balance for useful metadata, but the coin is the actual object that we're going to be dealing with.

### Type Definitions

An account is a class. If you're familiar with object-oriented programming, that should feel very familiar. Then we have this attribute called type. Type dictates to the QCL output what you're actually dealing with: is this something that is extrinsic that is stored on the network on the hypergraph itself, or is this something related to the actual execution of a method.

When you have types that you're storing on the network, type is extrinsic. When you have types that are being fed into as inputs of a method, you have a type of either garbler or evaluator.

Every single method is going to at least return bool. But at a minimum if you're going to be messing with data on the hypergraph, you have evaluative outputs like: is it going to update these? Is it going to create new ones? Is it going to delete?

### Property Definitions

For account properties, we have total_balance which is a property of account and then we choose domain which is of a type called qcl:uint or unsigned integer. One thing that's important with types like unsigned integers, byte arrays, and integers themselves: you have to define a size. In the case of dealing with integers, you're talking about total bytes (32 bytes). Same thing with byte arrays (57 bytes for public keys).

What's important to understand is how that actually translates into QCL types: it's going to be turned into bits for you for unsigned integers and integers, and it's going to remain bytes for byte arrays.

The ordering doesn't really matter in the same way that it does with other protocols like Ethereum where you have to come up with clever byte packing ways to manage your types. You just define the size and it slices accordingly.

### Coin Type

Coin has the same type (extrinsic, it lives on a hypergraph). It has a balance (unsigned integer, 32 bytes). The range property or attribute is how you take a property and assign it to a class. Then we have the owner_account and lineage. These three properties constitute a coin.

### Pending Transaction Type

When somebody wants to actually send a coin, you create what is called a pending transaction. One of the problems with protocols like Ethereum is that it's permissionless such that if somebody sends you a coin, you can't refuse it and worse it's actually fully embedded with your overall account balance.

But in the case of 2.1, we have what is called a pending transaction which you can accept or reject. It has a few components:
- **to_account**: dictates where this transaction is going
- **refund_account**: which might not be the original sender if they wish to retain privacy
- **of_coin**: a reference to another coin

### Request Types for Methods

There's two parties of every single method in QCL. One is always the garbler, one is always the evaluator, but sometimes the evaluator is just "network" which is a default parameter meaning there's no input from the evaluator side.

The method name dictates how it is able to be separated in terms of namespacing versus what you will end up seeing in the generated QCL. If it does any sort of interactions that create, update, or delete data then it will have a corresponding update, create, or delete extrinsic return type, and at the end it must have a bool.

We have an accept_request and a reject_request for accepting or rejecting a pending transfer. The first argument is the pending_transaction and a signature component.

### Schema Validation

When you're defining a schema, obviously if you're not very familiar with RDF, you're going to want to validate it. It does get pretty picky about things like basic syntax elements. If you're missing something like a period at the end of a given attribute assignment, it will say that there's a problem there. But when you correct all those you'll have "schema is valid."

## QCL Code Generation and Programming

Once you create a schema, the next thing we do is write some code off of it. This is going to be the bulk of what we cover because I'm going to enumerate some of the very important differences between QCL and Golang. Historically I've just said "just write Go," and that's great but there are some nuances to care about.

### Generated Types

When you click on your schema, it brings up automatically generated QCL types. You can see them all. The methods that were defined on those request payloads now appear as individual tabs here.

There are some built-ins. In traditional Golang, you need to have imports. QCL does support imports, but there are some imports that are actually just default imported always. For example, dealing with the hypergraph's extrinsics is already imported for you, so you already have the basic hypergraph methods.

You'll also notice there's a lot of tags related here that help define relationships, because if you have a hypergraph extrinsic as your given type for a field, that's not helpful to the network to know which extrinsic it is. So this helps define those relationships.

We have marshallers just like any other marshallers in Golang. They take data from raw bytes and unmarshall them, or they will take a given type and marshall them.

The extrinsic object has literally only one field: the ref, which is the address value where that given reference exists on the hypergraph.

## Writing the Create Transaction Method

For accept flow, we have a single garbler input and no corresponding evaluator. So it gets set to this default of "relay" which is a parameter that says anyone can participate in this as a node. It has the corresponding outputs of hypergraph update_extrinsic, update_extrinsic, and create_extrinsic.

### Retrieving and Verifying Data

The first thing you'll want to do is interact with the hypergraph to retrieve that data. We have some primitives that have been built for you to request that data.

```go
coinBytes, err := hypergraph.RetrieveExtrinsic(request.OfCoin)
if err != "" {
    return nil, nil, nil, false
}
```

We end that with false because every method has to at least end in a boolean value as the response type. This is how we can tell the network that everything evaluated so far has terminated in failure. It's a singular bit that is put as the output wire so we can know that all the related changes that happened are null and void.

Once we have the coin in terms of bytes that we've retrieved from the extrinsic, we need to actually extract it:

```go
coin := UnmarshallCoin(coinBytes)
```

We then take the account out of this data as well:

```go
accountBytes, err := hypergraph.RetrieveExtrinsic(coin.OwnerAccount)
if err != "" {
    return nil, nil, nil, false
}
account := UnmarshallAccount(accountBytes)
```

### Signature Verification Using Intrinsics

One of the things you may have noticed in the create_transaction_request is that we have a signature component. Specific algorithms can be really expensive to do in MPC if you're just defaulting to garbled circuits. One of those is without a doubt signature verification.

One of the things we did in testing of the Bedlam compiler and circuit garbler was an ED25519 signature, and that takes a much longer time than using a purpose-built algorithm. Instead we're going to use the sign.verify method instead of an MPC baked-into-garbled-circuits version of the verification method because that would be much more expensive and we can do this more efficiently.

We have an intrinsic that does the verification:

```go
hash, err := extrinsics.Hash(coinBytes, accountBytes)
if err != "" {
    log.Error(err)
    return nil, nil, nil, false
}

verified := sign.Verify(account.PublicKey, hash, request.Signature, "")
if !verified {
    return nil, nil, nil, false
}
```

### Creating Updated Extrinsics

We create an updated account structure with the total balance minus the coin's balance:

```go
updatedAccount := Account{
    TotalBalance: account.TotalBalance - coin.Balance,
    PublicKey:    account.PublicKey,
}

updatedAccountBytes := MarshallAccount(updatedAccount)
updatedAccountExt := hypergraph.Update("account", coin.OwnerAccount.Ref, updatedAccountBytes)
```

We update the coin, setting the owner to nobody and updating the lineage:

```go
updatedCoin := Coin{
    Balance:      coin.Balance,
    OwnerAccount: hypergraph.EmptyRef(),
    Lineage:      bloom.Add(coin.Lineage, coin.OwnerAccount.Ref),
}

updatedCoinBytes := MarshallCoin(updatedCoin)
updatedCoinExt := hypergraph.Update("coin", request.OfCoin.Ref, updatedCoinBytes)
```

The bloom intrinsic applies the previous owner account to the lineage of that coin. This is how we do MPC-based private set intersection of history without actually revealing the history of a coin.

Then we create the pending transaction:

```go
pendingTxBytes := MarshallPendingTransaction(pendingTx)
pendingTxExt := hypergraph.Create("pending_transaction", pendingTxBytes)

return updatedAccountExt, updatedCoinExt, pendingTxExt, true
```

We return true because it was successful.

## Mutual Transfer: MPC Privacy-Preserving Transactions

What makes MPC so useful here is one of the things that MPC can do that basic protocols can't. Let's say I'm wanting to send you some QUIL tokens and you're wanting to receive said QUIL tokens, but neither of us actually wants to know who the other party is.

In order to do that, if you create a pending transaction you have to know who the recipient is. The recipient might not know the sender but the sender has to know the recipient. Rather than create multiple legs of pending transactions to masquerade who the recipient is ultimately, you can actually just use MPC to do that and that's a lot more efficient.

We have this notion of a mutual transfer. Our garbler ends up on the left side, but the evaluator is an actual type this time: the mutual_transfer_recipient_request object.

### Understanding Garbled Circuits in QCL

One thing you need to understand that's different about what QCL is versus programming in a traditional language: it is creating a garbled circuit for you behind the scenes. When you actually execute this code, you are creating a garbled circuit.

What that means is that it is a computational circuit where the inputs are effectively private for each given side. You are filling in the value as a sender and the recipient is filling in their value as the recipient, and neither party sees each other's inputs despite this method being very transparent.

So we have fetched the coin from the sender, we have fetched the account of that coin, we have fetched the destination account of the recipient, and all of those things are able to happen. We're able to perform interactions mutually as two individuals in this equation without actually revealing any of those inputs to each other.

### Signature Verification for Both Parties

Normally when you're hashing data for a proof that you have the key and you're permitting that data to be sent over, you would have more inputs to the signature. But in this case, we don't know who the sender is, and we can't sign it interactively because that would be incredibly expensive. So instead, we just have the signature up front as part of the request payload.

Both parties hash and verify:
- The recipient proves they have the address and have the right to modify this
- The owner of the coin is signing the coin to prove they have the right to modify this

Individual verifications happen for both the sending account and the recipient account.

### Streaming Circuit Optimization

Given the nature of streaming circuits, there's a certain order that you should do things. Your circuit can get better performance if you structure the verification checks appropriately. Given the nature of streaming circuits, this is also a bit more defense in depth.

For mutual transfer, there's no pending transaction that gets created. Instead, we just have three different updates executing on the hypergraph:
- Updated sender account extrinsic
- Updated recipient extrinsic
- Updated coin extrinsic

And then return true because it was correct.

## Next Steps: SDK and Deployment

This is not available in the preview today, but we also generate the boilerplate for interacting with those methods using the JavaScript SDK wrapper. That's what we're actually going to dive into in the next broadcast.

What that's going to be useful for is basically closing the loop on this and creating a website where people can obtain the token from an airdrop or something. Once you've deployed this and added it to your project, that SDK wrapper is being added to the project as a pluggable resource.

Like I was talking about in the previous session about Q Storage having pluggability as a supported thing, we have a template that lets you create a basic web page for importing that JS SDK wrapper and using it to create a token launchpad.

We're also going to cover:
- The actual deployment process
- The generated SDK
- Wiring that through with Q Storage
- If you wanted to have a dedicated Mint authority for controlling the airdrop, wiring in QKMS and its SDK so that you can use MPC wallets to manage your airdrop distribution securely
- Launching it as a website

## Upcoming Schedule Note

The space that we normally do on Wednesday/Thursday depending on time zones, we're going to not do that this week because we're going to be fully heads down on getting 2.1 prepared for release signing and any sort of final sanity checks around that to be ready for launch day.

---

*Last updated: 2026-01-29*
