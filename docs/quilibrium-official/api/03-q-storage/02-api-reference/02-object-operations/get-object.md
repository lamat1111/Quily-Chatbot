---
sidebar_label: GetObject
title: GetObject
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ApiTester from '@site/src/components/ApiTester';
import ParamsTable from '@site/src/components/ParamsTable';
import ApiExample from '@site/src/components/ApiExample';

export const URI_PARAMETERS = [
  {
    name: "Key",
    type: "text",
    description: "Key name of the object to get",
    required: true,
    placeholder: "example.txt"
  },
  {
    name: "versionId",
    type: "text",
    description: "Version ID of the object to get",
    required: false,
    placeholder: "096fKKXTRTtl3on89fVO.MiO.DJ1Y4.o"
  },
  {
    name: "response-cache-control",
    type: "text",
    description: "Sets the Cache-Control header of the response",
    required: false,
    placeholder: "no-cache"
  },
  {
    name: "response-content-disposition",
    type: "text",
    description: "Sets the Content-Disposition header of the response",
    required: false,
    placeholder: "attachment; filename=example.txt"
  },
  {
    name: "response-content-encoding",
    type: "text",
    description: "Sets the Content-Encoding header of the response",
    required: false,
    placeholder: "gzip"
  },
  {
    name: "response-content-language",
    type: "text",
    description: "Sets the Content-Language header of the response",
    required: false,
    placeholder: "en-US"
  },
  {
    name: "response-content-type",
    type: "text",
    description: "Sets the Content-Type header of the response",
    required: false,
    placeholder: "application/json"
  },
  {
    name: "response-expires",
    type: "text",
    description: "Sets the Expires header of the response",
    required: false,
    placeholder: "Wed, 01 Mar 2024 12:00:00 GMT"
  },
  {
    name: "partNumber",
    type: "text",
    description: "Part number of the object to retrieve. This is a positive integer between 1 and 10,000",
    required: false,
    placeholder: "1"
  }
];

export const HEADER_PARAMETERS = [
  {
    name: "Range",
    type: "text",
    description: "Downloads the specified range bytes of an object. For more information about the HTTP Range header, see https://www.rfc-editor.org/rfc/rfc9110.html#name-range",
    required: false,
    placeholder: "bytes=0-1024"
  },
  {
    name: "If-Match",
    type: "text",
    description: "Return the object only if its entity tag (ETag) is the same as the one specified",
    required: false,
    placeholder: "\"7778aef83f66abc1fa1e8477f296d394\""
  },
  {
    name: "If-Modified-Since",
    type: "text",
    description: "Return the object only if it has been modified since the specified time",
    required: false,
    placeholder: "Wed, 01 Mar 2024 12:00:00 GMT"
  },
  {
    name: "If-None-Match",
    type: "text",
    description: "Return the object only if its entity tag (ETag) is different from the one specified",
    required: false,
    placeholder: "\"7778aef83f66abc1fa1e8477f296d394\""
  },
  {
    name: "If-Unmodified-Since",
    type: "text",
    description: "Return the object only if it has not been modified since the specified time",
    required: false,
    placeholder: "Wed, 01 Mar 2024 12:00:00 GMT"
  },
  {
    name: "x-amz-request-payer",
    type: "text",
    description: "Confirms that the requester knows that they will be charged for the request",
    required: false,
    placeholder: "requester"
  },
  {
    name: "x-amz-checksum-mode",
    type: "text",
    description: "To retrieve the checksum, this mode must be enabled.<br/><br/>Valid Values: ENABLED",
    required: false,
    placeholder: "ENABLED"
  },
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
    description: "Specifies the algorithm to use to when decrypting the object",
    required: false,
    placeholder: "AES256"
  },
  {
    name: "x-amz-server-side-encryption-customer-key",
    type: "text",
    description: "Specifies the customer-provided encryption key to use to decrypt the object",
    required: false,
    placeholder: "Base64-encoded encryption key"
  },
  {
    name: "x-amz-server-side-encryption-customer-key-MD5",
    type: "text",
    description: "Specifies the base64-encoded 128-bit MD5 digest of the encryption key according to RFC 1321",
    required: false,
    placeholder: "Base64-encoded MD5 hash"
  }
];

