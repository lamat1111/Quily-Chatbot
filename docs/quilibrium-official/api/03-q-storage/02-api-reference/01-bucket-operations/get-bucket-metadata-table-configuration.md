---
title: GetBucketMetadataTableConfiguration
label: GetBucketMetadataTableConfiguration
---

import ParamsTable from '@site/src/components/ParamsTable';
import ApiTester from '@site/src/components/ApiTester';
import ApiExample from '@site/src/components/ApiExample';

export const requestHeaders = [
  {
    name: 'x-amz-expected-bucket-owner',
    description: 'The account ID of the expected bucket owner',
    required: false,
    type: 'String'
  }
];

export const requestUriParams = [
  {
    name: 'BucketName',
    description: 'The name of the bucket for which to get the metadata table configuration',
    required: true,
    type: 'String'
  }
];

export const responseHeaders = [
  {
    name: 'x-amz-id-2',
    description: 'An identifier for the request',
    type: 'String'
  },
  {
    name: 'x-amz-request-id',
    description: 'A unique identifier for the request',
    type: 'String'
  }
];

export const responseElements = [
  {
    name: 'GetBucketMetadataTableConfigurationResult',
    description: 'Root level tag for the GetBucketMetadataTableConfigurationResult parameters',
    type: 'Container',
    required: true
  },
  {
    name: 'MetadataTableConfigurationResult',
    description: 'The metadata table configuration for a general purpose bucket',
    type: '<a href="/docs/api/q-storage/api-reference/data-types/metadata-table-configuration-result">MetadataTableConfigurationResult</a>',
    required: true
  },
  {
    name: 'Status',
    description: 'The status of the metadata table. Values: CREATING (table is being created), ACTIVE (table created successfully and records being delivered), FAILED (unable to create table or deliver records)',
    type: 'String',
    required: true
  },
  {
    name: 'Error',
    description: 'Contains error information if the table creation fails',
    type: '<a href="/docs/api/q-storage/api-reference/data-types/error-details">ErrorDetails</a>',
    required: false
  }
];

Returns the metadata table configuration for a bucket. This operation requires the `s3:GetBucketMetadataTableConfiguration` permission.

## Permissions
To use this operation, you must have the `s3:GetBucketMetadataTableConfiguration` permission.

## Request Syntax

<ApiExample
  request={{
    method: "GET",
    path: "/?metadataTable",
    headers: {
      "Host": "_BucketName_.qstorage.quilibrium.com",
      "x-amz-expected-bucket-owner": "_OwnerAccountId_"
    }
  }}
  response={{}}
/>

## Request Parameters

### Request Headers
<ParamsTable parameters={requestHeaders} />

### Request URI Parameters
<ParamsTable parameters={requestUriParams} />

### Request Body
This request does not have a request body.

## Response Syntax

```xml
HTTP/1.1 200
<?xml version="1.0" encoding="UTF-8"?>
<GetBucketMetadataTableConfigurationResult>
   <MetadataTableConfigurationResult>
      <S3TablesDestinationResult>
         <TableArn>string</TableArn>
         <TableBucketArn>string</TableBucketArn>
         <TableName>string</TableName>
         <TableNamespace>string</TableNamespace>
      </S3TablesDestinationResult>
   </MetadataTableConfigurationResult>
   <Status>string</Status>
   <Error>
      <ErrorCode>string</ErrorCode>
      <ErrorMessage>string</ErrorMessage>
   </Error>
</GetBucketMetadataTableConfigurationResult>
```

### Response Headers
<ParamsTable parameters={responseHeaders} />

### Response Elements
<ParamsTable parameters={responseElements} typesEnabled />

## Data Types

The GetBucketMetadataTableConfiguration API uses the following data types:

- [MetadataTableConfiguration](/docs/api/q-storage/api-reference/data-types/metadata-table-configuration)
- [MetadataTableConfigurationResult](/docs/api/q-storage/api-reference/data-types/metadata-table-configuration-result)
- [S3TablesDestinationResult](/docs/api/q-storage/api-reference/data-types/s3-tables-destination-result)
- [ErrorDetails](/docs/api/q-storage/api-reference/data-types/error-details)

## Examples

### Get Metadata Table Configuration

#### Sample Request
```http
GET /?metadata-table-configuration HTTP/1.1
Host: example-bucket.qstorage.example.com
x-amz-expected-bucket-owner: 111122223333
```

#### Sample Response
```http
HTTP/1.1 200
<?xml version="1.0" encoding="UTF-8"?>
<GetBucketMetadataTableConfigurationResult>
   <MetadataTableConfigurationResult>
      <S3TablesDestinationResult>
         <TableArn>arn:qstorage:example-region:111122223333:table/example-table</TableArn>
         <TableBucketArn>arn:qstorage:example-region:111122223333:bucket/example-bucket</TableBucketArn>
         <TableName>example-table</TableName>
         <TableNamespace>example-namespace</TableNamespace>
      </S3TablesDestinationResult>
   </MetadataTableConfigurationResult>
   <Status>ACTIVE</Status>
   <Error>
      <ErrorCode></ErrorCode>
      <ErrorMessage></ErrorMessage>
   </Error>
</GetBucketMetadataTableConfigurationResult>
```

<ApiTester
  method="GET"
  endpoint="/?metadata-table-configuration"
  headers={requestHeaders}
/>
