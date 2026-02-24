---
sidebar_position: 10
---

# Qclient Commands

Please see the [QClient 101](/docs/run-node/qclient/qclient-101) guide for details how to use.

## Global Flags

These flags can be used with any qclient command:

| **Flag**                           | **Description**                                                                                   |
|------------------------------------|-------------------------------------------------------------------------------------------------|
| `--public-rpc=<true\|false>`       | Forces use of public RPC endpoint (overrides config setting)                                      |
| `--config <Path>`                  | Specifies a custom configuration file path                                                        |
| `--signature-check=<true\|false>`  | Override signature verification setting                                                           |
| `--dry-run`                        | Preview actions and costs without executing (where applicable)                                     |

## General
| **Command**                        | **Syntax**                                              | **Description**                                                                                   |
|------------------------------------|--------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| **Version**                        | `qclient version [--checksum\|-c]`                                      | Displays the current version of the qclient application. Optionally, can get the checksum for the current binary.                                         |
| **Cross-Mint**                     | `qclient cross-mint [payload]`                                   | Initiates a cross-mint operation for token management across networks (currently supporting Ethereum).                           |
| **Link**                           | `qclient link`                                         | Links the qclient to a specific node or service for easy interaction.                                 |
| **Update**                         | `qclient update [<Version>] [--signature-check]`       | Updates qclient to specified or latest version with optional signature verification.              |
| **Download-Signatures**            | `qclient download-signatures [--version <Version>]`    | Downloads signature files for specified or current version.                                       |
| **Config Create Default**          | `qclient config create-default`                        | Creates a default configuration file.                                                             |


## Token Commands

| **Command**                        | **Syntax**                                              | **Description**                                                                                   |
|------------------------------------|--------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| **Parent Command**                 | `qclient token`                                        | Parent command for all token operations.                                                          |
| **Query Account**                  | `qclient token account`                                | Shows the managing account address.                                                               |
| **Query Balance**                  | `qclient token balance`                                | Displays the total QUIL balance and associated account address.                                   |
| **Query Coins**                    | `qclient token coins`                                  | Lists individual coins owned by the account.                                                     |
| **Query Coins with Metadata**      | `qclient token coins metadata`                         | Lists individual coins with additional metadata (e.g., frame number, timestamp).                 |
| **Mint Tokens**                    | `qclient token mint <ProofHex> [<RecipientAccount>]`   | Mints new tokens using a proof (mintable tokens only).                                           |
| **Transfer**                       | `qclient token transfer <ToAccount> [<RefundAccount>] [--expiration\|-e <Expiration>] <Amount\|OfCoin>` | Creates a pending transaction with optional expiration.        |
| **Transfer Raw**                   | `qclient token transfer raw <JsonTransaction>`         | Advanced transfer with full control over transaction structure.                                   |
| **Split Coins**                    | `qclient token split <OfCoin> <Amounts>... [--parts\|-p <n>] [--part-amount\|-a <amount>]` | Splits a coin with flexible options.                   |
| **Merge Coins**                    | `qclient token merge [all\|<CoinAddresses>...]`        | Merges all coins or specific coin addresses.                                                      |
| **Accept Transaction**             | `qclient token accept <PendingTransaction>`            | Accepts a pending transaction, completing the transfer.                                           |
| **Reject Transaction**             | `qclient token reject <PendingTransaction>`            | Rejects a pending transaction, creating a new pending transaction for the refund.                |
| **Mutual Receive**                 | `qclient token mutual-receive <ExpectedAmount>`        | Initiates a mutual transfer by generating a rendezvous ID for the sender.                        |
| **Mutual Transfer (Sender)**       | `qclient token mutual-transfer <Rendezvous> <Amount\|OfCoin>` | Sends the agreed amount or coin using the rendezvous ID from the receiver.                    |

## Hypergraph Commands

| **Command**                        | **Syntax**                                              | **Description**                                                                                   |
|------------------------------------|--------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| **Get Vertex**                     | `qclient hypergraph get vertex <FullAddress> [<EncryptionKeyBytes>]` | Retrieves and displays vertex data with optional decryption.                           |
| **Put Vertex**                     | `qclient hypergraph put [--domain\|-d <DomainAddress>] vertex [<PropertyName>=<PropertyValue>] [<EncryptionKeyBytes>]` | Creates or updates a vertex with validation and optional encryption. |
| **Get Hyperedge**                  | `qclient hypergraph get hyperedge <FullAddress> [<EncryptionKeyBytes>]` | Retrieves and displays hyperedge data with optional decryption.                     |
| **Put Hyperedge**                  | `qclient hypergraph put [--domain\|-d <DomainAddress>] hyperedge <FullAddress> [<AtomAddress>, ...] [<EncryptionKeyBytes>]` | Creates or updates a hyperedge connecting vertices. |

## Compute Commands

| **Command**                        | **Syntax**                                              | **Description**                                                                                   |
|------------------------------------|--------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| **Execute**                        | `qclient compute execute <FullAddress> [<Rendezvous>] [<PartyId>] [<ArgumentKey>=<ArgumentValue>]` | Executes computation with optional multi-party coordination. |

## Deploy Commands

| **Command**                        | **Syntax**                                              | **Description**                                                                                   |
|------------------------------------|--------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| **Deploy (Default)**               | `qclient deploy`                                       | Parent command that defaults to compute deployment.                                               |
| **Deploy Compute**                 | `qclient deploy compute [--domain\|-d <DomainAddress>] <QCLFileName> [<RDFFileName>]` | Deploys QCL application with optional RDF schema.           |
| **Deploy File**                    | `qclient deploy file [--domain\|-d <DomainAddress>] <FileName> [<EncryptionKeyBytes>]` | Deploys file to hypergraph with optional encryption.      |
| **Deploy Token**                   | `qclient deploy token [<ConfigurationKey>=<ConfigurationValue> ...]` | Deploys custom token with configurable properties.                       |
| **Deploy Hypergraph**              | `qclient deploy hypergraph [<ConfigurationKey>=<ConfigurationValue> ...] [<RDFFileName>]` | Deploys hypergraph schemas and configurations.         |

