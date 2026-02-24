---
title: QClient Setup
sidebar_position: 2
---
# QClient Setup

## Installing the client
There are two common methods in which installation can be done for the initial install of qclient:

### Scripted Installation
This install will require sudo in order to create the /var/quilibrium/ directory in which binaries are installed and to create a symlink/shortcut.

```bash
curl -sSL https://raw.githubusercontent.com/QuilibriumNetwork/ceremonyclient/refs/heads/develop/install-qclient.sh | sudo bash
```

This will script downloads the binary and signatures, place them into the `/var/quilibrium/bin/qclient/<version>/` directory and then create a symlink so you can access your install in any directory.

### Manual Installation

1. Check for the latest qclient release's file names [here](https://releases.quilibrium.com/qclient-release).
2. Download the files for your Operating System (Linux or Darwin) and Architecture (amd64 or arm64), each file can be downloaded from:  
   ```
   https://releases.quilibrium.com/<filename>
   ```
3. Make the qclient binary executable (the file that does not have a .dgst or .sig file extension):
   ```bash
   chmod +x <filename>
   ```
4. Ideally, these should be located at `/var/quilibrium/bin/qclient/<version>/` so to keep the location consistant with future updates with qclient (it's the default install path). 

Subsequent installs/updates can be done with:

`qclient update`

## First-Time Setup

- When you run a qclient command for the first time, it will create a default config/key file containing your keys.
- If you already have existing keys, you can import them with the `qclient config import` command.  See [Managing Configs](/docs/run-node/qclient/managing-configs) for more info.
- If your `.config` folder is located elsewhere, you can use the `--config path-to-config` flag in the qclient commands to specify its location.
- To use the public RPC you can also add the flag `--public-rpc`

:::info
Pre-2.1 the default config would be created in the .config directory located where you ran the command, currently configs have been moved to be in the `~/.quilibrium/configs` directory.

Qclient is aiming to deliver a toolset to be able use existing installations where an .config folder already exists, but it is recommended to import to the new structure for maximum compatibility and future improvements. See [Managing Configs](/docs/run-node/qclient/managing-configs) on how to import.
:::

#### Creating an Alias
You can create an alias to make life easier by running `qclient-<version>-<os>-<arch> link`.

This will allow you to run qclient commands by just using `qclient <command>`

### Bypassing Signature Checks
By default, you shouldn't bypass signature checks unless you know what you are doing.  By default, you won't have signatures after a fresh download, so you use the following methods:
#### Downloading Signatures
You can download signatures by using the `qclient download-signatures` command


#### Indicate No Signature Check
If you choose to not download signatures, you compiled from source, or are doing development you can bypass checks manually or create a persistant setting.
#### Single-use
Use the `--signature-check=false` or `-y` flag to indicate you don't wish to check signatures.

#### Persistant Setting
Run `qclient config signature-check disable`.  This will bypass any future signature checks on this client.

To unset, run `qclient config signature-check enable`. Running future qclient commands will then require signature checks.

### Using a Light Node
A light node is where you choose to use a public or custom RPC.


You can configure your qclient commands to use a public RPC for querying the network without running a full node. Below is a table summarizing the commands and options for setting up RPC configurations:

| **Option**                          | **Command**                                      | **Description**                                                                 |
|-------------------------------------|-------------------------------------------------|---------------------------------------------------------------------------------|
| **Public RPC Flag**                 | `qclient <command> --public-rpc`               | Temporarily uses the default public RPC (`rpc.quilibrium.com:8337`) for the command. |
| **Enable Public RPC Persistently**  | `qclient config public-rpc true`               | Sets the client to always use the public RPC for future commands.              |
| **Disable Public RPC Persistently** | `qclient config public-rpc false`              | Disables the persistent use of public RPC, reverting to local node if available. |

#### Selecting an External RPC
By default a light node will use Quilibrium's Public RPC, but you can optionally set another RPC using the `qclient config set-custom-rpc` command.

This RPC should be a trusted RPC, although it can be any RPC that is exposed, e.g. another 3rd-party RPC or your own node that is not on the same client.

| **Option**                          | **Command**                                      | **Description**   |
|-------------------------------------|-------------------------------------------------|---------------------------------------------------------------------------------|
| **Default**                         | N/A | The qclient commands will use the Quilibrium's Public RPC |
| **Set Custom RPC**                  | `qclient config set-custom-rpc <RPC-Address>`  | Configures the client to use a custom RPC endpoint (e.g., `qclient config set-custom-rpc my-rpc.example.com:8337`). |

:::tip
- To unset a custom RPC and revert to default settings, you can use `qclient config set-custom-rpc clear`.
- Ensure the RPC endpoint you are connecting to is trusted, as it will handle your queries and potentially sensitive data.
:::

Going forward, any --public-rpc commands will use the configured RPC (default if not set, or the new custom RPC url).