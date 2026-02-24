---
sidebar_label: DeletePublicAccessBlock
title: DeletePublicAccessBlock
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

export const RESPONSE_HEADERS = [];

# DeletePublicAccessBlock

Removes the PublicAccessBlock configuration from the specified bucket.

## Description

The `DeletePublicAccessBlock` operation removes the PublicAccessBlock configuration from a bucket. After this operation completes, the specified bucket will no longer have the public access block settings applied to it.

:::note
- To use this operation, you must have the `s3:PutBucketPublicAccessBlock` permission.
- This operation will succeed even if there is no PublicAccessBlock configuration on the bucket.
- After deleting the PublicAccessBlock configuration, the bucket's access will be determined by its bucket policy and ACL settings.
- This operation requires the caller to authenticate.
:::

## Request Syntax

<ApiExample
  request={{
    method: "DELETE",
    path: "/?publicAccessBlock",
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

### Example 1: Delete public access block configuration from a bucket

<ApiExample
  request={{
    method: "DELETE",
    path: "/?publicAccessBlock",
    headers: {
      "Host": "_my-bucket_.qstorage.quilibrium.com"
    }
  }}
  response={{
    status: 204,
  }}
/>

## Response Syntax

<ApiExample
  request={{}}
  response={{
    status: 204,
  }}
/>

## Response Elements

### Response Headers

<ParamsTable responseElements={RESPONSE_HEADERS} type="response" />

## Special Errors

| Error Code | Description |
|------------|-------------|
| NoSuchBucket | The specified bucket does not exist |
| 403 | Forbidden. Authentication failed or you do not have permission to delete the public access block configuration |

## Permissions

You must have the `s3:PutBucketPublicAccessBlock` permission.

## Try It Out

<ApiTester
  operation="DeletePublicAccessBlock"
  description="Delete the public access block configuration from a bucket."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket to delete public access block configuration from"
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