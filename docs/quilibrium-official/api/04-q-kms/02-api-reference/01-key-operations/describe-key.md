---
sidebar_label: DescribeKey
title: DescribeKey
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
    description: 'Must be "TrentService.DescribeKey"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "string",
    description: "The identifier of the KMS key you want to describe. This can be the key ID or key ARN of the KMS key.",
    required: true
  },
  {
    name: "GrantTokens",
    type: "array[string]",
    description: "A list of grant tokens that represent grants that can be used to access the KMS key.",
    required: false
  }
];

export const RESPONSE_ELEMENTS = [
  {
    name: "KeyMetadata",
    description: "Metadata about the KMS key.",
    children: [
      {
        name: "AccountId",
        description: "The account ID of the QConsole account that owns the KMS key."
      },
      {
        name: "KeyId",
        description: "The globally unique identifier for the KMS key."
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
        name: "DeletionDate",
        description: "The date and time after which QKMS deletes the KMS key."
      },
      {
        name: "ValidTo",
        description: "The time at which the imported key material expires."
      },
      {
        name: "Origin",
        description: "The source of the key material for the KMS key."
      },
      {
        name: "CustomerMasterKeySpec",
        description: "Describes the type of key material in the KMS key."
      },
      {
        name: "KeyManager",
        description: "The manager of the KMS key."
      },
      {
        name: "CustomKeyStoreId",
        description: "A unique identifier for the custom key store that contains the KMS key."
      },
      {
        name: "ExpirationModel",
        description: "Specifies whether the KMS key's key material expires."
      },
      {
        name: "KeyRotationEnabled",
        description: "Indicates whether key rotation is enabled."
      }
    ]
  }
];

# DescribeKey

Gets detailed information about a KMS key.

## Description

The \`DescribeKey\` operation provides detailed information about a KMS key. This operation works for all types of KMS keys, including symmetric and asymmetric keys, and keys in custom key stores.

:::note
- If you use the \`KeyId\` parameter, the operation provides information about that specific KMS key.
- If you use the \`KeyArn\` parameter, the operation provides information about the KMS key specified in the ARN.
- For symmetric keys, this operation provides information about the key material and its rotation status.
- For asymmetric keys, this operation includes information about the key spec, key usage, and public key.
:::

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
      "X-Amz-Target": "TrentService.DescribeKey"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab"
    }
  }}
  response={{}}
/>

## Response Elements

<ParamsTable responseElements={RESPONSE_ELEMENTS} type="response" />

## Examples

### Example 1: Describe a symmetric encryption KMS key

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.DescribeKey"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab"
    }
  }}
  response={{
    status: 200,
    headers: {
      "Content-Type": "application/x-amz-json-1.1"
    },
    body: {
      "KeyMetadata": {
        "AWSAccountId": "111122223333",
        "Arn": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab",
        "CreationDate": "2023-12-01T00:00:00-07:00",
        "Description": "Example symmetric encryption key",
        "Enabled": true,
        "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
        "KeyManager": "CUSTOMER",
        "KeyState": "Enabled",
        "KeyUsage": "ENCRYPT_DECRYPT",
        "CustomerMasterKeySpec": "SYMMETRIC_DEFAULT",
        "Origin": "AWS_KMS",
        "MultiRegion": false
      }
    }
  }}
/>

## Special Errors

| Error Code | Description |
|------------|-------------|
| DependencyTimeoutException | The system timed out while trying to fulfill the request. |
| InvalidArnException | The request was rejected because a specified ARN was not valid. |
| InvalidGrantTokenException | The request was rejected because the specified grant token is not valid. |
| KMSInternalException | The request was rejected because an internal error occurred. |
| KMSInvalidStateException | The request was rejected because the key state is not valid for this operation. |
| NotFoundException | The request was rejected because the specified key was not found. |

## Permissions

To use the \`DescribeKey\` operation, you must have the following permissions:
- \`kms:DescribeKey\` on the KMS key

## Try It Out

<ApiTester
  operation="DescribeKey"
  description="Get detailed information about a KMS key."
  parameters={REQUEST_PARAMETERS}
  exampleResponse={{
    "KeyMetadata": {
      "AWSAccountId": "111122223333",
      "Arn": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab",
      "CreationDate": "2023-12-01T00:00:00-07:00",
      "Description": "Example symmetric encryption key",
      "Enabled": true,
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "KeyManager": "CUSTOMER",
      "KeyState": "Enabled",
      "KeyUsage": "ENCRYPT_DECRYPT",
      "CustomerMasterKeySpec": "SYMMETRIC_DEFAULT",
      "Origin": "AWS_KMS",
      "MultiRegion": false
    }
  }}
/> 