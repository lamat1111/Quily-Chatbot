---
sidebar_label: GetPublicKey
title: GetPublicKey
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
    description: 'Must be "TrentService.GetPublicKey"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "string",
    description: "Identifies the asymmetric KMS key that contains the public key. The value can be the ID or ARN of a KMS key.",
    required: true
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
    description: "The Amazon Resource Name (ARN) of the asymmetric KMS key from which the public key was downloaded."
  },
  {
    name: "PublicKey",
    description: "The public key (plaintext)."
  },
  {
    name: "CustomerMasterKeySpec",
    description: "The type of the asymmetric KMS key (e.g., RSA_2048, RSA_3072, RSA_4096, ECC_NIST_P256, etc.)."
  },
  {
    name: "KeyUsage",
    description: "The permitted use of the public key. Valid values are ENCRYPT_DECRYPT or SIGN_VERIFY."
  },
  {
    name: "EncryptionAlgorithms",
    description: "The encryption algorithms that QKMS supports for this key. Present only for asymmetric KMS keys with KeyUsage of ENCRYPT_DECRYPT."
  },
  {
    name: "SigningAlgorithms",
    description: "The signing algorithms that QKMS supports for this key. Present only for asymmetric KMS keys with KeyUsage of SIGN_VERIFY."
  }
];

# GetPublicKey

Downloads the public key of an asymmetric KMS key.

## Description

The \`GetPublicKey\` operation returns the public key from an asymmetric KMS key. The KMS key must be an asymmetric key and the key state must be \`Enabled\`. You can use the public key to encrypt data or verify signatures outside of QKMS.

:::note
- The KMS key must be asymmetric.
- The key state must be \`Enabled\`.
- The public key is returned in plaintext.
- You can use the public key outside of QKMS for encryption or signature verification.
:::

## Request Syntax

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.GetPublicKey"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab"
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

### Example 1: Get the public key of an RSA KMS key

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.GetPublicKey"
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
      "KeyId": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab",
      "PublicKey": "Base64-encoded public key",
      "CustomerMasterKeySpec": "RSA_2048",
      "KeyUsage": "ENCRYPT_DECRYPT",
      "EncryptionAlgorithms": [
        "RSAES_OAEP_SHA_1",
        "RSAES_OAEP_SHA_256"
      ]
    }
  }}
/>

### Example 2: Get the public key of an ECC signing key

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.GetPublicKey"
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
      "KeyId": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab",
      "PublicKey": "Base64-encoded public key",
      "CustomerMasterKeySpec": "ECC_NIST_P256",
      "KeyUsage": "SIGN_VERIFY",
      "SigningAlgorithms": [
        "ECDSA_SHA_256"
      ]
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
      "PublicKey": "blob",
      "CustomerMasterKeySpec": "string",
      "KeyUsage": "string",
      "EncryptionAlgorithms": ["string"],
      "SigningAlgorithms": ["string"]
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
| InvalidKeyUsageException | The request was rejected because the specified KeyId value cannot be used for this operation. |
| KeyUnavailableException | The request was rejected because the specified KMS key was not available. |
| KMSInternalException | The request was rejected because an internal error occurred. |
| KMSInvalidStateException | The request was rejected because the key state is not valid for this operation. |
| NotFoundException | The request was rejected because the specified entity or resource could not be found. |
| UnsupportedOperationException | The request was rejected because a specified parameter is not supported or a specified resource is not valid for this operation. |

## Permissions

To use the \`GetPublicKey\` operation, you must have the following permissions:
- \`kms:GetPublicKey\` on the KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="GetPublicKey"
  description="Download the public key of an asymmetric KMS key."
  parameters={[
    {
      name: "keyId",
      type: "string",
      required: true,
      placeholder: "1234abcd-12ab-34cd-56ef-1234567890ab",
      description: "The identifier of the asymmetric KMS key"
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
    "PublicKey": "Base64-encoded public key",
    "CustomerMasterKeySpec": "RSA_2048",
    "KeyUsage": "ENCRYPT_DECRYPT",
    "EncryptionAlgorithms": [
      "RSAES_OAEP_SHA_1",
      "RSAES_OAEP_SHA_256"
    ]
  }}
/> 