---
sidebar_label: CreateGrant
title: CreateGrant
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
    description: 'Must be "TrentService.CreateGrant"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "text",
    description: "The unique identifier for the KMS key that the grant applies to.",
    required: true,
    placeholder: "1234abcd-12ab-34cd-56ef-1234567890ab"
  },
  {
    name: "GranteePrincipal",
    type: "text",
    description: "The principal that is given permission to perform the operations that the grant permits.",
    required: true,
    placeholder: "arn:aws:iam::111122223333:role/ExampleRole"
  },
  {
    name: "Operations",
    type: "text",
    description: "A list of operations that the grant permits (as JSON array).",
    required: true,
    placeholder: '["Decrypt", "Encrypt"]'
  },
  {
    name: "RetiringPrincipal",
    type: "text",
    description: "The principal that is given permission to retire the grant by using RetireGrant operation.",
    required: false,
    placeholder: "arn:aws:iam::111122223333:role/RetireRole"
  },
  {
    name: "Constraints",
    type: "text",
    description: "A structure that you can use to allow the operations permitted by the grant only when the grant request includes particular encryption context keys or values (as JSON object).",
    required: false,
    placeholder: '"{\"EncryptionContextSubset\": {\"Department\": \"Finance\"}}"'
  },
  {
    name: "Name",
    type: "text",
    description: "A friendly name for identifying the grant. Use the same name to refer to the same grant in subsequent requests.",
    required: false,
    placeholder: "ExampleGrant"
  }
];

export const RESPONSE_ELEMENTS = [
  {
    name: "GrantId",
    description: "The unique identifier for the grant."
  },
  {
    name: "GrantToken",
    description: "The grant token. Use this value to establish the scope of the grant during its early phase, before the grant is replicated to all Q-KMS hosts."
  }
];

# CreateGrant

Creates a grant for a KMS key. A grant is a policy instrument that allows AWS principals to use KMS keys in cryptographic operations.

## Description

A grant gives AWS principals long-term permissions to use KMS keys in cryptographic operations. You can create a grant to allow a principal to use the KMS key in specified operations. You can also use a grant to allow the principal to delegate their grant permissions to other principals.

## Request Syntax

### Headers

<ParamsTable parameters={HEADER_PARAMETERS} type="request" />

### Request Body

<ParamsTable parameters={REQUEST_PARAMETERS} type="request" />

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.CreateGrant"
    },
    body: `{
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "GranteePrincipal": "arn:aws:iam::111122223333:role/ExampleRole",
      "Operations": [
        "Decrypt",
        "Encrypt"
      ],
      "Name": "ExampleGrant"
    }`
  }}
  response={{}}
/>

## Response Elements

<ParamsTable responseElements={RESPONSE_ELEMENTS} type="response" />

## Examples

### Example 1: Create a grant for encryption and decryption

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.CreateGrant"
    },
    body: `{
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "GranteePrincipal": "arn:aws:iam::111122223333:role/ExampleRole",
      "Operations": [
        "Decrypt",
        "Encrypt"
      ],
      "Name": "ExampleGrant"
    }`
  }}
  response={{
    status: 200,
    headers: {
      "Content-Type": "application/x-amz-json-1.1"
    },
    body: `{
      "GrantId": "0c237476b39f8bc44e45212e08498fbe3151305030726c0590dd8d3e9f3d6a60",
      "GrantToken": "AQpAM2RhZTk1MGMyNTk2ZmCjsrRInph6PxKRieR4..."
    }`
  }}
/>

### Example 2: Create a grant with encryption context constraints

<!-- <ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.CreateGrant"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "GranteePrincipal": "arn:aws:iam::111122223333:role/ExampleRole",
      "Operations": [
        "Decrypt",
        "Encrypt"
      ],
      "Constraints": {
        "EncryptionContextSubset": {
          "Department": "Finance",
          "Purpose": "Test"
        }
      },
      "Name": "ExampleGrantWithConstraints"
    }
  }}
  response={{
    status: 200,
    headers: {
      "Content-Type": "application/x-amz-json-1.1"
    },
    body: {
      "GrantId": "0c237476b39f8bc44e45212e08498fbe3151305030726c0590dd8d3e9f3d6a60",
      "GrantToken": "AQpAM2RhZTk1MGMyNTk2ZmCjsrRInph6PxKRieR4..."
    }
  }}
/> -->

## Special Errors

| Error Code | Description |
|------------|-------------|
| DependencyTimeoutException | The system timed out while trying to fulfill the request. |
| DisabledException | The request was rejected because the specified KMS key is disabled. |
| InvalidArnException | The request was rejected because a specified ARN was not valid. |
| InvalidGrantTokenException | The request was rejected because the specified grant token is not valid. |
| KeyUnavailableException | The request was rejected because the specified KMS key was not available. |
| KMSInternalException | The request was rejected because an internal error occurred. |
| KMSInvalidStateException | The request was rejected because the state of the specified resource is not valid for this request. |
| LimitExceededException | The request was rejected because a quota was exceeded. |
| NotFoundException | The request was rejected because the specified entity or resource could not be found. |

## Permissions

To use the \`CreateGrant\` operation, you must have the following permissions:
- \`kms:CreateGrant\` on the KMS key

## Try It Out

<ApiTester
  operation="CreateGrant"
  description="Create a grant for a KMS key to allow specific cryptographic operations."
  parameters={[
    ...HEADER_PARAMETERS,
    ...REQUEST_PARAMETERS,
  ]}
  exampleResponse={{
    "GrantId": "0c237476b39f8bc44e45212e08498fbe3151305030726c0590dd8d3e9f3d6a60",
    "GrantToken": "AQpAM2RhZTk1MGMyNTk2ZmCjsrRInph6PxKRieR4..."
  }}
/> 