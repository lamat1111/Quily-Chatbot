---
title: "Building Howler: A Decentralized Discord Clone on Quilibrium"
source: youtube
youtube_url: https://www.youtube.com/watch?v=NxKjcZE338o
author: Cassandra Heart
date: 2024-07-18
type: livestream_transcript
topics:
  - howler
  - application-development
  - passkeys
  - authentication
  - webassembly
  - sdk
  - discord-clone
  - gin-framework
  - rpc
  - wallet-security
---

## Recap from Part 1

In the last stream we covered a few things that are important. We first talked about the very beginnings of all of this - what happened seven years ago in the journey that led to Quilibrium as it is today. We are getting very very close to a really big moment in this protocol's history. On the 20th we will be launching mainnet with 2.0.

Last time we started off with the original proposal for all of this, which was all the way back into the days when I ran a streaming series called Code Wolf Pack. We walked through how do you design Discord from scratch - the basic functional requirements, non-functional requirements, how that works in the web 2 context, and then how we translate things over into working on Quilibrium.

We also dove into some pieces of the network structure and how to actually run a testnet locally, walking through the process of cloning the repo.

## WebSocket Architecture for Low-Latency Chat

One of the things that happens in a lot of chat-oriented apps is that there's a very low latency requirement. Things have to move really quick for users, especially because interactive chats need to respond to events in real-time.

If we're just using pure REST style web services, we'll end up in a scenario where the services themselves can't be fast enough because you'll have this pattern where the UI is just repeatedly polling over and over again. Instead, in a lot of web services today, that's replaced with WebSockets.

The idea is that for initial hydration - when you click on a server or click on a particular channel in Discord parlance - you'll make a request against their web service and it will send you down everything it has. There might even be an application-level cache if you've already done that fetch. But for actual live chat flowing once you're looking at a particular channel, or you have a background subscription to another channel for notifications, all that's being carried over with WebSockets.

## The Howler Repository History

Howler is the build-from-scratch Discord clone. It's a very interesting repository to look at because it uses a language that I don't really code a whole lot in anymore - C#.

A fun little note about Quilibrium's history is that I actually wrote Quilibrium originally in C#. The reason why I ended up switching to Golang was because I was trying to get a much faster performing runtime over WebAssembly, and Go did a much better job of that than the very poor native AOT integration with C#'s Mono runtime.

### Original Architecture

The basic structure of Howler was a CQL-based data store. At the time it was Apache Cassandra instead of CockroachDB, but they're API compatible for CQL. At the database level we had:
- Initial keyspace creation
- Tables for spaces (our equivalent of servers)
- Channels
- Messages
- Basic management functionality

### Federated Authentication Design

We had a two-tier authentication system. In the old design, I was talking about using something like Auth0, but we actually used AWS Cognito for our auth service.

We used that for a centralized repository for authentication so that if somebody claimed a username, that username would apply to any of the federated servers. You didn't run into this weird issue that Mastodon has where you have long strings of username-at-particular-server.

The Auth Gateway concept was a JWT inside of a JWT approach. Instead of the typical three-leg loop with OAuth/OpenID Connect, it was actually a four-leg loop where you would go from one service to the next to the Auth Gateway, back to the UI, and then to the actual federated host server. The purpose was to separate concerns on what auth token corresponded to what, reducing the blast radius if a federated server were malicious.

## Why Redux Sagas Still Have Value

The main reason I used Redux Sagas is that it was one of the few methods that was really well put together for composing interactions without creating queued requests that result in jagged user experience.

For example, if a user is hitting a bunch of different space icons and you were to load each one in sequence as they were clicked, that would suck. Instead, Sagas let you use generator functions that say how you actually want to handle those actions.

With `yield takeLeading`, when somebody's clicking really fast, it will take the very first one rather than inducing that action every single time. It's a way of queue management for user behaviors.

React Query nowadays does have some of these same behavioral components - you can dictate what your particular hooks are going to do in terms of how they're producing interactions. It's the same thing, just a different structural model.

## Updated Howler Structure

The updated Howler has:
- Spaces
- Groups of channels under a space
- Channels
- Messages (text-based, events like user joined/left, replies, embeds for videos/audio)
- Reactions and mentions
- Role management

## PassKey Integration for Quilibrium

What's coming with 2.0 is our JavaScript-based SDK. The JavaScript SDK integration has actually been on the Quilibrium website for a while - people who have been toying around with the labs have been using a really early version of our SDK.

### Browser Compatibility Challenges

Chrome has done something frustrating where they originally had large blob support and then completely shelved it. Reading between the lines, it seems to be about not wanting to support a standard that Apple is pushing. They've been pushing pseudo-random functions (PRF) instead of large blob storage.

PRF is fine, but it's not supported in the current version of Safari. Safari 18 is supposed to support PRF, but so far in the technology preview beta, every time I try to create a passkey using PRF it immediately crashes the browser.

For Howler, we can use passkeys directly without having to deal with large blob or PRF, so it'll work in either browser.

### Why PassKeys Matter for Security

