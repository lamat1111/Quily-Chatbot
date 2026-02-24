---
sidebar_label: UpdateAlias
title: UpdateAlias
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
    description: 'Must be "TrentService.UpdateAlias"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "AliasName",
    type: "string",
    description: "The name of the alias to update. The alias name must begin with `alias/`.",
    required: true
  },
  {
    name: "TargetKeyId",
    type: "string",
    description: "The identifier of the KMS key that the alias will be associated with. This can be the key ID or key ARN of the KMS key.",
    required: true
  }
];

# UpdateAlias

Associates an existing alias with a different KMS key.

## Description

The `UpdateAlias` operation associates an existing alias with a different KMS key. Each alias is associated with only one KMS key at a time, although a KMS key can have multiple aliases.

:::note
- The alias and the target KMS key must be in the same account and region.
- You cannot use this operation to change the alias name.
- The current and new target KMS key must be the same type (both symmetric or both asymmetric).
- The current and new target KMS key must have the same key usage.
- The alias name must begin with `alias/`.
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
      "X-Amz-Target": "TrentService.UpdateAlias"
    },
    body: {
      "AliasName": "alias/test",
      "TargetKeyId": "1234abcd-12ab-34cd-56ef-1234567890ab"
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
| KMSInternalException | An internal error occurred. |
| KMSInvalidStateException | The request was rejected because the key state is not valid for this operation. |
| LimitExceededException | The request was rejected because a quota was exceeded. |
| NotFoundException | The request was rejected because the specified entity or resource could not be found. |

## Permissions

To use the `UpdateAlias` operation, you must have the following permissions:
- `kms:UpdateAlias` on the alias (specified in the policy)
- `kms:UpdateAlias` on the current KMS key (specified in the policy)
- `kms:UpdateAlias` on the new target KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="UpdateAlias"
  description="Update an alias to point to a different KMS key."
  parameters={REQUEST_PARAMETERS}
  exampleResponse={{}}
/> 