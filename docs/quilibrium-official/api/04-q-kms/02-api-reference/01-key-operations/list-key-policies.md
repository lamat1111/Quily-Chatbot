---
sidebar_label: ListKeyPolicies
title: ListKeyPolicies
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
    description: 'Must be "TrentService.ListKeyPolicies"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "string",
    description: "The identifier of the KMS key. The value can be the ID or ARN of a KMS key.",
    required: true
  },
  {
    name: "Limit",
    type: "integer",
    description: "Use this parameter to specify the maximum number of items to return. When this value is present, QKMS does not return more than the specified number of items, but it might return fewer.",
    required: false
  },
  {
    name: "Marker",
    type: "string",
    description: "Use this parameter in a subsequent request after you receive a response with truncated results. Set it to the value of NextMarker from the truncated response you just received.",
    required: false
  }
];

export const RESPONSE_ELEMENTS = [
  {
    name: "PolicyNames",
    description: "A list of key policy names. Currently, there is only one key policy per KMS key and it is always named 'default'."
  },
  {
    name: "NextMarker",
    description: "When Truncated is true, this value is present and contains the value to use for the Marker parameter in a subsequent request."
  },
  {
    name: "Truncated",
    description: "A flag that indicates whether there are more items in the list. When this value is true, the list in this response is truncated. To get more items, pass the value of the NextMarker element in subsequent requests."
  }
];

# ListKeyPolicies

Gets the names of the key policies that are attached to a KMS key.

## Description

The `ListKeyPolicies` operation gets the names of the key policies that are attached to a KMS key. This operation is designed to get policy names that you can use in a `GetKeyPolicy` operation.

:::note
- The only valid policy name is `default`.
- This operation does not return the policy document. To get the policy document, use the `GetKeyPolicy` operation.
:::

## Request Syntax

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.ListKeyPolicies"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "Limit": 20,
      "Marker": "eyJlbmNyeXB0ZWREYXRhIjpbMTIsMzQsNTYsNzgsOTBdfQ=="
    }
  }}
  response={{}}
/>

## Request Parameters

### Headers

<ParamsTable parameters={HEADER_PARAMETERS} />

### Request Body

<ParamsTable parameters={REQUEST_PARAMETERS} />

## Examples

### Example 1: List key policies for a KMS key

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.ListKeyPolicies"
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
      "PolicyNames": [
        "default"
      ],
      "Truncated": false
    }
  }}
/>

## Response Syntax

<ApiExample
  request={{}}
  response={{
    status: 200,
    headers: {
      "Content-Type": "application/x-amz-json-1.1"
    },
    body: {
      "PolicyNames": ["string"],
      "NextMarker": "string",
      "Truncated": "boolean"
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
| InvalidMarkerException | The request was rejected because the marker that specifies where pagination should next begin is not valid. |
| KMSInternalException | An internal error occurred. |
| KMSInvalidStateException | The request was rejected because the key state is not valid for this operation. |
| NotFoundException | The request was rejected because the specified entity or resource could not be found. |

## Permissions

To use the `ListKeyPolicies` operation, you must have the following permissions:
- `kms:ListKeyPolicies` on the KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="ListKeyPolicies"
  description="List key policies for a KMS key."
  parameters={[
    ...REQUEST_PARAMETERS.map(param => ({
      name: param.name.toLowerCase(),
      type: param.type === "integer" ? "number" : param.type,
      required: param.required,
      placeholder: param.name === "KeyId" ? "1234abcd-12ab-34cd-56ef-1234567890ab" :
                  param.name === "Limit" ? "20" : "Base64-encoded pagination token",
      description: param.description
    }))
  ]}
  exampleResponse={{
    "PolicyNames": [
      "default"
    ],
    "Truncated": false
  }}
/> 