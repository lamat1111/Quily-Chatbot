---
sidebar_position: 4
---

# Data Structures

Quilibrium employs a sophisticated type system with canonical byte serialization for all protocol messages. This section explores the core data structures that form the foundation of the distributed private oblivious hypergraph.

## Serialization Framework

### Canonical Byte Serialization

All protocol messages use a standardized canonical byte serialization format that ensures deterministic encoding across implementations.

#### Type Prefix System

- **4-byte Type Prefix**: Each message type has a unique identifier (big-endian unsigned integer)
- **Deterministic Encoding**: Same data always produces identical byte sequences
- **Version Independence**: Serialization remains consistent across protocol versions

#### Encoding Conventions

```text
[4 bytes] Type prefix (big-endian uint32)
[...] Field data according to specific rules:
  • Fixed-size fields: Written directly in big-endian
  • Variable byte arrays: 4-byte length + bytes
  • Repeated fields: 4-byte count + elements
  • Nested messages: Full canonical bytes (including type prefix)
  • Booleans: Single byte (0=false, 1=true)
  • Strings: Length-prefixed and written with WriteString (not raw bytes)
  • Optional/nil: Length of 0 for absent values
```

#### Additional Notes

1. All multi-byte integers are encoded in big-endian format.
2. Variable-length fields always have a 4-byte length prefix.
3. Nested messages include their own type prefix when serialized.
4. Boolean values are encoded as a single byte (0 or 1).
5. Fixed-size arrays (like keys and certain signatures) are written directly without length prefix.
6. Nil/optional fields are represented by a length of 0.
7. For repeated fields, a count of 0 indicates an empty array.
8. **Strings** are length-prefixed and written using `WriteString`.
9. **Union/oneof** fields use a discriminator byte followed by the selected variant’s canonical bytes.
10. All canonical byte representations are self-contained and include type prefixes.

### Type Categories

| Range           | Category         | Description                                  |
| --------------- | ---------------- | -------------------------------------------- |
| `0x0100-0x01FF` | Core Node        | Basic node communication and peer management |
| `0x0110-0x0124` | Key Management   | Cryptographic keys and signatures            |
| `0x0200-0x02FF` | Channels         | P2P communication and messaging              |
| `0x0300-0x03FF` | Global Consensus | Frame consensus and prover coordination      |
| `0x0400-0x04FF` | Hypergraph       | Data graph operations and RDF schema         |
| `0x0500-0x05FF` | Token System     | Currency and asset management                |
| `0x0600-0x06FF` | Compute Engine   | Program execution and state transitions      |
| `0x0900-0x09FF` | Emergency        | Network alerts and emergency protocols       |

---

## Core Node Types (0x0100-0x01FF)

### Message (0x0100)

Fundamental communication primitive for all network messages.

```protobuf
message Message {
  bytes hash = 1;
  bytes address = 2;
  bytes payload = 3;
}
```

**Canonical Serialization:**

```text
[4 bytes] 0x00000100
[4 bytes] Hash length
[n bytes] Hash
[4 bytes] Address length
[n bytes] Address
[4 bytes] Payload length
[n bytes] Payload
```

### PeerInfo (0x0101)

Discovery and capability advertisement for network peers.

```protobuf
message PeerInfo {
  bytes peer_id = 1;
  repeated NetworkReachability reachability = 2;
  int64 timestamp = 3;
  string version = 4;
  string patch_version = 5;
  repeated Capability capabilities = 6;
  bytes public_key = 7;
  bytes signature = 8;
}
```

**Canonical Serialization:**

```text
[4 bytes] 0x00000101
[4 bytes] Length of peer_id
[n bytes] peer_id
[4 bytes] Count of reachability
For each reachability:
  [4 bytes] Length of filter
  [n bytes] filter
  [4 bytes] Count of pubsub_multiaddrs
  For each pubsub_multiaddr:
    [4 bytes] Length of address
    [n bytes] address (string)
  [4 bytes] Count of stream_multiaddrs
  For each stream_multiaddr:
    [4 bytes] Length of address
    [n bytes] address (string)
[8 bytes] timestamp (int64)
[4 bytes] Length of version
[n bytes] version
[4 bytes] Length of patch_version
[n bytes] patch_version
[4 bytes] Count of capabilities
For each capability:
  [4 bytes] protocol_identifier (uint32)
  [4 bytes] Length of additional_metadata
  [n bytes] additional_metadata
[4 bytes] Length of public_key
[n bytes] public_key
[4 bytes] Length of signature
[n bytes] signature
```

