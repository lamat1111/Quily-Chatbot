---
sidebar_label: GetBucketAcl
title: GetBucketAcl
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
  },
  {
    name: "Last-Modified",
    description: "The date and time at which the resource was last modified"
  },
  {
    name: "Content-Length",
    description: "The size of the response body in bytes"
  },
  {
    name: "Content-Type",
    description: "The MIME type of the response"
  },
  {
    name: "Connection",
    description: "The type of connection used for the HTTP response"
  }
];

export const RESPONSE_ELEMENTS = [
  {
    name: "AccessControlPolicy",
    description: "Container for the response"
  },
  {
    name: "Grants",
    description: "A list of Grants.<br/><br />See <a href='/docs/api/q-storage/api-reference/data-types/grant'>Grant</a> data type."
  },
  {
    name: "Owner",
    description: "Container for the bucket owner's ID.<br/><br />See <a href='/docs/api/q-storage/api-reference/data-types/owner'>Owner</a> data type."
  },
];

# GetBucketAcl

Returns the access control list (ACL) of a bucket.

## Description

The `GetBucketAcl` operation returns the access control list (ACL) of a bucket. To use this operation, you must have `s3:GetBucketAcl` permissions on the bucket, or be the bucket owner.

:::note
If your bucket uses the bucket owner enforced setting for S3 Object Ownership, ACLs are disabled and no longer affect permissions. You must use policies to grant access to your bucket and the objects in it.
:::

## Request Syntax

<ApiExample
  request={{
    method: "GET",
    path: "/?acl",
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



## Response Syntax

<ApiExample
  request={{}}
  response={{
    status: 200,
    headers: {
      "x-amz-id-2": "_RequestId_",
      "x-amz-request-id": "_AmazonRequestId_",
      "Date": "_ISO8601Date_",
      "Last-Modified": "_Fri, 25 Dec 2020 12:00:00 GMT_",
      "Content-Length": "_123_",
      "Content-Type": "text/plain",
      "Connection": "close"
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<AccessControlPolicy>
   <Owner>
      <ID>_ID_</ID>
      <DisplayName>_DisplayName_</DisplayName>
   </Owner>
   <AccessControlList>
      <Grant>
         <Grantee xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="_Type_">
            <ID>_ID_</ID>
            <DisplayName>_DisplayName_</DisplayName>
         </Grantee>
         <Permission>_Permission_</Permission>
      </Grant>
   </AccessControlList>
</AccessControlPolicy>`
  }}
/>

## Response Elements
If the action is successful, the service sends back an response of HTTP 200.
### Response Headers

<ParamsTable responseElements={RESPONSE_HEADERS} type="response" />

### Response Body Elements
The response body will be in XML format.
<ParamsTable responseElements={RESPONSE_ELEMENTS} type="response" />

## Special Errors

| Error Code | Description |
|------------|-------------|
| NoSuchBucket | The specified bucket does not exist |
| 403 | Forbidden. Authentication failed or you do not have permission to access the bucket ACL |

## Permissions

You must have the `s3:GetBucketAcl` permission.

## Examples

<ApiExample
  request={{
    method: "GET",
    path: "/?acl",
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
      "Date": "_Wed, 01 Mar 2024 12:00:00 GMT_",
      "Last-Modified": "_Fri, 25 Dec 2020 12:00:00 GMT_",
      "Content-Length": "_123_",
      "Content-Type": "text/plain",
      "Connection": "close"
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<AccessControlPolicy>
   <Owner>
      <ID>123456789012</ID>
      <DisplayName>user@example.com</DisplayName>
   </Owner>
   <AccessControlList>
      <Grant>
         <Grantee xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="CanonicalUser">
            <ID>123456789012</ID>
            <DisplayName>user@example.com</DisplayName>
         </Grantee>
         <Permission>FULL_CONTROL</Permission>
      </Grant>
   </AccessControlList>
</AccessControlPolicy>`
  }}
/>

## Try It Out

<ApiTester
  operation="GetBucketAcl"
  description="Get the access control list (ACL) of a bucket."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket to get ACL for"
    },
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "AccessControlPolicy": {
      "Owner": {
        "ID": "123456789012",
        "DisplayName": "user@example.com"
      },
      "AccessControlList": {
        "Grant": [
          {
            "Grantee": {
              "ID": "123456789012",
              "DisplayName": "user@example.com",
              "Type": "CanonicalUser"
            },
            "Permission": "FULL_CONTROL"
          }
        ]
      }
    }
  }}
/> 