# Node Commands
This is a list of node-specific operations for qclient.

For a complete list of all qclient commands, see [QClient Commands](/docs/run-node/qclient/commands/command-list).

Node commands have a `--config` param that you can use to specify either a directory path, e.g. `/home/user/my-config/` or a name of a config.

---

## Node Prover Commands

### Merging Prover Data

Command:

```bash
qclient node prover merge
```

Description:

The `merge` command consolidates prover seniority data into a single, assigned configuration.

---

### Pausing Prover Activity

Command:

```bash
qclient node prover pause [<WorkerId>]
```

Description:

The `pause` command issues an emergency pause notice to the network for a prover to avoid penalization.

**Parameters:**
- `[<WorkerId>]`: Optional specific worker ID to pause

---

### Checking Prover Status

Command:

```bash
qclient node prover status [<WorkerId>]
```

Description:

Lists prover worker statuses, shard assignments, and storage availability.

**Parameters:**
- `[<WorkerId>]`: Optional specific worker ID (shows all workers if omitted)

**Example Output:**
```
Worker 1: Active - Shard 0x123 (Ring 0) - Storage: 85% available
Worker 2: Active - Shard 0x456 (Ring 0) - Storage: 92% available
```

---

### Initiating Prover Leave

Command:

```bash
qclient node prover leave [<WorkerId>]
```

Description:

Initiates a graceful leave process for a prover from the network.

**Parameters:**
- `[<WorkerId>]`: Optional specific worker ID to remove

---

### Delegating Prover Rewards

Command:

```bash
qclient node prover delegate [<DestinationAddress>]
```

Description:

Delegates prover rewards to an alternative address.

**Parameters:**
- `[<DestinationAddress>]`: Address to receive delegated rewards

**Example:**
```bash
qclient node prover delegate 0x[32-byte hex string]
```

---

## Node Config Commands

### Creating a New Configuration

Command:

```bash
qclient node config create [name] [--default|-d]
```

Description:

The `create` command generates a new configuration set for the node with an optional name (cannot be 'default'). Use the `--default` or `-d` flag to assign it as the default configuration used by the node.

---

### Importing a Configuration

Command:

```bash
qclient node config import [name] <path> [--default]
```

Description:

The `import` command brings in an existing configuration folder from the specified path to the given name, with an optional flag to set it as the default configuration.

---

### Modifying Configuration Settings

Command:

```bash
qclient node config set <key> <value>
```

Description:

The `set` command modifies a specific key in the default configuration file with the provided value.

---

### Switching Configurations

Command:

```bash
qclient node config switch [name]
```

Description:

The `switch` command changes the active configuration set to the specified name. If no name is provided, it lists available configuration options.

---

### Assigning Rewards to Configuration

Command:

```bash
qclient node config assign-rewards [config-name]
```

Description:

Assigns reward collection to a specific configuration.

**Parameters:**
- `[config-name]`: Name of the configuration to assign rewards to

**Example:**
```bash
qclient node config assign-rewards my-config
```

### Getting Node Information

Command:

```bash
qclient node info [<ConfigName>] [--latest-version|-l]
```

Description:

Displays detailed information about the node.

**Parameters:**
- `[<ConfigName>]`: Configuration name to check (defaults to active config)
- `[--latest-version|-l]`: Show latest available version

**Examples:**
```bash
qclient node info
qclient node info my-config --latest-version
```
