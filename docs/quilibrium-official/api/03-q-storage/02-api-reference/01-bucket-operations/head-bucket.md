---
sidebar_label: HeadBucket
title: HeadBucket
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

# HeadBucket

Determines if a bucket exists.

## Description

The `HeadBucket` operation is useful to determine if a bucket exists and you have permission to access it. The operation returns a `200 OK` if the bucket exists. It otherwise returns a `404`.

:::note
If you make a `HEAD` request to check a bucket's existence, you should examine the HTTP status code in the response:
- `200`: Bucket exists
- `404`: Bucket does not exist
:::

## Request Syntax

<ApiExample
  request={{
    method: "HEAD",
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
    method: "HEAD",
    path: "/",
    headers: {
      "Host": "_my-bucket_.qstorage.quilibrium.com",
      "x-amz-expected-bucket-owner": "123456789012"
    }
  }}
  response={{
    status: 200,
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
    status: 200,
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
| 404 | The specified bucket does not exist |

## Permissions

You must have the `s3:ListBucket` permission.

## Try It Out

<ApiTester
  operation="HeadBucket"
  description="Check if a bucket exists and you have permission to access it."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket to check"
    },
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "statusCode": 200,
    "headers": {
      "x-amz-id-2": "Example-ID",
      "x-amz-request-id": "Example-Request-ID",
      "Date": "_Wed, 01 Mar 2024 12:00:00 GMT_"
    }
  }}
/> 