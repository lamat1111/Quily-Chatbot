---
title: "QKMS — Quilibrium Key Management Service Comprehensive Reference"
source: official_docs_synthesis
date: 2026-02-11
type: technical_reference
topics:
  - QKMS
  - key management
  - MPC
  - multi-party computation
  - threshold signing
  - DKL-S18
  - FROST
  - secp256k1
  - Ed25519
  - oblivious transfer
  - HSM alternative
  - Q Console
---

# QKMS — Quilibrium Key Management Service

## What Is QKMS?

QKMS (Quilibrium Key Management Service) is a drop-in key management solution for applications and infrastructure providers to manage multi-party keys in a safe, secure manner. It launched in February 2026 as part of the Q Console product suite alongside Q Storage, QQ, and the Quark SDK.

QKMS is designed as a direct competitor to AWS KMS but with a fundamentally different security model. Where AWS KMS relies on Hardware Security Modules (HSMs) in trusted execution environments — requiring you to trust that Amazon's HSMs are secure and that Amazon is not providing data to state actors — QKMS uses Multi-Party Computation (MPC) so that key material is never combined in a single location. This eliminates the single point of trust entirely.

## How QKMS Differs from AWS KMS

| Aspect | AWS KMS | QKMS |
|--------|---------|------|
| Trust model | HSM-based; trust Amazon | MPC-based; no single trust point |
| Key storage | Keys live inside HSMs | Key shards distributed across nodes |
| Signing | HSM performs sign internally | Threshold signing via oblivious transfer |
| Custody | Amazon is the de-facto custodian | No single custodian; non-custodial by design |
| Edwards curves | Not supported | Ed25519, Ed448 supported |
| secp256k1 | Not supported | Native support (Ethereum, Bitcoin, Tezos) |
| SM2 | Not supported | Supported |
| Pricing | $1 per key per month + per-request | No per-key fee; per-request only with free tier |
| Cloud HSM | Available as separate product | Not offered (security model is questionable) |
| XKS (External Key Store) | Available | Not offered |

### What QKMS Includes

- Basic symmetric encryption (AES)
- Asymmetric RSA key pairs
- Asymmetric ECC (elliptic curve) key pairs
- Edwards curves (Ed25519, Ed448)
- secp256k1 (for Ethereum, Bitcoin, Tezos)
- HMAC (hash-based message authentication codes)
- SM2 (Chinese national cryptographic standard)
- Integration with Q Storage for data encryption
- AWS KMS-compatible API surface (DER and raw key output formats)

### What QKMS Does Not Include

- **Cloud HSM** — Quilibrium does not offer hardware security modules. The security model of cloud HSM is considered shaky; you are ultimately trusting the hardware vendor and the cloud provider.
- **XKS (External Key Store)** — Not supported. QKMS's MPC architecture provides stronger guarantees than external key stores.

## Architecture: True Multi-Party Computation

### The Problem with "Fake MPC"

Most consumer-facing multi-party wallet services claim to use MPC but do not implement it correctly. Their typical approach:

1. Split the key into multiple shares (sometimes generated locally, sometimes in a TEE)
2. Give the device one share, keep one, store a recovery shard elsewhere
3. When signing, **recombine the key shares in one place**

The recombination happens either on the user's device (full wallet key in memory) or in a trusted enclave (key material travels to enclave, recombines, signs, then discards). In either case, the complete key exists momentarily at a single point.

```
"FAKE MPC" — Key Recombination

  User Device          Provider          Recovery
  ┌──────────┐       ┌──────────┐      ┌──────────┐
  │ Share A   │       │ Share B   │      │ Share C   │
  └─────┬────┘       └─────┬────┘      └──────────┘
        │                   │
        └───────┬───────────┘
                ▼
        ┌──────────────┐
        │  RECOMBINED  │  <-- Full key exists here!
        │   KEY + SIGN │      (custodial, even if
        └──────────────┘       memory is flushed)
```

### How QKMS Does It: No Key Recombination

With QKMS, key shards never live in the same place. Instead of recombining keys, the system uses special **threshold signing algorithms** that perform the signing operation through oblivious transfer — a proper MPC technique that acts as a binary multiplication matrix gadget. No key material is ever exchanged between parties.

