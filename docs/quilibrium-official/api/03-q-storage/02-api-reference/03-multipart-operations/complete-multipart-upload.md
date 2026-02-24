---
sidebar_label: CompleteMultipartUpload
title: CompleteMultipartUpload
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
    description: "Upload ID identifying the multipart upload to complete",
    required: true,
    placeholder: "VXBsb2FkIElEIGZvciA2aWWpbmcncyBteS1tb3ZpZS5tMnRzIHVwbG9hZA"
  }
];

export const REQUEST_BODY = [
  {
    name: "CompleteMultipartUpload",
    description: "Root level tag for the CompleteMultipartUpload parameters",
    required: true
  },
  {
    name: "Part",
    description: "Array of <a href=\"/docs/api/q-storage/api-reference/data-types/completed-part\">CompletedPart</a> data types.<br/><br/>If you do not supply a valid Part with your request, the service sends back an HTTP 400 response.",
    required: false,
  }
];

export const HEADER_PARAMETERS = [
  {
    name: "If-Match",
    type: "text",
    description: "Return the object only if its entity tag (ETag) is the same as the one specified, otherwise return a 412 (precondition failed) error",
    required: false
  },
  {
    name: "If-None-Match",
    type: "text",
    description: "Return the object only if its entity tag (ETag) is different from the one specified, otherwise return a 304 (not modified) error",
    required: false
  },
  {
    name: "x-amz-checksum-crc32",
    type: "text",
    description: "This header can be used as a data integrity check to verify that the data received is the same data that was originally sent. This header specifies the Base64 encoded, 32-bit CRC32 checksum of the object",
    required: false
  },
  {
    name: "x-amz-checksum-crc32c",
    type: "text",
    description: "This header can be used as a data integrity check to verify that the data received is the same data that was originally sent. This header specifies the Base64 encoded, 32-bit CRC32C checksum of the object",
    required: false
  },
  {
    name: "x-amz-checksum-crc64nvme",
    type: "text",
    description: "This header can be used as a data integrity check to verify that the data received is the same data that was originally sent. This header specifies the Base64 encoded, 64-bit CRC64NVME checksum of the object. The CRC64NVME checksum is always a full object checksum",
    required: false
  },
  {
    name: "x-amz-checksum-sha1",
    type: "text",
    description: "This header can be used as a data integrity check to verify that the data received is the same data that was originally sent. This header specifies the Base64 encoded, 160-bit SHA1 digest of the object",
    required: false
  },
  {
    name: "x-amz-checksum-sha256",
    type: "text",
    description: "This header can be used as a data integrity check to verify that the data received is the same data that was originally sent. This header specifies the Base64 encoded, 256-bit SHA256 digest of the object",
    required: false
  },
  {
    name: "x-amz-checksum-type",
    type: "text",
    description: "This header specifies the checksum type of the object, which determines how part-level checksums are combined to create an object-level checksum for multipart objects. If the checksum type doesn't match the checksum type that was specified for the object during the CreateMultipartUpload request, it'll result in a BadDigest error",
    required: false,
    validValues: ["COMPOSITE", "FULL_OBJECT"]
  },
  {
    name: "x-amz-expected-bucket-owner",
    type: "text",
    description: "The account ID of the expected bucket owner. If the account ID that you provide does not match the actual owner of the bucket, the request fails with the HTTP status code 403 Forbidden (access denied)",
    required: false,
    placeholder: "123456789012"
  },
  {
    name: "x-amz-mp-object-size",
    type: "text",
    description: "The expected total object size of the multipart upload request. If there's a mismatch between the specified object size value and the actual object size value, it results in an HTTP 400 InvalidRequest error",
    required: false
  },
  {
    name: "x-amz-request-payer",
    type: "text",
    description: "Confirms that the requester knows that they will be charged for the request. Bucket owners need not specify this parameter in their requests",
    required: false,
    validValues: ["requester"]
  },
  {
    name: "x-amz-server-side-encryption-customer-algorithm",
    type: "text",
    description: "The server-side encryption (SSE) algorithm used to encrypt the object. This parameter is required only when the object was created using a checksum algorithm or if your bucket policy requires the use of SSE-C.",
    required: false
  },
  {
    name: "x-amz-server-side-encryption-customer-key",
    type: "text",
    description: "The server-side encryption (SSE) customer managed key. This parameter is needed only when the object was created using a checksum algorithm.",
    required: false
  },
  {
    name: "x-amz-server-side-encryption-customer-key-MD5",
    type: "text",
    description: "The MD5 server-side encryption (SSE) customer managed key. This parameter is needed only when the object was created using a checksum algorithm.",
    required: false
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
    name: "x-amz-server-side-encryption",
    description: "If the object is stored using server-side encryption with an QKMS key, the response includes this header with the value of the server-side encryption algorithm used when storing this object in QStorage",
    validValues: ["AES256", "verenc"]
  },
  {
    name: "x-amz-server-side-encryption-aws-kms-key-id",
    description: "If x-amz-server-side-encryption is present and has the value of verenc, this header specifies the ID of the AWS Key Management Service (QKMS) symmetric encryption customer managed key that was used for the object"
  },
  {
    name: "x-amz-server-side-encryption-context",
    description: "If present, specifies the QKMS Encryption Context to use for object encryption. The value of this header is a base64-encoded UTF-8 string holding JSON with the encryption context key-value pairs"
  },
  {
    name: "x-amz-version-id",
    description: "Version ID of the newly created object, in case the bucket has versioning turned on"
  },
  {
    name: "x-amz-expiration",
    description: "If the object expiration is configured, this will contain the expiration date (expiry-date) and rule ID (rule-id). The value of rule-id is URL-encoded."
  },
  {
    name: "x-amz-request-charged",
    description: "If present, indicates that the requester was successfully charged for the request.",
    validValues: ["requester"]
  }
];

