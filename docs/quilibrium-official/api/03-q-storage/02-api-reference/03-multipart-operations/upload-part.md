---
sidebar_label: UploadPart
title: UploadPart
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ApiTester from '@site/src/components/ApiTester';
import ParamsTable from '@site/src/components/ParamsTable';
import ApiExample from '@site/src/components/ApiExample';

export const URI_PARAMETERS = [
  {
    name: "partNumber",
    type: "number",
    description: "Part number of the part being uploaded. This is a positive integer between 1 and 10,000",
    required: true,
    placeholder: "1"
  },
  {
    name: "uploadId",
    type: "text",
    description: "Upload ID identifying the multipart upload whose part is being uploaded",
    required: true,
    placeholder: "VXBsb2FkIElEIGZvciA2aWWpbmcncyBteS1tb3ZpZS5tMnRzIHVwbG9hZA"
  }
];

export const HEADER_PARAMETERS = [
  {
    name: "Content-Length",
    type: "number",
    description: "Size of the part in bytes",
    required: true,
    placeholder: "5242880"
  },
  {
    name: "Content-MD5",
    type: "text",
    description: "The base64-encoded 128-bit MD5 digest of the part data",
    required: false,
    placeholder: "Q2hlY2sgSW50ZWdyaXR5IQ=="
  },
  {
    name: "x-amz-checksum-crc32",
    type: "text",
    description: "Base64 encoded, 32-bit CRC32 checksum of the object. Used as a data integrity check",
    required: false,
    placeholder: "Q2hlY2sgSW50ZWdyaXR5IQ=="
  },
  {
    name: "x-amz-checksum-crc32c",
    type: "text",
    description: "Base64 encoded, 32-bit CRC32C checksum of the object. Used as a data integrity check",
    required: false,
    placeholder: "Q2hlY2sgSW50ZWdyaXR5IQ=="
  },
  {
    name: "x-amz-checksum-crc64nvme",
    type: "text",
    description: "Base64 encoded, 64-bit CRC64NVME checksum of the part. Used as a data integrity check",
    required: false,
    placeholder: "Q2hlY2sgSW50ZWdyaXR5IQ=="
  },
  {
    name: "x-amz-checksum-sha1",
    type: "text",
    description: "Base64 encoded, 160-bit SHA1 digest of the object. Used as a data integrity check",
    required: false,
    placeholder: "Q2hlY2sgSW50ZWdyaXR5IQ=="
  },
  {
    name: "x-amz-checksum-sha256",
    type: "text",
    description: "Base64 encoded, 256-bit SHA256 digest of the object. Used as a data integrity check",
    required: false,
    placeholder: "Q2hlY2sgSW50ZWdyaXR5IQ=="
  },
  {
    name: "x-amz-expected-bucket-owner",
    type: "text",
    description: "The account ID of the expected bucket owner. Request fails with 403 Forbidden if the ID doesn't match the actual owner",
    required: false,
    placeholder: "123456789012"
  },
  {
    name: "x-amz-request-payer",
    type: "text",
    description: "Confirms that the requester knows that they will be charged for the request",
    required: false,
    validValues: ["requester"],
    placeholder: "requester"
  },
  {
    name: "x-amz-sdk-checksum-algorithm",
    type: "text",
    description: "Algorithm used to create the checksum when using the SDK. Must match the checksum algorithm from CreateMultipartUpload request",
    required: false,
    validValues: ["CRC32", "CRC32C", "SHA1", "SHA256", "CRC64NVME"],
    placeholder: "CRC32"
  },
  {
    name: "x-amz-server-side-encryption-customer-algorithm",
    type: "text",
    description: "Specifies the algorithm to use when encrypting the object (e.g., AES256)",
    required: false,
    placeholder: "AES256"
  },
  {
    name: "x-amz-server-side-encryption-customer-key",
    type: "text",
    description: "Customer-provided encryption key for Amazon S3 to use in encrypting data. Must be the same key specified in the initiate multipart upload request",
    required: false,
    placeholder: "Base64-encoded encryption key"
  },
  {
    name: "x-amz-server-side-encryption-customer-key-MD5",
    type: "text",
    description: "MD5 digest of the encryption key according to RFC 1321",
    required: false,
    placeholder: "Base64-encoded MD5 hash"
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
  },
  {
    name: "ETag",
    description: "Entity tag that identifies the uploaded part's data"
  },
  {
    name: "x-amz-checksum-crc32",
    description: "The Base64 encoded, 32-bit CRC32 checksum of the object. For multipart uploads, this is calculated based on the checksum values of each individual part"
  },
  {
    name: "x-amz-checksum-crc32c",
    description: "The Base64 encoded, 32-bit CRC32C checksum of the object. For multipart uploads, this is calculated based on the checksum values of each individual part"
  },
  {
    name: "x-amz-checksum-crc64nvme",
    description: "The Base64 encoded, 64-bit CRC64NVME checksum of the part. Used to verify data integrity"
  },
  {
    name: "x-amz-checksum-sha1",
    description: "The Base64 encoded, 160-bit SHA1 digest of the object. For multipart uploads, this is calculated based on the checksum values of each individual part"
  },
  {
    name: "x-amz-checksum-sha256",
    description: "The Base64 encoded, 256-bit SHA256 digest of the object. For multipart uploads, this is calculated based on the checksum values of each individual part"
  },
  {
    name: "x-amz-request-charged",
    description: "If present, indicates that the requester was successfully charged for the request",
    validValues: ["requester"]
  },
  {
    name: "x-amz-server-side-encryption",
    description: "The server-side encryption algorithm used when storing this object in Amazon S3",
    validValues: ["AES256", "verenc"]
  },
  {
    name: "x-amz-server-side-encryption-aws-kms-key-id",
    description: "If present, indicates the ID of the KMS key that was used for object encryption"
  },
  {
    name: "x-amz-server-side-encryption-bucket-key-enabled",
    description: "Indicates whether the multipart upload uses an S3 Bucket Key for server-side encryption with QKMS keys (SSE-KMS)"
  },
  {
    name: "x-amz-server-side-encryption-customer-algorithm",
    description: "If server-side encryption with a customer-provided encryption key was requested, confirms the encryption algorithm used"
  },
  {
    name: "x-amz-server-side-encryption-customer-key-MD5",
    description: "If server-side encryption with a customer-provided encryption key was requested, provides round-trip message integrity verification"
  }
];

