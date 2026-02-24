---
sidebar_label: Decrypt
title: Decrypt
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
    description: 'Must be "TrentService.Decrypt"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "CiphertextBlob",
    type: "Blob",
    description: "The ciphertext to decrypt.",
    required: true
  },
  {
    name: "KeyId",
    type: "String",
    description: "Specifies the KMS key that QKMS uses to decrypt the ciphertext. This value can be the key ID or key ARN of the KMS key.",
    required: false
  },
  {
    name: "EncryptionContext",
    type: "Object",
    description: "Specifies the encryption context to use when decrypting the data. The same encryption context that was used to encrypt the data must be provided.",
    required: false
  },
  {
    name: "GrantTokens",
    type: "Array<string>",
    description: "A list of grant tokens that represent grants that were used to encrypt the ciphertext.",
    required: false
  }
];

export const RESPONSE_ELEMENTS = [
  {
    name: "KeyId",
    description: "The Amazon Resource Name (ARN) of the KMS key that was used to decrypt the ciphertext."
  },
  {
    name: "Plaintext",
    description: "The decrypted (plaintext) data."
  },
  {
    name: "EncryptionAlgorithm",
    description: "The encryption algorithm that was used to decrypt the ciphertext."
  }
];

# Decrypt

Decrypts ciphertext that was encrypted by a KMS key using any of the encryption operations.

## Description

The \`Decrypt\` operation decrypts ciphertext that was encrypted by a KMS key using any of the following operations: \`Encrypt\`, \`GenerateDataKey\`, or \`GenerateDataKeyWithoutPlaintext\`. You can use this operation to decrypt data outside of QKMS that was encrypted with a KMS key in QKMS.

:::note
- The KMS key that you use for this operation must be in a compatible key state. For details, see [Key states required for operations](/docs/api/q-kms/user-manual/key-states).
- The ciphertext must have been encrypted under the specified KMS key.
- If the ciphertext was encrypted under a symmetric KMS key, you must use the same KMS key to decrypt it.
- If you use an asymmetric KMS key to encrypt a message, you must use the correct asymmetric KMS key to decrypt the message.
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
      "X-Amz-Target": "TrentService.Decrypt"
    },
    body: {
      "CiphertextBlob": "AQICAHiWj6qDgGqSQXkNHcsbq8Q3+q6lThTZqXXRRXYtGhEQXwEH5qV5eN9LQI6CtDwBUvNVAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMeq6+5Ey7LGAKorXtAgEQgDsgli8KqqW4qp0g9ZWnHdRGYc3ZJzpV3xH9qVGFRwzVVKJNK/Ey/fGS2tl4TOQXLcTYJMEOxR8gPjA=",
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "EncryptionContext": {
        "Department": "Finance"
      }
    }
  }}
  response={{}}
/>

## Response Elements

<ParamsTable responseElements={RESPONSE_ELEMENTS} type="response" />

## Examples

### Example 1: Decrypt ciphertext using a symmetric KMS key

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.Decrypt"
    },
    body: {
      "CiphertextBlob": "AQICAHiWj6qDgGqSQXkNHcsbq8Q3+q6lThTZqXXRRXYtGhEQXwEH5qV5eN9LQI6CtDwBUvNVAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMeq6+5Ey7LGAKorXtAgEQgDsgli8KqqW4qp0g9ZWnHdRGYc3ZJzpV3xH9qVGFRwzVVKJNK/Ey/fGS2tl4TOQXLcTYJMEOxR8gPjA=",
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
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
      "KeyId": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab",
      "Plaintext": "SGVsbG8gV29ybGQ=",
      "EncryptionAlgorithm": "SYMMETRIC_DEFAULT"
    }
  }}
/>

## Special Errors

| Error Code | Description |
|------------|-------------|
| DependencyTimeoutException | The system timed out while trying to fulfill the request. |
| DisabledException | The request was rejected because the specified KMS key is disabled. |
| InvalidCiphertextException | The request was rejected because the specified ciphertext has been corrupted or is not valid. |
| InvalidGrantTokenException | The request was rejected because the specified grant token is not valid. |
| InvalidKeyUsageException | The request was rejected because the specified KeyId value cannot be used for this operation. |
| KeyUnavailableException | The request was rejected because the specified KMS key was not available. |
| KMSInternalException | The request was rejected because an internal error occurred. |
| KMSInvalidStateException | The request was rejected because the key state is not valid for this operation. |
| NotFoundException | The request was rejected because the specified key was not found. |

## Permissions

To use the \`Decrypt\` operation, you must have the following permissions:
- \`kms:Decrypt\` on the KMS key

## Try It Out

<ApiTester
  operation="Decrypt"
  description="Decrypt ciphertext that was encrypted by a KMS key."
  parameters={REQUEST_PARAMETERS}
/> 