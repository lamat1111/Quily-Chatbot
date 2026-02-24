---
sidebar_label: ListParts
title: ListParts
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
    description: "Upload ID identifying the multipart upload whose parts are being listed",
    required: true,
    placeholder: "VXBsb2FkIElEIGZvciA2aWWpbmcncyBteS1tb3ZpZS5tMnRzIHVwbG9hZA"
  },
  {
    name: "max-parts",
    type: "number",
    description: "Maximum number of parts to return in the response",
    required: false,
    placeholder: "1000"
  },
  {
    name: "part-number-marker",
    type: "number",
    description: "Part number after which to start listing parts",
    required: false,
    placeholder: "1"
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
    name: "x-amz-server-side-encryption-customer-algorithm",
    type: "text",
    description: "The server-side encryption (SSE) algorithm used to encrypt the object. This parameter is needed only when the object was created using a checksum algorithm",
    required: false,
    placeholder: "AES256"
  },
  {
    name: "x-amz-server-side-encryption-customer-key",
    type: "text",
    description: "The server-side encryption (SSE) customer managed key. This parameter is needed only when the object was created using a checksum algorithm",
    required: false,
    placeholder: "Base64-encoded encryption key"
  },
  {
    name: "x-amz-server-side-encryption-customer-key-MD5",
    type: "text",
    description: "The MD5 server-side encryption (SSE) customer managed key. This parameter is needed only when the object was created using a checksum algorithm",
    required: false,
    placeholder: "Base64-encoded MD5 hash of encryption key"
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
  },
  {
    name: "x-amz-abort-date",
    description: "If a lifecycle rule is configured to abort incomplete multipart uploads and the object name matches the rule's prefix, this header indicates when the upload will become eligible for abort operation. Not supported for directory buckets"
  },
  {
    name: "x-amz-abort-rule-id",
    description: "Returned with x-amz-abort-date, identifies the lifecycle rule that defines the abort incomplete multipart uploads action. Not supported for directory buckets"
  },
  {
    name: "x-amz-request-charged",
    description: "If present, indicates that the requester was successfully charged for the request",
    validValues: ["requester"]
  }
];

export const RESPONSE_ELEMENTS = [
  {
    name: "ListPartsResult",
    description: "Container for the response",
    required: true,
  },
  {
    name: "Bucket",
    description: "Name of the bucket to which the multipart upload was initiated"
  },
  {
    name: "Key",
    description: "Object key for which the multipart upload was initiated",
    contraints: ["Minimum length of 1"]
  },
  {
    name: "UploadId",
    description: "Upload ID identifying the multipart upload whose parts are being listed"
  },
  {
    name: "ChecksumAlgorithm",
    description: "The algorithm that was used to create a checksum of the object",
    validValues: ["CRC32", "CRC32C", "SHA1", "SHA256", "CRC64NVME"]
  },
  {
    name: "ChecksumType",
    description: "The checksum type that determines how part-level checksums are combined to create an object-level checksum for multipart objects. Used to verify the checksum type matches what was specified in the CreateMultipartUpload request",
    validValues: ["COMPOSITE", "FULL_OBJECT"]
  },
  {
    name: "PartNumberMarker",
    description: "Part number after which listing begins"
  },
  {
    name: "NextPartNumberMarker",
    description: "When a list is truncated, this is the part number marker to use in a subsequent request",
    type: "Integer"
  },
  {
    name: "MaxParts",
    description: "Maximum number of parts allowed in the response",
    type: "Integer"
  },
  {
    name: "IsTruncated",
    description: "Indicates whether the returned list of parts is truncated",
    type: "Boolean"
  },
  {
    name: "Part",
    description: "Container for elements related to a particular part",
    type: "<a href=\"/docs/api/q-storage/api-reference/data-types/part\">Part</a>"
  },
  {
    name: "PartNumber",
    description: "Part number identifying the part",
    type: "Integer"
  },
  {
    name: "LastModified",
    description: "Date and time at which the part was uploaded"
  },
  {
    name: "Size",
    description: "Size in bytes of the uploaded part data"
  },
  {
    name: "Owner",
    description: "Container element that identifies the object owner",
    type: "<a href=\"/docs/api/q-storage/api-reference/data-types/owner\">Owner</a>"
  },
  {
    name: "Initiator",
    description: "Container element that identifies who initiated the multipart upload.",
    type: "<a href=\"/docs/api/q-storage/api-reference/data-types/initiator\">Initiator</a>"
  }
];

# ListParts

Lists the parts that have been uploaded for a specific multipart upload.

## Description

The `ListParts` operation lists the parts that have been uploaded for a specific multipart upload. To use this operation, you must provide the `upload ID` in the request, which you obtain from the `CreateMultipartUpload` response.

:::note Important
- This operation returns at most 1,000 uploaded parts in the response. This is also the default value.
- You can restrict the number of parts in a response by specifying the `max-parts` request parameter.
- If your multipart upload consists of more than 1,000 parts, the response returns an `IsTruncated` field with the value of `true`, and a `NextPartNumberMarker` element.
- To list remaining uploaded parts, in subsequent `ListParts` requests, include the `part-number-marker` query string parameter and set its value to the `NextPartNumberMarker` field value from the previous response.
:::

## Request Syntax

