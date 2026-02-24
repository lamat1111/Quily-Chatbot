---
sidebar_label: VerifyMac
title: VerifyMac
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
    description: 'Must be "TrentService.VerifyMac"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "string",
    description: "Identifies the KMS key that will be used to verify the MAC. This must be the ID or ARN of a KMS key with a KeyUsage of GENERATE_VERIFY_MAC.",
    required: true
  },
  {
    name: "Message",
    type: "blob",
    description: "The message that was used to generate the MAC. The message can be up to 4096 bytes.",
    required: true
  },
  {
    name: "MacAlgorithm",
    type: "string",
    description: "The MAC algorithm that was used to generate the MAC. Valid values are HMAC_SHA_224, HMAC_SHA_256, HMAC_SHA_384, or HMAC_SHA_512.",
    required: true
  },
  {
    name: "Mac",
    type: "blob",
    description: "The MAC to verify. This is the value of the MAC field that was returned by the GenerateMAC operation.",
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
    description: "The Amazon Resource Name (ARN) of the KMS key that was used to verify the MAC."
  },
  {
    name: "MacValid",
    description: "A Boolean value that indicates whether the MAC is valid."
  },
  {
    name: "MacAlgorithm",
    description: "The MAC algorithm that was used to verify the MAC."
  }
];

# VerifyMac

Verifies the integrity and authenticity of a message using a message authentication code (MAC).

## Description

The \`VerifyMac\` operation uses a KMS key to verify a message authentication code (MAC). This operation is the complement of the \`GenerateMAC\` operation. If the MAC is valid, the \`VerifyMac\` operation returns a \`MacValid\` value of \`true\`. If the MAC is not valid, the operation returns a \`MacValid\` value of \`false\`.

:::note
- The KMS key must have a \`KeyUsage\` value of \`GENERATE_VERIFY_MAC\`.
- The maximum message size is 4096 bytes.
- The MAC algorithm must match the one used in the GenerateMAC request.
:::

## Request Syntax

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.VerifyMac"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "Message": "SGVsbG8gV29ybGQ=",
      "MacAlgorithm": "HMAC_SHA_256",
      "Mac": "Base64-encoded MAC value"
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

### Example 1: Verify a MAC using HMAC-SHA-256

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.VerifyMac"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "Message": "SGVsbG8gV29ybGQ=",
      "MacAlgorithm": "HMAC_SHA_256",
      "Mac": "Base64-encoded MAC value"
    }
  }}
  response={{
    status: 200,
    headers: {
      "Content-Type": "application/x-amz-json-1.1"
    },
    body: {
      "KeyId": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab",
      "MacValid": true,
      "MacAlgorithm": "HMAC_SHA_256"
    }
  }}
/>

### Example 2: Verify a MAC using HMAC-SHA-512

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.VerifyMac"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "Message": "SGVsbG8gV29ybGQ=",
      "MacAlgorithm": "HMAC_SHA_512",
      "Mac": "Base64-encoded MAC value"
    }
  }}
  response={{
    status: 200,
    headers: {
      "Content-Type": "application/x-amz-json-1.1"
    },
    body: {
      "KeyId": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab",
      "MacValid": true,
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
      "MacValid": "boolean",
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
| MacInvalidException | The request was rejected because the MAC verification failed. |

## Permissions

To use the \`VerifyMac\` operation, you must have the following permissions:
- \`kms:VerifyMac\` on the KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="VerifyMac"
  description="Verify a message authentication code (MAC) for a message."
  parameters={[
    {
      name: "keyId",
      type: "string",
      required: true,
      placeholder: "1234abcd-12ab-34cd-56ef-1234567890ab",
      description: "The identifier of the KMS key to use for MAC verification"
    },
    {
      name: "message",
      type: "string",
      required: true,
      placeholder: "SGVsbG8gV29ybGQ=",
      description: "The message that was used to generate the MAC (base64-encoded)"
    },
    {
      name: "macAlgorithm",
      type: "string",
      required: true,
      placeholder: "HMAC_SHA_256",
      description: "The MAC algorithm that was used"
    },
    {
      name: "mac",
      type: "string",
      required: true,
      placeholder: "Base64-encoded MAC value",
      description: "The MAC to verify"
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
    "MacValid": true,
    "MacAlgorithm": "HMAC_SHA_256"
  }}
/> 