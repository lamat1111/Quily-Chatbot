---
sidebar_label: PutObject
title: PutObject
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ApiTester from '@site/src/components/ApiTester';
import ParamsTable from '@site/src/components/ParamsTable';
import ApiExample from '@site/src/components/ApiExample';

export const HEADER_PARAMETERS = [
  {
    name: "Content-Length",
    type: "number",
    description: "Size of the object in bytes",
    required: true,
    placeholder: "1024"
  },
  {
    name: "Content-Type",
    type: "text",
    description: "A standard MIME type describing the format of the object data",
    required: false,
    placeholder: "text/plain"
  },
  {
    name: "Content-MD5",
    type: "text",
    description: "The base64-encoded 128-bit MD5 digest of the message (RFC 1864)",
    required: false,
    placeholder: "ZDQxZDhjZDk4ZjAwYjIwNGU5ODAwOTk4ZWNmODQyN2U="
  },
  {
    name: "Cache-Control",
    type: "text",
    description: "Can be used to specify caching behavior along the request/reply chain",
    required: false,
    placeholder: "max-age=3600"
  },
  {
    name: "Content-Disposition",
    type: "text",
    description: "Specifies presentational information for the object",
    required: false,
    placeholder: "attachment; filename=\"filename.jpg\""
  },
  {
    name: "Content-Encoding",
    type: "text",
    description: "Specifies what content encodings have been applied to the object",
    required: false,
    placeholder: "gzip"
  },
  {
    name: "Expires",
    type: "text",
    description: "The date and time at which the object is no longer cacheable",
    required: false,
    placeholder: "Wed, 21 Oct 2025 07:28:00 GMT"
  },
  {
    name: "x-amz-acl",
    type: "text",
    description: "The canned ACL to apply to the object",
    required: false,
    validValues: ["private", "public-read", "public-read-write", "authenticated-read", "aws-exec-read", "bucket-owner-read", "bucket-owner-full-control"],
    placeholder: "private"
  },
  {
    name: "x-amz-checksum-crc32",
    type: "text",
    description: "The Base64 encoded, 32-bit CRC32 checksum of the object for data integrity verification",
    required: false,
    placeholder: "Q2hlY2tzdW0="
  },
  {
    name: "x-amz-checksum-crc32c",
    type: "text",
    description: "The Base64 encoded, 32-bit CRC32C checksum of the object for data integrity verification",
    required: false,
    placeholder: "Q2hlY2tzdW0="
  },
  {
    name: "x-amz-checksum-sha1",
    type: "text",
    description: "The Base64 encoded, 160-bit SHA1 digest of the object for data integrity verification",
    required: false,
    placeholder: "Q2hlY2tzdW0="
  },
  {
    name: "x-amz-checksum-sha256",
    type: "text",
    description: "The Base64 encoded, 256-bit SHA256 digest of the object for data integrity verification",
    required: false,
    placeholder: "Q2hlY2tzdW0="
  },
  {
    name: "x-amz-grant-full-control",
    type: "text",
    description: "Gives the grantee READ, READ_ACP, and WRITE_ACP permissions on the object",
    required: false,
    placeholder: "id=123456789012"
  },
  {
    name: "x-amz-grant-read",
    type: "text",
    description: "Allows grantee to read the object data and its metadata",
    required: false,
    placeholder: "id=123456789012"
  },
  {
    name: "x-amz-grant-read-acp",
    type: "text",
    description: "Allows grantee to read the object ACL",
    required: false,
    placeholder: "id=123456789012"
  },
  {
    name: "x-amz-grant-write-acp",
    type: "text",
    description: "Allows grantee to write the ACL for the applicable object",
    required: false,
    placeholder: "id=123456789012"
  },
  {
    name: "x-amz-server-side-encryption",
    type: "text",
    description: "The server-side encryption algorithm to use when storing this object",
    required: false,
    validValues: ["AES256", "verenc"],
    placeholder: "AES256"
  },
  {
    name: "x-amz-server-side-encryption-aws-kms-key-id",
    type: "text",
    description: "The ID of the QKMS key to use for object encryption. Required if x-amz-server-side-encryption is verenc",
    required: false,
    placeholder: "arn:verenc:account:key/key-id"
  },
  {
    name: "x-amz-server-side-encryption-context",
    type: "text",
    description: "Specifies the QKMS Encryption Context to use for object encryption (Base64-encoded string of UTF-8 encoded JSON)",
    required: false,
    placeholder: "eyJjb250ZXh0IjoiZXhhbXBsZSJ9"
  },
  {
    name: "x-amz-server-side-encryption-bucket-key-enabled",
    type: "text",
    description: "Specifies whether to use an QStorage Bucket Key for object encryption with QKMS (SSE-KMS)",
    required: false,
    placeholder: "true"
  },
  {
    name: "x-amz-sdk-checksum-algorithm",
    type: "text",
    description: "Indicates the algorithm used to create the checksum when using the SDK",
    required: false,
    validValues: ["CRC32", "CRC32C", "SHA1", "SHA256", "CRC64NVME"],
    placeholder: "CRC32"
  },
  {
    name: "x-amz-meta-*",
    type: "text",
    description: "User-defined metadata. Each key-value pair in the metadata is stored with the object. Total size of all metadata must be less than 2KB.",
    required: false,
    placeholder: "x-amz-meta-title: My Document"
  },
  {
    name: "x-amz-tagging",
    type: "text",
    description: "The tag-set for the object. The tag-set must be encoded as URL Query parameters",
    required: false,
    placeholder: "key1=value1&key2=value2"
  },
  {
    name: "x-amz-expected-bucket-owner",
    type: "text",
    description: "The account ID of the expected bucket owner. Request fails with 403 Forbidden if the account ID doesn't match the actual bucket owner",
    required: false,
    placeholder: "123456789012"
  },
  {
    name: "x-amz-object-lock-legal-hold",
    type: "text",
    description: "Specifies whether a legal hold will be applied to this object. For more information about Object Lock, see Object Lock documentation",
    required: false,
    validValues: ["ON", "OFF"],
    placeholder: "ON"
  },
  {
    name: "x-amz-object-lock-mode",
    type: "text",
    description: "The Object Lock mode that you want to apply to this object",
    required: false,
    validValues: ["GOVERNANCE", "COMPLIANCE"],
    placeholder: "GOVERNANCE"
  },
  {
    name: "x-amz-object-lock-retain-until-date",
    type: "text",
    description: "The date and time when you want this object's Object Lock to expire. Must be formatted as a timestamp parameter.",
    required: false,
    placeholder: "2024-12-31T23:59:59Z"
  }
];


