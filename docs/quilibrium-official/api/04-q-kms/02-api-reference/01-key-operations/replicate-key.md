---
sidebar_label: ReplicateKey
title: ReplicateKey
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ApiTester from '@site/src/components/ApiTester';
import ParamsTable from '@site/src/components/ParamsTable';
import ApiExample from '@site/src/components/ApiExample';

export const HEADER_PARAMETERS = [
  {
    name: "Content-Type",
    type: "string",
    description: 'Must be "application/x-amz-json-1.1"',
    required: true
  },
  {
    name: "X-Amz-Target",
    type: "string",
    description: 'Must be "TrentService.ReplicateKey"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "string",
    description: "Identifies the multi-Region primary key that is being replicated. Specify the key ID or key ARN of a multi-Region primary key.",
    required: true
  },
  {
    name: "ReplicaRegion",
    type: "string",
    description: "The Region ID of the Region that will contain the key replica.",
    required: true
  },
  {
    name: "Description",
    type: "string",
    description: "A description of the KMS key. The default value is an empty string (no description).",
    required: false
  },
  {
    name: "Policy",
    type: "string",
    description: "The key policy that authorizes use of the KMS key. The default value is the default key policy.",
    required: false
  },
  {
    name: "Tags",
    type: "array",
    description: "One or more tags. Each tag consists of a tag key and a tag value.",
    required: false,
    children: [
      {
        name: "TagKey",
        description: "The key of the tag."
      },
      {
        name: "TagValue",
        description: "The value of the tag."
      }
    ]
  }
];

export const RESPONSE_ELEMENTS = [
  {
    name: "ReplicaKeyMetadata",
    description: "Detailed information about the replica key.",
    children: [
      {
        name: "AWSAccountId",
        description: "The AWS account ID that owns the KMS key."
      },
      {
        name: "Arn",
        description: "The Amazon Resource Name (ARN) of the KMS key."
      },
      {
        name: "CreationDate",
        description: "The date and time when the KMS key was created."
      },
      {
        name: "Description",
        description: "The description of the KMS key."
      },
      {
        name: "Enabled",
        description: "Specifies whether the KMS key is enabled."
      },
      {
        name: "KeyId",
        description: "The globally unique identifier for the KMS key."
      },
      {
        name: "KeyManager",
        description: "The manager of the KMS key. Values: AWS | CUSTOMER"
      },
      {
        name: "KeyState",
        description: "The current status of the KMS key. Values: ENABLED | DISABLED | PENDING_DELETION | PENDING_IMPORT | UNAVAILABLE"
      },
      {
        name: "KeyUsage",
        description: "The cryptographic operations for which you can use the KMS key."
      },
      {
        name: "MultiRegion",
        description: "Indicates whether the KMS key is a multi-Region key."
      },
      {
        name: "MultiRegionConfiguration",
        description: "Configuration information about the multi-Region key.",
        children: [
          {
            name: "MultiRegionKeyType",
            description: "Indicates whether the KMS key is a PRIMARY or REPLICA key."
          },
          {
            name: "PrimaryKey",
            description: "Information about the primary key.",
            children: [
              {
                name: "Arn",
                description: "ARN of the primary key."
              },
              {
                name: "Region",
                description: "Region of the primary key."
              }
            ]
          },
          {
            name: "ReplicaKeys",
            description: "Information about the replica keys.",
            children: [
              {
                name: "Arn",
                description: "ARN of the replica key."
              },
              {
                name: "Region",
                description: "Region of the replica key."
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "ReplicaPolicy",
    description: "The key policy of the replica key."
  },
  {
    name: "ReplicaTags",
    description: "The tags on the replica key.",
    children: [
      {
        name: "TagKey",
        description: "The key of the tag."
      },
      {
        name: "TagValue",
        description: "The value of the tag."
      }
    ]
  }
];

# ReplicateKey

Creates a replica of a multi-Region KMS key in a different Region.

## Description

Creates a replica of a multi-Region KMS key in a different Region. This operation creates a KMS key with the same key ID and key material as the primary key. The replica key also has the same key usage, key policy, description, and tags as the primary key, unless you specify different values in the request.

## Request Syntax

### Headers

<ParamsTable parameters={HEADER_PARAMETERS} />

### Request Body

<ParamsTable parameters={REQUEST_PARAMETERS} />

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.ReplicateKey"
    },
    body: {
      "KeyId": "mrk-1234567890abcdef0",
      "ReplicaRegion": "us-west-2",
      "Description": "Example replica key",
      "Policy": "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Sid\":\"Enable IAM User Permissions\",\"Effect\":\"Allow\",\"Principal\":{\"AWS\":\"arn:aws:iam::111122223333:root\"},\"Action\":\"kms:*\",\"Resource\":\"*\"}]}",
      "Tags": [
        {
          "TagKey": "Purpose",
          "TagValue": "Test"
        }
      ]
    }
  }}
  response={{}}
/>

## Response Elements

<ParamsTable responseElements={RESPONSE_ELEMENTS} type="response" />

## Special Errors

| Error Code | Description |
|------------|-------------|
| DisabledException | The request was rejected because the specified KMS key is not enabled. |
| InvalidKeyUsageException | The request was rejected because the specified KeyUsage value is not valid. |
| KMSInvalidStateException | The request was rejected because the state of the specified resource is not valid for this request. |
| KMSNotFoundException | The request was rejected because the specified entity or resource could not be found. |
| TagException | The request was rejected because one or more tags are not valid. |
| UnsupportedOperationException | The request was rejected because a specified parameter is not supported or a specified resource is not valid for this operation. |

## Permissions

To use the `ReplicateKey` operation, you must have the following permissions:
- `kms:ReplicateKey` on the primary key
- `kms:CreateKey` in the replica region

## Try It Out

<ApiTester
  operation="ReplicateKey"
  description="Create a replica of a multi-Region KMS key."
  parameters={REQUEST_PARAMETERS}
  exampleResponse={{
    "ReplicaKeyMetadata": {
      "AWSAccountId": "111122223333",
      "Arn": "arn:verenc:111122223333:key/mrk-1234567890abcdef0",
      "CreationDate": "2023-12-01T21:15:00Z",
      "Description": "Example replica key",
      "Enabled": true,
      "KeyId": "mrk-1234567890abcdef0",
      "KeyManager": "CUSTOMER",
      "KeyState": "ENABLED",
      "KeyUsage": "ENCRYPT_DECRYPT",
      "MultiRegion": true,
      "MultiRegionConfiguration": {
        "MultiRegionKeyType": "REPLICA",
        "PrimaryKey": {
          "Arn": "arn:verenc:111122223333:key/mrk-1234567890abcdef0",
          "Region": "us-east-1"
        },
        "ReplicaKeys": [
          {
            "Arn": "arn:verenc:111122223333:key/mrk-1234567890abcdef0",
            "Region": "us-west-2"
          }
        ]
      }
    },
    "ReplicaPolicy": "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Sid\":\"Enable IAM User Permissions\",\"Effect\":\"Allow\",\"Principal\":{\"AWS\":\"arn:aws:iam::111122223333:root\"},\"Action\":\"kms:*\",\"Resource\":\"*\"}]}",
    "ReplicaTags": [
      {
        "TagKey": "Purpose",
        "TagValue": "Test"
      }
    ]
  }}
/> 