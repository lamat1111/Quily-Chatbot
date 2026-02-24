---
title: GetObjectAcl
label: GetObjectAcl
---

import ParamsTable from '@site/src/components/ParamsTable';
import ApiTester from '@site/src/components/ApiTester';

# GetObjectAcl

Returns the access control list (ACL) of an object in a QStorage bucket.

## Permissions Required

To perform this operation, you need one of the following permissions:
- READ_ACP permission on the object
- Bucket owner
- Object owner

## Request

### Request Headers

export const REQUEST_HEADERS = [
  {
    name: 'x-amz-request-payer',
    description: 'Confirms that the requester knows that they will be charged for the request.',
    type: 'String',
    required: false,
    values: ['requester']
  }
];

<ParamsTable parameters={REQUEST_HEADERS} type="request" />

### URI Parameters

export const URI_PARAMETERS = [
  {
    name: 'versionId',
    description: 'Version ID of the object whose ACL you want to retrieve.',
    type: 'String',
    required: false
  }
];

<ParamsTable parameters={URI_PARAMETERS} type="request" />

### Request Body
This operation does not have a request body.

### Request Syntax

```http
GET /{object-key}?acl HTTP/1.1
Host: {bucket-name}.qstorage.quilibrium.com
x-amz-request-payer: requester
```

## Response

### Response Headers

export const RESPONSE_HEADERS = [
  {
    name: 'x-amz-request-charged',
    description: 'If present, indicates that the requester was successfully charged for the request.',
    type: 'String',
    values: ['requester']
  }
];

<ParamsTable parameters={RESPONSE_HEADERS} type="response" />

### Response Elements

export const RESPONSE_ELEMENTS = [
  {
    name: 'AccessControlList',
    description: 'Container for the ACL information.',
    type: 'Container'
  },
  {
    name: 'Grant',
    description: 'Container for the grantee and permissions.',
    type: 'Container'
  },
  {
    name: 'Grantee',
    description: 'The person being granted permissions.',
    type: 'Container'
  },
  {
    name: 'ID',
    description: 'The ID of the grantee.',
    type: 'String'
  },
  {
    name: 'DisplayName',
    description: 'Screen name of the grantee.',
    type: 'String'
  },
  {
    name: 'Permission',
    description: 'Specifies the permission given to the grantee.',
    type: 'String',
    values: ['FULL_CONTROL', 'WRITE', 'WRITE_ACP', 'READ', 'READ_ACP']
  },
  {
    name: 'Owner',
    description: 'Container for the bucket owner\'s information.',
    type: 'Container'
  }
];

<ParamsTable parameters={RESPONSE_ELEMENTS} type="response" />

### Error Responses

export const ERROR_RESPONSES = [
  {
    name: 'NoSuchKey',
    description: 'The specified key does not exist.',
    httpCode: '404 Not Found'
  },
  {
    name: 'NoSuchBucket',
    description: 'The specified bucket does not exist.',
    httpCode: '404 Not Found'
  }
];

<ParamsTable parameters={ERROR_RESPONSES} type="errors" />

## Examples

### Example Request
```http
GET /example-object?acl HTTP/1.1
Host: example-bucket.qstorage.quilibrium.com
```

### Example Response
```xml
<?xml version="1.0" encoding="UTF-8"?>
<AccessControlPolicy>
   <Owner>
      <ID>*** Owner-ID ***</ID>
      <DisplayName>owner-display-name</DisplayName>
   </Owner>
   <AccessControlList>
      <Grant>
         <Grantee>
            <ID>*** Owner-ID ***</ID>
            <DisplayName>owner-display-name</DisplayName>
         </Grantee>
         <Permission>FULL_CONTROL</Permission>
      </Grant>
   </AccessControlList>
</AccessControlPolicy>
```

## API Tester
<ApiTester /> 