export const RESPONSE_ELEMENTS = [
  {
    name: "CompleteMultipartUploadResult",
    description: "Container for the response",
    type: "container",
    required: false
  },
  {
    name: "Location",
    description: "The URI that identifies the newly created object",
    type: "string",
    required: false
  },
  {
    name: "Bucket",
    description: "Name of the bucket that contains the newly created object",
    type: "string",
    required: false
  },
  {
    name: "Key",
    description: "The object key of the newly created object",
    type: "string",
    required: false,
    constraints: ["Minimum length of 1"]
  },
  {
    name: "ETag",
    description: "Entity tag that identifies the newly created object's data. Objects with different object data will have different entity tags. The entity tag is an opaque string. The entity tag may or may not be an MD5 digest of the object data. If the entity tag is not an MD5 digest of the object data, it will contain one or more nonhexadecimal characters and/or will consist of less than 32 or more than 32 hexadecimal digits",
    type: "string",
    required: false
  },
  {
    name: "ChecksumCRC32",
    description: "The base64-encoded, 32-bit CRC32 checksum of the object. This checksum is only present if the checksum was uploaded with the object. When you use an API operation on an object that was uploaded using multipart uploads, this value may not be a direct checksum value of the full object. Instead, it's a calculation based on the checksum values of each individual part",
    type: "string",
    required: false
  },
  {
    name: "ChecksumCRC32C",
    description: "The base64-encoded, 32-bit CRC32C checksum of the object. This checksum is only present if the checksum was uploaded with the object. When you use an API operation on an object that was uploaded using multipart uploads, this value may not be a direct checksum value of the full object. Instead, it's a calculation based on the checksum values of each individual part",
    type: "string",
    required: false
  },
  {
    name: "ChecksumCRC64NVME",
    description: "The base64-encoded, 64-bit CRC64NVME checksum of the object. The CRC64NVME checksum is always a full object checksum",
    type: "string",
    required: false
  },
  {
    name: "ChecksumSHA1",
    description: "The base64-encoded, 160-bit SHA1 digest of the object. This will only be present if the object was uploaded with the object. When you use an API operation on an object that was uploaded using multipart uploads, this value may not be a direct checksum value of the full object. Instead, it's a calculation based on the checksum values of each individual part",
    type: "string",
    required: false
  },
  {
    name: "ChecksumSHA256",
    description: "The base64-encoded, 256-bit SHA256 digest of the object. This will only be present if the object was uploaded with the object. When you use an API operation on an object that was uploaded using multipart uploads, this value may not be a direct checksum value of the full object. Instead, it's a calculation based on the checksum values of each individual part",
    type: "string",
    required: false
  },
  {
    name: "ChecksumType",
    description: "The checksum type, which determines how part-level checksums are combined to create an object-level checksum for multipart objects. You can use this header as a data integrity check to verify that the checksum type is the same as what was specified during the CreateMultipartUpload request.",
    type: "string",
    required: false,
    validValues: ["COMPOSITE", "FULL_OBJECT"]
  }
];

