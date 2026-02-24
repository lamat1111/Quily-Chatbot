---
sidebar_label: CreateBucket
title: CreateBucket
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ApiTester from '@site/src/components/ApiTester';
import ParamsTable from '@site/src/components/ParamsTable';
import ApiExample from '@site/src/components/ApiExample';

export const HEADER_PARAMETERS = [
  {
    name: "x-amz-acl",
    type: "string",
    description: "The canned ACL to apply to the bucket.",
    validValues: [
      "private",
      "public-read",
      "public-read-write",
      "authenticated-read"
    ],
    required: false,
    placeholder: "private"
  },
  {
    name: "x-amz-grant-full-control",
    type: "string",
    description: "Allows grantee the READ, WRITE, READ_ACP, and WRITE_ACP permissions on the bucket",
    required: false,
    placeholder: "id=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  },
  {
    name: "x-amz-grant-read",
    type: "string",
    description: "Allows grantee to list the objects in the bucket",
    required: false,
    placeholder: "id=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  },
  {
    name: "x-amz-grant-read-acp",
    type: "string",
    description: "Allows grantee to read the bucket ACL",
    required: false,
    placeholder: "id=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  },
  {
    name: "x-amz-grant-write",
    type: "string",
    description: "Allows grantee to create, overwrite, and delete any object in the bucket",
    required: false,
    placeholder: "id=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  },
  {
    name: "x-amz-grant-write-acp",
    type: "string",
    description: "Allows grantee to write the ACL for the applicable bucket",
    required: false,
    placeholder: "id=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  },
  {
    name: "x-amz-bucket-object-lock-enabled",
    type: "boolean",
    description: "Specifies whether you want object lock to be enabled for the new bucket",
    required: false,
    placeholder: "true"
  },
  {
    name: "x-amz-object-ownership",
    type: "string",
    description: "Specifies the Object Ownership of the bucket",
    required: false,
    validValues: [
      "BucketOwnerPreferred",
      "ObjectWriter",
      "BucketOwnerEnforced"
    ],
    placeholder: "BucketOwnerEnforced"
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
    name: "Location",
    description: "The URI of the newly created bucket"
  },
  {
    name: "Date",
    description: "The date and time at which the response was sent"
  }
];

# CreateBucket

Creates a new bucket in QStorage.

## Description

The `CreateBucket` operation creates a new bucket in QStorage. The bucket name you choose must be unique across all existing bucket names in QStorage. You can use this operation to create a bucket that can hold your objects.

:::important
- Bucket names must be between 3 and 63 characters long
- Bucket names can consist only of lowercase letters, numbers, dots (.), and hyphens (-)
- Bucket names must begin and end with a letter or number
- Bucket names must not be formatted as an IP address (e.g., 192.168.5.4)
:::

## Request Syntax

<ApiExample
  request={{
    method: "PUT",
    path: "/",
    headers: {
      "Host": "_BucketName_.qstorage.quilibrium.com",
      "x-amz-bucket-object-lock-enabled": "_ObjectLockEnabled_"
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<CreateBucketConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
</CreateBucketConfiguration>`
  }}
  response={{}}
/>

## Request Parameters

### Headers

<ParamsTable parameters={HEADER_PARAMETERS} />

## Examples

<ApiExample
  request={{
    method: "PUT",
    path: "/",
    headers: {
      "Host": "_my-new-bucket_.qstorage.quilibrium.com",
      "x-amz-bucket-object-lock-enabled": "_true_"
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<CreateBucketConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
</CreateBucketConfiguration>`
  }}
  response={{
    status: 200,
    headers: {
      "x-amz-id-2": "_Example7qoYGN7uMuFuYS6m7a4l_",
      "x-amz-request-id": "_TX234S0F24A06C7_",
      "Location": "http://_my-new-bucket_.qstorage.quilibrium.com/",
      "Date": "_Wed, 01 Mar 2024 12:00:00 GMT_"
    }
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
      "Location": "_BucketLocation_",
      "Date": "_ISO8601Date_"
    }
  }}
/>

## Response Elements

### Response Headers

<ParamsTable responseElements={RESPONSE_HEADERS} type="response" />

This operation does not return a response body.

## Special Errors

| Error Code | Description |
|------------|-------------|
| BucketAlreadyExists | The requested bucket name is not available. The bucket namespace is shared by all users of the system. Please select a different name and try again. |
| BucketAlreadyOwnedByYou | Your previous request to create the named bucket succeeded and you already own it. |
| InvalidBucketName | The specified bucket name is not valid. |
| TooManyBuckets | You have attempted to create more buckets than allowed. |
| 403 | Forbidden. Authentication failed or you do not have permission to create buckets. |

## Permissions

You must have the `s3:CreateBucket` permission.

## Related Operations

The following operations are related to CreateBucket:

- [PutObject](/docs/api/q-storage/api-reference/object-operations/put-object)
- [DeleteBucket](/docs/api/q-storage/api-reference/bucket-operations/delete-bucket)

## Try It Out

<ApiTester
  operation="CreateBucket"
  description="Create a new bucket in QStorage."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-new-bucket",
      description: "Name of the bucket to create"
    },
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "Location": "http://my-new-bucket.qstorage.quilibrium.com/"
  }}
/> 