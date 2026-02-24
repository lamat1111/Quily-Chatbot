---
title: HeadObject
label: HeadObject
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ApiTester from '@site/src/components/ApiTester';
import ParamsTable from '@site/src/components/ParamsTable';
import ApiExample from '@site/src/components/ApiExample';

export const HEADER_PARAMETERS = [
  {
    name: "If-Match",
    type: "text",
    description: "Return the object only if its entity tag (ETag) is the same as the one specified; otherwise, return a 412 (precondition failed) error. For more information about conditional requests, see \<a href\=\"https\:\/\/datatracker\.ietf\.org\/doc\/html\/rfc7232\" target\=\"_blank\">RFC 7232\<\/a\>.",
    required: false,
    placeholder: "\"7778aef83f66abc1fa1e8477f296d394\""
  },
  {
    name: "If-None-Match",
    type: "text",
    description: "Return the object only if its entity tag (ETag) is different from the one specified; otherwise, return a 304 (not modified) error. For more information about conditional requests, see \<a href\=\"https\:\/\/datatracker\.ietf\.org\/doc\/html\/rfc7232\" target\=\"_blank\">RFC 7232\<\/a\>.",
    required: false,
    placeholder: "\"7778aef83f66abc1fa1e8477f296d394\""
  },
  {
    name: "If-Modified-Since",
    type: "text",
    description: "Return the object only if it has been modified since the specified time; otherwise, return a 304 (not modified) error. For more information about conditional requests, see \<a href\=\"https\:\/\/datatracker\.ietf\.org\/doc\/html\/rfc7232\" target\=\"_blank\">RFC 7232\<\/a\>.",
    required: false,
    placeholder: "Wed, 01 Mar 2024 12:00:00 GMT"
  },
  {
    name: "If-Unmodified-Since",
    type: "text",
    description: "Return the object only if it has not been modified since the specified time; otherwise, return a 412 (precondition failed) error. For more information about conditional requests, see \<a href\=\"https\:\/\/datatracker\.ietf\.org\/doc\/html\/rfc7232\" target\=\"_blank\">RFC 7232\<\/a\>.",
    required: false,
    placeholder: "Wed, 01 Mar 2024 12:00:00 GMT"
  },
  {
    name: "Range",
    type: "text",
    description: "HeadObject returns only the metadata for an object. If the Range is satisfiable, only the ContentLength is affected in the response. If the Range is not satisfiable, QStorage returns a 416 - Requested Range Not Satisfiable error.",
    required: false,
    placeholder: "bytes=0-1024"
  },
  {
    name: "partNumber",
    type: "text",
    description: "Part number of the object being read. This is a positive integer between 1 and 10,000. Effectively performs a 'ranged' HEAD request for the part specified. Useful querying about the size of the part and the number of parts in this object.",
    required: false,
    placeholder: "1"
  },
  {
    name: "versionId",
    type: "text",
    description: "Version ID used to reference a specific version of the object.",
    required: false,
    placeholder: "096fKKXTRTtl3on89fVO.MiO.DJ1Y4.o"
  },
  {
    name: "x-amz-checksum-mode",
    type: "text",
    description: "To retrieve the checksum, this parameter must be enabled.",
    required: false,
    placeholder: "ENABLED"
  },
  {
    name: "x-amz-expected-bucket-owner",
    type: "text",
    description: "The account ID of the expected bucket owner. If the account ID that you provide does not match the actual owner of the bucket, the request fails with the HTTP status code 403 Forbidden (access denied).",
    required: false,
    placeholder: "123456789012"
  },
  {
    name: "x-amz-request-payer",
    type: "text",
    description: "Confirms that the requester knows that they will be charged for the request.",
    required: false,
    placeholder: "requester"
  },
  {
    name: "x-amz-server-side-encryption-customer-algorithm",
    type: "text",
    description: "Specifies the algorithm to use when encrypting the object (for example, AES256).",
    required: false,
    placeholder: "AES256"
  },
  {
    name: "x-amz-server-side-encryption-customer-key",
    type: "text",
    description: "Specifies the customer-provided encryption key for QStorage to use in encrypting data. This value is used to store the object and then it is discarded; QStorage does not store the encryption key.",
    required: false,
    placeholder: "Base64-encoded encryption key"
  },
  {
    name: "x-amz-server-side-encryption-customer-key-MD5",
    type: "text",
    description: "Specifies the 128-bit MD5 digest of the encryption key according to RFC 1321. QStorage uses this header for a message integrity check to ensure that the encryption key was transmitted without error.",
    required: false,
    placeholder: "Base64-encoded MD5 hash"
  },
  {
    name: "response-cache-control",
    type: "text",
    description: "Sets the Cache-Control header of the response.",
    required: false,
    placeholder: "max-age=3600"
  },
  {
    name: "response-content-disposition",
    type: "text",
    description: "Sets the Content-Disposition header of the response.",
    required: false,
    placeholder: "attachment; filename=example.txt"
  },
  {
    name: "response-content-encoding",
    type: "text",
    description: "Sets the Content-Encoding header of the response.",
    required: false,
    placeholder: "gzip"
  },
  {
    name: "response-content-language",
    type: "text",
    description: "Sets the Content-Language header of the response.",
    required: false,
    placeholder: "en-US"
  },
  {
    name: "response-content-type",
    type: "text",
    description: "Sets the Content-Type header of the response.",
    required: false,
    placeholder: "application/json"
  },
  {
    name: "response-expires",
    type: "text",
    description: "Sets the Expires header of the response.",
    required: false,
    placeholder: "Wed, 01 Mar 2024 12:00:00 GMT"
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
    name: "accept-ranges",
    description: "Indicates that a range of bytes was specified"
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
    description: "Indicates what content encodings have been applied to the object and thus what decoding mechanisms must be applied"
  },
  {
    name: "Content-Language",
    description: "The language the content is in"
  },
  {
    name: "Content-Length",
    description: "Size of the body in bytes"
  },
  {
    name: "Content-Range",
    description: "The portion of the object returned in the response for a GET request"
  },
  {
    name: "Content-Type",
    description: "A standard MIME type describing the format of the object data"
  },
  {
    name: "ETag",
    description: "An entity tag that represents a specific version of the object"
  },
  {
    name: "Expires",
    description: "The date and time at which the object is no longer cacheable"
  },
  {
    name: "Last-Modified",
    description: "Date and time when the object was last modified"
  },
  {
    name: "x-amz-checksum-crc32",
    description: "The Base64 encoded, 32-bit CRC32 checksum of the object"
  },
  {
    name: "x-amz-checksum-crc32c",
    description: "The Base64 encoded, 32-bit CRC32C checksum of the object"
  },
  {
    name: "x-amz-checksum-crc64nvme",
    description: "The Base64 encoded, 64-bit CRC64NVME checksum of the object"
  },
  {
    name: "x-amz-checksum-sha1",
    description: "The Base64 encoded, 160-bit SHA1 digest of the object"
  },
  {
    name: "x-amz-checksum-sha256",
    description: "The Base64 encoded, 256-bit SHA256 digest of the object"
  },
  {
    name: "x-amz-checksum-type",
    description: "The checksum type, which determines how part-level checksums are combined to create an object-level checksum for multipart objects"
  },
  {
    name: "x-amz-delete-marker",
    description: "Specifies whether the object retrieved was (true) or was not (false) a Delete Marker"
  },
  {
    name: "x-amz-expiration",
    description: "If the object expiration is configured, the response includes this header with expiry-date and rule-id key-value pairs"
  },
  {
    name: "x-amz-missing-meta",
    description: "The number of metadata entries not returned in x-amz-meta headers"
  },
  {
    name: "x-amz-mp-parts-count",
    description: "The count of parts this object has for multipart uploads"
  },
  {
    name: "x-amz-request-charged",
    description: "If present, indicates that the requester was successfully charged for the request",
    validValues: ["requester"]
  },
  {
    name: "x-amz-restore",
    description: "If the object is an archived object, this header provides restoration status"
  },
  {
    name: "x-amz-server-side-encryption",
    description: "The server-side encryption algorithm used when storing this object in QStorage",
    validValues: ["AES256", "verenc"]
  },
  {
    name: "x-amz-server-side-encryption-aws-kms-key-id",
    description: "If present, indicates the ID of the KMS key used for object encryption"
  },
  {
    name: "x-amz-server-side-encryption-bucket-key-enabled",
    description: "Indicates whether the object uses an QStorage Bucket Key for server-side encryption with QKMS"
  },
  {
    name: "x-amz-server-side-encryption-customer-algorithm",
    description: "If server-side encryption with a customer-provided key was requested, confirms the encryption algorithm used"
  },
  {
    name: "x-amz-server-side-encryption-customer-key-MD5",
    description: "If server-side encryption with a customer-provided key was requested, provides verification of the encryption key"
  },
  {
    name: "x-amz-version-id",
    description: "Version ID of the object"
  },
  {
    name: "x-amz-website-redirect-location",
    description: "If the bucket is configured as a website, redirects requests for this object to another object or URL"
  },
  {
    name: "x-amz-object-lock-legal-hold",
    description: "Specifies whether a legal hold is in effect for this object (ON | OFF). Only returned if the requester has the s3:GetObjectLegalHold permission"
  },
  {
    name: "x-amz-object-lock-mode",
    description: "The Object Lock mode (GOVERNANCE | COMPLIANCE) in effect for this object. Only returned if the requester has the s3:GetObjectRetention permission",
    validValues: ["GOVERNANCE", "COMPLIANCE"]
  },
  {
    name: "x-amz-object-lock-retain-until-date",
    description: "The date and time when the Object Lock retention period expires.",
    constraints: ["Only returned if the requester has the s3:GetObjectRetention permission"]
  }
];

