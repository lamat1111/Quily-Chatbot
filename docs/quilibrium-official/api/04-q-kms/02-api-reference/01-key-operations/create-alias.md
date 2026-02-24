---
sidebar_label: CreateAlias
title: CreateAlias
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
    description: 'Must be "TrentService.CreateAlias"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "AliasName",
    type: "string",
    description: "The alias name. The name must begin with 'alias/' followed by a name, such as 'alias/ExampleAlias'.",
    required: true
  },
  {
    name: "TargetKeyId",
    type: "string",
    description: "The unique identifier of the KMS key that the alias will be associated with. This value can be the key ID or the key ARN of the KMS key.",
    required: true
  }
];

# CreateAlias

Creates a friendly name (alias) for a KMS key.

## Description

The \`CreateAlias\` operation creates a display name for a KMS key. An alias is a friendly name that you can use to identify a KMS key in the console and in some QKMS operations. Each alias is associated with exactly one KMS key at a time, but a KMS key can have multiple aliases.

:::note
- Each alias must be unique in the account and region. To simplify key management, you can use the same alias in different regions to refer to different keys.
- The alias name must begin with \`alias/\` followed by a name that contains only alphanumeric characters, forward slashes (/), underscores (_), and dashes (-).
- The alias name cannot begin with \`alias/aws/\` as this prefix is reserved for QKMS managed keys.
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
      "X-Amz-Target": "TrentService.CreateAlias"
    },
    body: {
      "AliasName": "alias/ExampleAlias",
      "TargetKeyId": "1234abcd-12ab-34cd-56ef-1234567890ab"
    }
  }}
  response={{}}
/>

## Examples

### Example 1: Create an alias for a KMS key

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.CreateAlias"
    },
    body: {
      "AliasName": "alias/ExampleAlias",
      "TargetKeyId": "1234abcd-12ab-34cd-56ef-1234567890ab"
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
| AlreadyExistsException | The alias you are trying to create already exists. |
| DependencyTimeoutException | The system timed out while trying to fulfill the request. |
| InvalidAliasNameException | The alias name is not valid. |
| KMSInternalException | An internal error occurred. |
| KMSInvalidStateException | The request was rejected because the key state is not valid for this operation. |
| LimitExceededException | The request was rejected because a quota was exceeded. |
| NotFoundException | The request was rejected because the specified key was not found. |

## Permissions

To use the \`CreateAlias\` operation, you must have the following permissions:
- \`kms:CreateAlias\` on the alias (specified in the policy)
- \`kms:CreateAlias\` on the KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="CreateAlias"
  description="Create an alias for a KMS key."
  parameters={REQUEST_PARAMETERS}
  exampleResponse={{}}
/> 