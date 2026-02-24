---
sidebar_label: DeleteBucketLifecycle
title: DeleteBucketLifecycle
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

# DeleteBucketLifecycle

Deletes the lifecycle configuration from the specified bucket.

## Description

The `DeleteBucketLifecycle` operation removes all lifecycle configuration rules from the specified bucket. After this operation is performed, there will be no automatic object lifecycle management actions performed on objects in the bucket.

:::note
- To use this operation, you must have permission to perform the `s3:PutLifecycleConfiguration` action.
- This operation will succeed even if there is no lifecycle configuration on the bucket.
- After deleting the lifecycle configuration, all lifecycle rules will be removed and no automatic lifecycle actions will be taken on the objects in the bucket.
:::

## Request Syntax

<ApiExample
  request={{
    method: "DELETE",
    path: "/?lifecycle",
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

### Example 1: Delete lifecycle configuration from a bucket

<ApiExample
  request={{
    method: "DELETE",
    path: "/?lifecycle",
    headers: {
      "Host": "_my-bucket_.qstorage.quilibrium.com"
    }
  }}
  response={{
    status: 204,
    headers: {
      "x-amz-id-2": "_Example7qoYGN7uMuFuYS6m7a4l_",
      "x-amz-request-id": "_TX234S0F24A06C7_",
      "Date": "__Wed, 01 Mar 2024 12:00:00 GMT__"
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
| 403 | Forbidden. Authentication failed or you do not have permission to delete the lifecycle configuration |

## Permissions

You must have the `s3:PutLifecycleConfiguration` permission.

## Try It Out

<ApiTester
  operation="DeleteBucketLifecycle"
  description="Delete the lifecycle configuration from a bucket."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket to delete lifecycle configuration from"
    },
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "status": 204,
    "headers": {
      "x-amz-id-2": "_Example7qoYGN7uMuFuYS6m7a4l_",
      "x-amz-request-id": "_TX234S0F24A06C7_",
      "Date": "_Wed, 01 Mar 2024 12:00:00 GMT_"
    }
  }}
/> 