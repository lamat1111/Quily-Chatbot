---
sidebar_label: GenerateMAC
title: GenerateMAC
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
    description: 'Must be "TrentService.GenerateMAC"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "string",
    description: "Specifies the KMS key to use for MAC generation. The KMS key must have a KeyUsage of GENERATE_VERIFY_MAC.",
    required: true
  },
  {
    name: "Message",
    type: "blob",
    description: "The message to be authenticated. The message can contain up to 4096 bytes.",
    required: true
  },
  {
    name: "MacAlgorithm",
    type: "string",
    description: "The MAC algorithm to use. Valid values are HMAC_SHA_224, HMAC_SHA_256, HMAC_SHA_384, or HMAC_SHA_512.",
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
    description: "The Amazon Resource Name (ARN) of the KMS key used to generate the MAC."
  },
  {
    name: "MAC",
    description: "The generated MAC in base64-encoded format."
  },
  {
    name: "MacAlgorithm",
    description: "The MAC algorithm that was used to generate the MAC."
  }
];

# GenerateMAC

Generates a message authentication code (MAC) for a message using a KMS key.

## Description

The \`GenerateMAC\` operation uses the specified KMS key and MAC algorithm to generate a message authentication code (MAC). A MAC is a cryptographic value that helps ensure data integrity and authenticity.

:::note
- The KMS key must have a \`KeyUsage\` value of \`GENERATE_VERIFY_MAC\`.
- The maximum message size is 4096 bytes.
- To verify the MAC, use the \`VerifyMAC\` operation.
:::

## Request Syntax

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.GenerateMAC"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "Message": "SGVsbG8gV29ybGQ=",
      "MacAlgorithm": "HMAC_SHA_256"
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

### Example 1: Generate a MAC using HMAC-SHA-256

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.GenerateMAC"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "Message": "SGVsbG8gV29ybGQ=",
      "MacAlgorithm": "HMAC_SHA_256"
    }
  }}
  response={{
    status: 200,
    headers: {
      "Content-Type": "application/x-amz-json-1.1"
    },
    body: {
      "KeyId": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab",
      "MAC": "Base64-encoded MAC value",
      "MacAlgorithm": "HMAC_SHA_256"
    }
  }}
/>

### Example 2: Generate a MAC using HMAC-SHA-512

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.GenerateMAC"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "Message": "SGVsbG8gV29ybGQ=",
      "MacAlgorithm": "HMAC_SHA_512"
    }
  }}
  response={{
    status: 200,
    headers: {
      "Content-Type": "application/x-amz-json-1.1"
    },
    body: {
      "KeyId": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab",
      "MAC": "Base64-encoded MAC value",
      "MacAlgorithm": "HMAC_SHA_512"
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
      "MAC": "blob",
      "MacAlgorithm": "string"
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

## Permissions

To use the \`GenerateMAC\` operation, you must have the following permissions:
- \`kms:GenerateMAC\` on the KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="GenerateMAC"
  description="Generate a message authentication code (MAC) for a message."
  parameters={[
    {
      name: "keyId",
      type: "string",
      required: true,
      placeholder: "1234abcd-12ab-34cd-56ef-1234567890ab",
      description: "The identifier of the KMS key to use for MAC generation"
    },
    {
      name: "message",
      type: "string",
      required: true,
      placeholder: "SGVsbG8gV29ybGQ=",
      description: "The message to authenticate (base64-encoded)"
    },
    {
      name: "macAlgorithm",
      type: "string",
      required: true,
      placeholder: "HMAC_SHA_256",
      description: "The MAC algorithm to use"
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
    "MAC": "Base64-encoded MAC value",
    "MacAlgorithm": "HMAC_SHA_256"
  }}
/> 