### Capability (0x0102)

Protocol capability advertisement for peer compatibility.

```protobuf
message Capability {
  uint32 protocol_identifier = 1;
  bytes additional_metadata = 2;
}
```

**Canonical Serialization:**

```text
[4 bytes] 0x00000102
[4 bytes] protocol_identifier (uint32)
[4 bytes] Length of additional_metadata
[n bytes] additional_metadata
```

---

## Cryptographic Key System (0x0110-0x0124)

### Ed448 Keys & Signature (0x0110-0x0112)

#### Ed448PublicKey (0x0110)

```text
[4 bytes] 0x00000110
[57 bytes] key_value (fixed)
```

#### Ed448PrivateKey (0x0111)

```text
[4 bytes] 0x00000111
[57 bytes] key_value (fixed)
```

#### Ed448Signature (0x0112)

```text
[4 bytes] 0x00000112
[4 bytes] Length of public_key (0 for nil)
[n bytes] public_key (Ed448PublicKey canonical bytes if not nil)
[4 bytes] Length of signature
[n bytes] signature
```

### X448 Keys (0x0113-0x0114)

#### X448PublicKey (0x0113)

```text
[4 bytes] 0x00000113
[56 bytes] key_value (fixed)
```

#### X448PrivateKey (0x0114)

```text
[4 bytes] 0x00000114
[56 bytes] key_value (fixed)
```

### BLS48-581 Keys & Signatures (0x0117-0x011C)

#### BLS48581G2PublicKey (0x0117)

```text
[4 bytes] 0x00000117
[565 bytes] key_value (fixed)
```

#### BLS48581G2PrivateKey (0x0118)

```text
[4 bytes] 0x00000118
[73 bytes] key_value (fixed)
```

#### BLS48581Signature (0x0119)

```text
[4 bytes] 0x00000119
[4 bytes] Length of public_key (0 for nil)
[n bytes] public_key (BLS48581G2PublicKey canonical bytes if not nil)
[4 bytes] Length of signature
[n bytes] signature
```

#### BLS48581SignatureWithProofOfPossession (0x011A)

```text
[4 bytes] 0x0000011A
[4 bytes] Length of signature
[n bytes] signature
[4 bytes] Length of public_key (0 for nil)
[n bytes] public_key (BLS48581G2PublicKey canonical bytes if not nil)
[4 bytes] Length of pop_signature
[n bytes] pop_signature
```

#### BLS48581AddressedSignature (0x011B)

```text
[4 bytes] 0x0000011B
[4 bytes] Length of signature
[n bytes] signature
[4 bytes] Length of address
[n bytes] address
```

#### BLS48581AggregateSignature (0x011C)

```text
[4 bytes] 0x0000011C
[4 bytes] Length of signature
[n bytes] signature
[4 bytes] Length of public_key (0 for nil)
[n bytes] public_key (BLS48581G2PublicKey canonical bytes if not nil)
[4 bytes] Length of bitmask
[n bytes] bitmask
```

### Decaf448 Keys & Signature (0x011D-0x011F)

#### Decaf448PublicKey (0x011D)

```text
[4 bytes] 0x0000011D
[56 bytes] key_value (fixed)
```

#### Decaf448PrivateKey (0x011E)

```text
[4 bytes] 0x0000011E
[56 bytes] key_value (fixed)
```

#### Decaf448Signature (0x011F)

```text
[4 bytes] 0x0000011F
[4 bytes] Length of public_key (0 for nil)
[n bytes] public_key (Decaf448PublicKey canonical bytes if not nil)
[4 bytes] Length of signature
[n bytes] signature
```

### SignedX448Key (0x0120)

```text
[4 bytes] 0x00000120
[4 bytes] Length of key (0 for nil)
[n bytes] key (X448PublicKey canonical bytes if not nil)
[4 bytes] Length of parent_key_address
[n bytes] parent_key_address
[1 byte] signature_type (0=nil, 1=Ed448, 2=BLS, 3=Decaf/Schnorr)
If signature_type > 0:
  [4 bytes] Length of signature
  [n bytes] signature (canonical bytes for the respective signature type)
```

### SignedDevicePreKey (0x0121)

```text
[4 bytes] 0x00000121
[4 bytes] Length of signed_x448_key (0 for nil)
[n bytes] signed_x448_key (SignedX448Key canonical bytes if not nil)
[4 bytes] key_id (uint32)
```

### KeyCollection (0x0122)

