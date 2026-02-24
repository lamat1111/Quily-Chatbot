---
sidebar_label: ReEncrypt
title: ReEncrypt
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
    description: 'Must be "TrentService.ReEncrypt"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "CiphertextBlob",
    type: "blob",
    description: "The ciphertext of the data to re-encrypt.",
    required: true
  },
  {
    name: "SourceKeyId",
    type: "string",
    description: "Specifies the KMS key that was used to encrypt the ciphertext. This can be the key ID or key ARN of the KMS key.",
    required: false
  },
  {
    name: "DestinationKeyId",
    type: "string",
    description: "Specifies the KMS key that will be used to re-encrypt the data. This can be the key ID or key ARN of the KMS key.",
    required: true
  },
  {
    name: "SourceEncryptionContext",
    type: "object",
    description: "Specifies the encryption context to use when decrypting the data. Must match the encryption context used when the data was encrypted.",
    required: false
  },
  {
    name: "DestinationEncryptionContext",
    type: "object",
    description: "Specifies the encryption context to use when re-encrypting the data.",
    required: false
  },
  {
    name: "SourceEncryptionAlgorithm",
    type: "string",
    description: "The encryption algorithm that was used to encrypt the ciphertext.",
    required: false
  },
  {
    name: "DestinationEncryptionAlgorithm",
    type: "string",
    description: "The encryption algorithm that will be used to re-encrypt the data.",
    required: false
  },
  {
    name: "GrantTokens",
    type: "array",
    description: "A list of grant tokens that represent grants that can be used to decrypt the ciphertext and re-encrypt it with the destination KMS key.",
    required: false
  }
];

export const RESPONSE_ELEMENTS = [
  {
    name: "CiphertextBlob",
    description: "The re-encrypted data."
  },
  {
    name: "SourceKeyId",
    description: "The Amazon Resource Name (ARN) of the KMS key that was used to decrypt the data."
  },
  {
    name: "KeyId",
    description: "The Amazon Resource Name (ARN) of the KMS key that was used to re-encrypt the data."
  },
  {
    name: "SourceEncryptionAlgorithm",
    description: "The encryption algorithm that was used to decrypt the ciphertext."
  },
  {
    name: "DestinationEncryptionAlgorithm",
    description: "The encryption algorithm that was used to re-encrypt the data."
  }
];

# ReEncrypt

Decrypts ciphertext and then re-encrypts it entirely within QKMS.

## Description

