---
sidebar_label: CreateKey
title: CreateKey
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
    description: 'Must be "TrentService.CreateKey"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "Policy",
    type: "string",
    description: "The key policy to attach to the KMS key. If you do not specify a policy, Q-KMS attaches a default key policy that gives all principals in the QConsole account access to all KMS operations.",
    required: false
  },
  {
    name: "Description",
    type: "string",
    description: "A description of the KMS key. Use a description that helps you decide whether the KMS key is appropriate for a task.",
    required: false
  },
  {
    name: "KeyUsage",
    type: "string",
    description: "Determines the cryptographic operations for which you can use the KMS key. The default value is ENCRYPT_DECRYPT. This parameter is required only for asymmetric KMS keys.",
    required: false
  },
  {
    name: "CustomerMasterKeySpec",
    type: "string",
    description: "Specifies the type of KMS key to create. The default value, SYMMETRIC_DEFAULT, creates a KMS key with a 256-bit symmetric key for encryption and decryption.",
    required: false
  },
  {
    name: "Origin",
    type: "string",
    description: "The source of the key material for the KMS key. You cannot change the origin after you create the KMS key. The default is AWS_KMS, which means Q-KMS creates the key material.",
    required: false
  },
  {
    name: "BypassPolicyLockoutSafetyCheck",
    type: "boolean",
    description: "A flag to indicate whether to bypass the key policy lockout safety check. The default value is false.",
    required: false
  },
  {
    name: "Tags",
    type: "array",
    description: "One or more tags. Each tag consists of a tag key and a tag value.",
    required: false
  }
];

export const RESPONSE_ELEMENTS = [
  {
    name: "KeyMetadata",
    description: "Metadata associated with the KMS key.",
    children: [
      {
        name: "QAccountId",
        description: "The account ID of the QConsole account that owns the KMS key."
      },
      {
        name: "KeyId",
        description: "The globally unique identifier for the KMS key."
      },
      {
        name: "Arn",
        description: "The Resource Name (ARN) of the KMS key."
      },
      {
        name: "CreationDate",
        description: "The date and time when the KMS key was created."
      },
      {
        name: "Enabled",
        description: "Specifies whether the KMS key is enabled."
      },
      {
        name: "Description",
        description: "The description of the KMS key."
      },
      {
        name: "KeyUsage",
        description: "The cryptographic operations for which you can use the KMS key."
      },
      {
        name: "KeyState",
        description: "The current status of the KMS key."
      },
      {
        name: "Origin",
        description: "The source of the key material for the KMS key."
      },
      {
        name: "CustomerMasterKeySpec",
        description: "Describes the type of key material in the KMS key."
      },
    ]
  }
];

# CreateKey

Creates a unique customer managed KMS key in your QConsole account.

## Description

Creates a customer managed KMS key in your QConsole account. You can use a KMS key to encrypt small amounts of data (up to 4,096 bytes) directly, but KMS keys are more commonly used to encrypt data encryption keys (DEKs) which are then used to encrypt larger amounts of data.

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
      "X-Amz-Target": "TrentService.CreateKey"
    },
    body: {
      "Description": "Example KMS key for general use",
      "KeyUsage": "ENCRYPT_DECRYPT",
      "CustomerMasterKeySpec": "SYMMETRIC_DEFAULT",
      "Origin": "QKMS",
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

## Examples

### Example 1: Create a symmetric encryption KMS key

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.CreateKey"
    },
    body: {
      "Description": "Example symmetric encryption KMS key",
      "KeyUsage": "ENCRYPT_DECRYPT",
      "CustomerMasterKeySpec": "SYMMETRIC_DEFAULT"
    }
  }}
  response={{
    status: 200,
    headers: {
      "Content-Type": "application/x-amz-json-1.1"
    },
    body: {
      "KeyMetadata": {
        "AccountId": "111122223333",
        "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
        "Arn": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab",
        "CreationDate": "2023-12-01T00:00:00-07:00",
        "Enabled": true,
        "Description": "Example symmetric encryption KMS key",
        "KeyUsage": "ENCRYPT_DECRYPT",
        "KeyState": "Enabled",
        "Origin": "QKMS",
        "CustomerMasterKeySpec": "SYMMETRIC_DEFAULT",
        "MultiRegion": false
      }
    }
  }}
/>

### Example 2: Create a multi-Region primary key

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.CreateKey"
    },
    body: {
      "Description": "Example multi-Region primary key",
      "MultiRegion": true,
      "KeyUsage": "ENCRYPT_DECRYPT",
      "CustomerMasterKeySpec": "SYMMETRIC_DEFAULT"
    }
  }}
  response={{
    status: 200,
    headers: {
      "Content-Type": "application/x-amz-json-1.1"
    },
    body: {
      "KeyMetadata": {
        "AccountId": "111122223333",
        "KeyId": "mrk-1234abcd12ab34cd56ef1234567890ab",
        "Arn": "arn:verenc:111122223333:key/mrk-1234abcd12ab34cd56ef1234567890ab",
        "CreationDate": "2023-12-01T00:00:00-07:00",
        "Enabled": true,
        "Description": "Example multi-Region primary key",
        "KeyUsage": "ENCRYPT_DECRYPT",
        "KeyState": "Enabled",
        "Origin": "QKMS",
        "CustomerMasterKeySpec": "SYMMETRIC_DEFAULT",
        "MultiRegion": true
      }
    }
  }}
/>

## Special Errors

| Error Code | Description |
|------------|-------------|
| DependencyTimeoutException | The system timed out while trying to fulfill the request. |
| InvalidArnException | The request was rejected because a specified ARN was not valid. |
| KMSInternalException | The request was rejected because an internal error occurred. |
| LimitExceededException | The request was rejected because a quota was exceeded. |
| MalformedPolicyDocumentException | The request was rejected because the specified policy document was malformed. |
| TagException | The request was rejected because one or more tags are not valid. |
| UnsupportedOperationException | The request was rejected because a specified parameter is not supported or a specified resource is not valid for this operation. |

## Permissions

To use the \`CreateKey\` operation, you must have the following permissions:
- \`kms:CreateKey\`
- \`iam:CreateServiceLinkedRole\` (required only to create multi-Region keys)

## Try It Out

<ApiTester
  operation="CreateKey"
  description="Create a new KMS key in your QConsole account."
  parameters={REQUEST_PARAMETERS}
/> 