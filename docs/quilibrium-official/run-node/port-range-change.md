---
sidebar_position: 7
title: "Worker Port Range Change"
---

# Worker Port Range Change

Starting with version 2.1.0.19, the default worker port ranges are changing from `50000-50000+N` / `60000-60000+N` to `25000-25000+N` / `32500-32500+N`.
This page explains who is affected, what will happen, and how to fix it.

## What Changed

| Setting | Old Default | New Default |
|---|---|---|
| `dataWorkerBaseP2PPort` | 50000 | 25000 |
| `dataWorkerBaseStreamPort` | 60000 | 32500 |

These values are defined in the [engine section](/docs/run-node/advanced-configuration#engine-section) of `config.yml`.

## Why This Changed

The `50000-60000` range overlaps with the default ephemeral (dynamic) port range on all major operating systems:

| OS | Default Ephemeral Range |
|---|---|
| Linux | `32768-60999` |
| macOS | `49152-65535` |
| Windows | `49152-65535` |

When the OS assigns outbound connections from the ephemeral range, it can conflict with the node's listening ports, causing intermittent connectivity failures.

The new defaults (`25000` / `32500`) sit below the ephemeral range on all platforms while also staying above the low `20000` range, which contains ports reserved by some ISPs for diagnostic services (e.g., port `20011` for ISDN logging).
This avoids both ephemeral port collisions and ISP-reserved port conflicts.

## Who Is Affected

### Config created before 2.1.0 (no explicit port entries)

If your `config.yml` was generated before 2.1.0, it likely does **not** contain `dataWorkerBaseP2PPort` or `dataWorkerBaseStreamPort` entries.
Because these values were implicit defaults, the node will automatically pick up the **new** defaults (`25000` / `32500`) when upgrading to 2.1.0.19.

**Impact:** Your workers will start listening on the new ports, but your existing firewall rules and port forwarding rules still reference the old `50000`/`60000` range.
Workers will be blocked and unable to communicate with the network.

### Config generated at 2.1.0 (explicit port entries)

If your `config.yml` was generated at 2.1.0, the values `dataWorkerBaseP2PPort: 50000` and `dataWorkerBaseStreamPort: 60000` are explicitly set.
The node will continue using those explicit values and the new defaults will **not** apply.

**Impact:** You may still experience intermittent connectivity failures because the `50000-60000` range overlaps with the OS ephemeral port range.
To resolve this, either [set your local ephemeral port range](#option-b-keep-the-old-port-range) to exclude the `50000-60000` range, or migrate to the new lower port range by following [Option A](#option-a-adopt-the-new-port-range-recommended) below.

## How to Fix

You have two options: adopt the new port range (recommended), or keep the old range and pin it in your config.

### Option A: Adopt the New Port Range (Recommended)

This is the recommended path.
Because the new port range sits below the OS ephemeral range, no ephemeral port adjustments are needed.

#### 1. Update firewall rules

Remove the old rules and add the new ones.
Adjust the port count to match your number of workers (the examples below use 4 workers).

**Using `ufw`:**

```bash
# Remove old worker port rules
ufw delete allow 50000:50003/tcp
ufw delete allow 50000:50003/udp
ufw delete allow 60000:60003/tcp

# Add new worker port rules
ufw allow 25000:25003/tcp
ufw allow 25000:25003/udp
ufw allow 32500:32503/tcp
```

**Using `iptables`:**

```bash
# Remove old worker port rules
iptables -D INPUT -p tcp --dport 50000:50003 -j ACCEPT
iptables -D INPUT -p udp --dport 50000:50003 -j ACCEPT
iptables -D INPUT -p tcp --dport 60000:60003 -j ACCEPT

# Add new worker port rules
iptables -A INPUT -p tcp --dport 25000:25003 -j ACCEPT
iptables -A INPUT -p udp --dport 25000:25003 -j ACCEPT
iptables -A INPUT -p tcp --dport 32500:32503 -j ACCEPT
```

:::tip
Don't forget to persist your `iptables` rules if you use them directly.
On Debian/Ubuntu: `sudo apt install iptables-persistent && sudo netfilter-persistent save`
:::

#### 2. Update port forwarding (home/residential users)

If you are running behind a residential router with port forwarding, update your router's port forwarding rules to forward the new ranges (`25000-25000+N` and `32500-32500+N`) to your node's local IP instead of the old ranges.

#### 3. Update port values in config (if present)

If your `config.yml` has explicit values for the old ports, you can either remove them to let the new defaults take effect, or set them explicitly to the new values:

```yaml
engine:
  dataWorkerBaseP2PPort: 25000
  dataWorkerBaseStreamPort: 32500
```

Alternatively, comment out or delete the lines entirely to rely on the new defaults:

```yaml
engine:
  # dataWorkerBaseP2PPort: 50000
  # dataWorkerBaseStreamPort: 60000
```

#### 4. Restart the node

After making all changes, restart your node for the new configuration to take effect.

### Option B: Keep the Old Port Range

If you prefer not to change your firewall or port forwarding setup, you can pin the old port values explicitly in your `config.yml`:

```yaml
engine:
  dataWorkerBaseP2PPort: 50000
  dataWorkerBaseStreamPort: 60000
```

Then set the ephemeral port range to exclude the `50000-60000` range to avoid collisions:

```bash
sudo sysctl -w net.ipv4.ip_local_port_range="32768 49999"
```

Make it persistent:

```bash
echo "net.ipv4.ip_local_port_range = 32768 49999" | sudo tee -a /etc/sysctl.d/99-quilibrium.conf
sudo sysctl --system
```

:::info
Even if you keep the old range, setting the ephemeral port exclusion is strongly recommended to avoid the port collision issue that motivated this change.
:::

Restart your node after making changes.

## Verifying the Fix

After restarting, confirm your workers are listening on the expected ports:

```bash
# Check which ports the node is listening on
ss -tlnp | grep node
ss -ulnp | grep node
```

You should see your worker processes bound to ports starting at either `25000`/`32500` (new defaults) or `50000`/`60000` (if you pinned the old values).

If workers fail to start or show connectivity errors in the logs, double-check that:
1. Your firewall allows inbound traffic on the correct port range.
2. Your port forwarding rules (if applicable) match the ports the node is using.
3. The ephemeral port range does not overlap with the node's listening ports.