```
TRUE MPC — Threshold Signing (No Recombination)

  Party A (Your Sidecar)         Party B (Quilibrium Network)
  ┌────────────────────┐         ┌────────────────────┐
  │    Key Share A      │         │    Key Share B      │
  │                    │         │                    │
  │  ┌──────────────┐  │   OT    │  ┌──────────────┐  │
  │  │ Local MPC    │◄─┼────────►┼──│ Local MPC    │  │
  │  │ Computation  │  │ rounds  │  │ Computation  │  │
  │  └──────┬───────┘  │         │  └──────┬───────┘  │
  │         │          │         │         │          │
  └─────────┼──────────┘         └─────────┼──────────┘
            │                              │
            └──────────┬───────────────────┘
                       ▼
              ┌────────────────┐
              │  VALID SIGNATURE│  <-- Produced without
              │  (no full key   │      either party ever
              │   existed)      │      seeing the full key
              └────────────────┘
```

Key shards are encrypted and stored on the hypergraph. When a signing operation is needed, QKMS pulls the shards through to the compute primitive for MPC execution. The complete private key is never reconstructed at any point in the process.

## Threshold Signing Algorithms

### DKL-S18 for secp256k1

For secp256k1 keys (used by Ethereum, Bitcoin, and Tezos), QKMS uses the **DKL-S18 algorithm** for two-of-two threshold signing. For higher thresholds such as three-of-five, an upgraded DKL-S version is used.

**Performance:** An actual DKL-S18 run under normal network conditions takes approximately **0.5 seconds** (half a second). During demonstrations, key generation has been shown taking about six seconds, but that was with a deliberately slow refresh rate of one round per second for visualization purposes.

### FROST for Ed25519

For Ed25519 keys (used by Solana, Farcaster, and other systems), QKMS uses the **FROST algorithm** (Flexible Round-Optimized Schnorr Threshold signatures). FROST operates in **three rounds** to produce a valid threshold signature.

### Algorithm Selection Summary

| Key Type | Algorithm | Threshold | Rounds | Approximate Latency |
|----------|-----------|-----------|--------|---------------------|
| secp256k1 | DKL-S18 | 2-of-2 | Multiple OT rounds | ~0.5 seconds |
| secp256k1 | DKL-S (upgraded) | N-of-M | Multiple OT rounds | Varies with N, M |
| Ed25519 | FROST | N-of-M | 3 rounds | Varies with network |

## Underlying Primitives

QKMS is built on top of Quilibrium's OS-level key management primitives stored as RDF schemas in the hypergraph.

### Key Object Structure

A **Key** object on the hypergraph has the following properties:

| Property | Description |
|----------|-------------|
| Format | The key format identifier (symmetric, RSA, ECC, Edwards, secp256k1, HMAC, SM2) |
| PublicData | The public key component (visible to authorized parties) |
| Protocol | Reference to a known protocol, or to an executable OT circuit File |

Each Key has one or more **KeyShares**:

| Property | Description |
|----------|-------------|
| OfKey | Reference back to the parent Key |
| KeyData | The actual key share data (one shard of the split key) |

The **Protocol** field can reference either a built-in protocol (Ed448, BLS-48-581, secp256k1) or an executable File containing a custom OT circuit, enabling additional MPC protocols beyond what the network natively supports.

### Service Primitive Mapping

| Service | Quilibrium Primitive |
|---------|---------------------|
| QKMS | Compute primitive (oblivious transfer) |
| Q Storage | Hypergraph (file/block schemas) |
| QQ | Hypergraph + dispatch mechanism |
| QPing | Dispatch mechanism |

## Regulatory Compliance

### NYDFS and Custodial Obligations

The New York Department of Financial Services (NYDFS) understands MPC and recognizes that wherever key material lives combined, that entity is the custodian. Companies using "fake MPC" (key recombination in a TEE or on a device) are performing custodial behavior and must comply with custodial obligations. Many companies have avoided scrutiny only because MPC is hard to understand and they are not yet large enough to be enforcement targets.

QKMS eliminates this regulatory risk entirely. Because key shards never recombine, neither the application developer nor Quilibrium is a custodian of the user's keys. This provides a path to regulatory compliance without the overhead of obtaining custodial licenses.

### Purpose-Bound Cryptographic Keys

Every key managed by QKMS can be tied to a specific function (e.g., "sign this transaction" or "approve this smart contract"). Even if a hacker gained access to a key fragment, they could not misuse it for unauthorized actions. This purpose-binding adds a layer of defense beyond the MPC guarantees.

## Key Operations in Q Console

### Creating a Symmetric Encryption Key

Through Q Console or the API:

1. Select key type — symmetric default uses AES
2. Name the key and provide tags (same tagging conventions as AWS)
3. The key is created with MPC; key shards are distributed
4. Use the key to encrypt plaintext data
5. Receive cipher text output
6. Test decryption is available immediately in the console

