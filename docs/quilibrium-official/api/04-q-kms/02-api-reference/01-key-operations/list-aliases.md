---
sidebar_label: ListAliases
title: ListAliases
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
    description: 'Must be "TrentService.ListAliases"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "string",
    description: "Lists only aliases that refer to the specified KMS key. The value can be the ID or ARN of a KMS key.",
    required: false
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
    name: "Aliases",
    description: "A list of aliases."
  },
  {
    name: "Aliases[].AliasArn",
    description: "The Amazon Resource Name (ARN) of the alias."
  },
  {
    name: "Aliases[].AliasName",
    description: "The name of the alias."
  },
  {
    name: "Aliases[].CreationDate",
    description: "The date and time that the alias was created."
  },
  {
    name: "Aliases[].LastUpdatedDate",
    description: "The date and time that the alias was last updated."
  },
  {
    name: "Aliases[].TargetKeyId",
    description: "The ID of the KMS key that the alias refers to."
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

# ListAliases

Gets a list of all aliases in the caller's account and region.

## Description

The `ListAliases` operation gets a list of all aliases in the caller's account and region. You can optionally filter the list to only aliases that are associated with a particular KMS key.

:::note
- The response might include multiple grants for the same KMS key.
- An alias name can contain only alphanumeric characters, forward slashes (/), underscores (_), and dashes (-).
- The alias must start with the word "alias/" followed by the alias name.
:::

## Request Syntax

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.ListAliases"
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

### Example 1: List all aliases in the account and region

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.ListAliases"
    },
    body: {}
  }}
  response={{
    status: 200,
    headers: {
      "Content-Type": "application/x-amz-json-1.1"
    },
    body: {
      "Aliases": [
        {
          "AliasArn": "arn:verenc:111122223333:alias/test-key",
          "AliasName": "alias/test-key",
          "CreationDate": 1668815672.0,
          "LastUpdatedDate": 1668815672.0,
          "TargetKeyId": "1234abcd-12ab-34cd-56ef-1234567890ab"
        }
      ],
      "Truncated": false
    }
  }}
/>

### Example 2: List aliases for a specific KMS key

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.ListAliases"
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
      "Aliases": [
        {
          "AliasArn": "arn:verenc:111122223333:alias/test-key",
          "AliasName": "alias/test-key",
          "CreationDate": 1668815672.0,
          "LastUpdatedDate": 1668815672.0,
          "TargetKeyId": "1234abcd-12ab-34cd-56ef-1234567890ab"
        }
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
      "Aliases": [
        {
          "AliasArn": "string",
          "AliasName": "string",
          "CreationDate": "number",
          "LastUpdatedDate": "number",
          "TargetKeyId": "string"
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
| InvalidArnException | The request was rejected because a specified ARN was not valid. |
| InvalidMarkerException | The request was rejected because the marker that specifies where pagination should next begin is not valid. |
| KMSInternalException | An internal error occurred. |
| NotFoundException | The request was rejected because the specified entity or resource could not be found. |

## Permissions

To use the `ListAliases` operation, you must have the following permissions:
- `kms:ListAliases` on the KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="ListAliases"
  description="List aliases in your account and region."
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
    "Aliases": [
      {
        "AliasArn": "arn:verenc:111122223333:alias/test-key",
        "AliasName": "alias/test-key",
        "CreationDate": 1668815672.0,
        "LastUpdatedDate": 1668815672.0,
        "TargetKeyId": "1234abcd-12ab-34cd-56ef-1234567890ab"
      }
    ],
    "Truncated": false
  }}
/> 