The \`ReEncrypt\` operation decrypts ciphertext and then re-encrypts it entirely within QKMS. You can use this operation to change the KMS key under which data is encrypted, such as when you want to manually rotate a key or move encrypted data from one region to another.

:::note
- The source and destination KMS keys must be symmetric encryption KMS keys.
- The source and destination KMS keys must be enabled.
- The ciphertext and the destination KMS key must be in the same region.
- The operation never exposes the plaintext data outside of QKMS.
- You can use different encryption contexts for encryption and decryption.
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
      "X-Amz-Target": "TrentService.ReEncrypt"
    },
    body: {
      "CiphertextBlob": "AQICAHiWj6qDgGqSQXkNHcsbq8Q3+q6lThTZqXXRRXYtGhEQXwEH5qV5eN9LQI6CtDwBUvNVAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQM6v4DhjrVUqgdqVEuAgEQgDsgli8KqqW4qp0g9ZWnHdRGYc3ZJzpV3xH9qVGFRwzVVKJNK/Ey/fGS2tl4TOQXLcTYJMEOxR8gPjA=",
      "SourceKeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "DestinationKeyId": "0987dcba-09fe-87dc-65ba-ab0987654321",
      "SourceEncryptionContext": {
        "Department": "Finance"
      },
      "DestinationEncryptionContext": {
        "Purpose": "Test"
      },
      "SourceEncryptionAlgorithm": "SYMMETRIC_DEFAULT",
      "DestinationEncryptionAlgorithm": "SYMMETRIC_DEFAULT",
      "GrantTokens": [
        "AQpAM2RhZTk1MGMyNTk2ZmZmMzEyYWVhOWViN2I1MWM4Mzc0MWFiYjc0ZDE1ODkyNGFlNTIzODZhMzgyZjBlNDkxOAF4"
      ]
    }
  }}
  response={{}}
/>

## Response Elements

<ParamsTable responseElements={RESPONSE_ELEMENTS} type="response" />

## Examples

### Example 1: Re-encrypt data with a new KMS key

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.ReEncrypt"
    },
    body: {
      "CiphertextBlob": "AQICAHiWj6qDgGqSQXkNHcsbq8Q3+q6lThTZqXXRRXYtGhEQXwEH5qV5eN9LQI6CtDwBUvNVAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQM6v4DhjrVUqgdqVEuAgEQgDsgli8KqqW4qp0g9ZWnHdRGYc3ZJzpV3xH9qVGFRwzVVKJNK/Ey/fGS2tl4TOQXLcTYJMEOxR8gPjA=",
      "SourceKeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "DestinationKeyId": "0987dcba-09fe-87dc-65ba-ab0987654321",
      "SourceEncryptionContext": {
        "Department": "Finance"
      },
      "DestinationEncryptionContext": {
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
      "CiphertextBlob": "AQICAHiWj6qDgGqSQXkNHcsbq8Q3+q6lThTZqXXRRXYtGhEQXwEH5qV5eN9LQI6CtDwBUvNVAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQM6v4DhjrVUqgdqVEuAgEQgDsgli8KqqW4qp0g9ZWnHdRGYc3ZJzpV3xH9qVGFRwzVVKJNK/Ey/fGS2tl4TOQXLcTYJMEOxR8gPjA=",
      "SourceKeyId": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab",
      "KeyId": "arn:verenc:111122223333:key/0987dcba-09fe-87dc-65ba-ab0987654321",
      "SourceEncryptionAlgorithm": "SYMMETRIC_DEFAULT",
      "DestinationEncryptionAlgorithm": "SYMMETRIC_DEFAULT"
    }
  }}
/>

## Special Errors

| Error Code | Description |
|------------|-------------|
| DependencyTimeoutException | The system timed out while trying to fulfill the request. |
| DisabledException | The request was rejected because the specified KMS key is disabled. |
| InvalidCiphertextException | The request was rejected because the specified ciphertext has been corrupted or is otherwise invalid. |
| InvalidGrantTokenException | The request was rejected because the specified grant token is not valid. |
| InvalidKeyUsageException | The request was rejected because the specified KeyId value cannot be used for this operation. |
| KeyUnavailableException | The request was rejected because the specified KMS key was not available. |
| KMSInternalException | An internal error occurred. |
| KMSInvalidStateException | The request was rejected because the key state is not valid for this operation. |
| NotFoundException | The request was rejected because the specified entity or resource could not be found. |

## Permissions

To use the \`ReEncrypt\` operation, you must have the following permissions:
- \`kms:ReEncryptFrom\` on the source KMS key (specified in the policy)
- \`kms:ReEncryptTo\` on the destination KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="ReEncrypt"
  description="Re-encrypt data with a new KMS key."
  parameters={REQUEST_PARAMETERS}
  exampleResponse={{
    "CiphertextBlob": "AQICAHiWj6qDgGqSQXkNHcsbq8Q3+q6lThTZqXXRRXYtGhEQXwEH5qV5eN9LQI6CtDwBUvNVAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQM6v4DhjrVUqgdqVEuAgEQgDsgli8KqqW4qp0g9ZWnHdRGYc3ZJzpV3xH9qVGFRwzVVKJNK/Ey/fGS2tl4TOQXLcTYJMEOxR8gPjA=",
    "SourceKeyId": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab",
    "KeyId": "arn:verenc:111122223333:key/0987dcba-09fe-87dc-65ba-ab0987654321",
    "SourceEncryptionAlgorithm": "SYMMETRIC_DEFAULT",
    "DestinationEncryptionAlgorithm": "SYMMETRIC_DEFAULT"
  }}
/> 