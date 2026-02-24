---
sidebar_label: ListMultipartUploads
title: ListMultipartUploads
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ApiTester from '@site/src/components/ApiTester';
import ParamsTable from '@site/src/components/ParamsTable';
import ApiExample from '@site/src/components/ApiExample';

export const URI_PARAMETERS = [
  {
    name: "delimiter",
    type: "text",
    description: "A delimiter is a character that you specify to group keys. All keys that contain the same string between the prefix and the first occurrence of the delimiter are grouped under a single result element in CommonPrefixes",
    required: false,
    placeholder: "/"
  },
  {
    name: "encoding-type",
    type: "text",
    description: "Specifies the encoding method to use for object key names in the response",
    required: false,
    placeholder: "url"
  },
  {
    name: "key-marker",
    type: "text",
    description: "Together with upload-id-marker, specifies the multipart upload after which listing should begin",
    required: false,
    placeholder: "example.txt"
  },
  {
    name: "max-uploads",
    type: "number",
    description: "Sets the maximum number of multipart uploads to return in the response body (default: 1000)",
    required: false,
    placeholder: "1000"
  },
  {
    name: "prefix",
    type: "text",
    description: "Limits the response to keys that begin with the specified prefix",
    required: false,
    placeholder: "documents/"
  },
  {
    name: "upload-id-marker",
    type: "text",
    description: "Together with key-marker, specifies the multipart upload after which listing should begin",
    required: false,
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
    name: "ListMultipartUploadsResult",
    description: "Container for the response"
  },
  {
    name: "Bucket",
    description: "Name of the bucket to which the multipart upload was initiated"
  },
  {
    name: "KeyMarker",
    description: "The key at which the listing begins"
  },
  {
    name: "UploadIdMarker",
    description: "Upload ID after which listing begins"
  },
  {
    name: "NextKeyMarker",
    description: "When a list is truncated, this element specifies the value that should be used for the key-marker request parameter in a subsequent request"
  },
  {
    name: "NextUploadIdMarker",
    description: "When a list is truncated, this element specifies the value that should be used for the upload-id-marker request parameter in a subsequent request"
  },
  {
    name: "MaxUploads",
    description: "Maximum number of multipart uploads that could have been returned"
  },
  {
    name: "IsTruncated",
    description: "Indicates whether the returned list of multipart uploads is truncated. A true value indicates that the list was truncated. A list can be truncated if the number of multipart uploads exceeds the limit allowed or specified by max uploads"
  },
  {
    name: "Upload",
    description: "Container for elements related to a particular multipart upload"
  },
  {
    name: "Key",
    description: "Key of the object for which the multipart upload was initiated"
  },
  {
    name: "UploadId",
    description: "Upload ID that identifies the multipart upload"
  },
  {
    name: "Initiator",
    description: "Identifies who initiated the multipart upload"
  },
  {
    name: "Owner",
    description: "Identifies the object owner"
  },
  {
    name: "Initiated",
    description: "Date and time at which the multipart upload was initiated"
  },
  {
    name: "CommonPrefixes",
    description: "If you specify a delimiter in the request, then the result returns each distinct key prefix containing the delimiter in a CommonPrefixes element. The distinct key prefixes are returned in the Prefix child element"
  },
  {
    name: "Prefix",
    description: "Keys that begin with the indicated prefix"
  }
];

# ListMultipartUploads

Lists in-progress multipart uploads in a bucket.

## Description

The `ListMultipartUploads` operation lists in-progress multipart uploads in a bucket. An in-progress multipart upload is a multipart upload that has been initiated using the `CreateMultipartUpload` request, but has not yet been completed or aborted.

:::note Important
- This operation returns at most 1,000 multipart uploads in the response. This is also the default value.
- The response might contain fewer uploads than specified by max-uploads.
- Always check the `IsTruncated` element in the response.
- If there are additional multipart uploads to list, the response will include a `NextKeyMarker` and `NextUploadIdMarker` that can be used in subsequent requests.
:::

## Request Syntax

