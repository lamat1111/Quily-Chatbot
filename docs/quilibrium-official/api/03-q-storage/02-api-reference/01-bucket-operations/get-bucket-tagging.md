---
sidebar_label: GetBucketTagging
title: GetBucketTagging
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
    name: "Tagging",
    description: "Container for the tag set. See <a href='/docs/api/q-storage/api-reference/data-types/tagging'>Tagging</a> for details."
  },
  {
    name: "TagSet",
    description: "Container for a set of tags. See <a href='/docs/api/q-storage/api-reference/data-types/tag'>Tag</a> for details of the Tag elements."
  }
];

# GetBucketTagging

Returns the tag set associated with a bucket.

## Description

The `GetBucketTagging` operation returns the tag set associated with a bucket. To use this operation, you must have permission to perform the `s3:GetBucketTagging` action.

Tags are useful for organizing and tracking costs associated with your buckets.

:::note
- To use this operation, you must have permission to perform the `s3:GetBucketTagging` action.
- You must be the bucket owner to use this operation.
- If there is no tag set associated with the bucket, QStorage returns a `NoSuchTagSet` error.
:::

## Request Syntax

<ApiExample
  request={{
    method: "GET",
    path: "/?tagging",
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

### Example 1: Get bucket tags

<ApiExample
  request={{
    method: "GET",
    path: "/?tagging",
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
<Tagging xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <TagSet>
      <Tag>
         <Key>project</Key>
         <Value>project-one</Value>
      </Tag>
      <Tag>
         <Key>environment</Key>
         <Value>production</Value>
      </Tag>
   </TagSet>
</Tagging>`
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
<Tagging xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <TagSet>
      <Tag>
         <Key>_TagKey_</Key>
         <Value>_TagValue_</Value>
      </Tag>
   </TagSet>
</Tagging>`
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
| NoSuchTagSet | There is no tag set associated with the bucket |
| 403 | Forbidden. Authentication failed or you do not have permission to get the bucket tags |

## Permissions

You must have the `s3:GetBucketTagging` permission.

## Try It Out

<ApiTester
  operation="GetBucketTagging"
  description="Get the tag set associated with a bucket."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket to get tags from"
    },
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "Tagging": {
      "TagSet": [
        {
          "Key": "project",
          "Value": "project-one"
        },
        {
          "Key": "environment",
          "Value": "production"
        }
      ]
    }
  }}
/> 