export const RESPONSE_HEADERS = [
  {
    name: "x-amz-id-2",
    description: "An identifier for the request that you can use to troubleshoot issues"
  },
  {
    name: "x-amz-request-id",
    description: "A unique identifier for the request that you can use to troubleshoot issues"
  },
  {
    name: "x-amz-version-id",
    description: "The version ID of the object. When you upload an object in a bucket with versioning enabled, QStorage automatically generates a version ID for the object"
  },
  {
    name: "x-amz-expiration",
    description: "If the object expiration is configured, this header contains the expiration date of the object and the rule ID that matches the object"
  },
  {
    name: "ETag",
    description: "Entity tag containing an MD5 hash of the object. The ETag reflects changes only to the contents of an object, not its metadata"
  },
  {
    name: "x-amz-server-side-encryption",
    description: "The server-side encryption algorithm used when storing this object (AES256, verenc)",
    validValues: ["AES256", "verenc"]
  },
  {
    name: "x-amz-server-side-encryption-aws-kms-key-id",
    description: "If x-amz-server-side-encryption is verenc, this header specifies the ID of the Quilibrium Key Management Service (QKMS) symmetric encryption customer managed key that was used for the object"
  },
  {
    name: "x-amz-server-side-encryption-customer-algorithm",
    description: "If server-side encryption with customer-provided encryption keys was requested, this header confirms the encryption algorithm used"
  },
  {
    name: "x-amz-server-side-encryption-customer-key-MD5",
    description: "If server-side encryption with customer-provided encryption keys was requested, this header provides the base64-encoded MD5 digest of the encryption key"
  },
  {
    name: "x-amz-server-side-encryption-bucket-key-enabled",
    description: "Indicates whether the uploaded object uses an QStorage Bucket Key for server-side encryption with QKMS (SSE-KMS)"
  },
  {
    name: "x-amz-checksum-crc32",
    description: "This header is returned when using the CRC32 checksum algorithm to verify object integrity"
  },
  {
    name: "x-amz-checksum-crc32c",
    description: "This header is returned when using the CRC32C checksum algorithm to verify object integrity"
  },
  {
    name: "x-amz-checksum-sha1",
    description: "This header is returned when using the SHA-1 checksum algorithm to verify object integrity"
  },
  {
    name: "x-amz-checksum-sha256",
    description: "This header is returned when using the SHA-256 checksum algorithm to verify object integrity"
  },
  {
    name: "x-amz-request-charged",
    description: "If present, indicates that the requester was successfully charged for the request.",
    validValues: ["requester"]
  },
  {
    name: "x-amz-object-size",
    description: "The size of the object in bytes. This value is only present if you append to an object"
  },
  {
    name: "x-amz-checksum-type",
    description: "Specifies the checksum type of the object.<br/><br/>For PutObject uploads, the value is always <span class=\"valid-value\">FULL_OBJECT</span>.",
    validValues: ["COMPOSITE", "FULL_OBJECT"]
  }
];

