---
title: PutBucketAcl
label: PutBucketAcl
---

import ParamsTable from '@site/src/components/ParamsTable';
import ApiTester from '@site/src/components/ApiTester';

# PutBucketAcl

Sets the access control list (ACL) permissions for a QStorage bucket.

## Permissions Required

To perform this operation, you need:
- WRITE_ACP permission on the bucket
- Bucket owner permissions

## Request

### Request Headers

export const REQUEST_HEADERS = [
  {
    name: 'x-amz-acl',
    description: 'The canned ACL to apply to the bucket.',
    type: 'String',
    required: false,
    validValues: ['private', 'public-read', 'public-read-write', 'authenticated-read']
  },
  {
    name: 'x-amz-expected-bucket-owner',
    description: 'The account ID of the expected bucket owner. If the account ID that you provide does not match the actual owner of the bucket, the request fails with the HTTP status code 403 Forbidden (access denied).',
    type: 'String',
    required: false,
    placeholder: '123456789012'
  },
  {
    name: 'Content-MD5',
    description: 'The base64-encoded 128-bit MD5 digest of the data.',
    type: 'String',
    required: true
  },
  {
    name: 'x-amz-sdk-checksum-algorithm',
    description: 'Indicates the algorithm used to create the checksum for the request when using the SDK. Must be accompanied by either x-amz-checksum or x-amz-trailer header. If an individual checksum is provided, this parameter is ignored.',
    type: 'String',
    required: false,
    validValues: ['CRC32', 'CRC32C', 'SHA1', 'SHA256', 'CRC64NVME']
  },
  {
    name: 'x-amz-grant-read',
    description: 'Allows grantee to list the objects in the bucket.',
    type: 'String',
    required: false
  },
  {
    name: 'x-amz-grant-write',
    description: 'Allows grantee to create, overwrite, and delete any object in the bucket.',
    type: 'String',
    required: false
  },
  {
    name: 'x-amz-grant-read-acp',
    description: 'Allows grantee to read the bucket ACL.',
    type: 'String',
    required: false
  },
  {
    name: 'x-amz-grant-write-acp',
    description: 'Allows grantee to write the ACL for the bucket.',
    type: 'String',
    required: false
  },
  {
    name: 'x-amz-grant-full-control',
    description: 'Allows grantee the READ, WRITE, READ_ACP, and WRITE_ACP permissions on the bucket.',
    type: 'String',
    required: false
  }
];

<ParamsTable parameters={REQUEST_HEADERS} type="request" />

### Request Body

You can specify the ACL in the request body using an XML document with the following elements:

export const REQUEST_ELEMENTS = [
  {
    name: 'AccessControlPolicy',
    description: 'Container for the ACL information.',
    type: 'Container',
    required: true
  },
  {
    name: 'Owner',
    description: 'Container for the bucket owner\'s information.',
    type: '<a href="/docs/api/q-storage/api-reference/data-types/owner">Owner</a>',
    required: false
  },
  {
    name: 'Grant',
    description: 'Container for the grantee and permissions.',
    type: 'Array of <a href="/docs/api/q-storage/api-reference/data-types/grant">Grant</a> data types',
    required: true
  },
 
];

<ParamsTable parameters={REQUEST_ELEMENTS} type="request" />

### Request Syntax

```http
PUT /?acl HTTP/1.1
Host: _bucket-name_.qstorage.quilibrium.com
Content-MD5: {content-md5}
x-amz-acl: {canned-acl}
x-amz-grant-read: {grant-read}
x-amz-grant-write: {grant-write}
x-amz-grant-read-acp: {grant-read-acp}
x-amz-grant-write-acp: {grant-write-acp}
x-amz-grant-full-control: {grant-full-control}

<?xml version="1.0" encoding="UTF-8"?>
<AccessControlPolicy>
   <Owner>
      <ID>*** Owner-ID ***</ID>
      <DisplayName>owner-display-name</DisplayName>
   </Owner>
   <AccessControlList>
      <Grant>
         <Grantee>
            <ID>*** Grantee-ID ***</ID>
            <DisplayName>grantee-display-name</DisplayName>
         </Grantee>
         <Permission>FULL_CONTROL</Permission>
      </Grant>
   </AccessControlList>
</AccessControlPolicy>
```

## Response

### Error Responses

export const ERROR_RESPONSES = [
  {
    name: 'NoSuchBucket',
    description: 'The specified bucket does not exist.',
    httpCode: '404 Not Found'
  },
  {
    name: 'InvalidAcl',
    description: 'The provided ACL is not valid.',
    httpCode: '400 Bad Request'
  },
  {
    name: 'MalformedACLError',
    description: 'The XML provided was not well-formed or did not validate against the published schema.',
    httpCode: '400 Bad Request'
  }
];

<ParamsTable parameters={ERROR_RESPONSES} type="errors" />

## Examples

### Example 1: Set a canned ACL using the x-amz-acl header

#### Request
```http
PUT /?acl HTTP/1.1
Host: _example-bucket_.qstorage.quilibrium.com
x-amz-acl: _private_
Content-MD5: _0123456789abcdef0123456789abcdef_
```

### Example 2: Set a custom ACL using XML

#### Request
```http
PUT /?acl HTTP/1.1
Host: _example-bucket_.qstorage.quilibrium.com
Content-MD5: _0123456789abcdef0123456789abcdef_

<?xml version="1.0" encoding="UTF-8"?>
<AccessControlPolicy>
   <Owner>
      <ID>*** Owner-ID ***</ID>
      <DisplayName>owner-display-name</DisplayName>
   </Owner>
   <AccessControlList>
      <Grant>
         <Grantee>
            <ID>*** Grantee-ID ***</ID>
            <DisplayName>grantee-display-name</DisplayName>
         </Grantee>
         <Permission>READ</Permission>
      </Grant>
   </AccessControlList>
</AccessControlPolicy>
```

## API Tester
<ApiTester /> 