<ApiExample
  request={{
    method: "GET",
    path: "/?uploads&delimiter=_Delimiter_&encoding-type=_EncodingType_&key-marker=_KeyMarker_&max-uploads=_MaxUploads_&prefix=_Prefix_&upload-id-marker=_UploadIdMarker_",
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
<ListMultipartUploadsResult>
   <Bucket>_BucketName_</Bucket>
   <KeyMarker>_KeyMarker_</KeyMarker>
   <UploadIdMarker>_UploadIdMarker_</UploadIdMarker>
   <NextKeyMarker>_NextKeyMarker_</NextKeyMarker>
   <NextUploadIdMarker>_NextUploadIdMarker_</NextUploadIdMarker>
   <Delimiter>_Delimiter_</Delimiter>
   <Prefix>_Prefix_</Prefix>
   <MaxUploads>_MaxUploads_</MaxUploads>
   <IsTruncated>_true|false_</IsTruncated>
   <Upload>
      <Key>_ObjectKey_</Key>
      <UploadId>_UploadId_</UploadId>
      <Initiator>
         <ID>_InitiatorId_</ID>
         <DisplayName>_InitiatorName_</DisplayName>
      </Initiator>
      <Owner>
         <ID>_OwnerId_</ID>
         <DisplayName>_OwnerName_</DisplayName>
      </Owner>
      <Initiated>_ISO8601Date_</Initiated>
   </Upload>
   <CommonPrefixes>
      <Prefix>_CommonPrefix_</Prefix>
   </CommonPrefixes>
</ListMultipartUploadsResult>`
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
| 403 | Forbidden. Authentication failed or you do not have permission to list multipart uploads |

## Permissions

You must have the `s3:ListBucketMultipartUploads` permission on the bucket.

## Related Operations

The following operations are related to `ListMultipartUploads`:
- CreateMultipartUpload
- UploadPart
- CompleteMultipartUpload
- ListParts
- AbortMultipartUpload

## Examples

### Example 1: List all multipart uploads

<ApiExample
  request={{
    method: "GET",
    path: "/?uploads",
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
<ListMultipartUploadsResult>
   <Bucket>my-bucket</Bucket>
   <KeyMarker></KeyMarker>
   <UploadIdMarker></UploadIdMarker>
   <NextKeyMarker>large-file.zip</NextKeyMarker>
   <NextUploadIdMarker>VXBsb2FkIElEIGZvciA2aWWpbmcncyBteS1tb3ZpZS5tMnRzIHVwbG9hZA</NextUploadIdMarker>
   <MaxUploads>1000</MaxUploads>
   <IsTruncated>false</IsTruncated>
   <Upload>
      <Key>large-file.zip</Key>
      <UploadId>VXBsb2FkIElEIGZvciA2aWWpbmcncyBteS1tb3ZpZS5tMnRzIHVwbG9hZA</UploadId>
      <Initiator>
         <ID>123456789012</ID>
         <DisplayName>user@example.com</DisplayName>
      </Initiator>
      <Owner>
         <ID>123456789012</ID>
         <DisplayName>user@example.com</DisplayName>
      </Owner>
      <Initiated>2024-03-01T11:30:00.000Z</Initiated>
   </Upload>
</ListMultipartUploadsResult>`
  }}
/>

### Example 2: List multipart uploads with a prefix

<ApiExample
  request={{
    method: "GET",
    path: "/?uploads&prefix=documents/&max-uploads=2",
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
<ListMultipartUploadsResult>
   <Bucket>my-bucket</Bucket>
   <KeyMarker></KeyMarker>
   <UploadIdMarker></UploadIdMarker>
   <Prefix>documents/</Prefix>
   <MaxUploads>2</MaxUploads>
   <IsTruncated>true</IsTruncated>
   <NextKeyMarker>documents/report.pdf</NextKeyMarker>
   <NextUploadIdMarker>VXBsb2FkIElEIGZvciA2aWWpbmcncyBteS1tb3ZpZS5tMnRzIHVwbG9hZA</NextUploadIdMarker>
   <Upload>
      <Key>documents/presentation.pptx</Key>
      <UploadId>VXBsb2FkIElEIGZvciA2aWWpbmcncyBteS1tb3ZpZS5tMnRzIHVwbG9hZA</UploadId>
      <Initiator>
         <ID>123456789012</ID>
         <DisplayName>user@example.com</DisplayName>
      </Initiator>
      <Owner>
         <ID>123456789012</ID>
         <DisplayName>user@example.com</DisplayName>
      </Owner>
      <Initiated>2024-03-01T11:30:00.000Z</Initiated>
   </Upload>
   <Upload>
      <Key>documents/report.pdf</Key>
      <UploadId>VXBsb2FkIElEIGZvciA2aWWpbmcncyBteS1tb3ZpZS5tMnRzIHVwbG9hZA</UploadId>
      <Initiator>
         <ID>123456789012</ID>
         <DisplayName>user@example.com</DisplayName>
      </Initiator>
      <Owner>
         <ID>123456789012</ID>
         <DisplayName>user@example.com</DisplayName>
      </Owner>
      <Initiated>2024-03-01T11:45:00.000Z</Initiated>
   </Upload>
</ListMultipartUploadsResult>`
  }}
/>

## Try It Out

<ApiTester
  operation="ListMultipartUploads"
  description="List in-progress multipart uploads in a bucket."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket to list multipart uploads from"
    },
    ...URI_PARAMETERS,
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "ListMultipartUploadsResult": {
      "Bucket": "my-bucket",
      "KeyMarker": "",
      "UploadIdMarker": "",
      "MaxUploads": 1000,
      "IsTruncated": false,
      "Upload": [
        {
          "Key": "large-file.zip",
          "UploadId": "VXBsb2FkIElEIGZvciA2aWWpbmcncyBteS1tb3ZpZS5tMnRzIHVwbG9hZA",
          "Initiator": {
            "ID": "123456789012",
            "DisplayName": "user@example.com"
          },
          "Owner": {
            "ID": "123456789012",
            "DisplayName": "user@example.com"
          },
          "Initiated": "2024-03-01T11:30:00.000Z"
        }
      ]
    }
  }}
/>