# CompleteMultipartUpload

Completes a multipart upload by assembling previously uploaded parts.

## Description

The `CompleteMultipartUpload` operation completes a multipart upload by assembling previously uploaded parts. You first initiate the multipart upload and then upload all parts using the `UploadPart` operation. After successfully uploading all relevant parts, you call this operation to complete the upload.

:::note
- When you call `CompleteMultipartUpload`, QStorage constructs the object from the uploaded parts.
- You must include the parts in the request in the order that they were uploaded.
- Processing of a Complete Multipart Upload request could take several minutes.
- After QStorage begins processing the request, it sends an HTTP response header that specifies a 200 OK response.
- The ETag of the completed object is not an MD5 hash of the entire object. Instead, it is calculated by concatenating the ETags of the individual parts and then computing the MD5 hash of the concatenated string.
- You can use SSE, but this means your uploaded data will be encrypted twice, once with the specified key, and again for storage.
:::

## Request Syntax

<ApiExample
  request={{
    method: "POST",
    path: "/_ObjectKey_?uploadId=_UploadId_",
    headers: {
      "Host": "_BucketName_.qstorage.quilibrium.com",
      "x-amz-expected-bucket-owner": "_OwnerAccountId_",
      "x-amz-server-side-encryption": "_EncryptionAlgorithm_",
      "x-amz-server-side-encryption-aws-kms-key-id": "_KMSKeyId_",
      "x-amz-server-side-encryption-context": "_EncryptionContext_"
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<CompleteMultipartUpload>
   <Part>
      <PartNumber>_PartNumber_</PartNumber>
      <ETag>_ETag_</ETag>
      <ChecksumCRC32>_CRC32_</ChecksumCRC32>
      <ChecksumCRC32C>_CRC32C_</ChecksumCRC32C>
      <ChecksumCRC64NVME>_CRC64NVME_</ChecksumCRC64NVME>
      <ChecksumSHA1>_SHA1_</ChecksumSHA1>
      <ChecksumSHA256>_SHA256_</ChecksumSHA256>
   </Part>
   ...
</CompleteMultipartUpload>`
  }}
  response={{}}
/>

## Request Parameters

### URI Parameters

<ParamsTable parameters={URI_PARAMETERS} />

### Headers

<ParamsTable parameters={HEADER_PARAMETERS} />

### Request Body

<ParamsTable parameters={REQUEST_BODY} type="request" />

## Examples

### Example 1: Complete a multipart upload

<ApiExample
  request={{
    method: "POST",
    path: "/_large-file.zip_?uploadId=_VXBsb2FkIElEIGZvciA2aWWpbmcncyBteS1tb3ZpZS5tMnRzIHVwbG9hZA_",
    headers: {
      "Host": "_my-bucket_.qstorage.quilibrium.com"
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<CompleteMultipartUpload>
   <Part>
      <PartNumber>_1_</PartNumber>
      <ETag>_"7778aef83f66abc1fa1e8477f296d394"_</ETag>
   </Part>
   <Part>
      <PartNumber>_2_</PartNumber>
      <ETag>_"7778aef83f66abc1fa1e8477f296d394"_</ETag>
   </Part>
</CompleteMultipartUpload>`
  }}
  response={{
    status: 200,
    headers: {
      "x-amz-id-2": "_Example7qoYGN7uMuFuYS6m7a4l_",
      "x-amz-request-id": "_TX234S0F24A06C7_",
      "Date": "_Wed, 01 Mar 2024 12:00:00 GMT_"
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<CompleteMultipartUploadResult>
   <Location>https://_my-bucket_.qstorage.quilibrium.com/_large-file.zip_</Location>
   <Bucket>_my-bucket_</Bucket>
   <Key>_large-file.zip_</Key>
   <ETag>_"7778aef83f66abc1fa1e8477f296d394-2"_</ETag>
</CompleteMultipartUploadResult>`
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
      "x-amz-server-side-encryption": "_EncryptionAlgorithm_",
      "x-amz-server-side-encryption-aws-kms-key-id": "_KMSKeyId_",
      "x-amz-server-side-encryption-context": "_EncryptionContext_"
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<CompleteMultipartUploadResult>
   <Location>_URL_</Location>
   <Bucket>_BucketName_</Bucket>
   <Key>_ObjectKey_</Key>
   <ETag>_EntityTag_</ETag>
   <ChecksumCRC32>_CRC32_</ChecksumCRC32>
   <ChecksumCRC32C>_CRC32C_</ChecksumCRC32C>
   <ChecksumCRC64NVME>_CRC64NVME_</ChecksumCRC64NVME>
   <ChecksumSHA1>_SHA1_</ChecksumSHA1>
   <ChecksumSHA256>_SHA256_</ChecksumSHA256>
</CompleteMultipartUploadResult>`
  }}
/>

## Response Elements

### Response Headers

<ParamsTable responseElements={RESPONSE_HEADERS} type="response" />

### Response Data Elements
This will be returned in XML format.
<ParamsTable responseElements={RESPONSE_ELEMENTS} type="response" />

## Special Errors

| Error Code | Description | Status Code |
|------------|-------------|-------------|
| NoSuchUpload | The specified multipart upload does not exist | 404 Not Found |
| EntityTooSmall |  Your proposed upload is smaller than the minimum allowed object size. Each part must be at least 5 MB in size, except the last part. | 400 Bad Request |
| InvalidPart | One or more of the specified parts could not be found | 400 bad Request |
| InvalidPartOrder | The parts list is not in ascending order by part number | 400 Bad Request |
| InvalidRequest | The XML in the request body was not well-formed or did not validate against our published schema | 400 Bad Request |
| MalformedXML | The XML provided was not well-formed or did not validate against our published schema | 400 Bad Request |

## Permissions

You must have the `s3:PutObject` permission.

## Try It Out

<ApiTester
  operation="CompleteMultipartUpload"
  description="Complete a multipart upload by assembling previously uploaded parts."
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
    {
      name: "parts",
      type: "text",
      required: true,
      placeholder: "[{\"PartNumber\":1,\"ETag\":\"7778aef83f66abc1fa1e8477f296d394\"}]",
      description: "JSON array of parts with their part numbers and ETags"
    },
    ...URI_PARAMETERS,
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "CompleteMultipartUploadResult": {
      "Location": "https://my-bucket.qstorage.quilibrium.com/large-file.zip",
      "Bucket": "my-bucket",
      "Key": "large-file.zip",
      "ETag": "\"7778aef83f66abc1fa1e8477f296d394-2\""
    }
  }}
/> 