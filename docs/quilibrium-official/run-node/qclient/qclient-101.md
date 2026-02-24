---
sidebar_position: 1
---

# QClient 101

The qclient is an CLI application that eases a user's connection to the Quilibrium network. 

## QClient Features
The qclient provides a variety of features to interact with the Quilibrium network, including token operations, node operations, and bridging tokens. Below is a detailed table summarizing the key functionalities:

| **Category**            | **Description**                                      | **Documentation**                              |
|-------------------------|------------------------------------------------------|---------------------------------------|
| **Token Operations**    | Manage and perform token operations with tokens (send/receive, accept/reject, get balances, split, etc.).     | [Token Commands](/docs/run-node/qclient/commands/token)    |
| **Node Operations**     | Manage prover status, configuration, and node information. | [Node Commands](/docs/run-node/qclient/commands/node)            |
| **Bridging Tokens**     | Facilitate the bridging of Q native token transfers to different networks. | [Bridging Token Commands](/docs/run-node/qclient/commands/bridging) |
| **General Commands**    | Perform general qclient operations like updating the qclient, getting the version, etc.. | [General QClient Commands](/docs/run-node/qclient/commands/qclient) |
| **QClient Configuration** | Configure QClient settings such as RPC endpoints and signature checks. | [QClient Config Commands](/docs/run-node/qclient/commands/qclient-config) |

## How to run the qclient commands
To run the qclient commands, you need to execute your qclient binary, followed by the command and optional flags.

:::note
Some commands require sudo to interact with your file system for node install and configuration changes, but in general should not require it.
:::

### Example
Here is an example of a command:

```bash
qclient [command] [options]

qclient token balance --public-rpc
```

:::tip
The format above shows a linked qclient binary.  

Linking is a process of placing a binary into your system's PATH such that you do not need to specify the path (relative or absolute paths).

E.g. if the binary is installed to a user's HOME directory, to run it, the path needs to be specified:
```bash
~/qclient-2.1.0-linux-amd64 [command] [options]
```

A symlink is created by the command:
`sudo ln -s /usr/local/bin/qclient /home/user/qclient-2.1.0-linux-amd64`


A symlink would create a system "copy" to a location like `/usr/local/bin/qclient` which then enables a user to simply to input:
```bash
qclient [command] [options]
```

and it uses the linked binary.

You can determine if a file is a symlink by using the `ls -al /usr/local/bin/qclient` and see that it is indeed linked to the original binary location:

```terminal
user@hostname: ~$ ls -al /usr/local/bin/qclient

lrwxrwxrwx 1 root root 27 Apr  1 02:32 /usr/local/bin/qclient -> /home/user/qclient-2.1.0-linux-amd64
```

Note that symlinking, if done via the install script is done automatically for you, but otherwise can be run with the link command:
```bash
sudo /path/to/qclient-[version]-[os]-[arch] link
```
:::




