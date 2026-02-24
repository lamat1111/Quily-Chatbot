---
sidebar_label: EnableKey
title: EnableKey
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
    description: 'Must be "TrentService.EnableKey"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "string",
    description: "The identifier of the KMS key to enable. This can be the key ID or key ARN of the KMS key.",
    required: true
  }
];

# EnableKey

Enables a KMS key.

## Description

The \`EnableKey\` operation enables a KMS key. After the key is enabled, you can use it for cryptographic operations. This operation is part of the key lifecycle management.

:::note
- After a key is enabled, the key state changes to \`Enabled\`.
- You can disable the key again using the \`DisableKey\` operation.
- Enabling a KMS key that is scheduled for deletion does not cancel its deletion.
- The KMS key that you use for this operation must be in a compatible key state.
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
      "X-Amz-Target": "TrentService.EnableKey"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab"
    }
  }}
  response={{}}
/>

## Examples

### Example 1: Enable a KMS key

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.EnableKey"
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
| LimitExceededException | The request was rejected because a quota was exceeded. |
| NotFoundException | The request was rejected because the specified key was not found. |

## Permissions

To use the \`EnableKey\` operation, you must have the following permissions:
- \`kms:EnableKey\` on the KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="EnableKey"
  description="Enable a KMS key."
  parameters={REQUEST_PARAMETERS}
  exampleResponse={{}}
/> 