---
sidebar_label: ListObjectsV2
title: ListObjectsV2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ApiTester from '@site/src/components/ApiTester';
import ParamsTable from '@site/src/components/ParamsTable';
import ApiExample from '@site/src/components/ApiExample';

export const URI_PARAMETERS = [
  {
    name: "list-type",
    type: "number",
    description: "Must be set to 2 to use ListObjectsV2",
    required: true,
    placeholder: "2"
  },
  {
    name: "continuation-token",
    type: "text",
    description: "Token to continue listing more objects. Used for pagination.",
    required: false,
    placeholder: "eyJNYXJrZXIiOiBudWxsLCAiYm90b190cnVuY2F0ZV9hbW91bnQiOiAyfQ=="
  },
  {
    name: "delimiter",
    type: "text",
    description: "Character used to group keys",
    required: false,
    placeholder: "/"
  },
  {
    name: "encoding-type",
    type: "text",
    description: "Encoding type used by QStorage to encode object key names in the response",
    required: false,
    placeholder: "url"
  },
  {
    name: "fetch-owner",
    type: "boolean",
    description: "Specifies whether to include owner information in the response",
    required: false,
    placeholder: "true"
  },
  {
    name: "max-keys",
    type: "number",
    description: "Maximum number of keys to return in the response",
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
    name: "start-after",
    type: "text",
    description: "Start listing after this specified key",
    required: false,
    placeholder: "example.txt"
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
    description: "Confirms that the requester knows that they will be charged for the request.<br/><br/>Valid Values: <span class=\"valid-value\">requester</span>",
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
    name: "x-amz-request-charged",
    description: "If present, indicates that the requester was successfully charged for the request.<br/><br/>Valid Values: <span class=\"valid-value\">requester</span>"
  },
  {
    name: "Date",
    description: "The date and time at which the response was sent"
  }
];

export const RESPONSE_ELEMENTS = [
  {
    name: "ListBucketResult",
    description: "Container for response"
  },
  {
    name: "Name",
    description: "Name of the bucket"
  },
  {
    name: "Prefix",
    description: "Keys that begin with the indicated prefix"
  },
  {
    name: "StartAfter",
    description: "Key to start listing from"
  },
  {
    name: "KeyCount",
    description: "Number of keys returned"
  },
  {
    name: "MaxKeys",
    description: "Maximum number of keys that could have been returned"
  },
  {
    name: "Delimiter",
    description: "Character used to group keys. Keys containing the same string between the prefix and the first occurrence of the delimiter are grouped under a single CommonPrefixes element. These grouped keys are not listed individually elsewhere in the response and each group counts as one item against the MaxKeys limit."
  },
  {
    name: "IsTruncated",
    description: "Indicates whether the returned list of objects is truncated"
  },
  {
    name: "Contents",
    description: "Contains information about each <a href=\"/docs/api/q-storage/api-reference/data-types/object\">Object</a> returned. Each Object is returned as a Contents element"
  },
  {
    name: "Key",
    description: "The object key"
  },
  {
    name: "LastModified",
    description: "Date and time the object was last modified"
  },
  {
    name: "ContinuationToken",
    description: "If ContinuationToken was sent with the request, it is included in the response. You can use this ContinuationToken for pagination of the list results."
  },
  {
    name: "NextContinuationToken",
    description: "Token to use in a subsequent request to get the next set of objects, if there are any remaining."
  },
  {
    name: "ETag",
    description: "The entity tag is an MD5 hash of the object"
  },
  {
    name: "EncodingType",
    description: "Encoding type used to encode object key names in the XML response. If specified in the request, this element is included in the response, and encoded key name values are returned in the following response elements: Delimiter, Prefix, Key, and StartAfter."
  },
  {
    name: "Size",
    description: "Size in bytes of the object"
  },
  {
    name: "Owner",
    description: "Bucket owner information"
  },
  {
    name: "StorageClass",
    description: "Storage class used for storing the object"
  },
  {
    name: "CommonPrefixes",
    description: "Groups of keys that share identical patterns up to the next delimiter character. These common prefixes only appear in the response when a delimiter parameter is specified."
  }
];

# ListObjectsV2

Returns some or all (up to 1000) of the objects in a bucket.

## Description

The `ListObjectsV2` operation returns some or all (up to 1000) of the objects in a bucket. You can use the request parameters as selection criteria to return a subset of the objects in a bucket. To use this operation, you must have `s3:ListBucket` permissions on the bucket, or be the bucket owner.

:::note
- This operation returns up to 1000 objects at a time.
- To get the next set of objects, use the `continuation-token` from the previous response.
- For better performance when listing objects with many prefixes, use the `delimiter` parameter.
- A 200 OK response can contain valid or invalid XML.
:::

