---
sidebar_label: ListKeys
title: ListKeys
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
    description: 'Must be "TrentService.ListKeys"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
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
    name: "Keys",
    description: "A list of KMS keys."
  },
  {
    name: "Keys[].KeyId",
    description: "The globally unique identifier for the KMS key."
  },
  {
    name: "Keys[].KeyArn",
    description: "The Amazon Resource Name (ARN) of the KMS key."
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

# ListKeys

Gets a list of all KMS keys in the caller's account and region.

## Description

The `ListKeys` operation gets a list of all KMS keys in the caller's account and region. This operation returns the key ID and Amazon Resource Name (ARN) of each KMS key.

:::note
- The response might include KMS keys that you created and KMS keys that QKMS created on your behalf.
- The response includes both enabled and disabled KMS keys.
- The response includes both customer managed keys and AWS managed keys.
- To get detailed information about a KMS key, use the `DescribeKey` operation.
:::

## Request Syntax

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.ListKeys"
    },
    body: {
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

### Example 1: List all KMS keys in your account

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.ListKeys"
    },
    body: {}
  }}
  response={{
    status: 200,
    headers: {
      "Content-Type": "application/x-amz-json-1.1"
    },
    body: {
      "Keys": [
        {
          "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
          "KeyArn": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab"
        },
        {
          "KeyId": "0987dcba-09fe-87dc-65ba-ab0987654321",
          "KeyArn": "arn:verenc:111122223333:key/0987dcba-09fe-87dc-65ba-ab0987654321"
        }
      ],
      "Truncated": false
    }
  }}
/>

### Example 2: List KMS keys with pagination

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.ListKeys"
    },
    body: {
      "Limit": 1
    }
  }}
  response={{
    status: 200,
    headers: {
      "Content-Type": "application/x-amz-json-1.1"
    },
    body: {
      "Keys": [
        {
          "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
          "KeyArn": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab"
        }
      ],
      "NextMarker": "eyJlbmNyeXB0ZWREYXRhIjpbMTIsMzQsNTYsNzgsOTBdfQ==",
      "Truncated": true
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
      "Keys": [
        {
          "KeyId": "string",
          "KeyArn": "string"
        }
      ],
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
| InvalidMarkerException | The request was rejected because the marker that specifies where pagination should next begin is not valid. |
| KMSInternalException | An internal error occurred. |

## Permissions

To use the `ListKeys` operation, you must have the following permissions:
- `kms:ListKeys` on the KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="ListKeys"
  description="List KMS keys in your account."
  parameters={[
    ...REQUEST_PARAMETERS.map(param => ({
      name: param.name.toLowerCase(),
      type: param.type === "integer" ? "number" : param.type,
      required: param.required,
      placeholder: param.name === "Limit" ? "20" : "Base64-encoded pagination token",
      description: param.description
    }))
  ]}
  exampleResponse={{
    "Keys": [
      {
        "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
        "KeyArn": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab"
      }
    ],
    "Truncated": false
  }}
/> 