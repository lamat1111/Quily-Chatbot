---
sidebar_label: PutObjectLegalHold
title: PutObjectLegalHold
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ApiTester from '@site/src/components/ApiTester';
import ParamsTable from '@site/src/components/ParamsTable';
import ApiExample from '@site/src/components/ApiExample';

export const HEADER_PARAMETERS = [
  {
    name: "x-amz-legal-hold",
    type: "text",
    description: "Specifies whether you want to apply a Legal Hold to the object.",
    required: true,
    validValues: ['ON', 'OFF'],
    placeholder: "ON"
  },
  {
    name: "Content-MD5",
    type: "text",
    description: "The base64-encoded 128-bit MD5 digest of the Legal Hold configuration XML. This header is required by the API specification, but is calculated automatically with some CLI/SDK tooling.",
    required: true,
    placeholder: "ZDQxZDhjZDk4ZjAwYjIwNGU5ODAwOTk4ZWNmODQyN2U="
  },
  {
    name: "x-amz-expected-bucket-owner",
    type: "text",
    description: "The account ID of the expected bucket owner. Request fails with 403 Forbidden if the account ID doesn't match the actual bucket owner",
    required: false,
    placeholder: "123456789012"
  },
  {
    name: "x-amz-request-payer",
    type: "text",
    description: "Confirms that the requester knows that they will be charged for the request. Bucket owners need not specify this parameter in their requests. If either the source or destination S3 bucket has Requester Pays enabled, the requester will pay for corresponding charges to copy the object.",
    required: false,
    validValues: ["requester"],
    placeholder: "requester"
  },
  {
    name: "x-amz-sdk-checksum-algorithm",
    type: "text",
    description: "Indicates the algorithm used to create the checksum for the object when using the SDK. When you send this header, there must be a corresponding x-amz-checksum or x-amz-trailer header sent.",
    required: false,
    validValues: ["CRC32", "CRC32C", "SHA1", "SHA256", "CRC64NVME"],
    placeholder: "CRC32"
  }
];

export const REQUEST_BODY = [
  {
    name: "LegalHold",
    type: "Container",
    description: "Root level tag for the Legal Hold parameters.",
    required: true
  },
  {
    name: "Status",
    type: "String",
    description: "Specifies whether you want to apply a Legal Hold to the object.",
    required: true,
    validValues: ["ON", "OFF"],
    placeholder: "ON"
  }
];

export const RESPONSE_HEADERS = [
  {
    name: "x-amz-request-charged",
    description: "If present, indicates that the requester was successfully charged for the request.",
    validValues: ["requester"]
  }
];

# PutObjectLegalHold

Places or removes a Legal Hold on an object.

## Description

The `PutObjectLegalHold` operation places or removes a Legal Hold on an object. For this operation to succeed, the bucket must have object locking enabled.

:::note Important
- To use this operation, you must have the `s3:PutObjectLegalHold` permission.
- The bucket must have object locking enabled.
- Legal Hold is independent from retention periods and retention modes.
- When an object has a Legal Hold placed on it:
  - The object cannot be deleted
  - The object's version cannot be overwritten
  - The object's metadata cannot be modified
- Legal Hold remains in effect until explicitly removed, regardless of any retention settings.
:::

### Required Permissions
To successfully complete this operation, you must have:
- `s3:PutObjectLegalHold` permission on the object
- The bucket must have object locking enabled

## Request Syntax

<ApiExample
  request={{
    method: "PUT",
    path: "/_ObjectKey_?legal-hold",
    headers: {
      "Host": "_BucketName_.qstorage.quilibrium.com",
      "x-amz-legal-hold": "ON",
      "Content-MD5": "_ContentMD5_"
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<LegalHold>
   <Status>ON</Status>
</LegalHold>`
  }}
  response={{}}
/>

## Request Parameters

### URI Parameters

| Name | Description | Required |
|------|-------------|----------|
| Bucket | The bucket name containing the object that you want to place a legal hold on. | Yes |
| Key | The key name for the object that you want to place a legal hold on. Minimum length of 1. | Yes |
| versionId | The version ID of the object that you want to place a legal hold on. | No |

### Headers

<ParamsTable parameters={HEADER_PARAMETERS} />

### Request Elements

<ParamsTable parameters={REQUEST_BODY} />

## Examples

### Example 1: Place a Legal Hold on an object

<ApiExample
  request={{
    method: "PUT",
    path: "/document.txt?legal-hold",
    headers: {
      "Host": "my-bucket.qstorage.quilibrium.com",
      "x-amz-legal-hold": "ON",
      "Content-MD5": "NDM5MGY5YjhlODMzYjJhNzFmZjNkZGFlOTJhNzE4NDc="
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<LegalHold>
   <Status>ON</Status>
</LegalHold>`
  }}
  response={{
    status: 200,
    headers: {
      "x-amz-request-id": "TX234S0F24A06C7"
    }
  }}
/>

### Example 2: Remove a Legal Hold from an object

<ApiExample
  request={{
    method: "PUT",
    path: "/document.txt?legal-hold",
    headers: {
      "Host": "my-bucket.qstorage.quilibrium.com",
      "x-amz-legal-hold": "OFF",
      "Content-MD5": "OWY5YjhlODMzYjJhNzFmZjNkZGFlOTJhNzE4NDc="
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<LegalHold>
   <Status>OFF</Status>
</LegalHold>`
  }}
  response={{
    status: 200,
    headers: {
      "x-amz-request-id": "TX234S0F24A06C8"
    }
  }}
/>

## Response Syntax

<ApiExample
  request={{}}
  response={{
    status: 200,
    headers: {
      "x-amz-request-id": "_AmazonRequestId_"
    }
  }}
/>

## Response Elements
Returns a HTTP 200 response if successful.

### Response Headers
<ParamsTable responseElements={RESPONSE_HEADERS} type="response" />

## Special Errors

| Error Code | Description |
|------------|-------------|
| InvalidRequest | The request was invalid. Check the error message for details. |
| NoSuchBucket | The specified bucket does not exist. |
| NoSuchKey | The specified key does not exist. |
| ObjectLockConfigurationNotFoundError | Object Lock configuration does not exist for this bucket. |
| 403 | Forbidden. Authentication failed or you do not have permission to perform this operation. |

## Permissions

You must have the `s3:PutObjectLegalHold` permission on the object. The bucket must also have object locking enabled.

## Try It Out

<ApiTester
  operation="PutObjectLegalHold"
  description="Place or remove a Legal Hold on an object."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket containing the object"
    },
    {
      name: "objectKey",
      type: "text",
      required: true,
      placeholder: "document.txt",
      description: "Key of the object to apply Legal Hold to"
    },
    {
      name: "legalHoldStatus",
      type: "select",
      required: true,
      options: ["ON", "OFF"],
      placeholder: "ON",
      description: "Legal Hold status to apply"
    },
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "x-amz-request-id": "TX234S0F24A06C7"
  }}
/> 