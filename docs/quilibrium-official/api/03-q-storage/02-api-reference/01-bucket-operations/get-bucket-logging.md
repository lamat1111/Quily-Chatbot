---
sidebar_label: GetBucketLogging
title: GetBucketLogging
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
    name: "BucketLoggingStatus",
    description: "Root level tag for the BucketLoggingStatus parameters. See <a href='/docs/api/q-storage/api-reference/data-types/bucket-logging-status'>BucketLoggingStatus</a> for details."
  },
  {
    name: "LoggingEnabled",
    description: "Container for logging information. See <a href='/docs/api/q-storage/api-reference/data-types/logging-enabled'>LoggingEnabled</a> for details."
  }
];

# GetBucketLogging

Returns the logging status of a bucket and the permissions users have to view and modify that status.

## Description

The `GetBucketLogging` operation returns the logging status of a bucket and the permissions users have to view and modify that status. To use this operation, you must be the bucket owner or have the appropriate permissions.

Server access logging provides detailed records for the requests that are made to a bucket. The logs contain information such as:
- The request type
- The resources that are requested
- The time and date of the request
- The requester
- The response status

:::note
- To use this operation, you must have permission to perform the `s3:GetBucketLogging` action.
- You must be the bucket owner to use this operation.
- If logging is not enabled on the bucket, the response will include an empty `BucketLoggingStatus` element.
- This operation is not supported for directory buckets.
:::

## Request Syntax

<ApiExample
  request={{
    method: "GET",
    path: "/?logging",
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

### Example 1: Get bucket logging configuration when logging is enabled

<ApiExample
  request={{
    method: "GET",
    path: "/?logging",
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
<BucketLoggingStatus xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <LoggingEnabled>
      <TargetBucket>my-logging-bucket</TargetBucket>
      <TargetPrefix>logs/</TargetPrefix>
      <TargetGrants>
         <Grant>
            <Grantee xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="AmazonCustomerByEmail">
               <EmailAddress>user@example.com</EmailAddress>
            </Grantee>
            <Permission>READ</Permission>
         </Grant>
      </TargetGrants>
   </LoggingEnabled>
</BucketLoggingStatus>`
  }}
/>

### Example 2: Get bucket logging configuration when logging is disabled

<ApiExample
  request={{
    method: "GET",
    path: "/?logging",
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
<BucketLoggingStatus xmlns="http://s3.amazonaws.com/doc/2006-03-01/"/>`
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
<BucketLoggingStatus xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <LoggingEnabled>
      <TargetBucket>_TargetBucket_</TargetBucket>
      <TargetPrefix>_TargetPrefix_</TargetPrefix>
      <TargetGrants>
         <Grant>
            <Grantee xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="_GranteeType_">
               <ID>_GranteeID_</ID>
               <DisplayName>_GranteeName_</DisplayName>
               <EmailAddress>_GranteeEmail_</EmailAddress>
               <URI>_GranteeURI_</URI>
            </Grantee>
            <Permission>_Permission_</Permission>
         </Grant>
      </TargetGrants>
   </LoggingEnabled>
</BucketLoggingStatus>`
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
| 403 | Forbidden. Authentication failed or you do not have permission to get the bucket logging configuration |

## Permissions

You must have the `s3:GetBucketLogging` permission.

## Try It Out

<ApiTester
  operation="GetBucketLogging"
  description="Get the logging configuration of a bucket."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket to get logging configuration from"
    },
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "BucketLoggingStatus": {
      "LoggingEnabled": {
        "TargetBucket": "my-logging-bucket",
        "TargetPrefix": "logs/",
        "TargetGrants": [
          {
            "Grantee": {
              "Type": "AmazonCustomerByEmail",
              "EmailAddress": "user@example.com"
            },
            "Permission": "READ"
          }
        ]
      }
    }
  }}
/> 