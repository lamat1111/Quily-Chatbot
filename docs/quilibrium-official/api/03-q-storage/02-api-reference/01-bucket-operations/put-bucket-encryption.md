---
sidebar_label: PutBucketEncryption
title: PutBucketEncryption
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ApiTester from '@site/src/components/ApiTester';
import ParamsTable from '@site/src/components/ParamsTable';
import ApiExample from '@site/src/components/ApiExample';

export const HEADER_PARAMETERS = [
  {
    name: "Content-MD5",
    type: "text",
    description: "The base64-encoded 128-bit MD5 digest of the request body",
    required: true,
    placeholder: "DqB...=="
  },
  {
    name: "x-amz-expected-bucket-owner",
    type: "text",
    description: "The account ID of the expected bucket owner",
    required: false,
    placeholder: "123456789012"
  }
];

export const RESPONSE_HEADERS = [
  {
    name: "x-amz-id-2",
    description: "An identifier for the request"
  },
  {
    name: "x-amz-request-id",
    description: "A unique identifier for the request"
  },
  {
    name: "Date",
    description: "The date and time at which the response was sent"
  }
];

# PutBucketEncryption

Sets the default encryption configuration for a bucket.

## Description

The `PutBucketEncryption` operation sets the default server-side encryption configuration for a bucket. By default, all buckets have encryption enabled with QStorage-managed keys.

:::important
When using QKMS (SSE-KMS or DSSE-KMS), QStorage will still encrypt the data an additional time with the network's default encryption before it hits the network, regardless of the encryption configuration specified.
:::

:::note
- To use this operation, you must have permission to perform the `s3:PutEncryptionConfiguration` action.
- You must be the bucket owner to use this operation.
- The encryption configuration specified replaces any existing configuration.
:::

## Request Syntax

<ApiExample
  request={{
    method: "PUT",
    path: "/?encryption",
    headers: {
      "Host": "_BucketName_.qstorage.quilibrium.com",
      "Content-MD5": "_Base64EncodedMD5_",
      "x-amz-expected-bucket-owner": "_OwnerAccountId_"
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<ServerSideEncryptionConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <Rule>
      <ApplyServerSideEncryptionByDefault>
         <SSEAlgorithm>verenc</SSEAlgorithm>
         <KMSMasterKeyID>qkms:key-id</KMSMasterKeyID>
      </ApplyServerSideEncryptionByDefault>
      <BucketKeyEnabled>true</BucketKeyEnabled>
   </Rule>
</ServerSideEncryptionConfiguration>`
  }}
  response={{}}
/>

## Request Parameters

### Headers

<ParamsTable parameters={HEADER_PARAMETERS} />

### Request Body Elements

| Name | Type | Description | Required |
|------|------|-------------|-----------|
| ServerSideEncryptionConfiguration | Container | Container for server-side encryption configuration rules | Yes |
| Rule | [ServerSideEncryptionRule](/docs/api/q-storage/api-reference/data-types/server-side-encryption-rule) | Container for a server-side encryption rule. The bucket encryption configuration can include only one rule. | Yes |

## Examples

### Example 1: Set default encryption using QStorage-managed keys (SSE-S3)

<ApiExample
  request={{
    method: "PUT",
    path: "/?encryption",
    headers: {
      "Host": "my-bucket.qstorage.quilibrium.com",
      "Content-MD5": "DqB+2AhQpgX6OJAYrGA8Vw=="
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<ServerSideEncryptionConfiguration>
   <Rule>
      <ApplyServerSideEncryptionByDefault>
         <SSEAlgorithm>AES256</SSEAlgorithm>
      </ApplyServerSideEncryptionByDefault>
   </Rule>
</ServerSideEncryptionConfiguration>`
  }}
  response={{
    status: 200,
    headers: {
      "x-amz-id-2": "Example7qoYGN7uMuFuYS6m7a4l",
      "x-amz-request-id": "TX234S0F24A06C7",
      "Date": "Wed, 01 Mar 2024 12:00:00 GMT"
    }
  }}
/>

### Example 2: Set default encryption using QKMS (SSE-KMS)

<ApiExample
  request={{
    method: "PUT",
    path: "/?encryption",
    headers: {
      "Host": "my-bucket.qstorage.quilibrium.com",
      "Content-MD5": "DqB+2AhQpgX6OJAYrGA8Vw=="
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<ServerSideEncryptionConfiguration>
   <Rule>
      <ApplyServerSideEncryptionByDefault>
         <SSEAlgorithm>verenc</SSEAlgorithm>
         <KMSMasterKeyID>qkms:1234abcd-12ab-34cd-56ef-1234567890ab</KMSMasterKeyID>
      </ApplyServerSideEncryptionByDefault>
      <BucketKeyEnabled>true</BucketKeyEnabled>
   </Rule>
</ServerSideEncryptionConfiguration>`
  }}
  response={{
    status: 200,
    headers: {
      "x-amz-id-2": "Example7qoYGN7uMuFuYS6m7a4l",
      "x-amz-request-id": "TX234S0F24A06C7",
      "Date": "Wed, 01 Mar 2024 12:00:00 GMT"
    }
  }}
/>

## Response Syntax

<ApiExample
  request={{}}
  response={{
    status: 200,
    headers: {
      "x-amz-id-2": "_RequestId_",
      "x-amz-request-id": "_AmazonRequestId_",
      "Date": "_ISO8601Date_"
    }
  }}
/>

## Response Elements

### Response Headers

<ParamsTable responseElements={RESPONSE_HEADERS} type="response" />

This operation does not return a response body.

## Special Errors

| Error Code | Description |
|------------|-------------|
| NoSuchBucket | The specified bucket does not exist |
| InvalidArgument | The encryption configuration is not valid |
| 403 | Forbidden. Authentication failed or you do not have permission to set the encryption configuration |

## Permissions

You must have the `s3:PutEncryptionConfiguration` permission.

## Try It Out

<ApiTester
  operation="PutBucketEncryption"
  description="Set the default encryption configuration of a bucket."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket to set encryption configuration for"
    },
    ...HEADER_PARAMETERS,
    {
      name: "sseAlgorithm",
      type: "select",
      required: true,
      options: [
        { label: "AES256 (default SSE)", value: "AES256" },
        { label: "verenc (SSE-KMS)", value: "verenc" }
      ],
      description: "Server-side encryption algorithm to use"
    },
    {
      name: "kmsMasterKeyId",
      type: "text",
      required: false,
      placeholder: "qkms:key-id",
      description: "QKMS key ID to use (required when using SSE-KMS)"
    },
    {
      name: "bucketKeyEnabled",
      type: "boolean",
      required: false,
      description: "Enable bucket keys to reduce KMS requests"
    }
  ]}
  exampleResponse={{}}
/> 