```text
[4 bytes] 0x00000122
[4 bytes] Length of key_purpose
[n bytes] key_purpose (string)
[4 bytes] Count of keys
For each key:
  [4 bytes] Length of key
  [n bytes] key (canonical bytes of various key types)
```

### KeyRegistry (0x0123)

```text
[4 bytes] 0x00000123
[4 bytes] Length of identity_key (0 for nil)
[n bytes] identity_key (canonical bytes if not nil)
[4 bytes] Length of prover_key (0 for nil)
[n bytes] prover_key (canonical bytes if not nil)
[4 bytes] Length of identity_to_prover (0 for nil)
[n bytes] identity_to_prover (signature canonical bytes if not nil)
[4 bytes] Length of prover_to_identity (0 for nil)
[n bytes] prover_to_identity (signature canonical bytes if not nil)
[4 bytes] Count of keys_by_purpose map entries
For each map entry:
  [4 bytes] Length of purpose string
  [n bytes] purpose (string)
  [4 bytes] Length of collection
  [n bytes] collection (KeyCollection canonical bytes)
[8 bytes] last_updated (uint64)
```

---

## Channel Types (0x0200-0x02FF)

### P2PChannelEnvelope (0x0200)

```text
[4 bytes] 0x00000200
[4 bytes] protocol_identifier (uint32)
[4 bytes] Length of message_header (0 for nil)
[n bytes] message_header (MessageCiphertext canonical bytes if not nil)
[4 bytes] Length of message_body (0 for nil)
[n bytes] message_body (MessageCiphertext canonical bytes if not nil)
```

### MessageCiphertext (0x0201)

```text
[4 bytes] 0x00000201
[4 bytes] Length of initialization_vector
[n bytes] initialization_vector
[4 bytes] Length of ciphertext
[n bytes] ciphertext
[4 bytes] Length of associated_data
[n bytes] associated_data
```

### InboxMessage (0x0202)

```text
[4 bytes] 0x00000202
[4 bytes] Length of address
[n bytes] address
[8 bytes] timestamp (uint64)
[4 bytes] Length of ephemeral_public_key
[n bytes] ephemeral_public_key
[4 bytes] Length of message
[n bytes] message
```

### HubAddInbox (0x0203)

```text
[4 bytes] 0x00000203
[4 bytes] Length of address
[n bytes] address
[4 bytes] Length of inbox_public_key
[n bytes] inbox_public_key
[4 bytes] Length of hub_public_key
[n bytes] hub_public_key
[4 bytes] Length of signature
[n bytes] signature
```

### HubDeleteInbox (0x0204)

```text
[4 bytes] 0x00000204
[4 bytes] Length of address
[n bytes] address
[4 bytes] Length of inbox_public_key
[n bytes] inbox_public_key
[4 bytes] Length of hub_public_key
[n bytes] hub_public_key
[4 bytes] Length of signature
[n bytes] signature
```

---

## Global Consensus Types (0x0300-0x03FF)

### LegacyProverRequest (0x0300)

```text
[4 bytes] 0x00000300
[4 bytes] Count of public_key_signatures_ed448
For each signature:
  [4 bytes] Length of signature (0 for nil)
  [n bytes] signature (Ed448Signature canonical bytes if not nil)
```

### Prover Lifecycle (0x0301-0x0308)

#### ProverJoin (0x0301)

```text
[4 bytes] 0x00000301
[4 bytes] Count of filters
For each filter:
  [3 bytes] filter (fixed)
[8 bytes] frame_number (uint64)
[4 bytes] Length of public_key_signature_bls48581 (0 for nil)
[n bytes] public_key_signature_bls48581 (BLS48581SignatureWithProofOfPossession canonical bytes if not nil)
[4 bytes] Length of delegate_address
[n bytes] delegate_address
[4 bytes] Count of merge_targets
For each merge_target:
  [4 bytes] Length of merge_target (0 for nil)
  [n bytes] merge_target (SeniorityMerge canonical bytes if not nil)
```

#### ProverLeave (0x0302)

```text
[4 bytes] 0x00000302
[4 bytes] Count of filters
For each filter:
  [3 bytes] filter (fixed)
[8 bytes] frame_number (uint64)
[4 bytes] Length of public_key_signature_bls48581 (0 for nil)
[n bytes] public_key_signature_bls48581 (BLS48581AddressedSignature canonical bytes if not nil)
```

#### ProverPause (0x0303)

```text
[4 bytes] 0x00000303
[3 bytes] filter (fixed)
[8 bytes] frame_number (uint64)
[4 bytes] Length of public_key_signature_bls48581 (0 for nil)
[n bytes] public_key_signature_bls48581 (BLS48581AddressedSignature canonical bytes if not nil)
```