# PutObject

Adds an object to a bucket.

## Description

The `PutObject` operation adds an object to a bucket. You can use `PutObject` to create a new object or replace an existing object. To use this operation, you must have `s3:PutObject` permissions on the bucket, or be the bucket owner.

:::note Important
- QStorage never adds partial objects; if you receive a success response, QStorage added the entire object to the bucket.
- If you upload an object that has the same key as an existing object in the bucket, QStorage replaces the existing object.
- You cannot use `PutObject` to only update a single piece of metadata for an existing object. You must put the entire object with updated metadata if you want to update some values.
- The maximum size of a single PUT operation is 5 GB.
- For objects larger than 100 MB, consider using multipart uploads for better reliability.
- User-defined metadata is limited to 2 KB in size.
- Headers with the prefix `x-amz-meta-` are treated as user-defined metadata.
- You can use SSE, but this means your uploaded data will be encrypted twice, once with the specified key, and again for storage.
:::

### Access Control Lists (ACLs)
- By default, all objects are private. Only the owner has full access control.
- You can use headers to grant ACL-based permissions to individual accounts or predefined groups.
- You can use either canned ACLs (x-amz-acl) or grant specific permissions (x-amz-grant-* headers).
- If the bucket uses the bucket owner enforced setting for Object Ownership, ACLs are disabled.

### Data Integrity
- You can use Content-MD5 header for basic data integrity verification.
- For enhanced integrity checking, you can use one of the following checksum algorithms:
  - CRC32 (x-amz-checksum-crc32)
  - CRC32C (x-amz-checksum-crc32c)
  - SHA1 (x-amz-checksum-sha1)
  - SHA256 (x-amz-checksum-sha256)
- When using SDKs, you can specify the checksum algorithm using x-amz-sdk-checksum-algorithm.

### Server-Side Encryption
- Objects are encrypted by default using server-side encryption with QStorage managed keys.
- You can specify the following encryption options:
  - QStorage managed keys (SSE-S3) using AES256
  - QKMS keys (SSE-KMS) using verenc
  - Double encryption with QKMS keys (DSSE-KMS) using verenc:dsse
- When using KMS encryption, you can specify:
  - The KMS key ID (x-amz-server-side-encryption-aws-kms-key-id)
  - Additional encryption context (x-amz-server-side-encryption-context)
  - Whether to use QStorage Bucket Keys (x-amz-server-side-encryption-bucket-key-enabled)

### Object Lock
- You can use Object Lock to prevent an object from being deleted or overwritten for a fixed amount of time or indefinitely.
- Object Lock can be applied in one of two modes:
  - GOVERNANCE mode: Users with special permissions can override these retention settings
  - COMPLIANCE mode: No one, including the root user, can override or delete the object until retention expires
- Legal holds can be placed independently of retention periods
- To use Object Lock:
  - Specify the lock mode using x-amz-object-lock-mode
  - Set the retention period using x-amz-object-lock-retain-until-date
  - Apply legal holds using x-amz-object-lock-legal-hold
- Object Lock must be enabled on the bucket before it can be used on objects