## Request Syntax

<ApiExample
  request={{
    method: "GET",
    path: "/?list-type=2&continuation-token=_Token_&delimiter=_Delimiter_&encoding-type=_EncodingType_&fetch-owner=_FetchOwner_&max-keys=_MaxKeys_&prefix=_Prefix_&start-after=_StartAfter_",
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

### Example 1: List objects in a bucket

<ApiExample
  request={{
    method: "GET",
    path: "/?list-type=2",
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
<ListBucketResult>
   <Name>_my-bucket_</Name>
   <Prefix></Prefix>
   <KeyCount>_2_</KeyCount>
   <MaxKeys>_1000_</MaxKeys>
   <IsTruncated>_false_</IsTruncated>
   <Contents>
      <Key>_hello.txt_</Key>
      <LastModified>_2024-03-01T11:00:00.000Z_</LastModified>
      <ETag>_"7778aef83f66abc1fa1e8477f296d394"_</ETag>
      <Size>_11_</Size>
      <StorageClass>_STANDARD_</StorageClass>
   </Contents>
   <Contents>
      <Key>_document.txt_</Key>
      <LastModified>_2024-03-01T11:30:00.000Z_</LastModified>
      <ETag>_"7778aef83f66abc1fa1e8477f296d394"_</ETag>
      <Size>_11_</Size>
      <StorageClass>_STANDARD_</StorageClass>
   </Contents>
</ListBucketResult>`
  }}
/>

### Example 2: List objects with a prefix and delimiter

<ApiExample
  request={{
    method: "GET",
    path: "/?list-type=2&prefix=documents/&delimiter=/",
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
<ListBucketResult>
   <Name>_my-bucket_</Name>
   <Prefix>_documents/_</Prefix>
   <Delimiter>_/_</Delimiter>
   <KeyCount>_2_</KeyCount>
   <MaxKeys>_1000_</MaxKeys>
   <IsTruncated>_false_</IsTruncated>
   <Contents>
      <Key>_documents/report.pdf_</Key>
      <LastModified>_2024-03-01T11:00:00.000Z_</LastModified>
      <ETag>_"7778aef83f66abc1fa1e8477f296d394"_</ETag>
      <Size>_52428800_</Size>
      <StorageClass>_STANDARD_</StorageClass>
   </Contents>
   <CommonPrefixes>
      <Prefix>_documents/2024/_</Prefix>
   </CommonPrefixes>
</ListBucketResult>`
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
<ListBucketResult>
   <Name>_BucketName_</Name>
   <Prefix>_Prefix_</Prefix>
   <StartAfter>_StartAfter_</StartAfter>
   <KeyCount>_KeyCount_</KeyCount>
   <MaxKeys>_MaxKeys_</MaxKeys>
   <Delimiter>_Delimiter_</Delimiter>
   <IsTruncated>_true|false_</IsTruncated>
   <Contents>
      <Key>_ObjectKey_</Key>
      <LastModified>_ISO8601Date_</LastModified>
      <ETag>_EntityTag_</ETag>
      <Size>_Size_</Size>
      <Owner>
         <ID>_OwnerId_</ID>
         <DisplayName>_OwnerName_</DisplayName>
      </Owner>
      <StorageClass>_StorageClass_</StorageClass>
   </Contents>
   <CommonPrefixes>
      <Prefix>_CommonPrefix_</Prefix>
   </CommonPrefixes>
</ListBucketResult>`
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
| 403 | Forbidden. Authentication failed or you do not have permission to list objects |

## Permissions

You must have the `s3:ListBucket` permission.

## Try It Out

<ApiTester
  operation="ListObjectsV2"
  description="List objects in a bucket."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket to list objects from"
    },
    ...URI_PARAMETERS,
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "ListBucketResult": {
      "Name": "my-bucket",
      "Prefix": "",
      "KeyCount": 2,
      "MaxKeys": 1000,
      "IsTruncated": false,
      "Contents": [
        {
          "Key": "hello.txt",
          "LastModified": "2024-03-01T11:00:00.000Z",
          "ETag": "\"7778aef83f66abc1fa1e8477f296d394\"",
          "Size": 11,
          "StorageClass": "STANDARD"
        },
        {
          "Key": "document.txt",
          "LastModified": "2024-03-01T11:30:00.000Z",
          "ETag": "\"7778aef83f66abc1fa1e8477f296d394\"",
          "Size": 11,
          "StorageClass": "STANDARD"
        }
      ]
    }
  }}
/> 