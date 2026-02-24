---
sidebar_label: GetBucketVersioning
title: GetBucketVersioning
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
    name: "VersioningConfiguration",
    description: "Container for versioning configuration. See <a href='/docs/api/q-storage/api-reference/data-types/versioning-configuration'>VersioningConfiguration</a> for details."
  },
  {
    name: "Status",
    description: "The versioning state of the bucket.<br/><br/>Valid values: <span class=\"valid-value\">Enabled | Suspended</span>"
  },
  {
    name: "MFADelete",
    description: "Specifies whether MFA delete is enabled in the bucket versioning configuration.<br/><br/>Valid values: <span class=\"valid-value\">Enabled | Disabled</span>.<br/><br/><i>This element is only returned if the bucket has been configured with MFA delete.</i>"
  }
];

# GetBucketVersioning

Returns the versioning state of a bucket.

## Description

The `GetBucketVersioning` operation returns the versioning state of a bucket. To retrieve the versioning state of a bucket, you must be the bucket owner.

A bucket's versioning state can be one of the following:
- Enabled - Versioning is enabled for the bucket
- Suspended - Versioning was previously enabled but is currently suspended
- Unversioned - Versioning has never been enabled on the bucket

For more information about versioning, see [Object Versioning](/docs/api/q-storage/user-manual/object-versioning).

:::note
- To use this operation, you must have permission to perform the `s3:GetBucketVersioning` action.
- You must be the bucket owner to use this operation.
- The return format is XML
:::

## Request Syntax

<ApiExample
  request={{
    method: "GET",
    path: "/?versioning",
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

### Example 1: Get bucket versioning when versioning is enabled

<ApiExample
  request={{
    method: "GET",
    path: "/?versioning",
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
<VersioningConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <Status>Enabled</Status>
</VersioningConfiguration>`
  }}
/>

### Example 2: Get bucket versioning when versioning is suspended

<ApiExample
  request={{
    method: "GET",
    path: "/?versioning",
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
<VersioningConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <Status>Suspended</Status>
</VersioningConfiguration>`
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
<VersioningConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <Status>_Status_</Status>
   <MFADelete>_MFADeleteStatus_</MFADelete>
</VersioningConfiguration>`
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
| 403 | Forbidden. Authentication failed or you do not have permission to get the bucket versioning configuration |

## Permissions

You must have the `s3:GetBucketVersioning` permission.

## Try It Out

<ApiTester
  operation="GetBucketVersioning"
  description="Get the versioning state of a bucket."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket to get versioning state from"
    },
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "VersioningConfiguration": {
      "Status": "Enabled",
      "MFADelete": "Disabled"
    }
  }}
/> 