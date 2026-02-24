---
sidebar_label: GenerateDataKey
title: GenerateDataKey
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
    description: 'Must be "TrentService.GenerateDataKey"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "string",
    description: "The identifier of the KMS key to use to encrypt the data key. This can be the key ID or key ARN of the KMS key.",
    required: true
  },
  {
    name: "KeySpec",
    type: "string",
    description: "Specifies the type of data key to generate.<br/><br/>Valid Values: <span class=\"valid-value\">AES_256 |AES_128</span>.<br/><br/><i>You must specify either KeySpec or NumberOfBytes, but not both.</i>",
    required: false
  },
  {
    name: "NumberOfBytes",
    type: "integer",
    description: "The length of the data key in bytes. For example, use 64 to generate a 512-bit data key. You must specify either KeySpec or NumberOfBytes, but not both.",
    required: false
  },
  {
    name: "EncryptionContext",
    type: "map",
    description: "A set of key-value pairs that helps you identify the data key when you need to decrypt it later.",
    required: false
  },
  {
    name: "GrantTokens",
    type: "array",
    description: "A list of grant tokens that represent grants that allow this operation.",
    required: false
  }
];

export const RESPONSE_ELEMENTS = [
  {
    name: "CiphertextBlob",
    description: "The encrypted copy of the data key."
  },
  {
    name: "KeyId",
    description: "The Amazon Resource Name (ARN) of the KMS key that encrypted the data key."
  },
  {
    name: "Plaintext",
    description: "The plaintext data key. Use this value to encrypt your data outside of QKMS."
  }
];

# GenerateDataKey

Generates a unique symmetric data key for client-side encryption.

## Description

The \`GenerateDataKey\` operation generates a unique symmetric data key and returns both the plaintext version of the key and a copy that is encrypted under a KMS key that you specify. You can use the plaintext key to encrypt your data outside of QKMS and store the encrypted data key with the encrypted data.

:::note
- The KMS key you specify must be a symmetric encryption KMS key.
- You must specify the KMS key that will be used to encrypt the data key.
- The generated data key can be used to encrypt data outside of QKMS.
- The encrypted version of the data key can only be decrypted by QKMS.
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
      "X-Amz-Target": "TrentService.GenerateDataKey"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "KeySpec": "AES_256",
      "EncryptionContext": {
        "Purpose": "Test"
      }
    }
  }}
  response={{}}
/>

## Examples

### Example 1: Generate a data key

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.GenerateDataKey"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "KeySpec": "AES_256"
    }
  }}
  response={{
    status: 200,
    headers: {
      "Content-Type": "application/x-amz-json-1.1"
    },
    body: {
      "KeyId": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab",
      "Plaintext": "Base64-encoded plaintext key",
      "CiphertextBlob": "Base64-encoded encrypted data key"
    }
  }}
/>

## Response Elements

<ParamsTable responseElements={RESPONSE_ELEMENTS} type="response" />

## Special Errors

| Error Code | Description |
|------------|-------------|
| DependencyTimeoutException | The system timed out while trying to fulfill the request. |
| DisabledException | The request was rejected because the specified KMS key is disabled. |
| InvalidGrantTokenException | The request was rejected because a grant token was invalid. |
| InvalidKeyUsageException | The request was rejected because the specified KeyUsage value is not valid for this operation. |
| KeyUnavailableException | The request was rejected because the specified KMS key was not available. |
| KMSInternalException | An internal error occurred. |
| KMSInvalidStateException | The request was rejected because the key state is not valid for this operation. |
| NotFoundException | The request was rejected because the specified entity or resource could not be found. |

## Permissions

To use the \`GenerateDataKey\` operation, you must have the following permissions:
- \`kms:GenerateDataKey\` on the KMS key (specified in the policy)
- \`kms:Decrypt\` on the KMS key (to decrypt the data key)

## Try It Out

<ApiTester
  operation="GenerateDataKey"
  description="Generate a data key for client-side encryption."
  parameters={REQUEST_PARAMETERS}
  exampleResponse={{
    "KeyId": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab",
    "Plaintext": "Base64-encoded plaintext key",
    "CiphertextBlob": "Base64-encoded encrypted data key"
  }}
/> 