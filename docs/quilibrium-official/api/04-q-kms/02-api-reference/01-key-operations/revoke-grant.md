---
sidebar_label: RevokeGrant
title: RevokeGrant
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
    description: 'Must be "TrentService.RevokeGrant"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "string",
    description: "The identifier of the KMS key associated with the grant. This can be the key ID or key ARN of the KMS key.",
    required: true
  },
  {
    name: "GrantId",
    type: "string",
    description: "Identifier of the grant to revoke.",
    required: true
  }
];

# RevokeGrant

Revokes a grant for a KMS key.

## Description

The `RevokeGrant` operation revokes a grant. You can revoke a grant to actively deny operations that depend on it. Unlike `RetireGrant`, which can be called by the retiring principal or grantee principal, `RevokeGrant` requires permission to revoke grants on the KMS key.

:::note
- You must identify the grant to revoke by both the grant ID and the KMS key identifier.
- The operation doesn't return any output. If the request succeeds, the service sends back an HTTP 200 response with an empty HTTP body.
- Cross-account use: Yes. You can revoke a grant on a KMS key in a different account.
- When you revoke a grant, the permissions that it allowed are immediately invalid.
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
      "X-Amz-Target": "TrentService.RevokeGrant"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "GrantId": "abcde1234a123"
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
| InvalidGrantIdException | The request was rejected because the specified grant ID is not valid. |
| KMSInternalException | An internal error occurred. |
| KMSInvalidStateException | The request was rejected because the key state is not valid for this operation. |
| NotFoundException | The request was rejected because the specified entity or resource could not be found. |

## Permissions

To use the `RevokeGrant` operation, you must have the following permissions:
- `kms:RevokeGrant` on the KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="RevokeGrant"
  description="Revoke a grant for a KMS key."
  parameters={REQUEST_PARAMETERS}
  exampleResponse={{}}
/> 