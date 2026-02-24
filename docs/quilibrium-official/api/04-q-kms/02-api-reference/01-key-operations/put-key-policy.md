---
sidebar_label: PutKeyPolicy
title: PutKeyPolicy
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
    description: 'Must be "TrentService.PutKeyPolicy"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "string",
    description: "The identifier of the KMS key to attach the key policy to. This can be the key ID or key ARN of the KMS key.",
    required: true
  },
  {
    name: "PolicyName",
    type: "string",
    description: 'The name of the key policy. Currently, the only valid name is "default".',
    required: true
  },
  {
    name: "Policy",
    type: "string",
    description: "The key policy to attach to the KMS key. The key policy must be in JSON format.",
    required: true
  },
  {
    name: "BypassPolicyLockoutSafetyCheck",
    type: "boolean",
    description: "A flag to indicate whether to bypass the key policy lockout safety check. Setting this value to true increases the risk that the KMS key becomes unmanageable. Do not set this value to true indiscriminately.",
    required: false
  }
];

# PutKeyPolicy

Attaches a key policy to the specified KMS key.

## Description

The \`PutKeyPolicy\` operation attaches a key policy to the specified KMS key. If the key already has a policy attached, the new policy replaces the existing one.

:::note
- Currently, QKMS supports only one key policy per KMS key.
- The only valid policy name is "default".
- The key policy size limit is 32 kilobytes (32768 bytes).
- For help writing and formatting a key policy, see [Key Policies](/docs/api/q-kms/user-manual/key-policies).
- Changes to the key policy take effect immediately.
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
      "X-Amz-Target": "TrentService.PutKeyPolicy"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "PolicyName": "default",
      "Policy": "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Sid\":\"Enable IAM User Permissions\",\"Effect\":\"Allow\",\"Principal\":{\"AWS\":\"arn:aws:iam::111122223333:root\"},\"Action\":\"kms:*\",\"Resource\":\"*\"}]}",
      "BypassPolicyLockoutSafetyCheck": false
    }
  }}
  response={{}}
/>

## Examples

### Example 1: Attach a key policy to a KMS key

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.PutKeyPolicy"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "PolicyName": "default",
      "Policy": "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Sid\":\"Enable IAM User Permissions\",\"Effect\":\"Allow\",\"Principal\":{\"AWS\":\"arn:aws:iam::111122223333:root\"},\"Action\":\"kms:*\",\"Resource\":\"*\"}]}"
    }
  }}
  response={{
    status: 200,
    headers: {
      "Content-Type": "application/x-amz-json-1.1"
    },
    body: {}
  }}
/>

### Example 2: Attach a key policy with safety check bypass

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.PutKeyPolicy"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "PolicyName": "default",
      "Policy": "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Sid\":\"Enable IAM User Permissions\",\"Effect\":\"Allow\",\"Principal\":{\"AWS\":\"arn:aws:iam::111122223333:user/username\"},\"Action\":\"kms:*\",\"Resource\":\"*\"}]}",
      "BypassPolicyLockoutSafetyCheck": true
    }
  }}
  response={{
    status: 200,
    headers: {
      "Content-Type": "application/x-amz-json-1.1"
    },
    body: {}
  }}
/>

## Special Errors

| Error Code | Description |
|------------|-------------|
| DependencyTimeoutException | The system timed out while trying to fulfill the request. |
| InvalidArnException | The request was rejected because a specified ARN was not valid. |
| KMSInternalException | An internal error occurred. |
| KMSInvalidStateException | The request was rejected because the key state is not valid for this operation. |
| LimitExceededException | The request was rejected because a quota was exceeded. |
| MalformedPolicyDocumentException | The request was rejected because the specified policy document was malformed. |
| NotFoundException | The request was rejected because the specified entity or resource could not be found. |
| UnsupportedOperationException | The request was rejected because a specified parameter is not supported or a specified resource is not valid for this operation. |

## Permissions

To use the \`PutKeyPolicy\` operation, you must have the following permissions:
- \`kms:PutKeyPolicy\` on the KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="PutKeyPolicy"
  description="Attach a key policy to a KMS key."
  parameters={REQUEST_PARAMETERS}
  exampleResponse={{}}
/> 