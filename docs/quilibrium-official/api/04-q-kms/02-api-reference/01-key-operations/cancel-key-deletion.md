---
sidebar_label: CancelKeyDeletion
title: CancelKeyDeletion
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
    description: 'Must be "TrentService.CancelKeyDeletion"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "string",
    description: "The unique identifier of the KMS key whose deletion you want to cancel. This value can be the key ID or the key ARN of the KMS key.",
    required: true
  }
];

export const RESPONSE_ELEMENTS = [
  {
    name: "KeyId",
    description: "The Amazon Resource Name (ARN) of the KMS key whose deletion was canceled."
  }
];

# CancelKeyDeletion

Cancels the deletion of a KMS key.

## Description

The \`CancelKeyDeletion\` operation cancels the deletion of a KMS key. When this operation succeeds, the key state changes to \`Disabled\`. To enable the key, you must use the \`EnableKey\` operation.

This operation is part of the key deletion process. For more information about deleting keys, see [Deleting Keys](/docs/api/q-kms/user-manual/deleting-keys).

:::note
- The KMS key that you use for this operation must be in a compatible key state. For details, see [Key states required for operations](/docs/api/q-kms/user-manual/key-states).
- After a key deletion is canceled, the key is still disabled. You must enable it before you can use it again.
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
      "X-Amz-Target": "TrentService.CancelKeyDeletion"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab"
    }
  }}
  response={{}}
/>

## Response Elements

<ParamsTable responseElements={RESPONSE_ELEMENTS} type="response" />

## Examples

### Example 1: Cancel deletion of a KMS key

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.CancelKeyDeletion"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab"
    }
  }}
  response={{
    status: 200,
    headers: {
      "Content-Type": "application/x-amz-json-1.1"
    },
    body: {
      "KeyId": "arn:aws:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab"
    }
  }}
/>

## Special Errors

| Error Code | Description |
|------------|-------------|
| DependencyTimeoutException | The system timed out while trying to fulfill the request. |
| InvalidArnException | The key ARN provided is not valid. |
| KMSInternalException | An internal error occurred. |
| KMSInvalidStateException | The request was rejected because the key state is not valid for this operation. |
| NotFoundException | The request was rejected because the specified key was not found. |

## Permissions

To use the \`CancelKeyDeletion\` operation, you must have the following permissions:
- \`kms:CancelKeyDeletion\` on the KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="CancelKeyDeletion"
  description="Cancel the scheduled deletion of a KMS key."
  parameters={REQUEST_PARAMETERS}
  exampleResponse={{
    "KeyId": "arn::verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab"
  }}
/> 