### Required Permissions
- To successfully complete the `PutObject` request, you must have the `s3:PutObject` permission on the bucket.
- To change the object's ACL with your `PutObject` request, you must have the `s3:PutObjectAcl` permission.
- To set the tag-set with your `PutObject` request, you must have the `s3:PutObjectTagging` permission.
:::

## Request Syntax

<ApiExample
  request={{
    method: "PUT",
    path: "/_ObjectKey_",
    headers: {
      "Host": "_BucketName_.qstorage.quilibrium.com",
      "Content-Length": "_ContentLength_",
      "Content-Type": "_ContentType_",
      "Content-MD5": "_ContentMD5_",
      "x-amz-meta-*": "_MetadataValue_",
      "x-amz-expected-bucket-owner": "_OwnerAccountId_"
    },
    body: "_[12345 bytes of object data]_"
  }}
  response={{}}
/>

## Request Parameters

### Headers

<ParamsTable parameters={HEADER_PARAMETERS} />

## Examples

### Example 1: Upload a text file

<ApiExample
  request={{
    method: "PUT",
    path: "/hello.txt",
    headers: {
      "Host": "_my-bucket_.qstorage.quilibrium.com",
      "Content-Length": "11",
      "Content-Type": "text/plain"
    },
    body: "Hello World"
  }}
  response={{
    status: 200,
    headers: {
      "x-amz-id-2": "_Example7qoYGN7uMuFuYS6m7a4l_",
      "x-amz-request-id": "_TX234S0F24A06C7_",
      "Date": "_Wed, 01 Mar 2024 12:00:00 GMT_",
      "ETag": "\"7778aef83f66abc1fa1e8477f296d394\""
    }
  }}
/>

### Example 2: Upload an object with metadata

<ApiExample
  request={{
    method: "PUT",
    path: "/document.txt",
    headers: {
      "Host": "_my-bucket_.qstorage.quilibrium.com",
      "Content-Length": "11",
      "Content-Type": "text/plain",
      "x-amz-meta-title": "My Document",
      "x-amz-meta-author": "John Doe"
    },
    body: "Hello World"
  }}
  response={{
    status: 200,
    headers: {
      "x-amz-id-2": "_Example7qoYGN7uMuFuYS6m7a4l_",
      "x-amz-request-id": "_TX234S0F24A06C7_",
      "Date": "_Wed, 01 Mar 2024 12:00:00 GMT_",
      "ETag": "\"7778aef83f66abc1fa1e8477f296d394\""
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
      "Date": "_ISO8601Date_",
      "ETag": "_EntityTag_"
    }
  }}
/>

## Response Elements

### Response Headers

<ParamsTable responseElements={RESPONSE_HEADERS} type="response" />

## Special Errors

| Error Code | Description |
|------------|-------------|
| NoSuchBucket | The specified bucket does not exist |
| InvalidDigest | The Content-MD5 you specified did not match what we received |
| BadDigest | The Content-MD5 you specified was invalid |
| EntityTooLarge | Your proposed upload exceeds the maximum allowed object size |
| InvalidTag | The tag provided was not a valid tag. All tags must follow the tag format requirements |
| MissingContentLength | You must provide the Content-Length HTTP header |
| MissingRequestBodyError | Request body is empty |
| RequestTimeout | Your socket connection to the server was not read from or written to within the timeout period |
| 403 | Forbidden. Authentication failed or you do not have permission to add an object to the bucket |

## Permissions

You must have the `s3:PutObject` permission on the bucket. Additional permissions may be required:
- `s3:PutObjectAcl` - To set the object ACL
- `s3:PutObjectTagging` - To set object tags
- `s3:PutObjectVersionAcl` - To set ACL on a specific object version

## Try It Out

<ApiTester
  operation="PutObject"
  description="Add an object to a bucket."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket to add the object to"
    },
    {
      name: "objectKey",
      type: "text",
      required: true,
      placeholder: "hello.txt",
      description: "Key of the object to create"
    },
    {
      name: "data",
      type: "text",
      required: true,
      placeholder: "Hello World",
      description: "Content of the object"
    },
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "x-amz-id-2": "_Example7qoYGN7uMuFuYS6m7a4l_",
    "x-amz-request-id": "_TX234S0F24A06C7_",
    "Date": "_Wed, 01 Mar 2024 12:00:00 GMT_",
    "ETag": "\"7778aef83f66abc1fa1e8477f296d394\""
  }}
/> 