# HeadObject

## Description

The `HeadObject` operation retrieves metadata from an object without returning the object itself. This operation is useful if you're only interested in an object's metadata.

## Permissions

You must have the `s3:GetObject` permission on the object, or be the bucket owner.

## Request Headers

<ParamsTable parameters={HEADER_PARAMETERS} />

## Request URI Parameters

None

## Request Body

This operation does not have a request body.

## Request Syntax

<ApiExample
  request={{
    method: "HEAD",
    path: "/_ObjectKey_?partNumber=_PartNumber_&response-cache-control=_ResponseCacheControl_&response-content-disposition=_ResponseContentDisposition_&response-content-encoding=_ResponseContentEncoding_&response-content-language=_ResponseContentLanguage_&response-content-type=_ResponseContentType_&response-expires=_ResponseExpires_&versionId=_VersionId_",
    headers: {
      "Host": "_BucketName_.qstorage.quilibrium.com",
      "If-Match": "\"7778aef83f66abc1fa1e8477f296d394\"",
      "If-None-Match": "\"7778aef83f66abc1fa1e8477f296d394\"",
      "If-Modified-Since": "_Wed, 01 Mar 2024 12:00:00 GMT_",
      "If-Unmodified-Since": "_Wed, 01 Mar 2024 12:00:00 GMT_",
      "x-amz-expected-bucket-owner": "_OwnerAccountId_"
    }
  }}
  response={{}}
