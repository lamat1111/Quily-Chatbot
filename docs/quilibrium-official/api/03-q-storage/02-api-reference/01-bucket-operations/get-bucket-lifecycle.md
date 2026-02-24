---
sidebar_label: GetBucketLifecycle
title: GetBucketLifecycle
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
    name: "LifecycleConfiguration",
    type: "Container",
    description: "Container for the bucket's lifecycle rules",
    required: true
  },
  {
    name: "Rule",
    type: "<a href=\"/docs/api/q-storage/api-reference/data-types/rule\">Rule</a>",
    description: "Container for a lifecycle rule. The bucket can have zero or more lifecycle rules.",
    required: true
  }
];

# GetBucketLifecycle

:::warning Deprecated
For an updated version of this API, see [GetBucketLifecycleConfiguration](/docs/api/q-storage/api-reference/bucket-operations/get-bucket-lifecycle-configuration). If you configured a bucket lifecycle using the `filter` element, you should use the updated version. This topic is provided for backward compatibility.
:::

Returns the lifecycle configuration information set on the bucket.

## Description

The `GetBucketLifecycle` operation returns the lifecycle configuration information set on the bucket. To use this operation, you must have `s3:GetLifecycleConfiguration` permissions on the bucket, or be the bucket owner.

:::note
- If the bucket doesn't have a lifecycle configuration, this operation returns an empty `LifecycleConfiguration` element.
- This operation is not supported for directory buckets.
:::

## Request Syntax

<ApiExample
  request={{
    method: "GET",
    path: "/?lifecycle",
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

### Example 1: Get lifecycle configuration from a bucket

<ApiExample
  request={{
    method: "GET",
    path: "/?lifecycle",
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
<LifecycleConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <Rule>
      <ID>Archive and then delete rule</ID>
      <Prefix>projectdocs/</Prefix>
      <Status>Enabled</Status>
      <Transition>
         <Days>30</Days>
         <StorageClass>STANDARD_IA</StorageClass>
      </Transition>
      <Transition>
         <Days>365</Days>
         <StorageClass>GLACIER</StorageClass>
      </Transition>
      <Expiration>
         <Days>3650</Days>
      </Expiration>
   </Rule>
</LifecycleConfiguration>`
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
<LifecycleConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <Rule>
      <AbortIncompleteMultipartUpload>
         <DaysAfterInitiation>_integer_</DaysAfterInitiation>
      </AbortIncompleteMultipartUpload>
      <Expiration>
         <Date>_timestamp_</Date>
         <Days>_integer_</Days>
         <ExpiredObjectDeleteMarker>_boolean_</ExpiredObjectDeleteMarker>
      </Expiration>
      <ID>_string_</ID>
      <NoncurrentVersionExpiration>
         <NewerNoncurrentVersions>_integer_</NewerNoncurrentVersions>
         <NoncurrentDays>_integer_</NoncurrentDays>
      </NoncurrentVersionExpiration>
      <NoncurrentVersionTransition>
         <NewerNoncurrentVersions>_integer_</NewerNoncurrentVersions>
         <NoncurrentDays>_integer_</NoncurrentDays>
         <StorageClass>_string_</StorageClass>
      </NoncurrentVersionTransition>
      <Prefix>_string_</Prefix>
      <Status>_string_</Status>
      <Transition>
         <Date>_timestamp_</Date>
         <Days>_integer_</Days>
         <StorageClass>_string_</StorageClass>
      </Transition>
   </Rule>
</LifecycleConfiguration>`
  }}
/>

## Response Elements

### Response Headers

<ParamsTable responseElements={RESPONSE_HEADERS} type="response" />

### Response Body Elements

<ParamsTable parameters={RESPONSE_ELEMENTS} type="response" />

For details about the elements within the Rule type, see <a href="/docs/api/q-storage/api-reference/data-types/rule">Rule</a>. The response format follows the [AWS S3 GetBucketLifecycle API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketLifecycle.html) specification.

## Special Errors

| Error Code | Description |
|------------|-------------|
| NoSuchBucket | The specified bucket does not exist |
| NoSuchLifecycleConfiguration | The lifecycle configuration does not exist |
| 403 | Forbidden. Authentication failed or you do not have permission to access the bucket lifecycle configuration |

## Permissions

You must have the `s3:GetLifecycleConfiguration` permission.

## Try It Out

<ApiTester
  operation="GetBucketLifecycle"
  description="Get the lifecycle configuration of a bucket."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket to get lifecycle configuration for"
    },
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "LifecycleConfiguration": {
      "Rule": [
        {
          "ID": "Archive and then delete rule",
          "Prefix": "projectdocs/",
          "Status": "Enabled",
          "Transition": [
            {
              "Days": 30,
              "StorageClass": "STANDARD_IA"
            },
            {
              "Days": 365,
              "StorageClass": "GLACIER"
            }
          ],
          "Expiration": {
            "Days": 3650
          }
        }
      ]
    }
  }}
/> 