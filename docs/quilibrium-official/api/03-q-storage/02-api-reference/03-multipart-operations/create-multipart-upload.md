---
sidebar_label: CreateMultipartUpload
title: CreateMultipartUpload
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ApiTester from '@site/src/components/ApiTester';
import ParamsTable from '@site/src/components/ParamsTable';
import ApiExample from '@site/src/components/ApiExample';

export const HEADER_PARAMETERS = [
  {
    name: "Content-Type",
    type: "text",
    description: "A standard MIME type describing the format of the object data",
    required: false,
    placeholder: "text/plain"
  },
  {
    name: "x-amz-acl",
    type: "text",
    description: "The canned ACL to apply to the object",
    required: false,
    placeholder: "private",
    validValues: [
      "private",
      "public-read",
      "public-read-write",
      "authenticated-read",
      "aws-exec-read",
      "bucket-owner-read",
      "bucket-owner-full-control"
    ]
  },
  {
    name: "x-amz-tagging",
    type: "text",
    description: "The tag-set for the object. The tag-set must be encoded as URL Query parameters",
    required: false,
    placeholder: "key1=value1&key2=value2"
  },
  {
    name: "x-amz-server-side-encryption",
    type: "text",
    description: "Server-side encryption algorithm to use",
    required: false,
    placeholder: "AES256",
    validValues: ["AES256", "verenc"]
  },
  {
    name: "x-amz-server-side-encryption-aws-kms-key-id",
    type: "text",
    description: "If x-amz-server-side-encryption is verenc, this specifies the ID of the QKMS key to use",
    required: false,
    placeholder: "arn:verenc:account:key/key-id"
  },
  {
    name: "x-amz-server-side-encryption-context",
    type: "text",
    description: "If x-amz-server-side-encryption is verenc, this specifies the encryption context to use",
    required: false,
    placeholder: "Base64-encoded JSON"
  },
  {
    name: "x-amz-server-side-encryption-bucket-key-enabled",
    type: "text",
    description: "Specifies whether to use an QStorage Bucket Key for object encryption with SSE-KMS",
    required: false,
    placeholder: "true",
    validValues: [
      "true",
      "false"
    ]
  },
  {
    name: "x-amz-metadata-directive",
    type: "text",
    description: "Specifies whether the metadata is copied from the source object or replaced",
    required: false,
    placeholder: "COPY",
    validValues: [
      "COPY",
      "REPLACE"
    ]
  },
  {
    name: "x-amz-website-redirect-location",
    type: "text",
    description: "If the bucket is configured as a website, redirects requests for this object to another object or URL",
    required: false,
    placeholder: "/anotherpage.html"
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
    name: "x-amz-server-side-encryption",
    description: "The server-side encryption algorithm used when storing this object"
  },
  {
    name: "x-amz-server-side-encryption-aws-kms-key-id",
    description: "If x-amz-server-side-encryption is verenc, this indicates the ID of the QKMS key used"
  },
  {
    name: "x-amz-server-side-encryption-context",
    description: "If x-amz-server-side-encryption is verenc, this is the encryption context used"
  },
  {
    name: "x-amz-server-side-encryption-bucket-key-enabled",
    description: "Indicates whether the multipart upload uses an S3 Bucket Key for SSE-KMS"
  },
  {
    name: "x-amz-abort-date",
    description: "If the bucket has a lifecycle rule for incomplete multipart uploads, this header indicates when the upload becomes eligible for deletion"
  },
  {
    name: "x-amz-abort-rule-id",
    description: "If the bucket has a lifecycle rule for incomplete multipart uploads, this header provides the ID of that rule"
  },
  {
    name: "Date",
    description: "The date and time at which the response was sent"
  }
];

export const RESPONSE_ELEMENTS = [
  {
    name: "Bucket",
    description: "Name of the bucket to which the multipart upload was initiated"
  },
  {
    name: "Key",
    description: "Object key for which the multipart upload was initiated"
  },
  {
    name: "UploadId",
    description: "ID for the initiated multipart upload. This ID must be used in subsequent UploadPart and CompleteMultipartUpload operations"
  }
];