/>

## Response Headers

<ParamsTable responseElements={RESPONSE_HEADERS} type="response" />

## Response Body

This operation does not return a response body.

## Response Errors

| Error Code | Description |
|------------|-------------|
| NoSuchBucket | The specified bucket does not exist |
| NoSuchKey | The specified key does not exist |
| PreconditionFailed | At least one of the preconditions you specified did not hold |
| 403 | Forbidden. Authentication failed or you do not have permission to access the object |
| 304 | Not Modified. The condition specified in If-Modified-Since or If-None-Match headers was not met |

## Full Examples

### Example 1: Get object metadata

<ApiExample
  request={{
    method: "HEAD",
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
      "Date": "_Wed, 01 Mar 2024 12:00:00 GMT_",
      "Last-Modified": "Wed, 01 Mar 2024 11:00:00 GMT",
      "ETag": "\"7778aef83f66abc1fa1e8477f296d394\"",
      "Content-Length": "11",
      "Content-Type": "text/plain"
    }
  }}
/>

### Example 2: Get object metadata with conditional request

<ApiExample
  request={{
    method: "HEAD",
    path: "/hello.txt",
    headers: {
      "Host": "_my-bucket_.qstorage.quilibrium.com",
      "If-Modified-Since": "Wed, 01 Mar 2024 10:00:00 GMT"
    }
  }}
  response={{
    status: 200,
    headers: {
      "x-amz-id-2": "_Example7qoYGN7uMuFuYS6m7a4l_",
      "x-amz-request-id": "_TX234S0F24A06C7_",
      "Date": "_Wed, 01 Mar 2024 12:00:00 GMT_",
      "Last-Modified": "Wed, 01 Mar 2024 11:00:00 GMT",
      "ETag": "\"7778aef83f66abc1fa1e8477f296d394\"",
      "Content-Length": "11",
      "Content-Type": "text/plain"
    }
  }}
/>

## Try It Out

<ApiTester
  operation="HeadObject"
  description="Retrieve metadata from an object without returning the object itself."
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
      description: "Key of the object to get metadata for"
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
    "Content-Type": "text/plain"
  }}
/> 