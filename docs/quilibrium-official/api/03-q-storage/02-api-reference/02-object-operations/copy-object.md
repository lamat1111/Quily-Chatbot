---
title: CopyObject
label: CopyObject
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ApiTester from '@site/src/components/ApiTester';
import ParamsTable from '@site/src/components/ParamsTable';
import ApiExample from '@site/src/components/ApiExample';

export const HEADER_PARAMETERS = [
  {
    name: "x-amz-copy-source",
    type: "text",
    description: "The name of the source bucket and key name of the source object, separated by a forward slash",
    required: true,
    placeholder: "source-bucket/source-object.txt"
  },
  {
    name: "x-amz-acl",
    type: "text",
    description: "The canned ACL to apply to the object.<br/><br/>Valid Values: <span class=\"valid-value\">private | public-read | public-read-write | authenticated-read | bucket-owner-read | bucket-owner-full-control</span>",
    required: false,
    placeholder: "private"
  },
  {
    name: "x-amz-checksum-algorithm",
    type: "text",
    description: "Indicates the algorithm used to create the checksum for the object.<br/><br/>Valid Values: <span class=\"valid-value\">CRC32 | CRC32C | SHA1 | SHA256</span>",
    required: false,
    placeholder: "SHA256"
  },
  {
    name: "x-amz-copy-source-if-match",
    type: "text",
    description: "Copy the object only if its entity tag (ETag) matches the specified tag",
    required: false,
    placeholder: "\"7778aef83f66abc1fa1e8477f296d394\""
  },
  {
    name: "x-amz-copy-source-if-none-match",
    type: "text",
    description: "Copy the object only if its entity tag (ETag) is different from the specified tag",
    required: false,
    placeholder: "\"7778aef83f66abc1fa1e8477f296d394\""
  },
  {
    name: "x-amz-copy-source-if-modified-since",
    type: "text",
    description: "Copy the object only if it has been modified since the specified time",
    required: false,
    placeholder: "_Wed, 01 Mar 2024 12:00:00 GMT_"
  },
  {
    name: "x-amz-copy-source-if-unmodified-since",
    type: "text",
    description: "Copy the object only if it hasn't been modified since the specified time",
    required: false,
    placeholder: "_Wed, 01 Mar 2024 12:00:00 GMT_"
  },
  {
    name: "x-amz-copy-source-server-side-encryption-customer-algorithm",
    type: "text",
    description: "Specifies the algorithm to use when decrypting the source object. Must be used with x-amz-copy-source-server-side-encryption-customer-key and x-amz-copy-source-server-side-encryption-customer-key-MD5",
    required: false,
    placeholder: "AES256"
  },
  {
    name: "x-amz-copy-source-server-side-encryption-customer-key",
    type: "text",
    description: "Specifies the customer-provided encryption key for decrypting the source object. Must be used with x-amz-copy-source-server-side-encryption-customer-algorithm and x-amz-copy-source-server-side-encryption-customer-key-MD5",
    required: false,
    placeholder: "Base64(encryption-key)"
  },
  {
    name: "x-amz-copy-source-server-side-encryption-customer-key-MD5",
    type: "text",
    description: "Specifies the 128-bit MD5 digest of the encryption key according to RFC 1321. Must be used with x-amz-copy-source-server-side-encryption-customer-algorithm and x-amz-copy-source-server-side-encryption-customer-key",
    required: false,
    placeholder: "Base64(MD5(encryption-key))"
  },
  {
    name: "x-amz-metadata-directive",
    type: "text",
    description: "Specifies whether to copy the metadata from the source object or replace it with metadata provided in the request",
    required: false,
    placeholder: "COPY | REPLACE",
    validValues: ["COPY", "REPLACE"]
  },
  {
    name: "x-amz-server-side-encryption",
    type: "text",
    description: "Specifies server-side encryption algorithm to use for the destination object",
    required: false,
    placeholder: "AES256",
    validValues: ["AES256", "verenc"]
  },
  {
    name: "x-amz-server-side-encryption-customer-algorithm",
    type: "text",
    description: "Specifies the algorithm to use to when encrypting the destination object. Must be used with x-amz-server-side-encryption-customer-key and x-amz-server-side-encryption-customer-key-MD5",
    required: false,
    placeholder: "AES256"
  },
  {
    name: "x-amz-server-side-encryption-customer-key",
    type: "text",
    description: "Specifies the customer-provided encryption key for encrypting the destination object. Must be used with x-amz-server-side-encryption-customer-algorithm and x-amz-server-side-encryption-customer-key-MD5",
    required: false,
    placeholder: "Base64(encryption-key)"
  },
  {
    name: "x-amz-server-side-encryption-customer-key-MD5",
    type: "text",
    description: "Specifies the 128-bit MD5 digest of the encryption key according to RFC 1321. Must be used with x-amz-server-side-encryption-customer-algorithm and x-amz-server-side-encryption-customer-key",
    required: false,
    placeholder: "Base64(MD5(encryption-key))"
  },
  {
    name: "x-amz-grant-full-control",
    type: "text",
    description: "Gives the grantee READ, READ_ACP, and WRITE_ACP permissions on the object",
    required: false,
    placeholder: "id=canonical-id"
  },
  {
    name: "x-amz-grant-read",
    type: "text",
    description: "Allows grantee to read the object data and its metadata",
    required: false,
    placeholder: "id=canonical-id"
  },
  {
    name: "x-amz-grant-read-acp",
    type: "text",
    description: "Allows grantee to read the object ACL",
    required: false,
    placeholder: "id=canonical-id"
  },
  {
    name: "x-amz-grant-write-acp",
    type: "text",
    description: "Allows grantee to write the ACL for the applicable object",
    required: false,
    placeholder: "id=canonical-id"
  },
  {
    name: "x-amz-expected-bucket-owner",
    type: "text",
    description: "The account ID of the expected destination bucket owner",
    required: false,
    placeholder: "123456789012"
  },
  {
    name: "x-amz-source-expected-bucket-owner",
    type: "text",
    description: "The account ID of the expected source bucket owner",
    required: false,
    placeholder: "123456789012"
  },
  {
    name: "x-amz-request-payer",
    type: "text",
    description: "Confirms that the requester knows that they will be charged for the request. Required for Requester Pays buckets.",
    required: false,
    placeholder: "requester"
  },
  {
    name: "x-amz-object-lock-retain-until-date",
    type: "text",
    description: "The date and time when the Object Lock retention period expires. Must be formatted as a timestamp in ISO 8601 format.",
    required: false,
    placeholder: "2024-03-01T12:00:00.000Z"
  },
  {
    name: "x-amz-object-lock-mode",
    type: "text",
    description: "The Object Lock mode that you want to apply to the copied object.<br/><br/>Valid Values: <span class=\"valid-value\">GOVERNANCE | COMPLIANCE</span>",
    required: false,
    placeholder: "GOVERNANCE"
  },
  {
    name: "x-amz-object-lock-legal-hold",
    type: "text",
    description: "Specifies whether you want to apply a legal hold to the copied object.<br/><br/>Valid Values: <span class=\"valid-value\">ON | OFF</span>",
    required: false,
    placeholder: "ON"
  },
  {
    name: "x-amz-server-side-encryption-aws-kms-key-id",
    type: "text",
    description: "The ID of the symmetric encryption key to use for object encryption. Must be used with x-amz-server-side-encryption=verenc.",
    required: false,
    placeholder: "arn:verenc:account-id:key/key-id"
  },
  {
    name: "x-amz-server-side-encryption-bucket-key-enabled",
    type: "text",
    description: "Specifies whether QStorage should use an S3 Bucket Key for object encryption.",
    required: false,
    validValues: ["true", "false"],
    placeholder: "true"
  },
  {
    name: "x-amz-server-side-encryption-context",
    type: "text",
    description: "Specifies the encryption context to use for object encryption. Must be base64-encoded and must be used with x-amz-server-side-encryption=verenc.",
    required: false,
    placeholder: "Base64(encryption-context)"
  },
  {
    name: "x-amz-tagging",
    type: "text",
    description: "The tag-set for the object. The tag-set must be encoded as URL Query parameters.",
    required: false,
    placeholder: "key1=value1&key2=value2"
  },
  {
    name: "x-amz-tagging-directive",
    type: "text",
    description: "Specifies whether to copy the tag-set from the source object or replace it with tags provided in the request.<br/><br/>Valid Values: <span class=\"valid-value\">COPY | REPLACE</span>",
    required: false,
    placeholder: "COPY"
  },
  {
    name: "x-amz-website-redirect-location",
    type: "text",
    description: "If the bucket is configured as a website, redirects requests for this object to another object in the same bucket or to an external URL.",
    required: false,
    placeholder: "/anotherpage.html"
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
    name: "x-amz-version-id",
    description: "Version ID of the newly created copy"
  },
  {
    name: "x-amz-copy-source-version-id",
    description: "Version ID of the source object"
  },
  {
    name: "x-amz-server-side-encryption",
    description: "The server-side encryption algorithm used when storing this object in QStorage"
  },
  {
    name: "x-amz-server-side-encryption-aws-kms-key-id",
    description: "If x-amz-server-side-encryption is present and has the value of verenc, this indicates the ID of the Q KMS Key Management Service (KMS) symmetric encryption customer master key that was used for the object"
  },
  {
    name: "x-amz-server-side-encryption-customer-algorithm",
    description: "If server-side encryption with customer-provided encryption keys was requested, the response will include this header confirming the encryption algorithm used"
  },
  {
    name: "x-amz-server-side-encryption-customer-key-MD5",
    description: "If server-side encryption with customer-provided encryption keys was requested, the response will include this header to provide round-trip message integrity verification of the customer-provided encryption key"
  },
  {
    name: "x-amz-server-side-encryption-bucket-key-enabled",
    description: "Indicates whether the copied object uses an S3 Bucket Key for server-side encryption with QKMS (SSE-KMS)"
  }
];

