---
sidebar_label: PutObjectLockConfiguration
title: PutObjectLockConfiguration
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ApiTester from '@site/src/components/ApiTester';
import ParamsTable from '@site/src/components/ParamsTable';
import ApiExample from '@site/src/components/ApiExample';

export const HEADER_PARAMETERS = [
  {
    name: "x-amz-expected-bucket-owner",
    type: "String",
    description: "The account ID of the expected bucket owner",
    required: false,
    placeholder: "123456789012"
  },
  {
    name: "Content-MD5",
    type: "String",
    description: "The base64-encoded 128-bit MD5 digest of the request body",
    required: true,
    placeholder: "1B2M2Y8AsgTpgAmY7PhCfg=="
  },
  {
    name: "x-amz-request-payer",
    type: "String",
    description: "Confirms that the requester knows that they will be charged for the request",
    required: false,
    validValues: ["requester"],
    placeholder: "requester"
  },
  {
    name: "x-amz-sdk-checksum-algorithm",
    type: "String",
    description: "Indicates the algorithm used to create the checksum for the object",
    required: false,
    validValues: ["CRC32", "CRC32C", "SHA1", "SHA256", "CRC64NVME"],
    placeholder: "CRC32|CRC32C|SHA1|SHA256"
  },
  {
    name: "x-amz-bucket-object-lock-token",
    type: "String",
    description: "A token to allow Object Lock to be enabled for an existing bucket",
    required: false,
    placeholder: "token"
  }
];

export const RESPONSE_HEADERS = [
  {
    name: "x-amz-request-charged",
    description: "If present, indicates that the requester was successfully charged for the request",
    validValues: ["requester"]
  },
];

export const URI_PARAMETERS = [
  {
    name: "Bucket",
    type: "String",
    description: "The bucket whose Object Lock configuration you want to create or replace.",
    required: true,
    placeholder: "my-bucket"
  }
];

export const REQUEST_ELEMENTS = [
  {
    name: "ObjectLockConfiguration",
    type: "Container",
    description: "Container for Object Lock configuration parameters.",
    required: true
  },
  {
    name: "ObjectLockEnabled",
    type: "String",
    description: "Indicates whether this bucket has an Object Lock configuration enabled.",
    required: false,
    validValues: ["Enabled"]
  },
  {
    name: "Rule",
    description: "Container for the Object Lock rule for the specified object.",
    type: "<a href=\"/docs/api/q-storage/api-reference/data-types/object-lock-rule\">ObjectLockRule</a>",
    required: false
  }
];

# PutObjectLockConfiguration

Places an Object Lock configuration on the specified bucket.

## Description

The `PutObjectLockConfiguration` operation puts an Object Lock configuration on the specified bucket. The rule specified in the Object Lock configuration will be applied by default to every new object placed in the specified bucket.

:::important
- The bucket must have Object Lock enabled to use this operation.
- Object Lock must be enabled on the bucket when the bucket is created using the `x-amz-bucket-object-lock-enabled` request header.
- The `DefaultRetention` settings require both a mode and a period.
- The `DefaultRetention` period can be either `Days` or `Years` but you must select one. You cannot specify both.
- This operation requires `s3:PutBucketObjectLockConfiguration` permissions.
:::

## Request Syntax