#### ProverResume (0x0304)

```text
[4 bytes] 0x00000304
[3 bytes] filter (fixed)
[8 bytes] frame_number (uint64)
[4 bytes] Length of public_key_signature_bls48581 (0 for nil)
[n bytes] public_key_signature_bls48581 (BLS48581AddressedSignature canonical bytes if not nil)
```

#### ProverConfirm (0x0305)

```text
[4 bytes] 0x00000305
[3 bytes] filter (fixed)
[8 bytes] frame_number (uint64)
[4 bytes] Length of public_key_signature_bls48581 (0 for nil)
[n bytes] public_key_signature_bls48581 (BLS48581AddressedSignature canonical bytes if not nil)
```

#### ProverReject (0x0306)

```text
[4 bytes] 0x00000306
[3 bytes] filter (fixed)
[8 bytes] frame_number (uint64)
[4 bytes] Length of public_key_signature_bls48581 (0 for nil)
[n bytes] public_key_signature_bls48581 (BLS48581AddressedSignature canonical bytes if not nil)
```

#### ProverKick (0x0307)

```text
[4 bytes] 0x00000307
[8 bytes] frame_number (uint64)
[4 bytes] Length of kicked_prover_public_key
[n bytes] kicked_prover_public_key
[4 bytes] Length of conflicting_frame_1
[n bytes] conflicting_frame_1
[4 bytes] Length of conflicting_frame_2
[n bytes] conflicting_frame_2
[4 bytes] Length of commitment
[n bytes] commitment
[4 bytes] Length of proof
[n bytes] proof
[4 bytes] Length of traversal_proof (0 for nil)
[n bytes] traversal_proof (TraversalProof canonical bytes if not nil)
```

#### ProverUpdate (0x0308)

```text
[4 bytes] 0x00000308
[4 bytes] Length of delegate_address
[n bytes] delegate_address
[4 bytes] Length of public_key_signature_bls48581 (0 for nil)
[n bytes] public_key_signature_bls48581 (BLS48581AddressedSignature canonical bytes if not nil)
```

### Frame Structures (0x0309-0x030F)

#### GlobalFrameHeader (0x0309)

```text
[4 bytes] 0x00000309
[8 bytes] frame_number (uint64)
[8 bytes] timestamp (int64)
[4 bytes] difficulty (uint32)
[4 bytes] Length of output
[n bytes] output
[4 bytes] Length of parent_selector
[n bytes] parent_selector
[4 bytes] Count of global_commitments
For each global_commitment:
  [4 bytes] Length of commitment
  [n bytes] commitment
[4 bytes] Length of prover_tree_commitment
[n bytes] prover_tree_commitment
[4 bytes] Length of public_key_signature_bls48581 (0 for nil)
[n bytes] public_key_signature_bls48581 (BLS48581AggregateSignature canonical bytes if not nil)
```

#### FrameHeader (0x030A)

```text
[4 bytes] 0x0000030A
[4 bytes] Length of address
[n bytes] address
[8 bytes] frame_number (uint64)
[8 bytes] timestamp (int64)
[4 bytes] difficulty (uint32)
[4 bytes] Length of output
[n bytes] output
[4 bytes] Length of parent_selector
[n bytes] parent_selector
[4 bytes] Length of requests_root
[n bytes] requests_root
[4 bytes] Count of state_roots
For each state_root:
  [4 bytes] Length of state_root
  [n bytes] state_root
[4 bytes] Length of prover
[n bytes] prover
[8 bytes] fee_multiplier_vote (uint64)
[4 bytes] Length of public_key_signature_bls48581 (0 for nil)
[n bytes] public_key_signature_bls48581 (BLS48581AggregateSignature canonical bytes if not nil)
```

### Consensus Operations (0x030B-0x0316)

#### ProverLivenessCheck (0x030B)

This section is omitted until the release of 2.1

#### FrameVote (0x030C)

This section is omitted until the release of 2.1

#### FrameConfirmation (0x030D)

This section is omitted until the release of 2.1

#### GlobalFrame (0x030E)

```text
[4 bytes] 0x0000030E
[4 bytes] Length of header (0 for nil)
[n bytes] header (GlobalFrameHeader canonical bytes if not nil)
[4 bytes] Count of requests
For each request:
  [4 bytes] Length of request (0 for nil)
  [n bytes] request (MessageBundle canonical bytes if not nil)
```

#### AppShardFrame (0x030F)

