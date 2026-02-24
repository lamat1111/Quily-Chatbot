---
sidebar_label: GetBucketPolicy
title: GetBucketPolicy
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

export const RESPONSE_ELEMENTS = [
  {
    name: "Policy",
    description: "The bucket's Policy in JSON format. See <a href='/docs/api/q-storage/api-reference/data-types/bucket-policy'>BucketPolicy</a> for details."
  },

];

# GetBucketPolicy

Returns the policy of a specified bucket _in JSON format_.

## Description

The `GetBucketPolicy` operation returns the policy of the specified bucket. If you are using an identity other than the root user of the account that owns the bucket, the calling identity must have the `s3:GetBucketPolicy` permissions on the specified bucket and belong to the bucket owner's account.

:::note
- To use this operation, you must have permission to perform the `s3:GetBucketPolicy` action.
- You must be the bucket owner to use this operation.
- If there is no policy on the bucket, QStorage returns a `NoSuchBucketPolicy` error.
:::

## Request Syntax

<ApiExample
  request={{
    method: "GET",
    path: "/?policy",
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

### Example 1: Get bucket policy

<ApiExample
  request={{
    method: "GET",
    path: "/?policy",
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
    body: `{
   "Version": "2012-10-17",
   "Statement": [
      {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::_my-bucket/*_"
      }
   ]
}`
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
    body: `{
   "Version": "_Version_",
   "Statement": [
      {
         "Sid": "_StatementId_",
         "Effect": "_Effect_",
         "Principal": "_Principal_",
         "Action": "_Action_",
         "Resource": "_Resource_",
         "Condition": {
            "_ConditionOperator_": {
               "_ConditionKey_": "_ConditionValue_"
            }
         }
      }
   ]
}`
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
| 403 | Forbidden. Authentication failed or you do not have permission to get the bucket policy |

## Permissions

You must have the `s3:GetBucketPolicy` permission.

## Try It Out

<ApiTester
  operation="GetBucketPolicy"
  description="Get the policy of a bucket."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket to get policy from"
    },
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "PublicReadGetObject",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::my-bucket/*"
      }
    ]
  }}
/> 