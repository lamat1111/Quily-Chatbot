# Alias Commands
This is a list of alias-specific operations for qclient. 

For a complete list of all qclient commands, see [QClient Commands](/docs/run-node/qclient/commands/command-list).

## Overview
Aliases are designed to create shortcuts for referencing commonly used account addresses in token operations and increase confidence that the address is input correctly (if it works the first time it should continue to work correctly in the future).

This list is saved in the local QClient config file (`~/.quilibrium/qclient-config.yml`) and is not backed up and cannot be referenced by anyone else.

## Example Usage
After adding alias 'example':
```bash
qclient config alias add example 0x1234565abcdefg
```

You can now reference this in your qclient token commands.
### Transfering a Token Using an Alias
Transfer the token, `0xsome21334token`, to the `0x1234565abcdefg` address.
```
qclient token transfer --to example --coin 0xsome21334token --alias
```

:::note
You must include the `--alias` flag in order to tell the software to look up the alias. 

Token operations are not set to look up aliases by default as users may wish to manually input addresses without using aliases.
:::


## Adding a New Alias

Command:

```bash
qclient config alias add <alias> <address>
```

Description:

The `add` command creates a new alias for a given address, making it easier to reference in other commands without needing to use the full address.

---

## Creating a New Alias

Command:

```bash
qclient config alias create <alias> <address>
```

Description:

The `create` command is synonymous with `add` and creates a new alias for a specified address.

---

## Updating an Existing Alias

Command:

```bash
qclient config alias update <alias> <new-address>
```

Description:

The `update` command modifies an existing alias to point to a new address, allowing you to change the reference without deleting and recreating the alias.

---

## Deleting an Alias

Command:

```bash
qclient config alias delete <alias>
```

Description:

The `delete` command removes an alias from the list, deleting the reference to the associated address.

---

## Listing All Aliases

Command:

```bash
qclient config alias list
```

Description:

The `list` command displays all configured aliases and their corresponding Account addresses. 

:::info
The list will also return Account addresses for local node accounts that have been imported.
:::