```text
[4 bytes] 0x0000030F
[4 bytes] Length of header (0 for nil)
[n bytes] header (FrameHeader canonical bytes if not nil)
[4 bytes] Count of requests
For each request:
  [4 bytes] Length of request (0 for nil)
  [n bytes] request (MessageBundle canonical bytes if not nil)
```

#### SeniorityMerge (0x0310)

This section is omitted until the release of 2.1

#### MessageRequest (0x0311)

*A universal wrapper using an inner type discriminant.*

```text
[4 bytes] 0x00000311
[4 bytes] Inner type prefix (identifies the specific request type)
[n bytes] Request payload (includes its own type prefix)
```

#### MessageBundle (0x0312)

```text
[4 bytes] 0x00000312
[4 bytes] Count of requests
For each request:
  [4 bytes] Length of request (0 for nil)
  [n bytes] request (MessageRequest canonical bytes if not nil)
[8 bytes] timestamp (int64)
```

#### Multiproof (0x0313)

```text
[4 bytes] 0x00000313
[4 bytes] Length of multicommitment
[n bytes] multicommitment
[4 bytes] Length of proof
[n bytes] proof
```

#### Path (0x0314)

```text
[4 bytes] 0x00000314
[4 bytes] Count of indices
For each index:
  [4 bytes] index (uint32)
```

#### TraversalSubProof (0x0315)

```text
[4 bytes] 0x00000315
[4 bytes] Count of commits
For each commit:
  [4 bytes] Length of commit
  [n bytes] commit
[4 bytes] Count of ys
For each y:
  [4 bytes] Length of y
  [n bytes] y
[4 bytes] Count of paths
For each path:
  [4 bytes] Length of path
  [n bytes] path (Path canonical bytes)
```

#### TraversalProof (0x0316)

```text
[4 bytes] 0x00000316
[4 bytes] Length of multiproof (0 for nil)
[n bytes] multiproof (Multiproof canonical bytes if not nil)
[4 bytes] Count of sub_proofs
For each sub_proof:
  [4 bytes] Length of sub_proof
  [n bytes] sub_proof (TraversalSubProof canonical bytes)
```

---

## Hypergraph Types (0x0400-0x04FF)

Signatures for Vertex and Hyperedge Add/Remove operations utilize `write_public_key` from configuration for verification.

### HypergraphConfiguration (0x0401)

```text
[4 bytes] 0x00000401
[4 bytes] Length of read_public_key
[n bytes] read_public_key
[4 bytes] Length of write_public_key
[n bytes] write_public_key
[4 bytes] Length of owner_public_key
[n bytes] owner_public_key
```

### HypergraphDeployment (0x0402)

```text
[4 bytes] 0x00000402
[4 bytes] Length of config
[n bytes] config (HypergraphConfiguration canonical bytes)
[4 bytes] Length of rdf_schema
[n bytes] rdf_schema
```

### HypergraphUpdate (0x0403)

```text
[4 bytes] 0x00000403
[4 bytes] Length of domain
[n bytes] domain
[4 bytes] Length of config (0 for nil)
[n bytes] config (HypergraphConfiguration canonical bytes if not nil)
[4 bytes] Length of rdf_schema
[n bytes] rdf_schema
[4 bytes] Length of public_key_signature_bls48581 (0 for nil)
[n bytes] public_key_signature_bls48581 (BLS48581AggregateSignature canonical bytes if not nil)
```

### VertexAdd (0x0404)

```text
[4 bytes] 0x00000404
[4 bytes] Length of domain
[n bytes] domain
[4 bytes] Length of data_address
[n bytes] data_address
[4 bytes] Length of data
[n bytes] data
[4 bytes] Length of signature
[n bytes] signature
```

### VertexRemove (0x0405)

```text
[4 bytes] 0x00000405
[4 bytes] Length of domain
[n bytes] domain
[4 bytes] Length of data_address
[n bytes] data_address
[4 bytes] Length of signature
[n bytes] signature
```

### HyperedgeAdd (0x0406)

```text
[4 bytes] 0x00000406
[4 bytes] Length of domain
[n bytes] domain
[4 bytes] Length of value
[n bytes] value
[4 bytes] Length of signature
[n bytes] signature
```

### HyperedgeRemove (0x0407)

```text
[4 bytes] 0x00000407
[4 bytes] Length of domain
[n bytes] domain
[4 bytes] Length of value
[n bytes] value
[4 bytes] Length of signature
[n bytes] signature
```

---

## Token Types (0x0500-0x05FF)

### Authority (0x0500)

