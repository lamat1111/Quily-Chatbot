---
sidebar_label: ListBuckets
title: ListBuckets
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ApiTester from '@site/src/components/ApiTester';
import ParamsTable from '@site/src/components/ParamsTable';
import ApiExample from '@site/src/components/ApiExample';

export const URI_PARAMETERS = [
  {
    name: "continuation-token",
    type: "text",
    description: "Token indicating that the list is being continued. Used for pagination.<br/><br/>Length limits: Minimum 0 and maximum of 1024.",
    required: false,
    placeholder: "eyJNYXJrZXIiOiBudWxsLCAiYm90b190cnVuY2F0ZV9hbW91bnQiOiAyfQ=="
  },
  {
    name: "max-buckets",
    type: "number",
    description: "Maximum number of buckets to return in the response",
    required: false,
    placeholder: "1000"
  },
  {
    name: "prefix",
    type: "text",
    description: "Limits the response to bucket names that begin with the specified prefix",
    required: false,
    placeholder: "test-"
  }
];

export const HEADER_PARAMETERS = [];

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
  },
  {
    name: "Content-Type",
    description: "The content type of the response (application/xml)"
  }
];

export const RESPONSE_ELEMENTS = [
  {
    name: "ListAllMyBucketsResult",
    description: "Container for response"
  },
  {
    name: "Owner",
    description: "Container for the bucket owner's information. See <a href='/docs/api/q-storage/api-reference/data-types/owner'>Owner</a> for details."
  },
  {
    name: "Buckets",
    description: "A list of buckets owned by the requester. See <a href='/docs/api/q-storage/api-reference/data-types/bucket'>Bucket</a> for details."
  },
  {
    name: "ContinuationToken",
    description: "Token to use to retrieve the next page of results. Present only if IsTruncated is true.<br/><br/>Type: String"
  },
  {
    name: "Prefix",
    description: "If Prefix was sent with the request, it will be included in each response. All the returned buckets have this bucket prefix.<br/><br/>Type: String"
  }
];


# ListBuckets

Returns a list of all buckets owned by the authenticated sender of the request.

## Description

The `ListBuckets` operation returns a list of all buckets owned by the authenticated sender of the request. The list is returned in alphabetical order by bucket name.

:::note
- The response is paginated if there are more buckets than can be returned in a single response.
- Use the `continuation-token` parameter to retrieve additional pages of results.
- The maximum number of buckets that can be returned in a single response is 1000.
:::

## Request Syntax

<ApiExample
  request={{
    method: "GET",
    path: "/?max-buckets=_MaxBuckets_&continuation-token=_ContinuationToken_&prefix=_Prefix_",
    headers: {
      "Host": "qstorage.quilibrium.com"
    }
  }}
  response={{}}
/>

This operation does not have a request body.

## Request Parameters

### Headers

<ParamsTable parameters={HEADER_PARAMETERS} />

### URI Parameters

<ParamsTable parameters={URI_PARAMETERS} />

## Examples

### Example 1: List all buckets

<ApiExample
  request={{
    method: "GET",
    path: "/",
    headers: {
      "Host": "qstorage.quilibrium.com"
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
<ListAllMyBucketsResult>
   <Owner>
      <ID>123456789012</ID>
      <DisplayName>user@example.com</DisplayName>
   </Owner>
   <Buckets>
      <Bucket>
         <Name>my-bucket-1</Name>
         <CreationDate>2024-03-01T12:00:00.000Z</CreationDate>
      </Bucket>
      <Bucket>
         <Name>my-bucket-2</Name>
         <CreationDate>2024-03-01T13:00:00.000Z</CreationDate>
      </Bucket>
   </Buckets>
</ListAllMyBucketsResult>`
  }}
/>

### Example 2: List buckets with pagination

<ApiExample
  request={{
    method: "GET",
    path: "/?max-buckets=1",
    headers: {
      "Host": "qstorage.quilibrium.com"
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
<ListAllMyBucketsResult>
   <Owner>
      <ID>123456789012</ID>
      <DisplayName>user@example.com</DisplayName>
   </Owner>
   <Buckets>
      <Bucket>
         <Name>my-bucket-1</Name>
         <CreationDate>2024-03-01T12:00:00.000Z</CreationDate>
      </Bucket>
   </Buckets>
   <IsTruncated>true</IsTruncated>
   <ContinuationToken>eyJNYXJrZXIiOiBudWxsLCAiYm90b190cnVuY2F0ZV9hbW91bnQiOiAyfQ==</ContinuationToken>
</ListAllMyBucketsResult>`
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
<ListAllMyBucketsResult>
   <Owner>
      <ID>_ID_</ID>
      <DisplayName>_DisplayName_</DisplayName>
   </Owner>
   <Buckets>
      <Bucket>
         <Name>_BucketName_</Name>
         <CreationDate>_ISO8601Date_</CreationDate>
      </Bucket>
   </Buckets>
   <IsTruncated>_true|false_</IsTruncated>
   <ContinuationToken>_Token_</ContinuationToken>
</ListAllMyBucketsResult>`
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
| 403 | Forbidden. Authentication failed or you do not have permission to list buckets |

## Permissions

You must have the `s3:ListAllMyBuckets` permission.

## Try It Out

<ApiTester
  operation="ListBuckets"
  description="List all buckets owned by the authenticated sender of the request."
  parameters={[...URI_PARAMETERS]}
  exampleResponse={{
    "ListAllMyBucketsResult": {
      "Owner": {
        "ID": "123456789012",
        "DisplayName": "user@example.com"
      },
      "Buckets": [
        {
          "Name": "my-bucket-1",
          "CreationDate": "2024-03-01T12:00:00.000Z"
        },
        {
          "Name": "my-bucket-2",
          "CreationDate": "2024-03-01T13:00:00.000Z"
        }
      ]
    }
  }}
/> 