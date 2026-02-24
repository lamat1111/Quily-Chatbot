---
sidebar_label: GetKeyPolicy
title: GetKeyPolicy
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
    description: 'Must be "TrentService.GetKeyPolicy"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "string",
    description: "The identifier of the KMS key whose key policy you want to retrieve. This can be the key ID or key ARN of the KMS key.",
    required: true
  },
  {
    name: "PolicyName",
    type: "string",
    description: 'Specifies the name of the key policy to retrieve. Currently, the only valid name is "default".',
    required: true
  }
];

export const RESPONSE_ELEMENTS = [
  {
    name: "Policy",
    description: "A key policy document in JSON format."
  }
];

# GetKeyPolicy

Gets a key policy attached to the specified KMS key.

## Description

The \`GetKeyPolicy\` operation retrieves a key policy attached to a KMS key. By default, this operation returns the default key policy.

:::note
- The KMS key that you use for this operation must be in a compatible key state.
- The policy document returned by this operation is the actual policy that is in effect, not a template or default policy.
- If you specify a policy name other than the default policy, the operation fails unless that policy exists.
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
      "X-Amz-Target": "TrentService.GetKeyPolicy"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "PolicyName": "default"
    }
  }}
  response={{}}
/>

## Examples

### Example 1: Get the default key policy for a KMS key

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.GetKeyPolicy"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "PolicyName": "default"
    }
  }}
  response={{
    status: 200,
    headers: {
      "Content-Type": "application/x-amz-json-1.1"
    },
    body: {
      "Policy": "{\"Version\":\"2012-10-17\",\"Id\":\"key-default-1\",\"Statement\":[{\"Sid\":\"Enable IAM User Permissions\",\"Effect\":\"Allow\",\"Principal\":{\"AWS\":\"arn:aws:iam::111122223333:root\"},\"Action\":\"kms:*\",\"Resource\":\"*\"}]}"
    }
  }}
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

To use the \`GetKeyPolicy\` operation, you must have the following permissions:
- \`kms:GetKeyPolicy\` on the KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="GetKeyPolicy"
  description="Get a key policy for a KMS key."
  parameters={REQUEST_PARAMETERS}
  exampleResponse={{
    "Policy": "{\"Version\":\"2012-10-17\",\"Id\":\"key-default-1\",\"Statement\":[{\"Sid\":\"Enable IAM User Permissions\",\"Effect\":\"Allow\",\"Principal\":{\"AWS\":\"arn:aws:iam::111122223333:root\"},\"Action\":\"kms:*\",\"Resource\":\"*\"}]}"
  }}
/> 