export const RESPONSE_HEADERS = [
  {
    name: "accept-ranges",
    description: "Indicates that a range of bytes was specified in the request"
  },
  {
    name: "x-amz-delete-marker",
    description: "Specifies whether the object retrieved was (true) or was not (false) a delete marker"
  },
  {
    name: "x-amz-id-2",
    description: "An identifier for the request"
  },
  {
    name: "x-amz-request-id",
    description: "A unique identifier for the request"
  },
  {
    name: "x-amz-version-id",
    description: "The version ID of the object returned"
  },
  {
    name: "x-amz-server-side-encryption",
    description: "The server-side encryption algorithm used when storing this object in QStorage"
  },
  {
    name: "x-amz-server-side-encryption-aws-kms-key-id",
    description: "If present, specifies the ID of the Quilibrium Key Management Service (QKMS) symmetric encryption customer master key (CMK) that was used for the object"
  },
  {
    name: "x-amz-server-side-encryption-customer-algorithm",
    description: "If present, specifies the encryption algorithm that was used to decrypt the object"
  },
  {
    name: "x-amz-server-side-encryption-customer-key-MD5",
    description: "If present, specifies the base64-encoded 128-bit MD5 digest of the encryption key according to RFC 1321"
  },
  {
    name: "x-amz-server-side-encryption-bucket-key-enabled",
    description: "Indicates whether the object uses an QStorage Bucket Key for server-side encryption with QKMS (SSE-KMS)"
  },
  {
    name: "x-amz-checksum-crc32",
    description: "The Base64 encoded, 32-bit CRC32 checksum of the object. This checksum is only present if the object was uploaded with the object"
  },
  {
    name: "x-amz-checksum-crc32c",
    description: "The Base64 encoded, 32-bit CRC32C checksum of the object. This will only be present if the object was uploaded with the object"
  },
  {
    name: "x-amz-checksum-crc64nvme",
    description: "The Base64 encoded, 64-bit CRC64NVME checksum of the object"
  },
  {
    name: "x-amz-checksum-sha1",
    description: "The Base64 encoded, 160-bit SHA1 digest of the object. This will only be present if the object was uploaded with the object"
  },
  {
    name: "x-amz-checksum-sha256",
    description: "The Base64 encoded, 256-bit SHA256 digest of the object. This will only be present if the object was uploaded with the object"
  },
  {
    name: "x-amz-checksum-type",
    description: "The checksum type, which determines how part-level checksums are combined to create an object-level checksum for multipart objects"
  },
  {
    name: "x-amz-website-redirect-location",
    description: "If the bucket is configured as a website, redirects requests for this object to another object in the same bucket or to an external URL"
  },
  {
    name: "x-amz-request-charged",
    description: "If present, indicates that the requester was successfully charged for the request"
  },
  {
    name: "x-amz-mp-parts-count",
    description: "The count of parts this object has. This value is only returned if you specify partNumber in your request"
  },
  {
    name: "x-amz-tagging-count",
    description: "The number of tags, if any, on the object"
  },
  {
    name: "x-amz-missing-meta",
    description: "This is set to the number of metadata entries not returned in the headers that are prefixed with x-amz-meta-. This can happen if you create metadata using an API like SOAP that supports more flexible metadata than the REST API. For example, using SOAP, you can create metadata whose values are not legal HTTP headers"
  },
  {
    name: "Last-Modified",
    description: "The date and time at which the object was last modified"
  },
  {
    name: "Content-Length",
    description: "Size of the body in bytes"
  },
  {
    name: "Cache-Control",
    description: "Specifies caching behavior along the request/reply chain"
  },
  {
    name: "Content-Disposition",
    description: "Specifies presentational information for the object"
  },
  {
    name: "Content-Encoding",
    description: "Specifies what content encodings have been applied to the object"
  },
  {
    name: "Content-Length",
    description: "Size of the body in bytes"
  },
  {
    name: "Expires",
    description: "The date and time after which the object is no longer cacheable"
  },
  {
    name: "ETag",
    description: "An entity tag that represents a specific version of the object"
  },
  {
    name: "Content-Type",
    description: "A standard MIME type describing the format of the object data"
  },
  {
    name: "Content-Range",
    description: "The range of bytes returned if the request specified a range"
  }
];

# GetObject

Retrieves objects from QStorage.

## Description

The `GetObject` operation retrieves objects from QStorage. To use this operation, you must have `s3:GetObject` permissions on the object, or be the bucket owner.

:::note
- By default, this operation returns the entire object. You can use the Range header to retrieve a portion of the object.
:::

## Request Syntax

