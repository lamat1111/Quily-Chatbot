# Token Bridging Commands
Tokens can be bridged from Quilibrium's network to other networks, and must be signed for the bridge application to complete it's transfer.

### Supported Networks
- Ethereum

### Cross-Mint Operation

Command:

```bash
qclient cross-mint [payload]
```

Description:

The `cross-mint` command initiates a cross-mint operation for token management across different networks. The `payload` parameter is the signed data for the operation.

---

## How to bridge QUIL (native token) to wQUIL (Ethereum token)

:::warning

Beware of phishing sites. Before initiating a bridging operation, always double-check that you are on the correct bridge page: https://quilibrium.com/bridge. If you have never bridged before, it's a good idea to test with a small amount first until you feel confident.

:::

### Prerequisites

* Ethereum-compatible browser wallet
* Enough ETH for gas fees (ETH gas price is dynamic and varies a lot. Prepare at least $50 worth of ETH to be on the safe side. Your bridging transactions should cost less than that in most cases).
* Latest Qclient version installed

### Step-by-Step Instructions

1. Navigate to [https://quilibrium.com/bridge](https://quilibrium.com/bridge)
2. Enter your QUIL account address.
3. **Important**: Save the displayed coin addresses. These are essential for recovery if the bridge operation fails.
4. Select a coin address to bridge.
5.  Execute the `qclient cross-mint [payload]` command shown on the bridge page using Qclient.
6. Copy the Qclient response into the bridge page field (don't press Enter).
7. Run a second `cross-mint` command as shown on the bridge page to verify account ownership.
8. Copy the second Qclient response into the bridge field (don't press Enter)
9. **Important**: Do not refresh the page. Wait for the "Complete Bridge" button to appear, then click it.
10. Approve the bridging transaction in your browser wallet when prompted.
11. Save the transaction ID for future reference on Etherscan.


## How to retrieve your coin address after a failed bridging operation

Usually, you can retrieve your coin address with the `qclient token coins` command.

But in most cases, after a failed bridging operation, that command won't be able to query your coin address anymore.

This is because your coin has been taken out of the Quilibrium network and reserved for minting on Ethereum, but because you did not finish the bridge successfully, the coin has remained in a sort of "limbo".

**This is why you should ALWAYS take note of your coin address before attempting to bridge.**

So, if you can't query your coin address directly anymore (when `qclient token coins` doesn't work), here are 3 alternative methods to find your coin address.

### Method 1: First Format Decoding

This format has your coin address embedded between static strings.

#### Structure

```sh
0x7472616e73666572[your_coin_address_without_0x]1ac3290d57e064bdb5a57e874b59290226a9f9730d69f1d963600883789d6ee2
```

#### Example

```bash
# Original string:
0x7472616e73666572230f39c8656f7914f9ae86de19ab04f2377d651786eb145646209d40423573a21ac3290d57e064bdb5a57e874b59290226a9f9730d69f1d963600883789d6ee2

# Your coin address:
0x230f39c8656f7914f9ae86de19ab04f2377d651786eb145646209d40423573a2
```

> **Note**: The `0x` prefix is omitted in the cross-mint string.

### Method 2: Second Format Decoding

This format combines your Ethereum address and coin address.

#### Structure

```shell
[your_ethereum_address][your_coin_address_without_0x]
```

#### Example

```shell
# Original string:
0xc0ffee254729296a45a3885639AC7E10F9d54979230f39c8656f7914f9ae86de19ab04f2377d651786eb145646209d40423573a2

# Breakdown:
Ethereum address: 0xc0ffee254729296a45a3885639AC7E10F9d54979
Coin address: 0x230f39c8656f7914f9ae86de19ab04f2377d651786eb145646209d40423573a2
```

#### Where to find these Strings in your terminal after a failed bridging operation

You can find the cross-mint hex strings in either:

* Your `.bash_history` file
* By using the up arrow key in your terminal to browse command history

### Method 3: Using Etherscan

If you have a failed transaction:

1. Go to Etherscan
2. Find your transaction
3. Click on "+ Click to show more"
4. Select "Decode Input Data"
5. Look for the `uid` value in the decoded data

#### The bridge "Advanced" mode shows "Unknown Amount" when I paste my coin address.

If you have retrieved your coin address and are trying to finish the bridging process by pasting it directly via the "Advanced" bridge mode, you will see an "Unknown Amount" message.

This is normal, as the bridge doesn't know the amount in QUIL for that coin, since it no longer exists on the Quilibrium network but is already reserved for minting on Ethereum.

You can proceed with finishing the bridge, even if the amount is unknown, and your coin should be bridged successfully.

