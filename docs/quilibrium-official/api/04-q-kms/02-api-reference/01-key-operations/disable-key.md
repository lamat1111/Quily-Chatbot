---
sidebar_label: DisableKey
title: DisableKey
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
    description: 'Must be "TrentService.DisableKey"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "string",
    description: "The identifier of the KMS key to disable. This can be the key ID or key ARN of the KMS key.",
    required: true
  }
];

# DisableKey

Disables a KMS key.

## Description

The \`DisableKey\` operation disables a KMS key. A disabled key cannot be used in cryptographic operations. This operation is part of the key lifecycle management.

:::note
- After a key is disabled, the key state changes to \`Disabled\`.
- You can re-enable the key using the \`EnableKey\` operation.
- Disabling a KMS key does not delete it. You can still view its metadata and re-enable it.
- This operation is not reversible for keys that are scheduled for deletion.
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
      "X-Amz-Target": "TrentService.DisableKey"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab"
    }
  }}
  response={{}}
/>

## Examples

### Example 1: Disable a KMS key

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.DisableKey"
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
| InvalidArnException | The key ARN provided is not valid. |
| KMSInternalException | An internal error occurred. |
| KMSInvalidStateException | The request was rejected because the key state is not valid for this operation. |
| NotFoundException | The request was rejected because the specified key was not found. |

## Permissions

To use the \`DisableKey\` operation, you must have the following permissions:
- \`kms:DisableKey\` on the KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="DisableKey"
  description="Disable a KMS key."
  parameters={REQUEST_PARAMETERS}
  exampleResponse={{}}
/> 