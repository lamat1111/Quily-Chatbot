---
sidebar_label: UploadPart
title: UploadPart
---

import ParamsTable from '@site/src/components/ParamsTable';

# UploadPart

Uploads a part in a multipart upload.

:::note
In this operation, you provide new data as a part of an object in your request. However, you have an option to specify your existing Amazon S3 object as a data source for the part you are uploading. To upload a part from an existing object, you use the UploadPartCopy operation.
:::

## Properties

export const PROPERTIES = [
  {
    name: "Body",
    description: "Object data",
    type: "Binary",
    required: true
  },
  {
    name: "BucketName",
    description: "The name of the bucket to which the multipart upload was initiated",
    type: "string",
    required: true
  },
  {
    name: "ContentLength",
    description: "Size of the body in bytes. This parameter is useful when you cannot determine the size of the body prior to sending",
    type: "number",
    required: true
  },
  {
    name: "ContentMD5",
    description: "The base64-encoded 128-bit MD5 digest of the part data. This parameter is auto-populated when using the command from AWS SDKs",
    type: "string",
    required: false
  },
  {
    name: "Key",
    description: "Object key for which the multipart upload was initiated",
    type: "string",
    required: true
  },
  {
    name: "PartNumber",
    description: "Part number of part being uploaded. This is a positive integer between 1 and 10,000",
    type: "integer",
    required: true
  },
  {
    name: "UploadId",
    description: "Upload ID identifying the multipart upload whose part is being uploaded",
    type: "string",
    required: true
  },
  {
    name: "SSECustomerAlgorithm",
    description: "Specifies the algorithm to use to when encrypting the object. Not supported for directory buckets",
    type: "string",
    required: false
  },
  {
    name: "SSECustomerKey",
    description: "Specifies the customer-provided encryption key for Amazon S3 to use in encrypting data. Not supported for directory buckets",
    type: "string",
    required: false
  },
  {
    name: "SSECustomerKeyMD5",
    description: "Specifies the 128-bit MD5 digest of the encryption key according to RFC 1321. Not supported for directory buckets",
    type: "string",
    required: false
  },
  {
    name: "RequestCharged",
    description: "If present, indicates that the requester was successfully charged for the request",
    type: "string",
    validValues: ["requester"],
    required: false
  },
  {
    name: "x-amz-checksum-crc32",
    description: "Base64 encoded, 32-bit CRC32 checksum of the object. Used as a data integrity check",
    type: "string",
    required: false
  },
  {
    name: "x-amz-checksum-crc32c",
    description: "Base64 encoded, 32-bit CRC32C checksum of the object. Used as a data integrity check",
    type: "string",
    required: false
  },
  {
    name: "x-amz-checksum-crc64nvme",
    description: "Base64 encoded, 64-bit CRC64NVME checksum of the part. Used as a data integrity check",
    type: "string",
    required: false
  },
  {
    name: "x-amz-checksum-sha1",
    description: "Base64 encoded, 160-bit SHA1 digest of the object. Used as a data integrity check",
    type: "string",
    required: false
  },
  {
    name: "x-amz-checksum-sha256",
    description: "Base64 encoded, 256-bit SHA256 digest of the object. Used as a data integrity check",
    type: "string",
    required: false
  },
  {
    name: "x-amz-expected-bucket-owner",
    description: "The account ID of the expected bucket owner. Request fails with 403 Forbidden if the ID doesn't match the actual owner",
    type: "string",
    required: false
  },
  {
    name: "x-amz-request-payer",
    description: "Confirms that the requester knows that they will be charged for the request. Not supported for directory buckets",
    type: "string",
    validValues: ["requester"],
    required: false
  },
  {
    name: "x-amz-sdk-checksum-algorithm",
    description: "Algorithm used to create the checksum when using the SDK. Must match the checksum algorithm from CreateMultipartUpload request",
    type: "string",
    validValues: ["CRC32", "CRC32C", "SHA1", "SHA256", "CRC64NVME"],
    required: false
  },
  {
    name: "x-amz-server-side-encryption-customer-algorithm",
    description: "Specifies the algorithm to use when encrypting the object (e.g., AES256). Not supported for directory buckets",
    type: "string",
    required: false
  },
  {
    name: "x-amz-server-side-encryption-customer-key",
    description: "Customer-provided encryption key for Amazon S3 to use in encrypting data. Must be the same key specified in the initiate multipart upload request. Not supported for directory buckets",
    type: "string",
    required: false
  },
  {
    name: "x-amz-server-side-encryption-customer-key-MD5",
    description: "MD5 digest of the encryption key according to RFC 1321. Not supported for directory buckets",
    type: "string",
    required: false
  }
];

<ParamsTable parameters={PROPERTIES} /> 