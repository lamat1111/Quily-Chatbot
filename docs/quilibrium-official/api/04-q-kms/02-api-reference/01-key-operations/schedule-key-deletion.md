---
sidebar_label: ScheduleKeyDeletion
title: ScheduleKeyDeletion
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
    description: 'Must be "TrentService.ScheduleKeyDeletion"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "string",
    description: "The identifier of the KMS key to schedule for deletion. This can be the key ID or key ARN of the KMS key.",
    required: true
  },
  {
    name: "PendingWindowInDays",
    type: "integer",
    description: "The waiting period, specified in number of days. After the waiting period ends, QKMS deletes the KMS key. The value must be between 7 and 30, inclusive. If you don't specify a value, QKMS uses 30.",
    required: false
  }
];

export const RESPONSE_ELEMENTS = [
  {
    name: "KeyId",
    description: "The Amazon Resource Name (ARN) of the KMS key that is scheduled for deletion."
  },
  {
    name: "DeletionDate",
    description: "The date and time after which QKMS deletes the KMS key."
  },
  {
    name: "KeyState",
    description: "The current state of the KMS key. When this value is `PendingDeletion`, you cannot use the KMS key for cryptographic operations."
  },
  {
    name: "PendingWindowInDays",
    description: "The number of days remaining in the waiting period before QKMS deletes the KMS key."
  }
];

# ScheduleKeyDeletion

Schedules a KMS key for deletion.

## Description

The `ScheduleKeyDeletion` operation schedules the deletion of a KMS key. By default, QKMS waits 30 days before deleting the key to give you time to recover it if you change your mind. You can specify a waiting period between 7 and 30 days.

:::note
- While the key is pending deletion, its key state is `PendingDeletion`.
- During the waiting period, you can use `CancelKeyDeletion` to cancel the deletion of the KMS key.
- After the waiting period ends, QKMS deletes the KMS key and all related key material.
- Deleting a KMS key is irreversible. After a key is deleted, you can no longer decrypt data that was encrypted under that KMS key.
- Cross-account use: No. You cannot schedule deletion of a KMS key in a different account.
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
      "X-Amz-Target": "TrentService.ScheduleKeyDeletion"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "PendingWindowInDays": 7
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

## Permissions

To use the `ScheduleKeyDeletion` operation, you must have the following permissions:
- `kms:ScheduleKeyDeletion` on the KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="ScheduleKeyDeletion"
  description="Schedule a KMS key for deletion."
  parameters={REQUEST_PARAMETERS}
  exampleResponse={{
    "KeyId": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab",
    "DeletionDate": 1668815672.0,
    "KeyState": "PendingDeletion",
    "PendingWindowInDays": 30
  }}
/> 