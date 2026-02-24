---
sidebar_label: GenerateDataKeyPairWithoutPlaintext
title: GenerateDataKeyPairWithoutPlaintext
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
    description: 'Must be "TrentService.GenerateDataKeyPairWithoutPlaintext"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "string",
    description: "Specifies the KMS key that encrypts the private key in the data key pair. The value can be the ID or ARN of a KMS key.",
    required: true
  },
  {
    name: "KeyPairSpec",
    type: "string",
    description: "Determines the type of data key pair that is generated. The supported values are RSA_2048, RSA_3072, RSA_4096, ECC_NIST_P256, ECC_NIST_P384, ECC_NIST_P521, or ECC_SECG_P256K1.",
    required: true
  },
  {
    name: "EncryptionContext",
    type: "map",
    description: "A key-value pair that specifies the encryption context to be used for authenticated encryption. This value must match the encryption context used when decrypting the private key.",
    required: false
  },
  {
    name: "GrantTokens",
    type: "array",
    description: "A list of grant tokens. Use grant tokens when your permission to call this operation comes from a new grant that has not yet achieved eventual consistency.",
    required: false
  }
];

export const RESPONSE_ELEMENTS = [
  {
    name: "KeyId",
    description: "The Amazon Resource Name (ARN) of the KMS key that encrypted the private key."
  },
  {
    name: "KeyPairSpec",
    description: "The type of data key pair that was generated."
  },
  {
    name: "PrivateKeyCiphertextBlob",
    description: "The encrypted copy of the private key. Use this value to decrypt the private key outside of QKMS."
  },
  {
    name: "PublicKey",
    description: "The public key (plaintext)."
  }
];

# GenerateDataKeyPairWithoutPlaintext

Generates a unique asymmetric data key pair without the plaintext private key.

## Description

The \`GenerateDataKeyPairWithoutPlaintext\` operation is similar to the \`GenerateDataKeyPair\` operation except that it returns only the encrypted private key and the plaintext public key. This operation is useful when you need to move encrypted private keys to a system that doesn't need to decrypt them.

:::note
- You can use the public key to encrypt data or verify signatures outside of QKMS.
- To decrypt data or generate signatures, you must first decrypt the private key using the KMS key that encrypted it.
- The private key is never returned in plaintext form.
:::

## Request Syntax

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.GenerateDataKeyPairWithoutPlaintext"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "KeyPairSpec": "RSA_2048",
      "EncryptionContext": {
        "Purpose": "Test"
      }
    }
  }}
  response={{}}
/>

## Request Parameters

### Headers

<ParamsTable parameters={HEADER_PARAMETERS} />

### Request Body

<ParamsTable parameters={REQUEST_PARAMETERS} />

## Examples

### Example 1: Generate an RSA key pair without plaintext private key

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.GenerateDataKeyPairWithoutPlaintext"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "KeyPairSpec": "RSA_2048"
    }
  }}
  response={{
    status: 200,
    headers: {
      "Content-Type": "application/x-amz-json-1.1"
    },
    body: {
      "KeyId": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab",
      "KeyPairSpec": "RSA_2048",
      "PrivateKeyCiphertextBlob": "Base64-encoded encrypted private key",
      "PublicKey": "Base64-encoded public key"
    }
  }}
/>

### Example 2: Generate an ECC key pair without plaintext private key and with encryption context

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.GenerateDataKeyPairWithoutPlaintext"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "KeyPairSpec": "ECC_NIST_P256",
      "EncryptionContext": {
        "Purpose": "Test"
      }
    }
  }}
  response={{
    status: 200,
    headers: {
      "Content-Type": "application/x-amz-json-1.1"
    },
    body: {
      "KeyId": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab",
      "KeyPairSpec": "ECC_NIST_P256",
      "PrivateKeyCiphertextBlob": "Base64-encoded encrypted private key",
      "PublicKey": "Base64-encoded public key"
    }
  }}
/>

## Response Syntax

<ApiExample
  request={{}}
  response={{
    status: 200,
    headers: {
      "Content-Type": "application/x-amz-json-1.1"
    },
    body: {
      "KeyId": "string",
      "KeyPairSpec": "string",
      "PrivateKeyCiphertextBlob": "blob",
      "PublicKey": "blob"
    }
  }}
/>

## Response Elements

<ParamsTable responseElements={RESPONSE_ELEMENTS} type="response" />

## Special Errors

| Error Code | Description |
|------------|-------------|
| DependencyTimeoutException | The system timed out while trying to fulfill the request. |
| InvalidKeyUsageException | The request was rejected because the specified KeyId value cannot be used for this operation. |
| KeyUnavailableException | The request was rejected because the specified KMS key was not available. |
| KMSInternalException | The request was rejected because an internal error occurred. |
| KMSInvalidStateException | The request was rejected because the key state is not valid for this operation. |
| NotFoundException | The request was rejected because the specified entity or resource could not be found. |

## Permissions

To use the \`GenerateDataKeyPairWithoutPlaintext\` operation, you must have the following permissions:
- \`kms:GenerateDataKeyPairWithoutPlaintext\` on the KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="GenerateDataKeyPairWithoutPlaintext"
  description="Generate an asymmetric data key pair without plaintext private key."
  parameters={[
    {
      name: "keyId",
      type: "string",
      required: true,
      placeholder: "1234abcd-12ab-34cd-56ef-1234567890ab",
      description: "The identifier of the KMS key to use for encrypting the private key"
    },
    {
      name: "keyPairSpec",
      type: "string",
      required: true,
      placeholder: "RSA_2048",
      description: "The type of data key pair to generate"
    },
    {
      name: "encryptionContext",
      type: "object",
      required: false,
      placeholder: '{"Purpose": "Test"}',
      description: "Additional authenticated data for the encryption operation"
    },
    {
      name: "grantTokens",
      type: "array",
      required: false,
      placeholder: '["grant1", "grant2"]',
      description: "A list of grant tokens"
    }
  ]}
  exampleResponse={{
    "KeyId": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab",
    "KeyPairSpec": "RSA_2048",
    "PrivateKeyCiphertextBlob": "Base64-encoded encrypted private key",
    "PublicKey": "Base64-encoded public key"
  }}
/> 