Key lifecycle management includes:

- **Key rotation** — Schedule automatic rotation
- **Scheduled deletion** — Set a future deletion date for key material
- **Cancellation** — Cancel scheduled deletion and re-enable the key
- **Disable/enable** — Temporarily disable a key without deleting it

### Creating Elliptic Curve Keys

For crypto and blockchain use cases:

1. Select the curve type (secp256k1, Ed25519, etc.)
2. The key is generated through MPC
3. Output is available in both **DER format** (AWS-compatible, with extra encoding bytes) and **raw format** (what wallet developers typically use)
4. Use for signing transactions, verifying signatures, or deriving addresses

The dual-format output is a deliberate convenience: the AWS-compatible API returns DER encoding for tool compatibility, but developers working with crypto protocols can directly access the raw key bytes without manual DER parsing.

### MPC Configuration

In Q Console demo mode, the client-side MPC operation runs within the console itself. In production, you configure where the client-side MPC party lives and how it runs — typically in a sidecar process alongside your application.

## Integration with Q Storage

QKMS integrates directly with Q Storage for encryption of stored data. Use cases include:

- **Server-side encryption** — Use a QKMS key to encrypt objects stored in Q Storage buckets
- **HMAC keys for signed URLs** — Generate HMAC keys through QKMS to create time-limited signed URLs for Q Storage objects
- **Bucket policies with encryption** — Apply custom bucket policies that require QKMS encryption

When you store a key shard encrypted on the hypergraph, QKMS can pull it through to the compute primitive for MPC operations. This composability is a core design principle — storage objects and key objects are both addressable entities on the same hypergraph, and they can reference each other naturally.

## Practical Example: Farcaster Server-Side Key Management

A concrete use case for QKMS is managing Ed25519 signing keys for a Farcaster-compatible application. If you are building an app that needs to sign Farcaster messages on behalf of users (not wallet keys stored in their phone, but application-level signing keys), you can set up the following:

```
Farcaster App Architecture with QKMS

  ┌──────────────────┐          ┌──────────────────┐
  │  Your App Server  │          │  Quilibrium       │
  │  (Sidecar)        │          │  Network           │
  │                  │          │                    │
  │  Key Share A      │◄────────►│  Key Share B        │
  │  (Ed25519 shard)  │  FROST   │  (Ed25519 shard)    │
  │                  │  3 rounds │                    │
  └──────────────────┘          └──────────────────┘
          │
          ▼
  ┌──────────────────┐
  │  Signed Farcaster │
  │  Message           │
  │  (Ed25519 sig)     │
  └──────────────────┘
```

- One key shard lives with your application sidecar
- One key shard lives with Quilibrium's network
- Signing happens through FROST (three rounds) without either party ever possessing the full key
- You are not a custodian; Quilibrium is not a custodian
- Full regulatory compliance is maintained

## Pricing Model

QKMS pricing differs fundamentally from AWS KMS:

| Dimension | AWS KMS | QKMS |
|-----------|---------|------|
| Per key per month | $1.00 | $0.00 (no per-key fee) |
| Per request | Tiered pricing | Per-request with free tier |
| Free tier | 20,000 requests/month | Own free tier (details on Q Console) |

The absence of per-key fees makes QKMS particularly attractive for applications that manage many keys (e.g., one key per user in a wallet-as-a-service product).

## Warm Key Management

QKMS introduces a concept beyond the traditional hot/cold binary: **warm key management**. Keys can be programmed with strict rules that define what operations they are allowed to perform.

For example, a warm key might:

- Only hold funds and only sign transactions moving them to a designated hot key
- Only sign messages for a specific application domain
- Only operate during certain time windows

This programmable approach deconstructs the traditional hot/cold categories. You get cold-storage-level security guarantees with the operational flexibility of hot keys — all without manual key handling.

### Custody Configurations

| Configuration | Description | Use Case |
|---------------|-------------|----------|
| Hot | Key shares actively available, low-latency signing | Real-time transaction signing |
| Warm | Key shares available but rule-constrained | Treasury management, limited-scope operations |
| Cold | Offline proof via "MPC in the head" | Large reserves, regulatory cold storage requirements |

For cold custody, Quilibrium supports offline proofs using "MPC in the head" — the prover simulates all MPC participants locally, takes the execution trace, and submits it as a proof. This allows cold storage operations without connecting to the network live.

## Security Comparison

