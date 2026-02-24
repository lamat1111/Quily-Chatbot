---
sidebar_label: AbortMultipartUpload
title: AbortMultipartUpload
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ApiTester from '@site/src/components/ApiTester';
import ParamsTable from '@site/src/components/ParamsTable';
import ApiExample from '@site/src/components/ApiExample';

export const URI_PARAMETERS = [
  {
    name: "uploadId",
    type: "text",
    description: "Upload ID identifying the multipart upload to abort",
    required: true,
    placeholder: "VXBsb2FkIElEIGZvciA2aWWpbmcncyBteS1tb3ZpZS5tMnRzIHVwbG9hZA"
  }
];

export const HEADER_PARAMETERS = [
  {
    name: "x-amz-expected-bucket-owner",
    type: "text",
    description: "The account ID of the expected bucket owner",
    required: false,
    placeholder: "123456789012"
  },
  {
    name: "x-amz-request-payer",
    type: "text",
    description: "Confirms that the requester knows that they will be charged for the request. Bucket owners need not specify this parameter in their requests. If either the source or destination S3 bucket has Requester Pays enabled, the requester will pay for corresponding charges to copy the object.<br/><br/>Accepted values: <span class=\"valid-value\">requester</span>",
    required: false,
    placeholder: "requester"
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

# AbortMultipartUpload

Aborts a multipart upload.

## Description

The `AbortMultipartUpload` operation aborts a multipart upload. After a multipart upload is aborted, no additional parts can be uploaded using that upload ID. The storage used by any previously uploaded parts will be freed.

:::note
- If you stop uploading parts to a multipart upload, you should abort the multipart upload to free storage space.
- If any part uploads are currently in progress, those part uploads might or might not succeed. As a result, it might be necessary to abort a given multipart upload multiple times to completely free all storage consumed by all parts.
:::

## Request Syntax

<ApiExample
  request={{
    method: "DELETE",
    path: "/_ObjectKey_?uploadId=_UploadId_",
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

### Example 1: Abort a multipart upload

<ApiExample
  request={{
    method: "DELETE",
    path: "/_large-file.zip_?uploadId=_VXBsb2FkIElEIGZvciA2aWWpbmcncyBteS1tb3ZpZS5tMnRzIHVwbG9hZA_",
    headers: {
      "Host": "_my-bucket_.qstorage.quilibrium.com"
    }
  }}
  response={{
    status: 204,
    headers: {
      "x-amz-id-2": "_Example7qoYGN7uMuFuYS6m7a4l_",
      "x-amz-request-id": "_TX234S0F24A06C7_",
      "Date": "_Wed, 01 Mar 2024 12:00:00 GMT_"
    }
  }}
/>

### Example 2: Abort a multipart upload with bucket owner verification

<ApiExample
  request={{
    method: "DELETE",
    path: "/_large-file.zip_?uploadId=_VXBsb2FkIElEIGZvciA2aWWpbmcncyBteS1tb3ZpZS5tMnRzIHVwbG9hZA_",
    headers: {
      "Host": "_my-bucket_.qstorage.quilibrium.com",
      "x-amz-expected-bucket-owner": "_123456789012_"
    }
  }}
  response={{
    status: 204,
    headers: {
      "x-amz-id-2": "_Example7qoYGN7uMuFuYS6m7a4l_",
      "x-amz-request-id": "_TX234S0F24A06C7_",
      "Date": "_Wed, 01 Mar 2024 12:00:00 GMT_"
    }
  }}
/>

## Response Syntax

<ApiExample
  request={{}}
  response={{
    status: 204,
    headers: {
      "x-amz-id-2": "_RequestId_",
      "x-amz-request-id": "_AmazonRequestId_",
      "Date": "_ISO8601Date_"
    }
  }}
/>

## Response Elements

### Response Headers

<ParamsTable responseElements={RESPONSE_HEADERS} type="response" />

## Special Errors

| Error Code | Description |
|------------|-------------|
| NoSuchUpload | The specified multipart upload does not exist |

## Permissions

You must have the `s3:AbortMultipartUpload` permission.

## Try It Out

<ApiTester
  operation="AbortMultipartUpload"
  description="Abort a multipart upload."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket containing the multipart upload"
    },
    {
      name: "objectKey",
      type: "text",
      required: true,
      placeholder: "large-file.zip",
      description: "Key of the object being created"
    },
    ...URI_PARAMETERS,
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "x-amz-id-2": "_Example7qoYGN7uMuFuYS6m7a4l_",
    "x-amz-request-id": "_TX234S0F24A06C7_"
  }}
/> 