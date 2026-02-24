---
sidebar_label: GetBucketLifecycleConfiguration
title: GetBucketLifecycleConfiguration
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
    name: "x-amz-transition-default-minimum-object-size",
    description: "Indicates which default minimum object size behavior is applied to the lifecycle configuration.",
    validValues: ["varies_by_storage_class", "all_storage_classes_128K"]
  },
  {
    name: "Date",
    description: "The date and time at which the response was sent"
  }
];

# GetBucketLifecycleConfiguration

Returns the lifecycle configuration information set on a bucket.

## Description

The `GetBucketLifecycleConfiguration` operation returns the lifecycle configuration information set on a bucket. Lifecycle configuration enables you to specify the lifecycle management of objects in a bucket. The configuration is a set of one or more rules, where each rule defines an action for QStorage to apply to a group of objects.

:::note
- To use this operation, you must have permission to perform the `s3:GetLifecycleConfiguration` action.
- You must be the bucket owner to use this operation.
- If the bucket does not have a lifecycle configuration, QStorage returns a `NoSuchLifecycleConfiguration` error.
- Bucket lifecycle configuration supports specifying a lifecycle rule using:
  - Object key name prefix
  - One or more object tags
  - Object size
  - Any combination of the above
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
      "Date": "_Wed, 01 Mar 2024 12:00:00 GMT_",
      "x-amz-transition-default-minimum-object-size": "varies_by_storage_class"
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<LifecycleConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <Rule>
      <ID>ExampleRule</ID>
      <Filter>
         <And>
            <Prefix>logs/</Prefix>
            <ObjectSizeGreaterThan>500</ObjectSizeGreaterThan>
            <ObjectSizeLessThan>64000</ObjectSizeLessThan>
         </And>
      </Filter>
      <Status>Enabled</Status>
      <Expiration>
         <Days>30</Days>
      </Expiration>
      <Transition>
         <Days>90</Days>
         <StorageClass>STANDARD_IA</StorageClass>
      </Transition>
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
      "Date": "_ISO8601Date_",
      "x-amz-transition-default-minimum-object-size": "_TransitionDefaultMinimumObjectSize_"
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<LifecycleConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <Rule>
      <ID>_RuleId_</ID>
      <Filter>
         <And>
            <Prefix>_Prefix_</Prefix>
            <ObjectSizeGreaterThan>_SizeGreaterThan_</ObjectSizeGreaterThan>
            <ObjectSizeLessThan>_SizeLessThan_</ObjectSizeLessThan>
            <Tag>
               <Key>_TagKey_</Key>
               <Value>_TagValue_</Value>
            </Tag>
         </And>
      </Filter>
      <Status>_Status_</Status>
      <Expiration>
         <Days>_Days_</Days>
         <ExpiredObjectDeleteMarker>_Boolean_</ExpiredObjectDeleteMarker>
      </Expiration>
      <Transition>
         <Days>_Days_</Days>
         <StorageClass>_StorageClass_</StorageClass>
      </Transition>
      <AbortIncompleteMultipartUpload>
         <DaysAfterInitiation>_Days_</DaysAfterInitiation>
      </AbortIncompleteMultipartUpload>
   </Rule>
</LifecycleConfiguration>`
  }}
/>

## Response Elements

### Response Headers

<ParamsTable responseElements={RESPONSE_HEADERS} type="response" />

### Response Body Elements

| Name | Description |
|------|-------------|
| LifecycleConfiguration | Root level tag for the LifecycleConfiguration parameters. |
| Rule | Container for a lifecycle rule. See [LifecycleRule](/docs/api/q-storage/api-reference/data-types/lifecycle-rule) for details. |

## Special Errors

| Error Code | Description |
|------------|-------------|
| NoSuchBucket | The specified bucket does not exist |
| NoSuchLifecycleConfiguration | The lifecycle configuration does not exist |
| 403 | Forbidden. Authentication failed or you do not have permission to get the lifecycle configuration |

## Permissions

You must have the `s3:GetLifecycleConfiguration` permission.

## Try It Out

<ApiTester
  operation="GetBucketLifecycleConfiguration"
  description="Get the lifecycle configuration of a bucket."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket to get lifecycle configuration from"
    },
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "LifecycleConfiguration": {
      "Rules": [
        {
          "ID": "ExampleRule",
          "Filter": {
            "And": {
              "Prefix": "logs/",
              "ObjectSizeGreaterThan": 500,
              "ObjectSizeLessThan": 64000
            }
          },
          "Status": "Enabled",
          "Expiration": {
            "Days": 30,
            "ExpiredObjectDeleteMarker": true
          },
          "Transition": {
            "Days": 90,
            "StorageClass": "STANDARD_IA"
          }
        }
      ]
    }
  }}
/> 