| Feature | Hot Wallets | Multisig | Cold Storage | QKMS |
|---------|-------------|----------|--------------|------|
| No key exposure | No | Partial | Yes | Yes |
| No single failure point | No | Partial | Partial | Yes |
| No manual handling | Yes | Yes | No | Yes |
| Phishing resistant | No | No | Yes | Yes |
| Keys cannot be stolen | No | No | Yes | Yes |
| Purpose-bound keys | No | No | No | Yes |
| Fully decentralized | No | No | No | Yes |
| Programmable rules | No | Limited | No | Yes |

## Multi-Account Hierarchy

QKMS supports AWS-style multi-account hierarchical features. You can organize keys across multiple accounts with delegated access and cross-account sharing — something that is limited in scope on AWS due to their siloed architecture but naturally supported in Quilibrium's composable model.

## Real-World Use Cases

### Crypto Exchanges

- Prevents large-scale hacks by eliminating key exposure (no recombined key material to steal)
- Secures both hot and cold wallets using decentralized key management
- Protects admin keys and governance mechanisms from exploits
- Reduces reliance on smart-contract-based multisigs vulnerable to social engineering

### Wallet-as-a-Service Providers

- True non-custodial MPC signing without TEE dependency
- Simple SDK integration: user integrates one half, provider integrates the other half
- Full regulatory compliance without custodial license requirements
- Sub-second signing latency for production use

### Institutions and Custodians

- High-security asset custody with zero-trust key management
- Instant transactions with cold-storage-level security
- Warm key configurations for treasury management with programmatic guardrails

### DAOs and Web3 Organizations

- Replaces centralized control over treasury funds with decentralized, verifiable key management
- No single admin can compromise funds
- Threshold configurations (3-of-5, 5-of-9, etc.) for governance-aligned signing policies

### Game Developers (via Quark SDK)

- QKMS HMAC keys for generating signed URLs to Q Storage game assets
- Token ownership verification through MPC-signed transactions
- Privacy-preserving asset management where players' holdings are not publicly visible

## Frequently Asked Questions

**Q: Is QKMS a custodial service?**
No. Key shards are distributed and never recombined. Neither Quilibrium nor the application developer possesses the complete key at any point. Under regulatory frameworks like NYDFS, this is non-custodial.

**Q: Can I use existing AWS KMS SDKs with QKMS?**
The QKMS API is designed to be compatible with the AWS KMS API surface. DER-encoded outputs match the format AWS tools expect. Additional tooling (a client-side MPC sidecar) is needed alongside the SDK for the MPC component.

**Q: What happens if Quilibrium nodes go offline?**
Key shards are replicated across the network following the same replication standard as all hypergraph data (24-28 geographically distributed nodes per shard). Data is constructed using Reed-Solomon encoding through verifiable encryption, so some nodes can go offline without data loss.

**Q: How fast is signing?**
For secp256k1 two-of-two threshold signing (DKL-S18), approximately 0.5 seconds under normal network conditions. Performance varies for higher thresholds and for FROST-based Ed25519 signing depending on network latency.

**Q: Does QKMS support key rotation?**
Yes. Key rotation is supported through both the Q Console interface and the API. You can schedule automatic rotation or manually trigger it.

**Q: Can I use QKMS for encrypting data in Q Storage?**
Yes. QKMS integrates directly with Q Storage. You can use QKMS keys for server-side encryption of stored objects and generate HMAC keys for signed URL access.

**Q: Why no Cloud HSM support?**
The security model of cloud HSM is considered unreliable — you are ultimately trusting the hardware vendor and the cloud provider. QKMS's MPC approach provides stronger guarantees without depending on hardware trust assumptions.

**Q: What is the difference between QKMS and the on-chain key management primitives?**
The on-chain Key and KeyShare RDF schemas are the underlying primitives stored in the hypergraph. QKMS is the product layer built on top: it provides the API, Q Console interface, key lifecycle management, billing, and the MPC sidecar tooling that makes those primitives accessible to application developers.

**Q: Can I use raw key output instead of DER encoding?**
Yes. Unlike AWS KMS which only provides DER-encoded output, QKMS provides both DER and raw formats. Crypto and wallet developers who work with raw key bytes can use them directly without parsing DER structures.

**Q: Does QKMS support offline/cold custody signing?**
Yes. Using "MPC in the head," you can simulate all MPC participants locally (e.g., in a Faraday-caged environment), generate the execution trace as a proof, and submit it to the network. This enables cold custody operations without a live network connection.

---
*Last updated: 2026-02-11T15:00:00*
