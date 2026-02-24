---
sidebar_label: GetBucketPolicyStatus
title: GetBucketPolicyStatus
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
    description: "The account ID of the expected bucket owner. If the account ID that you provide does not match the actual owner of the bucket, the request fails with the HTTP status code 403 Forbidden (access denied).",
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

export const RESPONSE_ELEMENTS = [
  {
    name: "PolicyStatus",
    description: "Container for the policy status of a bucket. See <a href='/docs/api/q-storage/api-reference/data-types/policy-status'>PolicyStatus</a> for details."
  }
];

# GetBucketPolicyStatus

Returns the policy status for a bucket, indicating whether the bucket is public.

## Description

The `GetBucketPolicyStatus` operation retrieves the policy status for a bucket, indicating whether the bucket is public.

:::note
- To use this operation, you must have permission to perform the `s3:GetBucketPolicyStatus` action.
:::

## Request Syntax

<ApiExample
  request={{
    method: "GET",
    path: "/?policyStatus",
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

### Example 1: Get bucket policy status

<ApiExample
  request={{
    method: "GET",
    path: "/?policyStatus",
    headers: {
      "Host": "_my-bucket_.qstorage.quilibrium.com"
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
<PolicyStatus xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <IsPublic>_TRUE_</IsPublic>
</PolicyStatus>`
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
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<PolicyStatus xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <IsPublic>_Boolean_</IsPublic>
</PolicyStatus>`
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
| NoSuchBucketPolicy | The specified bucket does not have a bucket policy |
| 403 | Forbidden. Authentication failed or you do not have permission to get the bucket policy status |

## Permissions

You must have the `s3:GetBucketPolicyStatus` permission.

## Try It Out

<ApiTester
  operation="GetBucketPolicyStatus"
  description="Get the policy status of a bucket."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket to get policy status from"
    },
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "PolicyStatus": {
      "IsPublic": true
    }
  }}
/> 