```text
[4 bytes] 0x00000500
[4 bytes] key_type (uint32)
[4 bytes] Length of public_key
[n bytes] public_key
[1 byte] can_burn (bool)
```

### FeeBasis (0x0501)

```text
[4 bytes] 0x00000501
[4 bytes] type (uint32)
[4 bytes] Length of baseline
[n bytes] baseline
```

### TokenMintStrategy (0x0502)

```text
[4 bytes] 0x00000502
[4 bytes] mint_behavior (uint32)
[4 bytes] proof_basis (uint32)
[4 bytes] Length of verkle_root
[n bytes] verkle_root
[4 bytes] Length of authority (0 for nil)
[n bytes] authority (Authority canonical bytes if not nil)
[4 bytes] Length of payment_address
[n bytes] payment_address
[4 bytes] Length of fee_basis (0 for nil)
[n bytes] fee_basis (FeeBasis canonical bytes if not nil)
```

### TokenConfiguration (0x0503)

```text
[4 bytes] 0x00000503
[4 bytes] behavior (uint32)
[4 bytes] Length of mint_strategy (0 for nil)
[n bytes] mint_strategy (TokenMintStrategy canonical bytes if not nil)
[4 bytes] Length of units
[n bytes] units
[4 bytes] Length of supply
[n bytes] supply
[4 bytes] Length of name
[n bytes] name (string)
[4 bytes] Length of symbol
[n bytes] symbol (string)
[4 bytes] Count of additional_reference
For each reference:
  [4 bytes] Length of reference
  [n bytes] reference
[4 bytes] Length of owner_public_key
[n bytes] owner_public_key
```

### TokenDeployment (0x0504)

```text
[4 bytes] 0x00000504
[4 bytes] Length of config (0 for nil)
[n bytes] config (TokenConfiguration canonical bytes if not nil)
[4 bytes] Length of rdf_schema
[n bytes] rdf_schema
```

### TokenUpdate (0x0505)

```text
[4 bytes] 0x00000505
[4 bytes] Length of config (0 for nil)
[n bytes] config (TokenConfiguration canonical bytes if not nil)
[4 bytes] Length of rdf_schema
[n bytes] rdf_schema
[4 bytes] Length of public_key_signature_bls48581 (0 for nil)
[n bytes] public_key_signature_bls48581 (BLS48581AggregateSignature canonical bytes if not nil)
```

### RecipientBundle (0x0506)

```text
[4 bytes] 0x00000506
[4 bytes] Length of one_time_key
[n bytes] one_time_key
[4 bytes] Length of verification_key
[n bytes] verification_key
[4 bytes] Length of coin_balance
[n bytes] coin_balance
[4 bytes] Length of mask
[n bytes] mask
[4 bytes] Length of additional_reference
[n bytes] additional_reference
[4 bytes] Length of additional_reference_key
[n bytes] additional_reference_key
```

### TransactionInput (0x0507)

```text
[4 bytes] 0x00000507
[4 bytes] Length of commitment
[n bytes] commitment
[4 bytes] Length of signature
[n bytes] signature
[4 bytes] Count of proofs
For each proof:
  [4 bytes] Length of proof
  [n bytes] proof
```

### TransactionOutput (0x0508)

```text
[4 bytes] 0x00000508
[4 bytes] Length of frame_number
[n bytes] frame_number
[4 bytes] Length of commitment
[n bytes] commitment
[4 bytes] Length of recipient_output (0 for nil)
[n bytes] recipient_output (RecipientBundle canonical bytes if not nil)
```

### Transaction (0x0509)

```text
[4 bytes] 0x00000509
[4 bytes] Length of domain
[n bytes] domain
[4 bytes] Count of inputs
For each input:
  [4 bytes] Length of input
  [n bytes] input (TransactionInput canonical bytes)
[4 bytes] Count of outputs
For each output:
  [4 bytes] Length of output
  [n bytes] output (TransactionOutput canonical bytes)
[4 bytes] Count of fees
For each fee:
  [4 bytes] Length of fee
  [n bytes] fee
[4 bytes] Length of range_proof
[n bytes] range_proof
[4 bytes] Length of traversal_proof (0 for nil)
[n bytes] traversal_proof (canonical bytes if not nil)
[n bytes] signature
```

### PendingTransactionInput (0x050A)

```text
[4 bytes] 0x0000050A
[4 bytes] Length of commitment
[n bytes] commitment
[4 bytes] Length of signature
[n bytes] signature
[4 bytes] Count of proofs
For each proof:
  [4 bytes] Length of proof
  [n bytes] proof
```