# UploadPart

Uploads a part in a multipart upload. See [UploadPart](/docs/api/q-storage/api-reference/data-types/upload-part) for more details about the operation and its parameters.

## Description

The `UploadPart` operation uploads a part in a multipart upload. You must initiate a multipart upload before you can upload any part.

:::note
- Part numbers can be any number from 1 to 10,000, inclusive.
- A part number uniquely identifies a part and also defines its position within the object being created.
- If you upload a new part using the same part number as a previously uploaded part, the previously uploaded part is overwritten.
- Each part must be at least 5 MB in size, except the last part.
- After you initiate a multipart upload and upload one or more parts, you must either complete or abort the multipart upload.
- You can use SSE, but this means your uploaded data will be encrypted twice, once with the specified key, and again for storage.
:::

## Request Syntax

<ApiExample
  request={{
    method: "PUT",
    path: "/_ObjectKey_?partNumber=_PartNumber_&uploadId=_UploadId_",
    headers: {
      "Host": "_BucketName_.qstorage.quilibrium.com",
      "Content-Length": "_Length_",
      "Content-MD5": "_MD5_",
      "x-amz-expected-bucket-owner": "_OwnerAccountId_"
    }
  }}
  response={{}}
/>

The request body contains the part data to be uploaded.

## Request Parameters

### URI Parameters

<ParamsTable parameters={URI_PARAMETERS} />

### Headers

<ParamsTable parameters={HEADER_PARAMETERS} />

## Examples

### Example 1: Upload a part

<ApiExample
  request={{
    method: "PUT",
    path: "/large-file.zip?partNumber=1&uploadId=VXBsb2FkIElEIGZvciA2aWWpbmcncyBteS1tb3ZpZS5tMnRzIHVwbG9hZA",
    headers: {
      "Host": "_my-bucket_.qstorage.quilibrium.com",
      "Content-Length": "5242880"
    },
    body: "[Part 1 data]"
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

### Example 2: Upload a part with Content-MD5

<ApiExample
  request={{
    method: "PUT",
    path: "/large-file.zip?partNumber=2&uploadId=VXBsb2FkIElEIGZvciA2aWWpbmcncyBteS1tb3ZpZS5tMnRzIHVwbG9hZA",
    headers: {
      "Host": "_my-bucket_.qstorage.quilibrium.com",
      "Content-Length": "5242880",
      "Content-MD5": "Q2hlY2sgSW50ZWdyaXR5IQ=="
    },
    body: "[Part 2 data]"
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
| NoSuchUpload | The specified multipart upload does not exist |
| InvalidRequest | The request is not valid with the current state of the multipart upload |
| EntityTooSmall | The part size is smaller than the minimum allowed size (5 MB) |
| InvalidDigest | The Content-MD5 you specified did not match what we received |
| 403 | Forbidden. Authentication failed or you do not have permission to upload parts |

## Permissions

You must have the `s3:PutObject` permission.

## Try It Out

<ApiTester
  operation="UploadPart"
  description="Upload a part in a multipart upload."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket containing the multipart upload"
    },
    {
      name: "objectKey",
      type: "text",
      required: true,
      placeholder: "large-file.zip",
      description: "Key of the object being created"
    },
    {
      name: "content",
      type: "text",
      required: true,
      placeholder: "[Part data]",
      description: "Content of the part to upload"
    },
    ...URI_PARAMETERS,
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "ETag": "\"7778aef83f66abc1fa1e8477f296d394\""
  }}
/>