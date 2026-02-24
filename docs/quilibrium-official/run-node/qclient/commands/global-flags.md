---
sidebar_position: 9
---

# Global Flags

Global flags can be used with any qclient command to modify behavior, override configurations, or preview operations without executing them.

## Available Global Flags

### Public RPC Flag

Force the use of public RPC endpoint regardless of configuration settings.

```bash
--public-rpc=<true|false>
```

**Usage:**
- `--public-rpc=true`: Forces use of Quilibrium's public RPC
- `--public-rpc=false`: Forces use of local node RPC

**Examples:**
```bash
qclient token balance --public-rpc=true
qclient node info --public-rpc=false
```

:::note
This flag only affects commands that interact with the network.
Local-only commands ignore this flag.
:::

### Interactive Mode

Switches the client to interactive mode, where supplied arguments are requested interactively. Useful for avoiding private inputs being given as command line arguments.

```bash
--interactive=<true|false>
```

:::note
This flag is false by default.
:::

### Configuration Path

Specify a custom configuration directory path.

```bash
--config <Path>
```

**Usage:**
- Can specify a directory: `--config /path/to/config/dir/`

**Examples:**
```bash
qclient token balance --config ~/custom-config/
qclient node start --config /etc/quilibrium/config/
```

### Signature Check Override

Override the signature verification setting for the current command.

```bash
--signature-check=<true|false>
```

**Usage:**
- `--signature-check=true`: Enforce signature verification
- `--signature-check=false`: Skip signature verification (use with caution)

**Examples:**
```bash
qclient update --signature-check=true
qclient download-signatures --signature-check=false
```

:::warning
Disabling signature verification carries risk that the downloaded binaries may be tampered.
Only disable when absolutely necessary and you trust the source.
:::

### Dry Run Mode

Preview operations and estimate costs without actually executing them.

```bash
--dry-run
```

**Usage:**
- Shows what would happen without making changes
- Estimates transaction costs based on current fee market
- Validates parameters and permissions

**Supported Commands:**
- All `deploy` commands
- Token transfers and operations
- Node configuration changes
- Key operations

**Examples:**
```bash
# Preview deployment cost
qclient deploy compute app.qcl --dry-run

# Check transfer feasibility
qclient token transfer 0xrecipient 10.0 --dry-run
```

**Dry Run Output Example:**
```
[DRY RUN] Token Transfer
- From: 0xsender123...
- To: 0xrecipient456...
- Amount: 10.0 QUIL
- Estimated Fee: 0.001 QUIL
- Total Cost: 10.001 QUIL
- Current Balance: 50.0 QUIL
- Status: ✓ Transaction would succeed
```

## Flag Precedence

When multiple configuration sources are available, the precedence order is:

1. **Command-line flags** (highest priority)
2. **Environment variables**
3. **Configuration file specified with --config**
4. **Default configuration file**
5. **Built-in defaults** (lowest priority)

## Combining Flags

Multiple global flags can be used together:

```bash
qclient token transfer 0xrecipient 10.0 \
  --public-rpc=true \
  --config ~/custom/config/ \
  --dry-run
```

## Environment Variables

Some global flags can also be set via environment variables:

```bash
# Set public RPC via environment
export QCLIENT_PUBLIC_RPC=true

# Set custom config path
export QCLIENT_CONFIG=/path/to/config.yml

# Disable signature checks
export QCLIENT_SIGNATURE_CHECK=false
```

:::tip
Environment variables are useful for:
- CI/CD pipelines
- Docker containers
- Consistent team configurations
:::

## Best Practices

### Development vs Production

**Development:**
```bash
# More permissive for testing
qclient token transfer 0xtest 1.0 \
  --signature-check=false \
  --dry-run
```

**Production:**
```bash
# Strict security and verification
qclient token transfer 0xprod 1000.0 \
  --signature-check=true \
  --config /secure/prod.conf
```

### Security Considerations

1. **Always use signature verification in production**
   ```bash
   --signature-check=true
   ```

2. **Use dry-run for large operations**
   ```bash
   qclient deploy token Supply=1000000 --dry-run
   ```

3. **Secure configuration files**
   ```bash
   chmod 600 /path/to/config.yml
   qclient --config /path/to/config/
   ```

### Performance Optimization

1. **Use public RPC for read operations when local node is syncing**
   ```bash
   qclient token balance --public-rpc=true
   ```

2. **Use local node for write operations when possible**
   ```bash
   qclient token transfer 0xrecipient 10.0 --public-rpc=false
   ```

## Troubleshooting

### Common Issues

**"Flag not recognized"**
- Ensure flag is placed after `qclient` but before subcommands
- Check spelling and format (use `=` for values)

**"Configuration not found"**
- Verify path specified with --config exists
- Check file permissions

**"Dry run not supported"**
- Not all commands support dry-run mode
- Check command documentation for support

**"RPC connection failed"**
- Verify --public-rpc setting matches network availability
- Check network connectivity

## Related Documentation

- [QClient Configuration](/docs/run-node/qclient/commands/qclient-config) - Persistent configuration settings
- [Node Configuration](/docs/run-node/qclient/commands/node) - Node-specific configurations
- [QClient 101](/docs/run-node/qclient/qclient-101) - Getting started with qclient