---
sidebar_label: GenerateDataKeyWithoutPlaintext
title: GenerateDataKeyWithoutPlaintext
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
    description: 'Must be "TrentService.GenerateDataKeyWithoutPlaintext"',
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
    description: "The length and type of data key to generate.<br/><br/>Valid Values: AES_256, AES_128.",
    required: false
  },
  {
    name: "NumberOfBytes",
    type: "number",
    description: "The length of the data key in bytes. Use either this parameter or KeySpec, but not both.",
    required: false
  },
  {
    name: "EncryptionContext",
    type: "object",
    description: "A set of key-value pairs that will be cryptographically bound to the data key.",
    required: false
  },
  {
    name: "GrantTokens",
    type: "array",
    description: "A list of grant tokens that represent grants that can be used to generate the data key.",
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
    description: "The Amazon Resource Name (ARN) of the KMS key that was used to encrypt the data key."
  }
];

# GenerateDataKeyWithoutPlaintext

Generates an encrypted data key that you can use in your application.

## Description

The `GenerateDataKeyWithoutPlaintext` operation returns only the encrypted copy of the data key. This operation is useful when you need to generate a data key but don't need to use it immediately.

:::note
- The KMS key that you use for this operation must be in a compatible key state.
- This operation is identical to `GenerateDataKey` but returns only the encrypted copy of the data key.
- To get the plaintext data key, call the `Decrypt` operation on the encrypted data key.
- This operation is useful when you need to move encrypted data keys across security boundaries.
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
      "X-Amz-Target": "TrentService.GenerateDataKeyWithoutPlaintext"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "KeySpec": "AES_256",
      "EncryptionContext": {
        "Department": "Finance"
      }
    }
  }}
  response={{}}
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

To use the `GenerateDataKeyWithoutPlaintext` operation, you must have the following permissions:
- `kms:GenerateDataKeyWithoutPlaintext` on the KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="GenerateDataKeyWithoutPlaintext"
  description="Generate an encrypted data key."
  parameters={REQUEST_PARAMETERS}
  exampleResponse={{
    "CiphertextBlob": "AQICAHiWj6qDgGqSQXkNHcsbq8Q3+q6lThTZqXXRRXYtGhEQXwEH5qV5eN9LQI6CtDwBUvNVAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMeq6+5Ey7LGAKorXtAgEQgDsgli8KqqW4qp0g9ZWnHdRGYc3ZJzpV3xH9qVGFRwzVVKJNK/Ey/fGS2tl4TOQXLcTYJMEOxR8gPjA=",
    "KeyId": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab"
  }}
/> 