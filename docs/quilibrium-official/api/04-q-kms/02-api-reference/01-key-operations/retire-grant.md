---
sidebar_label: RetireGrant
title: RetireGrant
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
    description: 'Must be "TrentService.RetireGrant"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "GrantToken",
    type: "string",
    description: "Identifies the grant to retire. You can use a grant token to identify a new grant even before it has achieved eventual consistency. Only one of `GrantToken` or `GrantId`/`KeyId` pair must be specified.",
    required: false
  },
  {
    name: "KeyId",
    type: "string",
    description: "The identifier of the KMS key associated with the grant. This can be the key ID or key ARN of the KMS key. Required when you use `GrantId`.",
    required: false
  },
  {
    name: "GrantId",
    type: "string",
    description: "Identifies the grant to retire. Required when you use `KeyId`.",
    required: false
  }
];

# RetireGrant

Retires a grant for a KMS key.

## Description

The `RetireGrant` operation retires a grant. To retire a grant, you can use either the grant token or both the grant ID and a KMS key identifier. After a grant is retired, the permissions that it allowed are no longer valid.

:::note
- You should retire a grant when you're done using it to clean up the grant's permissions.
- You must identify the grant to retire by its grant token or by both the grant ID and the KMS key identifier.
- The operation doesn't return any output. If the request succeeds, the service sends back an HTTP 200 response with an empty HTTP body.
- Cross-account use: Yes. You can retire a grant on a KMS key in a different account.
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
      "X-Amz-Target": "TrentService.RetireGrant"
    },
    body: {
      "GrantToken": "AQpAM2RhZTk1MGMyNTk2ZmZmMzEyYWVhOWViN2I1MWM4Mzc0MWFiYjc0ZDE1ODkyNGFlNTIzODZhMzgyZjBlNDkxOAF4"
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
| InvalidGrantTokenException | The request was rejected because the specified grant token is not valid. |
| KMSInternalException | An internal error occurred. |
| KMSInvalidStateException | The request was rejected because the key state is not valid for this operation. |
| NotFoundException | The request was rejected because the specified entity or resource could not be found. |

## Permissions

To use the `RetireGrant` operation, you must have one of the following:
- Be the retiring principal of the grant
- Be the grantee principal of the grant
- Have `kms:RetireGrant` permission on the KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="RetireGrant"
  description="Retire a grant for a KMS key."
  parameters={REQUEST_PARAMETERS}
  exampleResponse={{}}
/> 