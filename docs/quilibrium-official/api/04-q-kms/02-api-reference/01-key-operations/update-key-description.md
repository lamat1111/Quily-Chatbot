---
sidebar_label: UpdateKeyDescription
title: UpdateKeyDescription
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
    description: 'Must be "TrentService.UpdateKeyDescription"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "string",
    description: "The identifier of the KMS key whose description you want to update. This can be the key ID or key ARN of the KMS key.",
    required: true
  },
  {
    name: "Description",
    type: "string",
    description: "The new description for the KMS key.",
    required: true
  }
];

# UpdateKeyDescription

Updates the description of a KMS key.

## Description

The `UpdateKeyDescription` operation changes the description of a KMS key. The description is a free-text string that can help you identify the purpose or usage of the key.

:::note
- You cannot change the description of a KMS key that is pending deletion.
- The description field can contain up to 8,192 characters.
- Updating the description does not affect the functionality of the KMS key.
- The new description is not a part of the key material and is not included in cryptographic operations.
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
      "X-Amz-Target": "TrentService.UpdateKeyDescription"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "Description": "Example description for test key"
    }
  }}
  response={{}}
/>

## Response Elements

This operation returns no response data.

## Special Errors

| Error Code | Description |
|------------|-------------|
| DependencyTimeoutException | The system timed out while trying to fulfill the request. |
| InvalidArnException | The request was rejected because a specified ARN was not valid. |
| KMSInternalException | An internal error occurred. |
| KMSInvalidStateException | The request was rejected because the key state is not valid for this operation. |
| NotFoundException | The request was rejected because the specified entity or resource could not be found. |

## Permissions

To use the `UpdateKeyDescription` operation, you must have the following permissions:
- `kms:UpdateKeyDescription` on the KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="UpdateKeyDescription"
  description="Update the description of a KMS key."
  parameters={REQUEST_PARAMETERS}
  exampleResponse={{}}
/> 