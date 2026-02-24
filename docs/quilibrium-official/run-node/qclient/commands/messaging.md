---
sidebar_position: 8
---

# Messaging Commands

The messaging commands enable secure, encrypted communication between addresses on the Quilibrium network, providing privacy-preserving messaging capabilities.

## Overview

Quilibrium's messaging system provides:
- End-to-end encrypted messages between addresses
- Multiple inbox support for enhanced privacy
- Message storage and retrieval
- Privacy controls to minimize correlation

## Message Management Commands

### Retrieve Messages

Fetch new messages from the network.

```bash
qclient message retrieve [<InboxKeyName>]
```

**Parameters:**
- `[<InboxKeyName>]`: Optional specific inbox key to retrieve messages for

**Behavior:**
- Without inbox specified: Retrieves messages for all inbox keys (lower privacy, increases correlation)
- With inbox specified: Retrieves messages for specific inbox only (higher privacy)

**Examples:**

Retrieve all messages (all inboxes):
```bash
qclient message retrieve
```

Retrieve messages for specific inbox (recommended for privacy):
```bash
qclient message retrieve private_inbox
```

:::tip
For maximum privacy, always specify an inbox key name rather than retrieving from all inboxes at once.
This reduces the ability for network observers to correlate your different identities.
:::

### Send Message

Send an encrypted message to a recipient.

```bash
qclient message send <InboxKeyName> <RecipientInboxKeyAddress> <Message>
```

**Parameters:**
- `<InboxKeyName>`: Your inbox key to send from
- `<RecipientInboxKeyAddress>`: Recipient's inbox address
- `<Message>`: Message content to send

**Example:**
```bash
qclient message send my_inbox 0xrecipient123...def "Hello, this is a private message"
```

:::note
Messages are automatically encrypted using the recipient's public key.
Only the recipient with the corresponding private key can decrypt and read the message.
:::

### Show Messages

Display stored messages for a specific inbox.

```bash
qclient message list <InboxKeyName>
```

**Parameters:**
- `<InboxKeyName>`: Inbox key name to show messages for

**Example:**
```bash
qclient message list private_inbox
```

### Delete Message

Remove a message from local storage.

```bash
qclient message delete <InboxKeyName> <MessageId>
```

**Parameters:**
- `<InboxKeyName>`: Inbox containing the message
- `<MessageId>`: ID of the message to delete

**Example:**
```bash
qclient message delete private_inbox 0xmsg001
```

:::caution
Deleting a message only removes it from local storage.
The sender may still have a copy of the sent message.
:::

## Privacy Considerations

### Multiple Inboxes

Using multiple inbox keys provides several privacy benefits:

1. **Identity Separation**: Different inboxes for different purposes/identities
2. **Reduced Correlation**: Harder to link activities across inboxes
3. **Selective Disclosure**: Share specific inbox addresses as needed

**Example Setup:**
```bash
# Create different inboxes for different purposes
qclient key create work_inbox x448
qclient key create personal_inbox x448
qclient key create marketplace_inbox x448
```

### Retrieval Strategies

**High Privacy (Recommended):**
```bash
# Retrieve from specific inboxes separately
qclient message retrieve work_inbox
qclient message retrieve personal_inbox
```

**Convenience (Lower Privacy):**
```bash
# Retrieve from all inboxes at once
qclient message retrieve
```

## Message Encryption

All messages are encrypted using:
- **Sender Authentication**: Messages are signed by the sender
- **Recipient Encryption**: Only the recipient can decrypt
- **Forward Secrecy**: Past messages remain secure even if keys are compromised

## Best Practices

### Inbox Management

1. **Create Purpose-Specific Inboxes**: Separate inboxes for different activities
2. **Rotate Inboxes Periodically**: Create new inboxes for enhanced privacy
3. **Secure Key Storage**: Backup inbox keys securely

### Message Hygiene

1. **Regular Cleanup**: Delete old messages to reduce storage
2. **Verify Senders**: Confirm sender addresses before trusting content

### Privacy Protection

1. **Use Specific Retrieval**: Always specify inbox when retrieving
2. **Limit Address Sharing**: Only share inbox addresses when necessary
3. **Monitor Activity**: Regularly check for unexpected messages

## Common Use Cases

### Secure Communication
```bash
# Alice creates an inbox
qclient key create alice_inbox x448 Messaging

# Alice shares her inbox address with Bob
# Bob sends a message
qclient message send bob_inbox 0xalice_inbox_address "Secure message content"

# Alice retrieves and reads
qclient message retrieve alice_inbox
qclient message list alice_inbox
```

### Anonymous Marketplace
```bash
# Create anonymous inbox for marketplace
qclient key create anon_market x448 Messaging

# Share address only for specific transactions
# Retrieve messages privately
qclient message retrieve anon_market
```

### Multi-Identity Management
```bash
# Different identities with separate inboxes
qclient key create identity1_inbox x448 Messaging
qclient key create identity2_inbox x448 Messaging

# Retrieve for each identity separately
qclient message retrieve identity1_inbox
qclient message retrieve identity2_inbox
```

## Troubleshooting

### Common Issues

**"Inbox key not found"**
- Verify the inbox key exists: `qclient key list`
- Create the inbox key if missing: `qclient key create <name> x448 Messaging`

**"Message decryption failed"**
- Ensure you have the correct private key for the inbox
- Verify the message was sent to the correct inbox address

**"No new messages"**
- Check network connectivity
- Verify the sender has the correct recipient address
- Try retrieving from all inboxes to debug

**"Message send failed"**
- Verify recipient address format
- Check network connectivity

## Related Commands

- [Key Commands](/docs/run-node/qclient/commands/key) - Create and manage inbox keys
- [Token Commands](/docs/run-node/qclient/commands/token) - Manage QUIL for message fees
- [Hypergraph Commands](/docs/run-node/qclient/commands/hypergraph) - Store message references