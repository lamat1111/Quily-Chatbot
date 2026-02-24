---
sidebar_label: ListObjects
title: ListObjects
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
    description: "A delimiter is a character you use to group keys. All keys that contain the same string between the prefix and the first occurrence of the delimiter are grouped under a single result element called CommonPrefixes",
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
    name: "marker",
    type: "text",
    description: "Specifies the key to start with when listing objects in a bucket",
    required: false,
    placeholder: "myobject.txt"
  },
  {
    name: "max-keys",
    type: "number",
    description: "Sets the maximum number of keys returned in the response body",
    required: false,
    placeholder: "1000"
  },
  {
    name: "prefix",
    type: "text",
    description: "Limits the response to keys that begin with the specified prefix",
    required: false,
    placeholder: "documents/"
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
    description: "Confirms that the requester knows that they will be charged for the request.",
    required: false,
    validValues: ["requester"],
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
    name: "Marker",
    description: "Indicates where in the bucket listing begins"
  },
  {
    name: "NextMarker",
    description: "When the response is truncated (the IsTruncated element value in the response is true), you can use the key name in this field as the marker parameter in the subsequent request to get the next set of objects. QStorage lists objects in alphabetical order.<br/><br/>Note: This element is returned only if you have the delimiter request parameter specified. If the response does not include the NextMarker element and it is truncated, you can use the value of the last Key element in the response as the marker parameter in the subsequent request to get the next set of object keys."
  },
  {
    name: "MaxKeys",
    description: "Maximum number of keys returned in the response"
  },
  {
    name: "Delimiter",
    description: "Character that groups keys sharing the same string between the prefix and the first occurrence of the delimiter into a single CommonPrefixes element. These grouped keys are not returned elsewhere in the response. Each grouped result counts as only one return against the MaxKeys limit."
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
    name: "EncodingType",
    description: "Encoding type used by QStorage to encode object key names in the XML response. If specified in the request, this element is included in the response, and encoded key name values are returned in the following response elements: Delimiter, Marker, Prefix, Key, and NextMarker."
  },
  {
    name: "CommonPrefixes",
    description: "Container for keys that are grouped by common prefixes. Only appears when a delimiter is specified. Keys between Prefix and the next occurrence of the delimiter are grouped under a single CommonPrefixes element. These keys act like subdirectories in the directory specified by Prefix (e.g., with prefix 'notes/' and delimiter '/', 'notes/summer/' would be a common prefix). All keys rolled up into a common prefix count as a single return when calculating the number of returns against the 1,000 limit."
  }
];

# ListObjects

Returns some or all (up to 1000) of the objects in a bucket.

## Description
:::warning Deprecated API
The `ListObjects` operation is maintained for backwards compatibility. For improved functionality and performance, we recommend using the [ListObjectsV2](/docs/api/q-storage/api-reference/object-operations/list-objects-v2) operation instead.
:::


The `ListObjects` operation returns some or all (up to 1000) of the objects in a bucket. You can use the request parameters as selection criteria to return a subset of the objects in a bucket.

:::note
- This operation returns up to 1000 objects at a time. Use the `marker` parameter for pagination.
- For better performance when listing objects with many prefixes, consider using `delimiter` parameter.
- If you need to list more than 1000 objects, you should use multiple requests with the `marker` parameter.
:::

## Request Syntax

<ApiExample
  request={{
    method: "GET",
    path: "/?delimiter=_Delimiter_&encoding-type=_EncodingType_&marker=_Marker_&max-keys=_MaxKeys_&prefix=_Prefix_",
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
    path: "/",
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
      "Date": "_Wed, 01 Mar 2024 12:00:00 GMT_"
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<ListBucketResult>
   <Name>my-bucket</Name>
   <Prefix></Prefix>
   <Marker></Marker>
   <MaxKeys>1000</MaxKeys>
   <IsTruncated>false</IsTruncated>
   <Contents>
      <Key>example.txt</Key>
      <LastModified>2024-03-01T12:00:00.000Z</LastModified>
      <ETag>"d41d8cd98f00b204e9800998ecf8427e"</ETag>
      <Size>11</Size>
      <Owner>
         <ID>123456789012</ID>
         <DisplayName>user@example.com</DisplayName>
      </Owner>
   </Contents>
</ListBucketResult>`
  }}
/>

### Example 2: List objects with a prefix and delimiter

<ApiExample
  request={{
    method: "GET",
    path: "/?prefix=documents/&delimiter=/",
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
      "Date": "_Wed, 01 Mar 2024 12:00:00 GMT_"
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<ListBucketResult>
   <Name>my-bucket</Name>
   <Prefix>documents/</Prefix>
   <Marker></Marker>
   <MaxKeys>1000</MaxKeys>
   <Delimiter>/</Delimiter>
   <IsTruncated>false</IsTruncated>
   <Contents>
      <Key>documents/readme.txt</Key>
      <LastModified>2024-03-01T12:00:00.000Z</LastModified>
      <ETag>"d41d8cd98f00b204e9800998ecf8427e"</ETag>
      <Size>11</Size>
      <Owner>
         <ID>123456789012</ID>
         <DisplayName>user@example.com</DisplayName>
      </Owner>
   </Contents>
   <CommonPrefixes>
      <Prefix>documents/2024/</Prefix>
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
   <Marker>_Marker_</Marker>
   <MaxKeys>_MaxKeys_</MaxKeys>
   <Delimiter>_Delimiter_</Delimiter>
   <IsTruncated>_true|false_</IsTruncated>
   <Contents>
      <Key>_ObjectKey_</Key>
      <LastModified>_ISO8601Date_</LastModified>
      <ETag>_EntityTag_</ETag>
      <Size>_Size_</Size>
      <Owner>
         <ID>_ID_</ID>
         <DisplayName>_DisplayName_</DisplayName>
      </Owner>
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
| 403 | Forbidden. Authentication failed or you do not have permission to list objects in the bucket |

## Permissions

You must have the `s3:ListBucket` permission.

## Try It Out

<ApiTester
  operation="ListObjects"
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
      "Marker": "",
      "MaxKeys": 1000,
      "IsTruncated": false,
      "Contents": [
        {
          "Key": "example.txt",
          "LastModified": "2024-03-01T12:00:00.000Z",
          "ETag": "\"d41d8cd98f00b204e9800998ecf8427e\"",
          "Size": 11,
          "Owner": {
            "ID": "123456789012",
            "DisplayName": "user@example.com"
          }
        }
      ]
    }
  }}
/> 

## Related Operations

The following operations are related to ListObjects:

- [ListObjectsV2](/docs/api/q-storage/api-reference/object-operations/list-objects-v2) - The newer, improved version of this operation
- [GetObject](/docs/api/q-storage/api-reference/object-operations/get-object) - Retrieves objects from QStorage
- [PutObject](/docs/api/q-storage/api-reference/object-operations/put-object) - Adds an object to a bucket
- [CreateBucket](/docs/api/q-storage/api-reference/bucket-operations/create-bucket) - Creates a new bucket
- [ListBuckets](/docs/api/q-storage/api-reference/bucket-operations/list-buckets) - Lists all buckets owned by the authenticated sender 