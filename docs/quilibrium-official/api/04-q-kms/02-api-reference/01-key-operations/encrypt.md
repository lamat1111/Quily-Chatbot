---
sidebar_label: Encrypt
title: Encrypt
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
    description: 'Must be "TrentService.Encrypt"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "string",
    description: "The identifier of the KMS key to use for encryption. This can be the key ID or key ARN of the KMS key.",
    required: true
  },
  {
    name: "Plaintext",
    type: "blob",
    description: "The data to encrypt.",
    required: true
  },
  {
    name: "EncryptionContext",
    type: "object",
    description: "A set of key-value pairs that you can attach to an encryption operation.",
    required: false
  },
  {
    name: "GrantTokens",
    type: "array[string]",
    description: "A list of grant tokens that represent grants that can be used to encrypt with the KMS key.",
    required: false
  },
  {
    name: "EncryptionAlgorithm",
    type: "string",
    description: "The encryption algorithm that will be used to encrypt the plaintext.<br/><br/>Valid Values: <span class=\"valid-value\">SYMMETRIC_DEFAULT</span>, <span class=\"valid-value\">RSAES_OAEP_SHA_1</span>, <span class=\"valid-value\">RSAES_OAEP_SHA_256</span>.",
    required: false
  }
];

export const RESPONSE_ELEMENTS = [
  {
    name: "CiphertextBlob",
    description: "The encrypted data (ciphertext)."
  },
  {
    name: "KeyId",
    description: "The Amazon Resource Name (ARN) of the KMS key that was used to encrypt the data."
  },
  {
    name: "EncryptionAlgorithm",
    description: "The encryption algorithm that was used to encrypt the data."
  }
];

# Encrypt

Encrypts plaintext into ciphertext using a KMS key.

## Description

The \`Encrypt\` operation uses a KMS key to encrypt data. This operation is the basic encryption operation provided by QKMS. You can use it to encrypt small amounts of arbitrary data, such as a personal identifier or database password.

:::note
- The KMS key that you use for this operation must be in a compatible key state.
- If you use a symmetric encryption KMS key, you can use the ciphertext in another cryptographic operation, such as \`Decrypt\`.
- For asymmetric KMS keys, you can encrypt data only with RSA public keys.
- The maximum size of the data you can encrypt varies with the type of KMS key and encryption algorithm that you are using.
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
      "X-Amz-Target": "TrentService.Encrypt"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "Plaintext": "SGVsbG8gV29ybGQ=",
      "EncryptionContext": {
        "Department": "Finance"
      },
      "GrantTokens": [
        "AQpAM2RhZTk1MGMyNTk2ZmZmMzEyYWVhOWViN2I1MWM4Mzc0MWFiYjc0ZDE1ODkyNGFlNTIzODZhMzgyZjBlNDkxOAF4"
      ],
      "EncryptionAlgorithm": "SYMMETRIC_DEFAULT"
    }
  }}
  response={{}}
/>

## Examples

### Example 1: Encrypt data using a symmetric encryption KMS key

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.Encrypt"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "Plaintext": "SGVsbG8gV29ybGQ=",
      "EncryptionContext": {
        "Department": "Finance"
      }
    }
  }}
  response={{
    status: 200,
    headers: {
      "Content-Type": "application/x-amz-json-1.1"
    },
    body: {
      "CiphertextBlob": "AQICAHiWj6qDgGqSQXkNHcsbq8Q3+q6lThTZqXXRRXYtGhEQXwEH5qV5eN9LQI6CtDwBUvNVAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMeq6+5Ey7LGAKorXtAgEQgDsgli8KqqW4qp0g9ZWnHdRGYc3ZJzpV3xH9qVGFRwzVVKJNK/Ey/fGS2tl4TOQXLcTYJMEOxR8gPjA=",
      "KeyId": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab",
      "EncryptionAlgorithm": "SYMMETRIC_DEFAULT"
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
| InvalidGrantTokenException | The request was rejected because the specified grant token is not valid. |
| InvalidKeyUsageException | The request was rejected because the specified KeyId value cannot be used for this operation. |
| KeyUnavailableException | The request was rejected because the specified KMS key was not available. |
| KMSInternalException | An internal error occurred. |
| KMSInvalidStateException | The request was rejected because the key state is not valid for this operation. |
| NotFoundException | The request was rejected because the specified key was not found. |

## Permissions

To use the \`Encrypt\` operation, you must have the following permissions:
- \`kms:Encrypt\` on the KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="Encrypt"
  description="Encrypt data using a KMS key."
  parameters={REQUEST_PARAMETERS}
  exampleResponse={{
    "CiphertextBlob": "AQICAHiWj6qDgGqSQXkNHcsbq8Q3+q6lThTZqXXRRXYtGhEQXwEH5qV5eN9LQI6CtDwBUvNVAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMeq6+5Ey7LGAKorXtAgEQgDsgli8KqqW4qp0g9ZWnHdRGYc3ZJzpV3xH9qVGFRwzVVKJNK/Ey/fGS2tl4TOQXLcTYJMEOxR8gPjA=",
    "KeyId": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab",
    "EncryptionAlgorithm": "SYMMETRIC_DEFAULT"
  }}
/> 