---
sidebar_label: GetBucketOwnershipControls
title: GetBucketOwnershipControls
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
    name: "OwnershipControls",
    description: "Container for ownership controls. See <a href='/docs/api/q-storage/api-reference/data-types/ownership-controls'>OwnershipControls</a> for details."
  },
  {
    name: "Rule",
    description: "Container for a rule that defines ownership controls. See <a href='/docs/api/q-storage/api-reference/data-types/ownership-controls-rule'>OwnershipControlsRule</a> for details."
  }
];

# GetBucketOwnershipControls

Returns the ownership controls for a bucket.

## Description

The `GetBucketOwnershipControls` operation retrieves the ownership controls for a bucket. To use this operation, you must have the `s3:GetBucketOwnershipControls` permission. 

:::note
- To use this operation, you must have permission to perform the `s3:GetBucketOwnershipControls` action.
- You must be the bucket owner to use this operation.
- If no ownership controls are configured for the bucket, QStorage returns a `OwnershipControlsNotFoundError` error.
:::

## Request Syntax

<ApiExample
  request={{
    method: "GET",
    path: "/?ownershipControls",
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

### Example 1: Get bucket ownership controls

<ApiExample
  request={{
    method: "GET",
    path: "/?ownershipControls",
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
<OwnershipControls xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <Rule>
      <ObjectOwnership>BucketOwnerPreferred</ObjectOwnership>
   </Rule>
</OwnershipControls>`
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
<OwnershipControls xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <Rule>
      <ObjectOwnership>_OwnershipValue_</ObjectOwnership>
   </Rule>
</OwnershipControls>`
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
| OwnershipControlsNotFoundError | The ownership controls were not found |
| 403 | Forbidden. Authentication failed or you do not have permission to get the bucket ownership controls |

## Permissions

You must have the `s3:GetBucketOwnershipControls` permission.

## Try It Out

<ApiTester
  operation="GetBucketOwnershipControls"
  description="Get the ownership controls of a bucket."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket to get ownership controls from"
    },
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "OwnershipControls": {
      "Rule": {
        "ObjectOwnership": "BucketOwnerPreferred"
      }
    }
  }}
/> 