<ApiExample
  request={{
    method: "GET",
    path: "/_ObjectKey_?versionId=_VersionId_&response-content-type=application/json",
    headers: {
      "Host": "_BucketName_.qstorage.quilibrium.com",
      "Range": "bytes=0-1024",
      "If-Match": "\"7778aef83f66abc1fa1e8477f296d394\"",
      "If-None-Match": "\"7778aef83f66abc1fa1e8477f296d394\"",
      "If-Modified-Since": "Wed, 01 Mar 2024 12:00:00 GMT",
      "If-Unmodified-Since": "Wed, 01 Mar 2024 12:00:00 GMT",
      "x-amz-server-side-encryption-customer-algorithm": "AES256",
      "x-amz-server-side-encryption-customer-key": "_Base64EncodedEncryptionKey_",
      "x-amz-server-side-encryption-customer-key-MD5": "_Base64EncodedMD5_",
      "x-amz-request-payer": "requester",
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

### Example 1: Get an entire object

<ApiExample
  request={{
    method: "GET",
    path: "/hello.txt",
    headers: {
      "Host": "_my-bucket_.qstorage.quilibrium.com"
    }
  }}
  response={{
    status: 200,
    headers: {
      "x-amz-id-2": "_Example7qoYGN7uMuFuYS6m7a4l_",
      "x-amz-request-id": "_TX234S0F24A06C7_",
      "Last-Modified": "Wed, 01 Mar 2024 11:00:00 GMT",
      "ETag": "\"7778aef83f66abc1fa1e8477f296d394\"",
      "x-amz-server-side-encryption": "AES256",
      "Content-Length": "11",
      "Content-Type": "text/plain"
    },
    body: "Hello World"
  }}
/>

### Example 2: Get a portion of an object using the Range header

<ApiExample
  request={{
    method: "GET",
    path: "/hello.txt",
    headers: {
      "Host": "_my-bucket_.qstorage.quilibrium.com",
      "Range": "bytes=0-4"
    }
  }}
  response={{
    status: 206,
    headers: {
      "x-amz-id-2": "_Example7qoYGN7uMuFuYS6m7a4l_",
      "x-amz-request-id": "_TX234S0F24A06C7_",
      "Last-Modified": "Wed, 01 Mar 2024 11:00:00 GMT",
      "ETag": "\"7778aef83f66abc1fa1e8477f296d394\"",
      "Content-Length": "5",
      "Content-Range": "bytes 0-4/11",
      "Content-Type": "text/plain",
      "x-amz-server-side-encryption": "AES256"
    },
    body: "Hello"
  }}
/>

### Example 3: Get an object with specific response headers

<ApiExample
  request={{
    method: "GET",
    path: "/hello.txt?response-content-type=application/octet-stream&response-content-disposition=attachment%3B%20filename%3Dhello.txt",
    headers: {
      "Host": "_my-bucket_.qstorage.quilibrium.com"
    }
  }}
  response={{
    status: 200,
    headers: {
      "x-amz-id-2": "_Example7qoYGN7uMuFuYS6m7a4l_",
      "x-amz-request-id": "_TX234S0F24A06C7_",
      "Last-Modified": "Wed, 01 Mar 2024 11:00:00 GMT",
      "ETag": "\"7778aef83f66abc1fa1e8477f296d394\"",
      "Content-Length": "11",
      "Content-Type": "application/octet-stream",
      "Content-Disposition": "attachment; filename=hello.txt",
      "x-amz-server-side-encryption": "AES256"
    },
    body: "Hello World"
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
      "x-amz-version-id": "_VersionId_",
      "x-amz-server-side-encryption": "_ServerSideEncryptionAlgorithm_",
      "x-amz-server-side-encryption-aws-kms-key-id": "_KMSKeyId_",
      "x-amz-server-side-encryption-customer-algorithm": "_CustomerEncryptionAlgorithm_",
      "x-amz-server-side-encryption-customer-key-MD5": "_CustomerKeyMD5_",
      "x-amz-server-side-encryption-bucket-key-enabled": "true",
      "Last-Modified": "_ISO8601Date_",
      "Content-Length": "_ContentLength_",
      "ETag": "_EntityTag_",
      "Content-Type": "_ContentType_",
      "Content-Range": "_ContentRange_"
    },
    body: "_Object Data_"
  }}
/>

## Response Elements

### Response Headers

<ParamsTable responseElements={RESPONSE_HEADERS} type="response" />

## Special Errors

| Error Code | Description |
|------------|-------------|
| NoSuchBucket | The specified bucket does not exist |
| NoSuchKey | The specified key does not exist |
| InvalidRange | The specified range is not satisfiable |
| PreconditionFailed | At least one of the preconditions you specified did not hold |
| 403 | Forbidden. Authentication failed or you do not have permission to access the object |
| 304 | Not Modified. The condition specified in If-Modified-Since or If-None-Match headers was not met |

## Permissions

You must have the `s3:GetObject` permission.

## Try It Out

<ApiTester
  operation="GetObject"
  description="Retrieve an object from a bucket."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket containing the object"
    },
    {
      name: "objectKey",
      type: "text",
      required: true,
      placeholder: "hello.txt",
      description: "Key of the object to retrieve"
    },
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "x-amz-id-2": "_Example7qoYGN7uMuFuYS6m7a4l_",
    "x-amz-request-id": "_TX234S0F24A06C7_",
    "Date": "_Wed, 01 Mar 2024 12:00:00 GMT_",
    "Last-Modified": "Wed, 01 Mar 2024 11:00:00 GMT",
    "ETag": "\"7778aef83f66abc1fa1e8477f296d394\"",
    "Content-Length": "11",
    "Content-Type": "text/plain",
    "Body": "Hello World"
  }}
/> 