---
sidebar_label: EnableKeyRotation
title: EnableKeyRotation
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
    description: 'Must be "TrentService.EnableKeyRotation"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "string",
    description: "The identifier of the KMS key whose key material will be rotated automatically. This can be the key ID or key ARN of the KMS key.",
    required: true
  }
];

# EnableKeyRotation

Enables automatic rotation of the key material for a KMS key.

## Description

The \`EnableKeyRotation\` operation enables automatic rotation of the key material for a symmetric customer managed KMS key. You cannot enable automatic rotation of asymmetric KMS keys, KMS keys in custom key stores, or AWS managed keys.

:::note
- When you enable key rotation, QKMS automatically creates new cryptographic material for the KMS key one year after enabling and every year thereafter.
- The KMS key that you use for this operation must be in a compatible key state.
- You cannot enable automatic rotation for AWS managed keys.
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
      "X-Amz-Target": "TrentService.EnableKeyRotation"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab"
    }
  }}
  response={{}}
/>

## Examples

### Example 1: Enable automatic key rotation for a KMS key

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.EnableKeyRotation"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab"
    }
  }}
  response={{
    status: 200,
    headers: {
      "Content-Type": "application/x-amz-json-1.1"
    }
  }}
/>

## Response Elements

This operation returns no response data.

## Special Errors

| Error Code | Description |
|------------|-------------|
| DependencyTimeoutException | The system timed out while trying to fulfill the request. |
| DisabledException | The request was rejected because the specified KMS key is disabled. |
| InvalidArnException | The key ARN provided is not valid. |
| KMSInternalException | An internal error occurred. |
| KMSInvalidStateException | The request was rejected because the key state is not valid for this operation. |
| NotFoundException | The request was rejected because the specified key was not found. |
| UnsupportedOperationException | The request was rejected because a specified parameter is not supported or a specified resource is not valid for this operation. |

## Permissions

To use the \`EnableKeyRotation\` operation, you must have the following permissions:
- \`kms:EnableKeyRotation\` on the KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="EnableKeyRotation"
  description="Enable automatic key rotation for a KMS key."
  parameters={REQUEST_PARAMETERS}
  exampleResponse={{}}
/> 