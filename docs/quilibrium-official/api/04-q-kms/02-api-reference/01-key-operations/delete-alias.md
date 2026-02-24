---
sidebar_label: DeleteAlias
title: DeleteAlias
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
    description: 'Must be "TrentService.DeleteAlias"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "AliasName",
    type: "string",
    description: "The alias to delete. The name must begin with 'alias/' followed by the alias name, such as 'alias/ExampleAlias'.",
    required: true
  }
];

# DeleteAlias

Deletes an alias.

## Description

The \`DeleteAlias\` operation removes the specified alias from the account and region. You cannot delete an alias that is being used by a KMS key. First, update the key to stop using the alias, then delete the alias.

:::note
- Because an alias is not a property of a KMS key, you can delete and change the aliases of a KMS key without affecting the KMS key.
- After you delete an alias, you cannot reuse it until the deletion is complete.
- If you delete an alias that is the only alias for a KMS key, the KMS key is not affected, but it no longer has any aliases.
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
      "X-Amz-Target": "TrentService.DeleteAlias"
    },
    body: {
      "AliasName": "alias/ExampleAlias"
    }
  }}
  response={{}}
/>

## Examples

### Example 1: Delete an alias

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.DeleteAlias"
    },
    body: {
      "AliasName": "alias/ExampleAlias"
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
| KMSInternalException | The request was rejected because an internal error occurred. |
| KMSInvalidStateException | The request was rejected because the state of the specified resource is not valid for this operation. |
| NotFoundException | The request was rejected because the specified alias was not found. |

## Permissions

To use the \`DeleteAlias\` operation, you must have the following permissions:
- \`kms:DeleteAlias\` on the alias
- \`kms:DeleteAlias\` on the KMS key

## Try It Out

<ApiTester
  operation="DeleteAlias"
  description="Delete an alias for a KMS key."
  parameters={REQUEST_PARAMETERS}
  exampleResponse={{}}
/> 