When you build an application on Quilibrium, you're not thinking things through in the same context of other web3 environments where you need to integrate wallet APIs, set up WalletConnect, wait for WebSocket connections, or have users scan QR codes. You just use the browser's passkey and you're done.

Some people recently had their wallets compromised and lost wrapped QUIL because of it. This happens because the Ethereum security model is fundamentally flawed. The way people use wallets is information dense but actionability low - users aren't provided with enough information to take adequate action.

There's this nonsense where a user can go to a website doing typo squatting (like "Quilibrium" with three L's) that looks like our site but has a wallet drainer. When wallet drainers put an approve message, users' wallets are frequently less sophisticated at handling message signing versus transaction signing.

What's the easiest way to solve this? PassKeys. Every interaction with a passkey is done locked to a domain. When you authenticate, your passkey will not work on other domains. For it to work on another domain, you have to perform a delegated action on Quilibrium itself.

### Domain-Locked Keys

The Quilibrium model is completely separated - a walled garden. For every domain you have a different key. You don't work in the same context as Ethereum where all your assets are under one given address managed by one key.

If you want to send money to somebody, you have to follow a delegated flow that interacts with the browser to redirect you to your literal wallet address. Every single application would have to have a presentment layer saying "here are the consent options for this particular application."

This shifts the burden from wallet makers (who can't possibly become experts in every application - that's the halting problem) to the contract or application being responsible for telling you what interactions you can expose, what consent flows you can create, and what that actually means.

## Building the PassKey Login Flow

First, we need the user to produce a passkey. The SDK has all the necessary components you need to integrate with Quilibrium either directly or indirectly through a tertiary service.

Key components needed:
- PassKeys context
- PassKey modal
- WASM exec implementation
- WASM bundle

The PassKeys context will load the WASM runtime. The SDK automatically detects if a passkey already exists - if present, it shows "Sign in with PassKey"; otherwise, it shows "Create Account."

For HTTPS requirement: if it says "not secure" in the browser bar (HTTP instead of HTTPS), when you try to do WebAuthn-based interactions it will just fail.

The username needs to be specified because otherwise it just shows the raw Quilibrium address, which users won't understand or remember.

## Backend Server Architecture

This is where you'll be writing Go. The main reason for using Gin is to be a simple web server.

### Desktop Application Model

In this design, you have an intermediary HTTP server doing delegated calls via REST and WebSockets that actually calls to the network itself. You basically have the single page application as the front-facing component on an Electron-based application, and the Electron application kicks up a backend server it's communicating with.

When you start Discord, you're starting the Discord application. Behind the scenes there's actually a Node server that's the backend of the frontend, handling all sorts of intermediary calls. Same concept, except instead of connecting to a third-party server, you're connecting to the Quilibrium network itself.

### Web Application Model

In a general web application context, you would either:
1. Do direct RPC calls against public nodes
2. Have a dedicated server proxying calls appropriately

If you do the backend server route, you have a centralized component. If your goal is to avoid centralization, architect towards pure RPC calls.

### Mobile

On mobile you can do the raw RPC model. Android lets you do the server-based model too; iOS probably doesn't. But either way you can make raw RPC calls - the browser can't do raw gRPC, but mobile can.

## Setting Up the Go Backend

Using Gin web framework:

```go
func main() {
    router := gin.Default()
    // CORS middleware for browser compatibility
    router.Use(corsMiddleware())
    router.GET("/spaces", getSpaces)
    router.Run(":5173")
}
```

For Quilibrium integration, you need to set up a light node inside the server application that can delegate requests:

```go
// Create blossom sub (light node)
// Bootstrap peers for local testnet
// Peer store setup
// Listen multiaddr
// Peer private key
```

The replace directive in go.mod tells the source resolver to use a local file path instead of the repository URL. The expectation is that the Howler API instance and the ceremony-client repository are living side by side in the same folder.

## Schema Compliance

Converting Howler API types (defined as JSON) into the RDF schema format is important for Quilibrium applications. While yes, it's just writing Go, we have certain practices like schema compliance and enforcement that enriched schema enables:

1. Efficient indexing
2. Explicit delegated consent calls between applications
3. Full documentation immediately in front of the user's face with no question about it (not mysterious hex bundles)

## Network Scale Context

On the dashboard, the node count has been floating around between 27,000 to 37,000. Even at 27,000, comparing to other networks doing onion-based routing like Tor (roughly 8,000 regular nodes and 2,000 exit nodes), we're roughly triple the size of Tor.

Everything we do with releases has to be incredibly thoughtful about how we launch features and how they interact with the rest of the world. A network that is anonymous, decentralized, and uncensorable requires careful thought about handling the abuse case, or that will become the primary use case.

## Future Architecture: Event Horizon and Equinox

The end state is to be essentially AWS majority APIs compatible. By that point you would have running virtual machines inside of Quilibrium that can run all the basic web server stuff you need, exposed through NPCTLS.

In a distributed context, there's no specific ethernet adapter to emit out of, so you need a different model. Because Quilibrium's entire context is multi-party computation, we would take packets that are specifically TLS packets and use an MPC-based process to reform the actual TLS packet formation and sending/receiving over the MPC-based network.

---

*Updated: 2026-01-29*