### PendingTransactionOutput (0x050B)

```text
[4 bytes] 0x0000050B
[4 bytes] Length of frame_number
[n bytes] frame_number
[4 bytes] Length of commitment
[n bytes] commitment
[4 bytes] Length of to (0 for nil)
[n bytes] to (canonical bytes if not nil)
[4 bytes] Length of refund (0 for nil)
[n bytes] refund (canonical bytes if not nil)
[8 bytes] expiration (uint64)
```

### PendingTransaction (0x050C)

```text
[4 bytes] 0x0000050C
[4 bytes] Length of domain
[n bytes] domain
[4 bytes] Count of inputs
For each input:
  [4 bytes] Length of input
  [n bytes] input (PendingTransactionInput canonical bytes)
[4 bytes] Count of outputs
For each output:
  [4 bytes] Length of output
  [n bytes] output (PendingTransactionOutput canonical bytes)
[4 bytes] Count of fees
For each fee:
  [4 bytes] Length of fee
  [n bytes] fee
[4 bytes] Length of range_proof
[n bytes] range_proof
[4 bytes] Length of traversal_proof (0 for nil)
[n bytes] traversal_proof (canonical bytes if not nil)
[n bytes] signature
```

### MintTransactionInput (0x050D)

```
[4 bytes] 0x0000050D
[4 bytes] Length of value
[n bytes] value
[4 bytes] Length of commitment
[n bytes] commitment
[4 bytes] Length of signature
[n bytes] signature
[4 bytes] Count of proofs
For each proof:
  [4 bytes] Length of proof
  [n bytes] proof
[4 bytes] Length of additional_reference_encryption_key
[n bytes] additional_reference_encryption_key
[4 bytes] Length of additional_reference_key_encryption_key
[n bytes] additional_reference_key_encryption_key
```

### MintTransactionOutput (0x050E)

```
[4 bytes] 0x0000050E
[4 bytes] Length of frame_number
[n bytes] frame_number
[4 bytes] Length of commitment
[n bytes] commitment
[4 bytes] Length of recipient_output (0 for nil)
[n bytes] recipient_output (RecipientBundle canonical bytes if not nil)
```

### MintTransaction (0x050F)

```
[4 bytes] 0x0000050F
[4 bytes] Length of domain
[n bytes] domain
[4 bytes] Count of inputs
For each input:
  [4 bytes] Length of input
  [n bytes] input (MintTransactionInput canonical bytes)
[4 bytes] Count of outputs
For each output:
  [4 bytes] Length of output
  [n bytes] output (MintTransactionOutput canonical bytes)
[4 bytes] Count of fees
For each fee:
  [4 bytes] Length of fee
  [n bytes] fee
[4 bytes] Length of range_proof
[n bytes] range_proof
[n bytes] signature
```

---

## Compute Types (0x0600-0x06FF)

### ComputeConfiguration (0x0600)

```
[4 bytes] 0x00000600
[4 bytes] Length of read_public_key
[n bytes] read_public_key
[4 bytes] Length of write_public_key
[n bytes] write_public_key
[4 bytes] Length of owner_public_key
[n bytes] owner_public_key
```

### ComputeDeployment (0x0601)

```
[4 bytes] 0x00000601
[4 bytes] Length of config (0 for nil)
[n bytes] config (ComputeConfiguration canonical bytes if not nil)
[4 bytes] Length of rdf_schema
[n bytes] rdf_schema
```

### ComputeUpdate (0x0602)

```
[4 bytes] 0x00000602
[4 bytes] Length of config (0 for nil)
[n bytes] config (ComputeConfiguration canonical bytes if not nil)
[4 bytes] Length of public_key_signature_bls48581 (0 for nil)
[n bytes] public_key_signature_bls48581 (BLS48581AggregateSignature canonical bytes if not nil)
```

### CodeDeployment (0x0603)

```
[4 bytes] 0x00000603
[4 bytes] Length of circuit
[n bytes] circuit
[4 bytes] Count of input_types
For each input_type:
  [4 bytes] Length of input_type
  [n bytes] input_type (string)
[4 bytes] Count of output_types
For each output_type:
  [4 bytes] Length of output_type
  [n bytes] output_type (string)
[32 bytes] domain (fixed size)
```

### Application (0x0604)

```
[4 bytes] 0x00000604
[4 bytes] Length of address
[n bytes] address
[4 bytes] execution_context (uint32)
```

### IntrinsicExecutionInput (0x0605)

```
[4 bytes] 0x00000605
[4 bytes] Length of address
[n bytes] address
[4 bytes] Length of input
[n bytes] input
```

