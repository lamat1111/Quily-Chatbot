---
sidebar_label: DeleteObject
title: DeleteObject
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ApiTester from '@site/src/components/ApiTester';
import ParamsTable from '@site/src/components/ParamsTable';
import ApiExample from '@site/src/components/ApiExample';

export const HEADER_PARAMETERS = [
  {
    name: "x-amz-mfa",
    type: "text",
    description: "The concatenation of the authentication device's serial number, a space, and the value that is displayed on your authentication device",
    required: false,
    placeholder: "SerialNumber AuthenticationCode"
  },
  {
    name: "x-amz-request-payer",
    type: "text",
    description: "Confirms that the requester knows that they will be charged for the request. Required for Requester Pays buckets",
    required: false,
    placeholder: "requester"
  },
  {
    name: "x-amz-expected-bucket-owner",
    type: "text",
    description: "The account ID of the expected bucket owner",
    required: false,
    placeholder: "123456789012"
  },
  {
    name: "If-Match",
    type: "text",
    description: "Delete the object only if its entity tag (ETag) matches the specified tag",
    required: false,
    placeholder: "\"7778aef83f66abc1fa1e8477f296d394\""
  },
  {
    name: "x-amz-if-match-last-modified-time",
    type: "text",
    description: "Delete the object only if its modification time matches the provided timestamp",
    required: false,
    placeholder: "2024-03-01T12:00:00.000Z"
  },
  {
    name: "x-amz-if-match-size",
    type: "text",
    description: "Delete the object only if its size matches the provided size in bytes",
    required: false,
    placeholder: "1024"
  }
];

export const URI_PARAMETERS = [
  {
    name: "Key",
    type: "text",
    description: "Key name of the object to delete",
    required: true,
    placeholder: "example.txt"
  },
  {
    name: "versionId",
    type: "text",
    description: "Version ID used to reference a specific version of the object",
    required: false,
    placeholder: "096fKKXTRTtl3on89fVO.MiO.DJ1Y4.o"
  }
];

export const RESPONSE_HEADERS = [
  {
    name: "x-amz-delete-marker",
    description: "Specifies whether the versioned object that was permanently deleted was (true) or was not (false) a delete marker"
  },
  {
    name: "x-amz-version-id",
    description: "Returns the version ID of the delete marker created as a result of the DELETE operation"
  },
  {
    name: "x-amz-request-charged",
    description: "If present, indicates that the requester was successfully charged for the request"
  }
];

# DeleteObject

Removes the specified object from QStorage.

## Description

The `DeleteObject` operation removes the specified object from a bucket. Once deleted, the object cannot be recovered.

:::note
- The DELETE operation is idempotent - sending multiple delete requests for the same object has no additional effect.
- QStorage does not provide a mechanism to undelete an object.
:::

## Request Syntax

<ApiExample
  request={{
    method: "DELETE",
    path: "/_cool-cat.jpeg_?versionId=_VersionId_",
    headers: {
      "Host": "_BucketName_.qstorage.quilibrium.com",
      "x-amz-expected-bucket-owner": "_OwnerAccountId_"
    }
  }}
  response={{}}
/>

This operation does not have a request body.

## Request Parameters

### URI Parameters

<ParamsTable parameters={URI_PARAMETERS} />

### Headers

<ParamsTable parameters={HEADER_PARAMETERS} />

## Examples

### Example 1: Delete an object

<ApiExample
  request={{
    method: "DELETE",
    path: "/hello.txt",
    headers: {
      "Host": "_my-bucket_.qstorage.quilibrium.com"
    }
  }}
  response={{
    status: 204,
    headers: {
      "x-amz-id-2": "_Example7qoYGN7uMuFuYS6m7a4l_",
      "x-amz-request-id": "_TX234S0F24A06C7_",
      "Date": "_Wed, 01 Mar 2024 12:00:00 GMT_"
    }
  }}
/>

### Example 2: Delete an object with bucket owner verification

<ApiExample
  request={{
    method: "DELETE",
    path: "/document.pdf",
    headers: {
      "Host": "_my-bucket_.qstorage.quilibrium.com",
      "x-amz-expected-bucket-owner": "123456789012"
    }
  }}
  response={{
    status: 204,
    headers: {
      "x-amz-id-2": "_Example7qoYGN7uMuFuYS6m7a4l_",
      "x-amz-request-id": "_TX234S0F24A06C7_",
      "Date": "_Wed, 01 Mar 2024 12:00:00 GMT_"
    }
  }}
/>

## Response Syntax

<ApiExample
  request={{}}
  response={{
    status: 204,
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

## Special Errors

| Error Code | Description |
|------------|-------------|
| NoSuchBucket | The specified bucket does not exist |
| NoSuchKey | The specified key does not exist |
| 403 | Forbidden. Authentication failed or you do not have permission to delete the object |

## Permissions

You must have the `s3:DeleteObject` permission.

## Try It Out

<ApiTester
  operation="DeleteObject"
  description="Delete an object from a bucket."
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
      placeholder: "hello.txt",
      description: "Key of the object to delete"
    },
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "x-amz-id-2": "_Example7qoYGN7uMuFuYS6m7a4l_",
    "x-amz-request-id": "_TX234S0F24A06C7_"
  }}
/> 