export const RESPONSE_ELEMENTS = [
  {
    name: "CopyObjectResult",
    description: "Container for all response elements. See <a href='/docs/api/q-storage/api-reference/data-types/copy-object-result'>CopyObjectResult</a> for details."
  },
  {
    name: "ETag",
    description: "The entity tag (ETag) that represents the copied object. The ETag reflects only changes to the contents of an object, not its metadata."
  },
  {
    name: "LastModified",
    description: "The date and time at which the copied object was last modified."
  },
  {
    name: "ChecksumCRC32",
    description: "The base64-encoded, 32-bit CRC32 checksum of the object. This will only be present if it was uploaded with the object."
  },
  {
    name: "ChecksumCRC32C",
    description: "The base64-encoded, 32-bit CRC32C checksum of the object. This will only be present if it was uploaded with the object."
  },
  {
    name: "ChecksumCRC64NVME",
    description: "The base64-encoded, 64-bit CRC64 checksum of the object computed using the NVME format. This will only be present if it was uploaded with the object."
  },
  {
    name: "ChecksumSHA1",
    description: "The base64-encoded, 160-bit SHA-1 digest of the object. This will only be present if it was uploaded with the object."
  },
  {
    name: "ChecksumSHA256",
    description: "The base64-encoded, 256-bit SHA-256 digest of the object. This will only be present if it was uploaded with the object."
  },
  {
    name: "ChecksumType",
    description: "The algorithm that was used to create the checksum for the object."
  }
];

