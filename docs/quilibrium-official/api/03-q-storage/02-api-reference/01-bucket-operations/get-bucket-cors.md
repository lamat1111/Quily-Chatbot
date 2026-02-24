---
sidebar_label: GetBucketCors
title: GetBucketCors
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
    name: "CORSConfiguration",
    type: "Container",
    description: "Container for the bucket's CORS configuration",
    required: "Yes"
  },
  {
    name: "CORSRule",
    type: "[CORSRule](/docs/api/q-storage/api-reference/data-types/cors-rule)",
    description: "A set of origins and methods (cross-origin access that you want to allow). You can add up to 100 rules to the configuration.",
    required: "No"
  }
];

# GetBucketCors

Returns the Cross-Origin Resource Sharing (CORS) configuration of a bucket.

## Description

The `GetBucketCors` operation returns the CORS configuration information set for the bucket. To use this operation, you must have `s3:GetBucketCORS` permissions on the bucket, or be the bucket owner.

:::note
If the bucket doesn't have a CORS configuration, this operation returns an empty `CORSConfiguration` element.
:::

## Request Syntax

<ApiExample
  request={{
    method: "GET",
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

<ApiExample
  request={{
    method: "GET",
    path: "/?cors",
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
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration>
   <CORSRule>
      <AllowedOrigin>https://example.com</AllowedOrigin>
      <AllowedMethod>GET</AllowedMethod>
      <AllowedMethod>PUT</AllowedMethod>
      <AllowedHeader>*</AllowedHeader>
      <MaxAgeSeconds>3000</MaxAgeSeconds>
      <ExposeHeader>ETag</ExposeHeader>
   </CORSRule>
</CORSConfiguration>`
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
<CORSConfiguration>
   <CORSRule>
      <AllowedOrigin>_AllowedOrigin_</AllowedOrigin>
      <AllowedMethod>_AllowedMethod_</AllowedMethod>
      <AllowedHeader>_AllowedHeader_</AllowedHeader>
      <MaxAgeSeconds>_MaxAgeSeconds_</MaxAgeSeconds>
      <ExposeHeader>_ExposeHeader_</ExposeHeader>
   </CORSRule>
</CORSConfiguration>`
  }}
/>

## Response Elements

### Response Headers

<ParamsTable responseElements={RESPONSE_HEADERS} type="response" />

### Response Body Elements

| Name | Type | Description | Required |
|------|------|-------------|-----------|
| CORSConfiguration | Container | Container for the bucket's CORS configuration | Yes |
| CORSRule | [CORSRule](/docs/api/q-storage/api-reference/data-types/cors-rule) | A set of origins and methods (cross-origin access that you want to allow). You can add up to 100 rules to the configuration. | No |

## Special Errors

| Error Code | Description |
|------------|-------------|
| NoSuchBucket | The specified bucket does not exist |
| 403 | Forbidden. Authentication failed or you do not have permission to access the bucket CORS configuration |

## Permissions

You must have the `s3:GetBucketCors` permission.

## Try It Out

<ApiTester
  operation="GetBucketCors"
  description="Get the CORS configuration of a bucket."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket to get CORS configuration for"
    },
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "CORSConfiguration": {
      "CORSRule": [
        {
          "AllowedOrigin": "https://example.com",
          "AllowedMethod": ["GET", "PUT"],
          "AllowedHeader": ["*"],
          "MaxAgeSeconds": 3000,
          "ExposeHeader": ["ETag"]
        }
      ]
    }
  }}
/> 