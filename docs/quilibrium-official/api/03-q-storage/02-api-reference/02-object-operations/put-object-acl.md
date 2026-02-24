---
title: PutObjectAcl
label: PutObjectAcl
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ApiTester from '@site/src/components/ApiTester';
import ParamsTable from '@site/src/components/ParamsTable';
import ApiExample from '@site/src/components/ApiExample';

export const requestHeaders = [
  {
    name: "x-amz-acl",
    description: "Predefined ACL to apply to the object.",
    validValues: ["private", "public-read", "public-read-write", "authenticated-read", "bucket-owner-read", "bucket-owner-full-control"],
    required: false,
    type: "string"
  },
  {
    name: "Content-MD5",
    description: "Base64-encoded 128-bit MD5 digest of the data",
    required: true,
    type: "string"
  },
  {
    name: "x-amz-request-payer",
    description: "Confirms that the requester knows that they will be charged for the request",
    required: false,
    type: "string"
  },
  {
    name: "x-amz-expected-bucket-owner",
    description: "The account ID of the expected bucket owner",
    required: false,
    type: "string"
  }
];

export const uriParameters = [
  {
    name: "versionId",
    description: "Version ID of the object that you want to set the ACL for",
    required: false,
    type: "string"
  }
];

export const requestBodyElements = [
  {
    name: "AccessControlPolicy",
    description: "Container for the request",
    required: true,
    type: "XML"
  },
  {
    name: "Owner",
    description: "Container for the bucket owner's ID and display name. See <a href='/docs/api/q-storage/api-reference/data-types/owner'>Owner</a> for details.",
    type: "Container"
  },
  {
    name: "Grants",
    description: "Array of Grant data types. See <a href='/docs/api/q-storage/api-reference/data-types/grant'>Grant</a> for details.",
    required: false,
    type: "Container"
  }
];

export const responseHeaders = [
  {
    name: "x-amz-request-charged",
    description: "If present, indicates that the requester was successfully charged for the request",
    required: false,
    validValues: ['requester']
  }
];

export const responseErrors = [
  {
    name: "NoSuchKey",
    description: "The specified key does not exist (HTTP Code 404)",
    type: "Error"
  }
];

# PutObjectAcl

Sets the access control list (ACL) permissions for an object that already exists in a bucket.

## Description

The `PutObjectAcl` operation uses the `acl` subresource to set the access control list (ACL) permissions for an existing object in a bucket. You must have `WRITE_ACP` permission to change an object's ACL.

## Permissions

You need the following permissions to use this operation:
- `s3:PutObjectAcl` on the object
- `s3:PutObject` on the object if you're also the object owner

## Request

### Request Headers

<ParamsTable parameters={requestHeaders} type="request" />

### Request URI Parameters

<ParamsTable parameters={uriParameters} type="request" />

### Request Body

The request accepts the following XML elements:

<ParamsTable parameters={requestBodyElements} type="request" />

### Request Syntax

<ApiExample
  request={{
    method: "PUT",
    path: "/_ObjectKey_?acl&versionId=_VersionId_",
    headers: {
      "Host": "_BucketName_.qstorage.quilibrium.com",
      "x-amz-acl": "_private_",
      "Content-MD5": "_Base64EncodedMD5_",
      "Authorization": "_authorization string_",
      "Date": "_Date_",
      "x-amz-request-payer": "requester",
      "x-amz-expected-bucket-owner": "_OwnerAccountId_"
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<AccessControlPolicy>
   <Owner>
      <ID>_OwnerID_</ID>
      <DisplayName>_OwnerName_</DisplayName>
   </Owner>
   <AccessControlList>
      <Grant>
         <Grantee>
            <ID>_GranteeID_</ID>
            <DisplayName>_GranteeName_</DisplayName>
         </Grantee>
         <Permission>_Permission_</Permission>
      </Grant>
   </AccessControlList>
</AccessControlPolicy>`
  }}
  response={{}}
/>

## Response

### Response Headers

<ParamsTable parameters={responseHeaders} type="response" />

### Response Body

This operation does not return a response body.

### Response Errors

<ParamsTable parameters={responseErrors} type="response" />

## Examples

### Set ACL for an Object

This example sets the ACL on an object to grant full control to the owner.

<ApiExample
  request={{
    method: "PUT",
    path: "/_example-object_?acl",
    headers: {
      "Host": "_my-bucket_.qstorage.quilibrium.com",
      "x-amz-acl": "private",
      "Content-MD5": "_6aKJsA2R/DqbxeJX7HaXzw==_",
      "Date": "_Wed, 28 Oct 2023 22:32:00 GMT_",
      "Authorization": "_authorization string_"
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<AccessControlPolicy>
   <Owner>
      <ID>_123456789abc_</ID>
      <DisplayName>_owner-name_</DisplayName>
   </Owner>
   <AccessControlList>
      <Grant>
         <Grantee>
            <ID>_123456789abc_</ID>
            <DisplayName>_owner-name_</DisplayName>
         </Grantee>
         <Permission>FULL_CONTROL</Permission>
      </Grant>
   </AccessControlList>
</AccessControlPolicy>`
  }}
  response={{
    status: 200,
    headers: {
      "x-amz-id-2": "_eftixk72aD6Ap51TnqcoF8eFidJG9Z/2mkiDFu8yU9AS1ed4OpIszj7UDNEHGran_",
      "x-amz-request-id": "_318BC8BC148832E5_",
      "Date": "_Wed, 28 Oct 2023 22:32:00 GMT_"
    }
  }}
  showTitle={true}
/>

### Set ACL Using a Canned ACL

This example sets a predefined (canned) ACL on an object.

<ApiExample
  request={{
    method: "PUT",
    path: "/example-object?acl",
    headers: {
      "Host": "_my-bucket_.qstorage.quilibrium.com",
      "x-amz-acl": "public-read",
      "Content-MD5": "_6aKJsA2R/DqbxeJX7HaXzw==_",
      "Date": "_Wed, 28 Oct 2023 22:32:00 GMT_",
      "Authorization": "_authorization string_"
    }
  }}
  response={{
    status: 200,
    headers: {
      "x-amz-id-2": "_eftixk72aD6Ap51TnqcoF8eFidJG9Z/2mkiDFu8yU9AS1ed4OpIszj7UDNEHGran_",
      "x-amz-request-id": "_318BC8BC148832E5_",
      "Date": "_Wed, 28 Oct 2023 22:32:00 GMT_"
    }
  }}
  showTitle={true}
/>

## Try It Out