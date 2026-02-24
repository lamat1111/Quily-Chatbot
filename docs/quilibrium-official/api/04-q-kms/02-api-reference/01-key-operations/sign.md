---
sidebar_label: Sign
title: Sign
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
    description: 'Must be "TrentService.Sign"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "string",
    description: "Identifies the asymmetric KMS key to use for signing. This must be the ID or ARN of an asymmetric KMS key with a KeyUsage of SIGN_VERIFY.",
    required: true
  },
  {
    name: "Message",
    type: "blob",
    description: "The message to be signed. The message can be up to 4096 bytes.",
    required: true
  },
  {
    name: "MessageType",
    type: "string",
    description: "Specifies the type of the message. Valid values are RAW or DIGEST.",
    required: false
  },
  {
    name: "SigningAlgorithm",
    type: "string",
    description: "The signing algorithm to use. Valid values depend on the key spec of the KMS key.",
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
    description: "The Amazon Resource Name (ARN) of the asymmetric KMS key that was used to sign the message."
  },
  {
    name: "Signature",
    description: "The cryptographic signature that was generated for the message."
  },
  {
    name: "SigningAlgorithm",
    description: "The signing algorithm that was used to generate the signature."
  }
];

# Sign

Creates a digital signature for a message or message digest using an asymmetric KMS key.

## Description

The \`Sign\` operation uses the private key in an asymmetric KMS key to generate a digital signature for a message or message digest. To verify the signature, use the \`Verify\` operation or use the public key downloaded from QKMS to verify the signature outside of QKMS.

:::note
- The KMS key must be asymmetric and its \`KeyUsage\` must be \`SIGN_VERIFY\`.
- The maximum message size is 4096 bytes.
- The message can be a message digest or a raw message.
- The signing algorithm must be compatible with the key spec of the KMS key.
:::

## Request Syntax

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.Sign"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "Message": "SGVsbG8gV29ybGQ=",
      "MessageType": "RAW",
      "SigningAlgorithm": "RSASSA_PSS_SHA_256"
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

### Example 1: Sign a message using RSA

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.Sign"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "Message": "SGVsbG8gV29ybGQ=",
      "MessageType": "RAW",
      "SigningAlgorithm": "RSASSA_PSS_SHA_256"
    }
  }}
  response={{
    status: 200,
    headers: {
      "Content-Type": "application/x-amz-json-1.1"
    },
    body: {
      "KeyId": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab",
      "Signature": "Base64-encoded signature",
      "SigningAlgorithm": "RSASSA_PSS_SHA_256"
    }
  }}
/>

### Example 2: Sign a message digest using ECC

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.Sign"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "Message": "Base64-encoded message digest",
      "MessageType": "DIGEST",
      "SigningAlgorithm": "ECDSA_SHA_384"
    }
  }}
  response={{
    status: 200,
    headers: {
      "Content-Type": "application/x-amz-json-1.1"
    },
    body: {
      "KeyId": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab",
      "Signature": "Base64-encoded signature",
      "SigningAlgorithm": "ECDSA_SHA_384"
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
      "Signature": "blob",
      "SigningAlgorithm": "string"
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

To use the \`Sign\` operation, you must have the following permissions:
- \`kms:Sign\` on the KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="Sign"
  description="Create a digital signature for a message or message digest."
  parameters={[
    {
      name: "keyId",
      type: "string",
      required: true,
      placeholder: "1234abcd-12ab-34cd-56ef-1234567890ab",
      description: "The identifier of the asymmetric KMS key to use for signing"
    },
    {
      name: "message",
      type: "string",
      required: true,
      placeholder: "SGVsbG8gV29ybGQ=",
      description: "The message or message digest to sign (base64-encoded)"
    },
    {
      name: "messageType",
      type: "string",
      required: false,
      placeholder: "RAW",
      description: "The type of the message (RAW or DIGEST)"
    },
    {
      name: "signingAlgorithm",
      type: "string",
      required: true,
      placeholder: "RSASSA_PSS_SHA_256",
      description: "The signing algorithm to use"
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
    "Signature": "Base64-encoded signature",
    "SigningAlgorithm": "RSASSA_PSS_SHA_256"
  }}
/> 