## Key Commands

| **Command**                        | **Syntax**                                              | **Description**                                                                                   |
|------------------------------------|--------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| **List Keys**                      | `qclient key list`                                     | Lists all available keys in the keystore.                                                         |
| **Create Key**                     | `qclient key create <Name> <KeyType> [<Purpose>]`      | Creates a new cryptographic key with specified alias and type.                                    |
| **Import Key**                     | `qclient key import <Name> <KeyBytes>`                 | Imports an existing key into the keystore.                                                        |
| **Delete Key**                     | `qclient key delete <Name>`                            | Removes a key from the keystore.                                                                  |
| **Sign Payload**                   | `qclient key sign [--domain\|-d <DomainAddress>] <Name> <Payload>` | Signs raw payload and optionally broadcasts to domain.                       |

## Messaging Commands

| **Command**                        | **Syntax**                                              | **Description**                                                                                   |
|------------------------------------|--------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| **Retrieve Messages**              | `qclient message retrieve [<InboxKeyName>]`            | Retrieves messages for specified or all inboxes.                                                  |
| **Send Message**                   | `qclient message send <InboxKeyName> <RecipientInboxKeyAddress> <Message>` | Sends encrypted message to recipient.                              |
| **Show Messages**                  | `qclient message list <InboxKeyName>`                  | Displays stored messages for specified inbox.                                                     |
| **Delete Message**                 | `qclient message delete <InboxKeyName> <MessageId>`    | Removes message from local storage.                                                               |

## Node Commands

| **Command**                        | **Syntax**                                              | **Description**                                                                                   |
|------------------------------------|--------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| **Info**                           | `qclient node info [<ConfigName>] [--latest-version\|-l]` | Gets node information with optional config and latest version check.                           |

### Node Prover Commands
| **Command**                        | **Syntax**                                              | **Description**                                                                                   |
|------------------------------------|--------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| **Prover Merge**                   | `qclient node prover merge <PrimaryConfigPath> [<AdditionalConfigPaths> ...]` | Merges configs for seniority preservation.                        |
| **Prover Pause**                   | `qclient node prover pause [<WorkerId>]`               | Emergency pause for prover with optional worker ID.                                               |
| **Prover Status**                  | `qclient node prover status [<WorkerId>]`              | Lists prover worker statuses, shard assignments, and storage availability.                        |
| **Prover Leave**                   | `qclient node prover leave [<WorkerId>]`               | Initiates graceful prover leave from network.                                                     |
| **Prover Delegate**                | `qclient node prover delegate [<DestinationAddress>]`  | Delegates prover rewards to alternative address.                                                  |

### Node Config Commands
| **Command**                        | **Syntax**                                              | **Description**                                                                                   |
|------------------------------------|--------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| **Create**                         | `qclient node config create [<Name>] [--default\|-d]`  | Creates a new configuration set for the node with a name*. Optionally assign it to be used by the node with the --default (-d) flag. |
| **Import**                         | `qclient node config import [<Name>] [<SourceDirectory>] [--default\|-d]` | Imports config files from directory with optional default flag. |
| **Set**                            | `qclient node config set <Key> <Value>`                | Modify a key in the default config file (keys: engine.statsMultiaddr, p2p.listenMultiaddr, listenGrpcMultiaddr, listenRestMultiaddr). |
| **Switch**                         | `qclient node config switch [<Name>]`                  | Switches the active configuration set to the specified name. If no name is provided, lists available options to choose. |
| **Assign Rewards**                 | `qclient node config assign-rewards [config-name]`     | Assigns reward collection to a specific configuration.                                            |

:::note 
*Cannot use the name 'default'.  This is reserved for node operations.
:::   


## QClient Config Commands

| **Command**                        | **Syntax**                                              | **Description**                                                                                   |
|------------------------------------|--------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| **Print**                          | `qclient config print`                                 | Prints the current configuration settings for QClient.                                           |
| **Create Default**                 | `qclient config create-default`                        | Creates a default configuration file.                                                             |
| **Public RPC**                     | `qclient config public-rpc [true\|false]`              | Sets/toggles defaulting to public RPC usage.                                                      |
| **Set Custom RPC**                 | `qclient config set-custom-rpc [<Url>\|clear]`         | Sets custom RPC URL (format: domain:port) or clears it.                                           |
| **Signature Check**                | `qclient config signature-check [enable\|disable]`     | Sets/toggles signature verification for downloads.                                                |

### Local Alias Commands
| **Command**                        | **Syntax**                                              | **Description**                                                                                   |
|------------------------------------|--------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| **Add**                            | `qclient config alias add <alias> <address>`                | Adds a new alias for a given address, making it easier to reference in commands.                 |
| **Create**                         | `qclient config alias create <alias> <address>`             | Creates a new alias for a specified address (synonymous with 'add').                             |
| **Update**                         | `qclient config alias update <alias> <new-address>`         | Updates an existing alias to point to a new address.                                             |
| **Delete**                         | `qclient config alias delete <alias>`                       | Removes an alias from the list, deleting the reference to the associated address.                |
| **List**                           | `qclient config alias list`                                 | Displays all configured aliases and their corresponding addresses, also returns addresses for local node accounts that have been imported.                               |
