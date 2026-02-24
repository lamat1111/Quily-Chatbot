---
sidebar_label: DeriveSharedSecret
title: DeriveSharedSecret
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
    description: 'Must be "TrentService.DeriveSharedSecret"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "string",
    description: "Specifies the KMS key that contains the private key in the key pair. The value can be the ID or ARN of a KMS key.",
    required: true
  },
  {
    name: "PublicKey",
    type: "blob",
    description: "The public key of the other party in the key agreement scheme. This key must use the same algorithm as your KMS key.",
    required: true
  },
  {
    name: "RecipientInfo",
    type: "blob",
    description: "Information about the party that will receive the shared secret. This parameter is optional and is used only by some key agreement algorithms.",
    required: false
  }
];

export const RESPONSE_ELEMENTS = [
  {
    name: "KeyId",
    description: "The Amazon Resource Name (ARN) of the KMS key that was used in the key agreement operation."
  },
  {
    name: "SharedSecret",
    description: "The shared secret that was derived from the key agreement operation."
  }
];

# DeriveSharedSecret

Combines the caller's private key and the recipient's public key to create a unique shared secret.

## Description

The \`DeriveSharedSecret\` operation performs a key agreement operation that combines the private key from a KMS key with a public key provided by the caller. This operation returns a shared secret that is unique to each combination of private and public key pair.

:::note
- The KMS key you use for this operation must be an asymmetric KMS key with a key usage of \`DERIVE_SHARED_SECRET\`.
- The public key must use the same algorithm as your KMS key.
- The shared secret is not stored by QKMS. You must use it immediately or store it securely.
:::

## Request Syntax

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.DeriveSharedSecret"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "PublicKey": "Base64-encoded public key",
      "RecipientInfo": "Base64-encoded recipient info"
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

### Example 1: Derive a shared secret using a KMS key

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.DeriveSharedSecret"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "PublicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA..."
    }
  }}
  response={{
    status: 200,
    headers: {
      "Content-Type": "application/x-amz-json-1.1"
    },
    body: {
      "KeyId": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab",
      "SharedSecret": "Base64-encoded shared secret"
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
      "SharedSecret": "blob"
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
| InvalidPublicKeyException | The request was rejected because the provided public key is invalid or incompatible with the KMS key. |
| KMSInternalException | The request was rejected because an internal error occurred. |
| KMSInvalidStateException | The request was rejected because the key state is not valid for this operation. |
| NotFoundException | The request was rejected because the specified entity or resource could not be found. |
| UnsupportedOperationException | The request was rejected because a specified parameter is not supported or a specified resource is not valid for this operation. |

## Permissions

To use the \`DeriveSharedSecret\` operation, you must have the following permissions:
- \`kms:DeriveSharedSecret\` on the KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="DeriveSharedSecret"
  description="Derive a shared secret using a KMS key."
  parameters={[
    {
      name: "keyId",
      type: "string",
      required: true,
      placeholder: "1234abcd-12ab-34cd-56ef-1234567890ab",
      description: "The identifier of the KMS key to use for the key agreement operation"
    },
    {
      name: "publicKey",
      type: "string",
      required: true,
      placeholder: "Base64-encoded public key",
      description: "The public key to use in the key agreement operation"
    },
    {
      name: "recipientInfo",
      type: "string",
      required: false,
      placeholder: "Base64-encoded recipient info",
      description: "Optional information about the recipient"
    }
  ]}
  exampleResponse={{
    "KeyId": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab",
    "SharedSecret": "Base64-encoded shared secret"
  }}
/> 