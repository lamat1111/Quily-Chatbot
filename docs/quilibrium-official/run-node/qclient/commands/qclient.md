# General QClient Commands
This is a list of general operations for qclient. For a complete list of all qclient commands, see [QClient Commands](/docs/run-node/qclient/commands/command-list).

## Displaying Version Information

Command:

```bash
qclient version [--checksum|-c]
```

Response:

```bash
Version: x.y.z
```

Description:

The `version` command displays the current version of the qclient application. Using the optional `--checksum` or `-c` flag will also show the checksum for the current binary, which can be useful for verification purposes.

---

## Linking to a Node or Service

Command:

```bash
qclient link
```

Description:

The `link` command connects the qclient to a specific node or service, making subsequent interactions easier by not having to specify connection details repeatedly.

---

## Updating the QClient Application

Command:

```bash
qclient update
```

Description:

The `update` command checks for available updates to the qclient application and applies them if found, ensuring you have the latest features and security patches.

---

## Downloading Signatures

Command:

```bash
qclient download-signatures
```

Description:

The `download-signatures` command retrieves necessary signatures for the current version's binary, which may be required for verification or operation of certain features.
