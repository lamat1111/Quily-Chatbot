---
sidebar_label: GetBucketAnalyticsConfiguration
title: GetBucketAnalyticsConfiguration
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ApiTester from '@site/src/components/ApiTester';
import ParamsTable from '@site/src/components/ParamsTable';
import ApiExample from '@site/src/components/ApiExample';

export const URI_PARAMETERS = [
  {
    name: "id",
    type: "text",
    description: "The ID that identifies the analytics configuration",
    required: true,
    placeholder: "config1"
  }
];

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



# GetBucketAnalyticsConfiguration

Gets an analytics configuration for a bucket.

## Description

The `GetBucketAnalyticsConfiguration` operation returns an analytics configuration (identified by the configuration ID) from the bucket. By default, this operation returns information about access patterns for objects in a bucket.

:::note
- To use this operation, you must have permission to perform the `s3:GetAnalyticsConfiguration` action.
- You must be the bucket owner to use this operation.
- If the specified configuration does not exist, QStorage returns a `NoSuchConfiguration` error.
:::

## Request Syntax

<ApiExample
  request={{
    method: "GET",
    path: "/?analytics&id=_ConfigurationId_",
    headers: {
      "Host": "_BucketName_.qstorage.quilibrium.com",
      "x-amz-expected-bucket-owner": "_OwnerAccountId_"
    }
  }}
  response={{}}
/>

This operation does not have a request body.

## Request Parameters

### URI Parameters

<ParamsTable parameters={URI_PARAMETERS} />

### Headers

<ParamsTable parameters={HEADER_PARAMETERS} />

## Examples

### Example 1: Get analytics configuration from a bucket

<ApiExample
  request={{
    method: "GET",
    path: "/?analytics&id=config1",
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
<AnalyticsConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <Id>config1</Id>
   <Filter>
      <Prefix>documents/</Prefix>
   </Filter>
   <StorageClassAnalysis>
      <DataExport>
         <OutputSchemaVersion>V_1</OutputSchemaVersion>
         <Destination>
            <S3BucketDestination>
               <Format>CSV</Format>
               <BucketAccountId>123456789012</BucketAccountId>
               <Bucket>arn:aws:s3:::destination-bucket</Bucket>
               <Prefix>reports/</Prefix>
            </S3BucketDestination>
         </Destination>
      </DataExport>
   </StorageClassAnalysis>
</AnalyticsConfiguration>`
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
<AnalyticsConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <Id>_ConfigurationId_</Id>
   <Filter>
      <And>
         <Prefix>_Prefix_</Prefix>
         <Tag>
            <Key>_Key_</Key>
            <Value>_Value_</Value>
         </Tag>
      </And>
   </Filter>
   <StorageClassAnalysis>
      <DataExport>
         <OutputSchemaVersion>_Version_</OutputSchemaVersion>
         <Destination>
            <S3BucketDestination>
               <Format>_Format_</Format>
               <BucketAccountId>_AccountId_</BucketAccountId>
               <Bucket>_BucketARN_</Bucket>
               <Prefix>_Prefix_</Prefix>
            </S3BucketDestination>
         </Destination>
      </DataExport>
   </StorageClassAnalysis>
</AnalyticsConfiguration>`
  }}
/>

## Response Elements

### Response Headers

<ParamsTable responseElements={RESPONSE_HEADERS} type="response" />

### Response Body Elements

| Name | Type | Description | Required |
|------|------|-------------|-----------|
| AnalyticsConfiguration | Container | Container for the analytics configuration | Yes |
| Id | String | The ID that identifies the analytics configuration | Yes |
| Filter | [AnalyticsFilter](/docs/api/q-storage/api-reference/data-types/analytics-filter) | Container for the filter used to describe a set of objects for analyses | No |

## Special Errors

| Error Code | Description |
|------------|-------------|
| NoSuchBucket | The specified bucket does not exist |
| NoSuchConfiguration | The specified configuration does not exist |
| 403 | Forbidden. Authentication failed or you do not have permission to get the analytics configuration |

## Permissions

You must have the `s3:GetAnalyticsConfiguration` permission.

## Try It Out

<ApiTester
  operation="GetBucketAnalyticsConfiguration"
  description="Get an analytics configuration from a bucket."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket to get analytics configuration from"
    },
    ...URI_PARAMETERS,
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "AnalyticsConfiguration": {
      "Id": "config1",
      "Filter": {
        "Prefix": "documents/"
      },
      "StorageClassAnalysis": {
        "DataExport": {
          "OutputSchemaVersion": "V_1",
          "Destination": {
            "S3BucketDestination": {
              "Format": "CSV",
              "BucketAccountId": "123456789012",
              "Bucket": "arn:aws:s3:::destination-bucket",
              "Prefix": "reports/"
            }
          }
        }
      }
    }
  }}
/> 