### IntrinsicExecutionOutput (0x0606)

```
[4 bytes] 0x00000606
[4 bytes] Length of address
[n bytes] address
[4 bytes] Length of output
[n bytes] output
[4 bytes] Length of proof
[n bytes] proof
```

### ExecutionDependency (0x0607)

```
[4 bytes] 0x00000607
[4 bytes] Length of identifier
[n bytes] identifier
[4 bytes] Count of read_set
For each read:
  [4 bytes] Length of read
  [n bytes] read
[4 bytes] Count of write_set
For each write:
  [4 bytes] Length of write
  [n bytes] write
[4 bytes] stage (uint32)
```

### ExecuteOperation (0x0608)

```
[4 bytes] 0x00000608
[4 bytes] Length of application
[n bytes] application (Application canonical bytes)
[4 bytes] Length of identifier
[n bytes] identifier
[4 bytes] Count of dependencies
For each dependency:
  [4 bytes] Length of dependency
  [n bytes] dependency
```

### ExecutionNode (0x0609)

```
[4 bytes] 0x00000609
[4 bytes] Length of operation (0 for nil)
[n bytes] operation (ExecuteOperation canonical bytes if not nil)
[4 bytes] Count of read_set
For each read:
  [4 bytes] Length of read
  [n bytes] read
[4 bytes] Count of write_set
For each write:
  [4 bytes] Length of write
  [n bytes] write
[4 bytes] stage (uint32)
[1 byte] visited (bool)
[1 byte] in_progress (bool)
```

### ExecutionDAG (0x060A)

```
[4 bytes] 0x0000060A
[4 bytes] Count of operations map entries
For each map entry:
  [4 bytes] Length of key (string)
  [n bytes] key
  [4 bytes] Length of node
  [n bytes] node (ExecutionNode canonical bytes)
[4 bytes] Count of stages
For each stage:
  [4 bytes] Length of stage
  [n bytes] stage (ExecutionStage canonical bytes)
```

### ExecutionStage (0x060B)

```
[4 bytes] 0x0000060B
[4 bytes] Count of operation_ids
For each operation_id:
  [4 bytes] Length of operation_id
  [n bytes] operation_id (string)
```

### CodeExecute (0x060C)

```
[4 bytes] 0x0000060C
[4 bytes] Count of proof_of_payment
For each proof:
  [4 bytes] Length of proof
  [n bytes] proof
[32 bytes] domain (fixed size)
[32 bytes] rendezvous (fixed size)
[4 bytes] Count of execute_operations
For each operation:
  [4 bytes] Length of operation
  [n bytes] operation (ExecuteOperation canonical bytes)
```

### StateTransition (0x060D)

```
[4 bytes] 0x0000060D
[4 bytes] Length of domain
[n bytes] domain
[4 bytes] Length of previous_state
[n bytes] previous_state
[4 bytes] Length of new_state
[n bytes] new_state
```

### ExecutionResult (0x060E)

```
[4 bytes] 0x0000060E
[4 bytes] Length of proof_of_payment
[n bytes] proof_of_payment
[4 bytes] Length of domain
[n bytes] domain
[4 bytes] Length of output
[n bytes] output
[4 bytes] Length of proof
[n bytes] proof
```

### CodeFinalize (0x060F)

```
[4 bytes] 0x0000060F
[32 bytes] rendezvous (fixed size)
[4 bytes] Count of results
For each result:
  [4 bytes] Length of result
  [n bytes] result (ExecutionResult canonical bytes)
[4 bytes] Count of state_changes
For each state_change:
  [4 bytes] Length of state_change
  [n bytes] state_change (StateTransition canonical bytes)
[4 bytes] Length of proof_of_execution
[n bytes] proof_of_execution
[4 bytes] Length of message_output
[n bytes] message_output
```

---

## Emergency Types (0x0900-0x09FF)

### GlobalAlert (0x0911)

```
[4 bytes] 0x00000911
[4 bytes] Length of message
[n bytes] message
[4 bytes] Length of signature
[n bytes] signature
```

---

## Implementation Guidance

- This specification mirrors the `ToCanonicalBytes` implementations in the codebase.
- Some types use union/oneof patterns (e.g., `MessageRequest`, `SignedX448Key`); the discriminator byte precedes the selected variant’s canonical bytes.
- Optional message fields use length `0` to indicate `nil`, followed by canonical bytes if present.
- Fixed-size key values are written directly without length prefixes; all other byte arrays and nested messages are length-prefixed.