<ApiExample
  request={{
    method: "PUT",
    path: "/?object-lock",
    headers: {
      "Host": "_BucketName_.qstorage.quilibrium.com",
      "Content-MD5": "_Base64EncodedMD5_",
      "x-amz-expected-bucket-owner": "_OwnerAccountId_",
      "x-amz-request-payer": "_RequestPayer_",
      "x-amz-sdk-checksum-algorithm": "_ChecksumAlgorithm_",
      "x-amz-bucket-object-lock-token": "_BucketObjectLockToken_"
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<ObjectLockConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <ObjectLockEnabled>_Enabled_</ObjectLockEnabled>
   <Rule>
      <DefaultRetention>
         <Mode>_GOVERNANCE_</Mode>
         <Days>_Integer_</Days>
         <Years>_Integer_</Years>
      </DefaultRetention>
   </Rule>
</ObjectLockConfiguration>`
  }}
  response={{}}
/>

## Request Parameters

### URI Parameters

<ParamsTable parameters={URI_PARAMETERS} />

### Headers

<ParamsTable parameters={HEADER_PARAMETERS} />

### Request Elements

<ParamsTable parameters={REQUEST_ELEMENTS} type="request" typesEnabled />

## Examples

### Example 1: Set Object Lock configuration with retention period in days

<ApiExample
  request={{
    method: "PUT",
    path: "/?object-lock",
    headers: {
      "Host": "my-bucket.qstorage.quilibrium.com",
      "Content-MD5": "1B2M2Y8AsgTpgAmY7PhCfg==",
      "x-amz-expected-bucket-owner": "123456789012",
      "x-amz-request-payer": "requester",
      "x-amz-sdk-checksum-algorithm": "CRC32",
      "x-amz-bucket-object-lock-token": "token"
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<ObjectLockConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <ObjectLockEnabled>Enabled</ObjectLockEnabled>
   <Rule>
      <DefaultRetention>
         <Mode>COMPLIANCE</Mode>
         <Days>30</Days>
      </DefaultRetention>
   </Rule>
</ObjectLockConfiguration>`
  }}
  response={{
    status: 200,
    headers: {
      "x-amz-id-2": "Example7qoYGN7uMuFuYS6m7a4l",
      "x-amz-request-id": "TX234S0F24A06C7",
      "x-amz-request-charged": "requester",
      "Date": "Wed, 01 Mar 2024 12:00:00 GMT"
    }
  }}
/>

### Example 2: Set Object Lock configuration with retention period in years

<ApiExample
  request={{
    method: "PUT",
    path: "/?object-lock",
    headers: {
      "Host": "my-bucket.qstorage.quilibrium.com",
      "Content-MD5": "1B2M2Y8AsgTpgAmY7PhCfg==",
      "x-amz-expected-bucket-owner": "123456789012",
      "x-amz-request-payer": "requester",
      "x-amz-sdk-checksum-algorithm": "SHA256",
      "x-amz-bucket-object-lock-token": "token"
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<ObjectLockConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <ObjectLockEnabled>Enabled</ObjectLockEnabled>
   <Rule>
      <DefaultRetention>
         <Mode>GOVERNANCE</Mode>
         <Years>1</Years>
      </DefaultRetention>
   </Rule>
</ObjectLockConfiguration>`
  }}
  response={{
    status: 200,
    headers: {
      "x-amz-id-2": "Example7qoYGN7uMuFuYS6m7a4l",
      "x-amz-request-id": "TX234S0F24A06C7",
      "x-amz-request-charged": "requester",
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
      "x-amz-request-charged": "_RequestCharged_",
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
| InvalidRequest | The request is missing required headers or the Object Lock configuration is not valid. |
| ObjectLockConfigurationNotFoundError | This error occurs when you attempt to get an Object Lock configuration for a bucket that does not have a configuration. |
| NoSuchBucket | The specified bucket does not exist. |
| 403 | Forbidden. Authentication failed or you do not have permission to configure Object Lock. |

## Permissions

You must have the `s3:PutBucketObjectLockConfiguration` permission.

## Try It Out

<ApiTester
  operation="PutObjectLockConfiguration"
  description="Set the Object Lock configuration for a bucket."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket to configure Object Lock for"
    },
    {
      name: "mode",
      type: "select",
      required: true,
      options: ["COMPLIANCE", "GOVERNANCE"],
      description: "The Object Lock retention mode to apply"
    },
    {
      name: "retentionPeriod",
      type: "group",
      required: true,
      fields: [
        {
          name: "type",
          type: "select",
          options: ["Days", "Years"],
          description: "The type of retention period"
        },
        {
          name: "value",
          type: "number",
          description: "The retention period value"
        }
      ]
    },
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "statusCode": 200
  }}
/> 