# CreateMultipartUpload

Initiates a multipart upload and returns an upload ID.

## Description

The `CreateMultipartUpload` operation initiates a multipart upload and returns an upload ID. This upload ID is used to associate all of the parts in the specific multipart upload. You specify this upload ID in each of your subsequent `UploadPart` operations.

:::note
- Use multipart upload for objects larger than 5 GB.
- After you initiate the multipart upload and upload one or more parts, you must either complete or abort the multipart upload.
- QStorage will not process any additional requests until the multipart upload is either completed or aborted.
- You can use SSE, but this means your uploaded data will be encrypted twice, once with the specified key, and again for storage.
:::

## Request Syntax

<ApiExample
  request={{
    method: "POST",
    path: "/_ObjectKey_?uploads",
    headers: {
      "Host": "_BucketName_.qstorage.quilibrium.com",
      "Content-Type": "_Type_",
      "x-amz-tagging": "_TagSet_",
      "x-amz-expected-bucket-owner": "_OwnerAccountId_"
    }
  }}
  response={{}}
/>

This operation does not have a request body.

## Request Parameters

### Headers

<ParamsTable parameters={HEADER_PARAMETERS} />

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
<InitiateMultipartUploadResult>
   <Bucket>_BucketName_</Bucket>
   <Key>_ObjectKey_</Key>
   <UploadId>_UploadId_</UploadId>
</InitiateMultipartUploadResult>`
  }}
/>

## Response Elements

### Response Headers

<ParamsTable responseElements={RESPONSE_HEADERS} type="response" />

### Response Body Elements

<ParamsTable responseElements={RESPONSE_ELEMENTS} type="response" />

## Special Errors

| Error Code | Description |
|------------|-------------|
| NoSuchBucket | The specified bucket does not exist |
| InvalidRequest | The request is not valid with the current state of the bucket |
| 403 | Forbidden. Authentication failed or you do not have permission to initiate multipart upload |

## Permissions

You must have the `s3:PutObject` permission.

## Examples

### Example 1: Initiate a multipart upload

<ApiExample
  request={{
    method: "POST",
    path: "/_large-file.zip_?uploads",
    headers: {
      "Host": "_my-bucket_.qstorage.quilibrium.com",
      "Content-Type": "_application/zip_"
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
<InitiateMultipartUploadResult>
   <Bucket>my-bucket</Bucket>
   <Key>large-file.zip</Key>
   <UploadId>VXBsb2FkIElEIGZvciA2aWWpbmcncyBteS1tb3ZpZS5tMnRzIHVwbG9hZA</UploadId>
</InitiateMultipartUploadResult>`
  }}
/>

### Example 2: Initiate a multipart upload with tags 

<ApiExample
  request={{
    method: "POST",
    path: "/large-document.pdf?uploads",
    headers: {
      "Host": "_my-bucket_.qstorage.quilibrium.com",
      "Content-Type": "application/pdf",
      "x-amz-tagging": "project=documentation&confidential=true"
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
<InitiateMultipartUploadResult>
   <Bucket>my-bucket</Bucket>
   <Key>large-document.pdf</Key>
   <UploadId>VXBsb2FkIElEIGZvciA2aWWpbmcncyBteS1tb3ZpZS5tMnRzIHVwbG9hZA</UploadId>
</InitiateMultipartUploadResult>`
  }}
/>

## Try It Out

<ApiTester
  operation="CreateMultipartUpload"
  description="Initiate a multipart upload and get an upload ID."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket to upload to"
    },
    {
      name: "objectKey",
      type: "text",
      required: true,
      placeholder: "large-file.zip",
      description: "Key of the object to create"
    },
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "InitiateMultipartUploadResult": {
      "Bucket": "my-bucket",
      "Key": "large-file.zip",
      "UploadId": "VXBsb2FkIElEIGZvciA2aWWpbmcncyBteS1tb3ZpZS5tMnRzIHVwbG9hZA"
    }
  }}
/> 