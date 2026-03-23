---
title: "Quorum Notifications and Privacy Architecture"
source: discord
author: Cassandra Heart
date: 2026-02-02
type: discord_transcript
topics:
  - Quorum
  - notifications
  - privacy
  - k-anonymity
  - mobile
  - iOS
  - Android
  - security
  - Signal comparison
---

# Quorum Notifications and Privacy Architecture

## Overview

Quorum is a peer-to-peer encrypted messenger created by Quilibrium Inc. that runs on the Quilibrium network. This document explains the **proposed notification system design** currently being built for Quorum, including how it will handle push notifications while maintaining user privacy, and the security considerations for users in high-risk situations.

> **Note**: The notification features described in this document are **under development** and not yet available in the current Quorum release.

## The Notification Challenge

### Platform Limitations

iOS and Android do not permit applications to run background processes continuously. This creates two main workarounds:

1. **Silent Notifications**: The OS can send a silent notification to "wake up" a background process that checks for new messages. However, there are limits to this, and "intelligent" throttling ensures the number of successful wake-ups is proportional to how often you use the app.

2. **Periodic Background Workers**: Apps can periodically run a background worker to check for messages. This leads to poor notification timeliness since checks happen on a set schedule, meaning the notification rarely arrives when the message actually occurred.

### The Privacy Issue

Traditional messengers like Signal track enough information to know when your device should receive a notification. While Signal doesn't know the content of the message, they do know that *your* device should be notified. Signal layers on Trusted Execution Environments (TEEs) as part of their solution to claim they don't "know," but for all intents and purposes, they do know—regardless of the hardware blindfold they apply.

Quorum's approach: **We do not track anything.** This means from the dispatch proxy side, there is no way to know when a message should result in a notification for you.

## Quorum's Proposed Notification Solutions

The workarounds being built for Quorum will offer users a choice between two approaches, each with different privacy/convenience tradeoffs:

### Option 1: Periodic Polling (Maximum Privacy)

- **How it will work**: The app will periodically run a background worker to check for messages (approach 1.b)
- **Privacy impact**: None—no tracking or external notification triggers
- **Tradeoff**: Notifications can lag by up to 15 minutes
- **Best for**: Users who prioritize privacy over notification speed

### Option 2: K-Anonymity Buckets (Balanced Approach)

For users who opt-in:

1. **Bucket Assignment**: You will choose a bucket (0-255) for which you assign ping events from inbox addresses
2. **K-Anonymity**: Buckets are intentionally small because the goal is to minimize the degree to which you can be identified. Other users will also end up in the same bucket as you (k-anonymity principle)
3. **How it will work**: Your device will receive silent notifications to wake up the background worker and check for messages. If you received a message, you'll see the actual notification. If not, the background worker goes back to sleep
4. **Critical privacy feature**: The bucket choice is deterministic. When your device subscribes for notifications, it won't be registering your device as the receiver for specific inboxes—it will be registering for that *bucket* only

**Privacy impact**: Small tradeoff—you're part of an anonymity set, not individually identifiable

**Expected notification speed**: Instant (or near-instant depending on OS scheduler priority based on app usage frequency)

### OS Scheduler Behavior

iOS and Android have their own schedulers that may deprioritize background notification workers based on app usage:
- **Regular users**: Notifications arrive instantly
- **Infrequent users** (once a week): May experience a few minutes of delay

## Similar Privacy Pattern: QNS Lookups

A similar tradeoff is already implemented for how Quorum supports lookups for Q Name Service (QNS) names under Quilibrium stealth keys:

1. Your view key deterministically chooses a bucket
2. The response data includes many other names that you don't own
3. Your device actively filters out those names and shows only the ones you do own

This breaks direct linkability while still enabling the lookup functionality.

## Security Considerations for High-Risk Users

### Background Worker Vulnerability

Signal doesn't publicly tell users this, but when you opt-in to displaying message content in notifications, you're telling Signal to hand over the decryption keys to the background worker. The worker does its best to purge key material as soon as decryption completes, but notifications occur in a less-privileged context.

**This has been exploited**: Forensic tools like Cellebrite and others have exploited this mechanism. There was an undisclosed vulnerability in Signal's background worker that was being actively exploited by state actors (since resolved).

### Quorum's Planned Approach

Users will be able to avoid this vulnerability by having notifications not show message content. In this mode, Quorum will simply show "you have received a message" without decrypting the content in the notification context. Quorum intends to provide clear explanations of why users might choose this option.

### Design Goal for High-Risk Users

Quorum is being designed so that users in dangerous situations with state actors (e.g., protesters in Iran, journalists working with informants) can feel confident that if their phone is confiscated:

**With biometric auth enabled and stronger security settings, they will be safe.**

### Recommended Security Practices

1. **Enable biometric authentication**: On iOS, long-pressing the power button (which brings up emergency and shutdown options) locks down the phone so biometric auth no longer works—requiring the password instead
2. **Disable notification content display**: This prevents decryption keys from being handed to the background worker
3. **If going to a risky location**: Consider not having your phone turned on at all

### Legal Context (United States)

- You **cannot** be compelled to reveal a password
- You **can** be compelled to use your thumbprint or Face ID scan if enabled
- The iOS power button long-press is the quick path to disable biometric auth in an emergency

*Note: Other countries have laws around forced disclosure of encryption keys. Journalists and activists may actively choose to take legal consequences for not disclosing, compounding safety for their sources and contacts.*

## Future Considerations

### Duress Feature (Out of Scope Currently)

Some Android forks have a duress feature where "unlocking" with a duress code switches into a different partition entirely, revealing nothing. This was also a feature of TrueCrypt.

Quorum could potentially add a duress feature where visible (in-memory) data is limited to a safe dummy account. However, this is currently out of scope since users who face this as a risk factor would already take stronger measures like the ones described above.

