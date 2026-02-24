---
sidebar_label: GetKeyRotationStatus
title: GetKeyRotationStatus
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
    description: 'Must be "TrentService.GetKeyRotationStatus"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "string",
    description: "The identifier of the KMS key to query. This can be the key ID or key ARN of the KMS key.",
    required: true
  }
];

export const RESPONSE_ELEMENTS = [
  {
    name: "KeyRotationEnabled",
    description: "A Boolean value that specifies whether key rotation is enabled."
  }
];

# GetKeyRotationStatus

Gets the rotation status for a KMS key.

## Description

The `GetKeyRotationStatus` operation retrieves the current status of automatic key rotation for a customer managed KMS key.

:::note
- This operation works only on symmetric encryption KMS keys. You cannot enable or disable automatic rotation of asymmetric KMS keys.
- Automatic key rotation is not available for KMS keys in custom key stores.
- The KMS key must be in a compatible key state to determine its rotation status.
- When automatic key rotation is enabled, QKMS automatically creates new cryptographic material for the KMS key one year after enabling and every year thereafter.
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
      "X-Amz-Target": "TrentService.GetKeyRotationStatus"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab"
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
| InvalidArnException | The request was rejected because a specified ARN was not valid. |
| KMSInternalException | An internal error occurred. |
| KMSInvalidStateException | The request was rejected because the key state is not valid for this operation. |
| NotFoundException | The request was rejected because the specified entity or resource could not be found. |
| UnsupportedOperationException | The request was rejected because a specified parameter is not supported or a specified resource is not valid for this operation. |

## Permissions

To use the `GetKeyRotationStatus` operation, you must have the following permissions:
- `kms:GetKeyRotationStatus` on the KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="GetKeyRotationStatus"
  description="Get the rotation status for a KMS key."
  parameters={REQUEST_PARAMETERS}
  exampleResponse={{
    "KeyRotationEnabled": true
  }}
/> 