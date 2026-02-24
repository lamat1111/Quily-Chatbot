---
sidebar_label: DeleteBucketCors
title: DeleteBucketCors
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

# DeleteBucketCors

Deletes the CORS configuration information set for the bucket.

## Description

The `DeleteBucketCors` operation removes the CORS (Cross-Origin Resource Sharing) configuration information from a bucket. CORS defines a way for client web applications that are loaded in one domain to interact with resources in a different domain.

:::note
- To use this operation, you must have permission to perform the `s3:PutBucketCORS` action.
- If you delete the CORS configuration, all cross-origin requests will be denied.
- This operation will succeed even if there is no CORS configuration on the bucket.
:::

## Request Syntax

<ApiExample
  request={{
    method: "DELETE",
    path: "/?cors",
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

### Example 1: Delete CORS configuration from a bucket

<ApiExample
  request={{
    method: "DELETE",
    path: "/?cors",
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
| 403 | Forbidden. Authentication failed or you do not have permission to delete the CORS configuration |

## Permissions

You must have the `s3:PutBucketCORS` permission.

## Try It Out

<ApiTester
  operation="DeleteBucketCors"
  description="Delete the CORS configuration from a bucket."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket to delete CORS configuration from"
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