# CopyObject

Creates a copy of an object that is already stored in QStorage.

## Description

The `CopyObject` operation creates a copy of an object that is already stored in QStorage. A copy operation creates a new object with the same data and metadata as the source object, but with a different key name and/or destination bucket.

## Permissions

You must have:
- `s3:GetObject` permission on the source object
- `s3:PutObject` permission on the destination bucket

:::note
- The source object and destination must be in QStorage buckets.
- When copying an object, you can preserve all metadata (default) or specify new metadata.
- You cannot copy objects that are larger than 5 GB in size. For larger objects, you must use multipart upload operations.
- The source bucket and destination bucket must exist before you can copy an object.
- You can use SSE, but this means your uploaded data will be encrypted twice, once with the specified key, and again for storage.
:::

## Request Headers

<ParamsTable parameters={HEADER_PARAMETERS} type="request" />

## Request URI Parameters

This operation does not use URI parameters.

## Request Body

This operation does not have a request body.

## Request Syntax

<ApiExample
  request={{
    method: "PUT",
    path: "/{ObjectKey}",
    headers: {
      "Host": "{BucketName}.qstorage.quilibrium.com",
      "x-amz-copy-source": "{SourceBucket}/{SourceObjectKey}",
      "x-amz-copy-source-if-match": "{ETag}",
      "x-amz-copy-source-if-none-match": "{ETag}",
      "x-amz-copy-source-if-modified-since": "{TimeStamp}",
      "x-amz-copy-source-if-unmodified-since": "{TimeStamp}",
      "x-amz-metadata-directive": "COPY | REPLACE",
      "x-amz-expected-bucket-owner": "{OwnerAccountId}",
      "x-amz-source-expected-bucket-owner": "{SourceOwnerAccountId}"
    }
  }}
  response={{}}
