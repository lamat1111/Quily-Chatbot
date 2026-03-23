---
title: "QNS (Quilibrium Name Service) FAQ"
source: discord
author: Community (compiled by lamat1111)
date: 2026-02-05
type: community_faq
topics:
  - QNS
  - Quilibrium Name Service
  - names
  - domains
  - subdomains
  - privacy
  - anonymity
  - wallet
  - identity
  - Quorum
  - ENS comparison
---

# QNS (Quilibrium Name Service) FAQ

> **Disclaimer**: This is an **unofficial community-compiled FAQ** based on Discord discussions and public information. While reviewed for accuracy, it is not part of the official Quilibrium documentation. For authoritative information, always refer to official Quilibrium sources.

## Getting Started

**What is QNS?**

QNS is a naming system for the Quilibrium network that lets you use readable names like `yourname.q` instead of long cryptographic addresses, similar to how website domains work but for decentralized applications.

**What can I do with a QNS name?**

- **Messaging identity**: Use `@yourname` on Quorum for easy contact
- **Host websites/apps**: Point to decentralized content at `yourname.q`
- **Unified identity**: Same name across all Quilibrium applications
- **Create subdomains**: Control subdomains like `shop.yourname.q`
- **Future integrations**: More apps will support QNS as the ecosystem grows

**Do QNS names expire?**

No. One-time payment, no renewals. Once purchased, it's yours permanently.

**Where can I buy QNS names?**

https://names.quilibrium.com/

## Working with Subdomains

**Can I create subdomains under my name?**

Yes. If you own `restaurant.q`, you control ALL subdomains under it: `menu.restaurant.q`, `reservations.restaurant.q`, etc. You must set yourself up as an issuer/authority to manage subdomains.

**How does subdomain control work?**

- QNS handles the `.q` top-level domain
- If you own `tech.q`, you have full authority over all `.tech.q` subdomains
- **Nobody can create subdomains under your name without permission**
- You control who can use subdomains and what they point to

**Can I sell or lease subdomains?**

Yes. If you own `coffee.q`, you could sell/lease subdomains like `shop.coffee.q`, `beans.coffee.q`, etc. You have complete control as the parent domain owner.

**Can I use someone else's name as my subdomain?**

The hierarchy works right-to-left, so names at different levels are independent.

Example:
- Alice owns `coffee.q`
- Bob owns `seattle.q`
- Bob can create `coffee.seattle.q` under his `seattle.q` domain
- Bob's `coffee.seattle.q` and Alice's `coffee.q` are completely separate
- Neither can control the other's domain

## Privacy & Anonymity

**Is my QNS name linked to my wallet address?**

No, not by default. When you transfer ownership of a name to a Quilibrium wallet address, they are effectively unlinkable. You would have to explicitly choose to set up your name to resolve your wallet address as metadata for the public to see.

**What information is publicly visible for a QNS name?**

When someone resolves a QNS name, they see:
- The name itself
- The `resolveKey` (your public identity key for Quorum)
- Any metadata you choose to add

For example, resolving `cassie` returns:
```json
{
    "header": {
        "authorityKey": "",
        "name": "cassie",
        "parent": null,
        "createdAt": 1767801112,
        "updatedAt": 1767801112
    },
    "address": "0x2d845efd...",
    "resolveKey": "0x688b4bd746b7d9b7...",
    "metadata": null
}
```

The `resolveKey` is your public identity key for Quorum—**not** your wallet view/spend key.

**Can people see what my wallet owns?**

No. Even if you choose to set your Quilibrium wallet address in the metadata, it reveals nothing about what else that wallet owns.

**How do I stay anonymous with QNS?**

Simply don't add your wallet address to your name's metadata. By default, your QNS name is not linked to your wallet. The only public information is your Quorum identity key (for messaging), which is separate from your financial identity.

## How QNS Compares

**QNS vs. regular domains (.com, .org)?**

Traditional domains require annual renewals and can be seized by registrars. QNS names are one-time purchases that cannot be taken away.

**QNS vs. ENS (Ethereum Name Service)?**

ENS links names to wallet addresses. QNS provides:
- **Richer data**: Quilibrium stores large amounts of data; Ethereum cannot
- **Communication keys**: Automatic keys for secure messaging in Quorum
- **Application hosting**: Points to websites and app resources, not just addresses
- **Better security**: Cryptographic verification without certificate authorities
- **Cheaper**: One-time payment with no renewal fees

**Is QNS like DNS for decentralized apps?**

Yes. DNS translates domains to IP addresses with different record types (web, email, etc.). QNS translates names to identity keys with additional metadata—messaging keys for Quorum, content addresses for websites, or app-specific resources.

## How QNS Works

**What happens when someone looks up my name?**

Format depends on usage:
- **Quorum**: `@yourname`
- **Websites/apps**: `yourname.q`

Behind the scenes:
1. System looks up your identity key
2. Retrieves relevant info (communication keys, content addresses, etc.)
3. Connection established via cryptographic verification

**Why is QNS more secure?**

Traditional web security relies on certificate authorities (CAs). If a CA is compromised, attackers can impersonate sites. QNS records are cryptographically self-verifying—no trusted third party needed.

**Can I access .q websites in regular browsers?**

Not yet without additional tools:
- Browsers with built-in Quilibrium support (as they become available)
- Extensions or proxy tools (similar to Tor for .onion sites)

Components to enable browser support are being built into Quorum's browser integration. Major browsers like Chrome are unlikely to add native support without direct incentive.

## Buying QNS Names

**How does purchasing work?**

1. Search for available names
2. See current price
3. Create and submit payment transaction
4. Transaction broadcasts to payment network AND QNS
5. QNS matches payment to name
6. Success = name is yours; failure = name returns to pool

**Why pay before name reservation?**

Prevents abuse. Temporary reservations before payment would let bad actors lock up names without buying them.

**What if two people buy simultaneously?**

First transaction processed wins. This is competitive but prevents reservation abuse.

**I paid but lost the name. Why?**

1. **Simultaneous purchase**: Someone else's transaction processed first
2. **Transaction failure**: Payment failed, name returned to pool

No queue or retry system exists.

## Technical Details

**What payment networks does QNS accept?**

Check the marketplace for current supported networks.

**How long does acquisition take?**

Depends on:
- Transaction confirmation time
- Network congestion
- QNS verification process

**Can I transfer my name?**

Check official QNS documentation for transfer capabilities.

**Will QNS support traditional domains (.com, .io)?**

QNS is being designed to resolve traditional domains with privacy-preserving queries. Implementation details and availability timeline are not yet documented. Check official channels for updates.