<ApiExample
  request={{
    method: "GET",
    path: "/_ObjectKey_?uploadId=_UploadId_&max-parts=_MaxParts_&part-number-marker=_PartNumberMarker_",
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
<ListPartsResult>
   <Bucket>_BucketName_</Bucket>
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
   <PartNumberMarker>_PartNumberMarker_</PartNumberMarker>
   <NextPartNumberMarker>_NextPartNumberMarker_</NextPartNumberMarker>
   <MaxParts>_MaxParts_</MaxParts>
   <IsTruncated>_true|false_</IsTruncated>
   <Part>
      <PartNumber>_PartNumber_</PartNumber>
      <LastModified>_ISO8601Date_</LastModified>
      <ETag>_EntityTag_</ETag>
      <Size>_Size_</Size>
   </Part>
</ListPartsResult>`
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
| NoSuchUpload | The specified multipart upload does not exist |
| 403 | Forbidden. Authentication failed or you do not have permission to list parts |

## Permissions

You must have the `s3:ListMultipartUploadParts` permission on the bucket. If the upload was created using server-side encryption with KMS keys (SSE-KMS), you must also have permission to the `kms:Decrypt` action.

## Related Operations

The following operations are related to `ListParts`:
- CreateMultipartUpload
- UploadPart
- CompleteMultipartUpload
- AbortMultipartUpload
- ListMultipartUploads

## Examples

### Example 1: List all parts of a multipart upload

<ApiExample
  request={{
    method: "GET",
    path: "/large-file.zip?uploadId=VXBsb2FkIElEIGZvciA2aWWpbmcncyBteS1tb3ZpZS5tMnRzIHVwbG9hZA",
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
<ListPartsResult>
   <Bucket>_my-bucket_</Bucket>
   <Key>_large-file.zip_</Key>
   <UploadId>VXBsb2FkIElEIGZvciA2aWWpbmcncyBteS1tb3ZpZS5tMnRzIHVwbG9hZA</UploadId>
   <Initiator>
      <ID>_123456789012_</ID>
      <DisplayName>_Qm12311_</DisplayName>
   </Initiator>
   <Owner>
      <ID>_123456789012_</ID>
      <DisplayName>_Qm12345_</DisplayName>
   </Owner>
   <PartNumberMarker>0</PartNumberMarker>
   <NextPartNumberMarker>2</NextPartNumberMarker>
   <MaxParts>1000</MaxParts>
   <IsTruncated>false</IsTruncated>
   <Part>
      <PartNumber>1</PartNumber>
      <LastModified>2024-03-01T11:30:00.000Z</LastModified>
      <ETag>"7778aef83f66abc1fa1e8477f296d394"</ETag>
      <Size>5242880</Size>
   </Part>
   <Part>
      <PartNumber>2</PartNumber>
      <LastModified>2024-03-01T11:45:00.000Z</LastModified>
      <ETag>"7778aef83f66abc1fa1e8477f296d394"</ETag>
      <Size>5242880</Size>
   </Part>
</ListPartsResult>`
  }}
/>

### Example 2: List parts with a maximum limit and part number marker

<ApiExample
  request={{
    method: "GET",
    path: "/_large-file.zip_?uploadId=_VXBsb2FkIElEIGZvciA2aWWpbmcncyBteS1tb3ZpZS5tMnRzIHVwbG9hZA_&max-parts=_2_&part-number-marker=_1_",
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
<ListPartsResult>
   <Bucket>_my-bucket_</Bucket>
   <Key>_large-file.zip_</Key>
   <UploadId>_VXBsb2FkIElEIGZvciA2aWWpbmcncyBteS1tb3ZpZS5tMnRzIHVwbG9hZA_</UploadId>
   <Initiator>
      <ID>_123456789012_</ID>
      <DisplayName>_Qm12311_</DisplayName>
   </Initiator>
   <Owner>
      <ID>_123456789012_</ID>
      <DisplayName>_Qm12345</DisplayName>
   </Owner>
   <PartNumberMarker>1</PartNumberMarker>
   <NextPartNumberMarker>3</NextPartNumberMarker>
   <MaxParts>2</MaxParts>
   <IsTruncated>true</IsTruncated>
   <Part>
      <PartNumber>2</PartNumber>
      <LastModified>2024-03-01T11:30:00.000Z</LastModified>
      <ETag>"7778aef83f66abc1fa1e8477f296d394"</ETag>
      <Size>10485760</Size>
   </Part>
   <Part>
      <PartNumber>3</PartNumber>
      <LastModified>2024-03-01T11:45:00.000Z</LastModified>
      <ETag>"aaaa18db4cc2f85cedef654fccc4a4x8"</ETag>
      <Size>10485760</Size>
   </Part>
</ListPartsResult>`
  }}
/>

## Try It Out

<ApiTester
  operation="ListParts"
  description="List the parts that have been uploaded for a specific multipart upload."
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
    "ListPartsResult": {
      "Bucket": "my-bucket",
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
      "PartNumberMarker": "0",
      "NextPartNumberMarker": "2",
      "MaxParts": "1000",
      "IsTruncated": false,
      "Part": [
        {
          "PartNumber": "1",
          "LastModified": "2024-03-01T11:30:00.000Z",
          "ETag": "\"7778aef83f66abc1fa1e8477f296d394\"",
          "Size": "5242880"
        },
        {
          "PartNumber": "2",
          "LastModified": "2024-03-01T11:45:00.000Z",
          "ETag": "\"7778aef83f66abc1fa1e8477f296d394\"",
          "Size": "5242880"
        }
      ]
    }
  }}
/> 
/> 
/> 