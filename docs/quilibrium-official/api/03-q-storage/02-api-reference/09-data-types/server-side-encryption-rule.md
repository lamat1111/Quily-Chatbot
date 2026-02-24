---
sidebar_label: ServerSideEncryptionRule
title: ServerSideEncryptionRule
---

import ParamsTable from '@site/src/components/ParamsTable';

# ServerSideEncryptionRule

The `ServerSideEncryptionRule` data type specifies the default server-side encryption configuration for a bucket.

## Syntax

```xml
<Rule>
   <ApplyServerSideEncryptionByDefault>
      <SSEAlgorithm>string</SSEAlgorithm>
      <KMSMasterKeyID>string</KMSMasterKeyID>
   </ApplyServerSideEncryptionByDefault>
   <BucketKeyEnabled>boolean</BucketKeyEnabled>
</Rule>
```

## Properties

export const serverSideEncryptionRuleParams = [
  {
    name: "ApplyServerSideEncryptionByDefault",
    type: "Container",
    description: "Container for server-side encryption by default configuration",
    required: true
  },
  {
    name: "ApplyServerSideEncryptionByDefault.SSEAlgorithm",
    type: "String",
    description: "Server-side encryption algorithm to use",
    required: true,
    validValues: ["AES256", "verenc"]
  },
  {
    name: "ApplyServerSideEncryptionByDefault.KMSMasterKeyID",
    type: "String",
    description: "QKMS key ID to use. Only required when SSEAlgorithm is `verenc`. Must be prefixed with `qkms:`",
    required: false
  },
  {
    name: "BucketKeyEnabled",
    type: "Boolean",
    description: "Specifies whether QStorage should use an QStorage Bucket Key with SSE-KMS. Bucket keys can reduce your QKMS costs",
    required: false
  }
];

<ParamsTable parameters={serverSideEncryptionRuleParams} typesEnabled={true} />

:::important
When using QKMS (SSE-KMS), QStorage will still encrypt the data an additional time with the network's default encryption before it hits the network, regardless of the encryption configuration specified.
:::

## Examples

### Example 1: SSE-S3 Configuration

```xml
<Rule>
   <ApplyServerSideEncryptionByDefault>
      <SSEAlgorithm>AES256</SSEAlgorithm>
   </ApplyServerSideEncryptionByDefault>
</Rule>
```

### Example 2: SSE-KMS Configuration with Bucket Key

```xml
<Rule>
   <ApplyServerSideEncryptionByDefault>
      <SSEAlgorithm>verenc</SSEAlgorithm>
      <KMSMasterKeyID>qkms:1234abcd-12ab-34cd-56ef-1234567890ab</KMSMasterKeyID>
   </ApplyServerSideEncryptionByDefault>
   <BucketKeyEnabled>true</BucketKeyEnabled>
</Rule>
```

## Description

The ServerSideEncryptionRule type defines how QStorage should encrypt objects in a bucket. You can specify the default encryption method and whether to use bucket keys for SSE-KMS encryption.

## Related Types

### Server Side Encryption By Default

export const serverSideEncryptionByDefaultParams = [
  {
    name: "SSEAlgorithm",
    type: "String",
    description: "Server-side encryption algorithm to use",
    required: true,
    validValues: ["AES256", "verenc"]
  },
  {
    name: "KMSMasterKeyID",
    type: "String",
    description: "KMS key ID to use for object encryption. Only used when SSEAlgorithm is `verenc`",
    required: false
  }
];

<ParamsTable parameters={serverSideEncryptionByDefaultParams} typesEnabled={true} />

## Usage

The ServerSideEncryptionRule type is used in operations that manage default encryption for buckets, such as:

- [PutBucketEncryption](/docs/api/q-storage/api-reference/bucket-operations/put-bucket-encryption)
- [GetBucketEncryption](/docs/api/q-storage/api-reference/bucket-operations/get-bucket-encryption)

:::note
By default, all buckets have encryption enabled with QStorage-managed keys (SSE-S3).
::: 