---
sidebar_label: PutBucketLifecycle
title: PutBucketLifecycle
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ApiTester from '@site/src/components/ApiTester';
import ParamsTable from '@site/src/components/ParamsTable';
import ApiExample from '@site/src/components/ApiExample';

export const HEADER_PARAMETERS = [
  {
    name: "Content-MD5",
    type: "String",
    description: "The base64-encoded 128-bit MD5 digest of the lifecycle configuration XML. This header is required by the API specification but optional for QStorage.",
    required: false
  },
  {
    name: "x-amz-expected-bucket-owner",
    type: "String",
    description: "The account ID of the expected bucket owner. If the account ID that you provide does not match the actual owner of the bucket, the request fails with the HTTP status code 403 Forbidden (access denied).",
    required: false,
    placeholder: "123456789012"
  },
  {
    name: "x-amz-sdk-checksum-algorithm",
    type: "String",
    description: "Indicates the algorithm used to create the checksum for the request when using the SDK. Must be accompanied by either x-amz-checksum or x-amz-trailer header. If an individual checksum is provided, this parameter is ignored.",
    required: false,
    validValues: ["CRC32", "CRC32C", "SHA1", "SHA256", "CRC64NVME"]
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

export const REQUEST_ELEMENTS = [
  {
    name: "LifecycleConfiguration",
    type: "Container",
    description: "Container for lifecycle rules. You can add as many as 1,000 rules.",
    required: true
  },
  {
    name: "Rule",
    type: "<a href=\"/docs/api/q-storage/api-reference/data-types/rule\">Rule</a>",
    description: "Container for a lifecycle rule. You can add as many as 1,000 rules.",
    required: true
  }
];

# PutBucketLifecycle

:::warning Deprecated
For an updated version of this API, see [PutBucketLifecycleConfiguration](/docs/api/q-storage/api-reference/bucket-operations/put-bucket-lifecycle-configuration). If you want to use the `filter` element to specify lifecycle rule filters, you must use the updated API. This topic is provided for backward compatibility.
:::

Creates a new lifecycle configuration for the bucket or replaces an existing lifecycle configuration.

## Description

The `PutBucketLifecycle` operation creates a new lifecycle configuration for the bucket or replaces an existing lifecycle configuration. To use this operation, you must have permission to perform the `s3:PutLifecycleConfiguration` action.

By default, all QStorage objects are persistently stored; however, you can use object lifecycle configuration to manage objects so they are automatically transitioned to different storage classes or expired.

:::note
- If you specify a lifecycle configuration that includes a rule with an `AbortIncompleteMultipartUpload` action, the action applies only to multipart uploads that are initiated after the lifecycle configuration is set.
- This operation is not supported for directory buckets.
:::

## Request Syntax

<ApiExample
  request={{
    method: "PUT",
    path: "/?lifecycle",
    headers: {
      "Host": "_BucketName_.qstorage.quilibrium.com",
      "Content-MD5": "_Base64EncodedMD5_",
      "x-amz-expected-bucket-owner": "_OwnerAccountId_"
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<LifecycleConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <Rule>
      <ID>_string_</ID>
      <Prefix>_string_</Prefix>
      <Status>_string_</Status>
      <Transition>
         <Days>_integer_</Days>
         <StorageClass>_string_</StorageClass>
      </Transition>
      <Expiration>
         <Days>_integer_</Days>
      </Expiration>
      <AbortIncompleteMultipartUpload>
         <DaysAfterInitiation>_integer_</DaysAfterInitiation>
      </AbortIncompleteMultipartUpload>
   </Rule>
</LifecycleConfiguration>`
  }}
  response={{}}
/>

## Request Parameters

### Headers

<ParamsTable parameters={HEADER_PARAMETERS} type="request" />

### Request Elements

<ParamsTable parameters={REQUEST_ELEMENTS} type="request" />

For details about the elements within the Rule type, see <a href="/docs/api/q-storage/api-reference/data-types/rule">Rule</a>.

## Examples

### Example 1: Add lifecycle configuration - archive and then delete

This example adds a lifecycle configuration to a bucket. The configuration specifies that objects with the prefix `projectdocs/` will transition to the STANDARD_IA storage class after 30 days, then to GLACIER after 365 days, and finally be deleted after 3650 days.

<ApiExample
  request={{
    method: "PUT",
    path: "/?lifecycle",
    headers: {
      "Host": "my-bucket.qstorage.quilibrium.com"
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<LifecycleConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <Rule>
      <ID>Archive and then delete rule</ID>
      <Prefix>projectdocs/</Prefix>
      <Status>Enabled</Status>
      <Transition>
         <Days>30</Days>
         <StorageClass>STANDARD_IA</StorageClass>
      </Transition>
      <Transition>
         <Days>365</Days>
         <StorageClass>GLACIER</StorageClass>
      </Transition>
      <Expiration>
         <Days>3650</Days>
      </Expiration>
   </Rule>
</LifecycleConfiguration>`
  }}
  response={{
    status: 200,
    headers: {
      "x-amz-id-2": "_Example7qoYGN7uMuFuYS6m7a4l_",
      "x-amz-request-id": "_TX234S0F24A06C7_",
      "Date": "_Wed, 01 Mar 2024 12:00:00 GMT_"
    }
  }}
/>

## Response Syntax

A successful operation returns either HTTP status code 200 (OK) with an empty response body.

### Response Headers

<ParamsTable parameters={RESPONSE_HEADERS} type="response" />

## Special Errors

| Error Code | Description |
|------------|-------------|
| InvalidArgument | Invalid argument error |
| MalformedXML | The XML provided was not well-formed or did not validate against the published schema |
| NoSuchBucket | The specified bucket does not exist |
| 403 | Forbidden. Authentication failed or you do not have permission to create bucket lifecycle configuration |

## Permissions

You must have the `s3:PutLifecycleConfiguration` permission on the bucket.

## Try It Out

<ApiTester
  operation="PutBucketLifecycle"
  description="Add or update the lifecycle configuration of a bucket."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket to set lifecycle configuration for"
    },
    ...HEADER_PARAMETERS,
    {
      name: "lifecycleConfiguration",
      type: "textarea",
      required: true,
      placeholder: `<?xml version="1.0" encoding="UTF-8"?>
<LifecycleConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <Rule>
      <ID>Archive and then delete rule</ID>
      <Prefix>projectdocs/</Prefix>
      <Status>Enabled</Status>
      <Transition>
         <Days>30</Days>
         <StorageClass>STANDARD_IA</StorageClass>
      </Transition>
      <Expiration>
         <Days>3650</Days>
      </Expiration>
   </Rule>
</LifecycleConfiguration>`,
      description: "The lifecycle configuration XML"
    }
  ]}
  exampleResponse={{
    status: 200,
    headers: {
      "x-amz-id-2": "Example7qoYGN7uMuFuYS6m7a4l",
      "x-amz-request-id": "TX234S0F24A06C7",
      "Date": "Wed, 01 Mar 2024 12:00:00 GMT"
    }
  }}
/> 