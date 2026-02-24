---
sidebar_label: DeleteBucket
title: DeleteBucket
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

# DeleteBucket

Deletes a bucket from QStorage.

## Description

The `DeleteBucket` operation deletes the bucket specified in the request. All objects (including all object versions and delete markers) in the bucket must be deleted before the bucket itself can be deleted.

:::warning
- The bucket you want to delete must be empty.
- Once a bucket is deleted, the name becomes available for reuse by any account.
- This operation is not reversible.
:::

## Request Syntax

<ApiExample
  request={{
    method: "DELETE",
    path: "/",
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

<ApiExample
  request={{
    method: "DELETE",
    path: "/",
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

This operation does not return a response body.

## Special Errors

| Error Code | Description |
|------------|-------------|
| BucketNotEmpty | The bucket you tried to delete is not empty. You must delete all objects from the bucket before you can delete the bucket. |
| NoSuchBucket | The specified bucket does not exist. |
| 403 | Forbidden. Authentication failed or you do not have permission to delete the bucket. |

## Permissions

You must have the `s3:DeleteBucket` permission.

## Try It Out

<ApiTester
  operation="DeleteBucket"
  description="Delete an empty bucket from QStorage."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket to delete"
    },
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "statusCode": 204
  }}
/> 