/>

## Response Headers

<ParamsTable parameters={RESPONSE_HEADERS} type="response" />

## Response Body Elements

<ParamsTable parameters={RESPONSE_ELEMENTS} type="response" />

## Special Errors

| Error Code | Description |
|------------|-------------|
| NoSuchBucket | The specified bucket does not exist |
| NoSuchKey | The specified source object does not exist |
| InvalidRequest | The specified copy source is not supported |
| EntityTooLarge | The source object is too large to copy using a single operation |
| 403 | Forbidden. Authentication failed or you do not have permission to copy the object |

## Examples

### Example 1: Copy an object

<ApiExample
  request={{
    method: "PUT",
    path: "/destination.txt",
    headers: {
      "Host": "destination-bucket.qstorage.quilibrium.com",
      "x-amz-copy-source": "source-bucket/source.txt"
    }
  }}
  response={{
    status: 200,
    headers: {
      "x-amz-id-2": "{Example7qoYGN7uMuFuYS6m7a4l}",
      "x-amz-request-id": "{TX234S0F24A06C7}",
      "Date": "{Wed, 01 Mar 2024 12:00:00 GMT}",
      "ETag": "\"{7778aef83f66abc1fa1e8477f296d394}\""
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<CopyObjectResult>
   <LastModified>2024-03-01T12:00:00.000Z</LastModified>
   <ETag>"7778aef83f66abc1fa1e8477f296d394"</ETag>
</CopyObjectResult>`
  }}
/>

### Example 2: Copy an object and replace its metadata

<ApiExample
  request={{
    method: "PUT",
    path: "/destination.txt",
    headers: {
      "Host": "destination-bucket.qstorage.quilibrium.com",
      "x-amz-copy-source": "source-bucket/source.txt",
      "x-amz-metadata-directive": "REPLACE",
      "x-amz-meta-title": "New Document",
      "x-amz-meta-author": "Jane Doe"
    }
  }}
  response={{
    status: 200,
    headers: {
      "x-amz-id-2": "{Example7qoYGN7uMuFuYS6m7a4l}",
      "x-amz-request-id": "{TX234S0F24A06C7}",
      "Date": "{Wed, 01 Mar 2024 12:00:00 GMT}",
      "ETag": "\"{7778aef83f66abc1fa1e8477f296d394}\""
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<CopyObjectResult>
   <LastModified>2024-03-01T12:00:00.000Z</LastModified>
   <ETag>"7778aef83f66abc1fa1e8477f296d394"</ETag>
</CopyObjectResult>`
  }}
/>

## Try It Out

<ApiTester
  operation="CopyObject"
  description="Create a copy of an existing object in QStorage."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "destination-bucket",
      description: "Name of the destination bucket"
    },
    {
      name: "objectKey",
      type: "text",
      required: true,
      placeholder: "destination.txt",
      description: "Key of the destination object"
    },
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "CopyObjectResult": {
      "LastModified": "2024-03-01T12:00:00.000Z",
      "ETag": "\"7778aef83f66abc1fa1e8477f296d394\""
    }
  }}
/> 