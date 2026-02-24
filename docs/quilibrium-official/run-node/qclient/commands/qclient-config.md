# QClient Config Commands
This is a list of configuration operations for qclient. 

For a complete list of all qclient commands, see [QClient Commands](/docs/run-node/qclient/commands/command-list).

## Printing Current Configuration

Command:

```bash
qclient config print
```

Description:

The `print` command displays the current configuration settings for QClient, allowing you to review all active settings.

---

## Setting Public RPC Usage

Command:

```bash
qclient config public-rpc [true|false]
```

Description:

The `public-rpc` command sets the configuration to always use a public (or custom) RPC endpoint for network interactions. This is called using a 'light-client'. 

Use `true` to enable this setting or `false` to disable it.

---

## Setting a Custom RPC Endpoint

Command:

```bash
qclient config set-custom-rpc <endpoint>
```

Description:

The `set-custom-rpc` command overrides the default light client RPC (Quilibrium's public RPC) with a custom endpoint of your choice.

Must be specified as a URL and port without http/https prefix: e.g. `rpc.quilibrium.com:8337`

---

## Configuring Signature Check

Command:

```bash
qclient config signature-check [enable|disable]
```

Description:

The `signature-check` command allows you to persist a signature check setting for all future QClient commands. 

Use `enable` to enable signature checking or `disable` to disable it.

## Using Account Aliases

Alias Commands are listed [here](/docs/run-node/qclient/commands/alias).