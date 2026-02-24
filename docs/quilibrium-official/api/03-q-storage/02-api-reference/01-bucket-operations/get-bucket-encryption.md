---
sidebar_label: GetBucketEncryption
title: GetBucketEncryption
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ApiTester from '@site/src/components/ApiTester';
import ParamsTable from '@site/src/components/ParamsTable';
import ApiExample from '@site/src/components/ApiExample';

export const HEADER_PARAMETERS = [
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

export const RESPONSE_BODY_ELEMENTS = [
  {
    name: "ServerSideEncryptionConfiguration",
    type: "Container",
    description: "Container for server-side encryption configuration rules",
    required: true
  },
  {
    name: "Rule",
    type: "<a href=\"/docs/api/q-storage/api-reference/data-types/server-side-encryption-rule\">ServerSideEncryptionRule</a>",
    description: "Container for a server-side encryption rule. The bucket encryption configuration can include only one rule.",
    required: true
  }
];

# GetBucketEncryption

Returns the default encryption configuration for a bucket.

## Description

The `GetBucketEncryption` operation returns the default encryption configuration for a bucket. By default, all buckets have encryption enabled with QStorage-managed keys.

:::note
- To use this operation, you must have permission to perform the `s3:GetEncryptionConfiguration` action.
- You must be the bucket owner to use this operation.
- If the bucket does not have a default encryption configuration, QStorage returns a `ServerSideEncryptionConfigurationNotFoundError` error.
:::

## Request Syntax

<ApiExample
  request={{
    method: "GET",
    path: "/?encryption",
    headers: {
      "Host": "_BucketName_.qstorage.quilibrium.com",
      "x-amz-expected-bucket-owner": "_OwnerAccountId_"
    }
  }}
  response={{}}
/>

This operation does not have a request body.

## Request Parameters

### Headers

<ParamsTable parameters={HEADER_PARAMETERS} />

## Examples

### Example 1: Get default encryption configuration from a bucket

<ApiExample
  request={{
    method: "GET",
    path: "/?encryption",
    headers: {
      "Host": "_my-bucket_.qstorage.quilibrium.com"
    }
  }}
  response={{
    status: 200,
    headers: {
      "x-amz-id-2": "_Example7qoYGN7uMuFuYS6m7a4l_",
      "x-amz-request-id": "_TX234S0F24A06C7_",
      "Date": "_Wed, 01 Mar 2024 12:00:00 GMT_"
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<ServerSideEncryptionConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <Rule>
      <ApplyServerSideEncryptionByDefault>
         <SSEAlgorithm>AES256</SSEAlgorithm>
      </ApplyServerSideEncryptionByDefault>
   </Rule>
</ServerSideEncryptionConfiguration>`
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
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<ServerSideEncryptionConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <Rule>
      <ApplyServerSideEncryptionByDefault>
         <SSEAlgorithm>_Algorithm_</SSEAlgorithm>
         <KMSMasterKeyID>_KeyId_</KMSMasterKeyID>
      </ApplyServerSideEncryptionByDefault>
      <BucketKeyEnabled>_BooleanValue_</BucketKeyEnabled>
   </Rule>
</ServerSideEncryptionConfiguration>`
  }}
/>

## Response Elements

### Response Headers

<ParamsTable responseElements={RESPONSE_HEADERS} type="response" />

### Response Body Elements

<ParamsTable parameters={RESPONSE_BODY_ELEMENTS} />

## Special Errors

| Error Code | Description |
|------------|-------------|
| NoSuchBucket | The specified bucket does not exist |
| ServerSideEncryptionConfigurationNotFoundError | The server-side encryption configuration was not found |
| 403 | Forbidden. Authentication failed or you do not have permission to get the encryption configuration |

## Permissions

You must have the `s3:GetEncryptionConfiguration` permission.

## Try It Out

<ApiTester
  operation="GetBucketEncryption"
  description="Get the default encryption configuration of a bucket."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket to get encryption configuration from"
    },
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "ServerSideEncryptionConfiguration": {
      "Rule": {
        "ApplyServerSideEncryptionByDefault": {
          "SSEAlgorithm": "AES256"
        }
      }
    }
  }}
/> 