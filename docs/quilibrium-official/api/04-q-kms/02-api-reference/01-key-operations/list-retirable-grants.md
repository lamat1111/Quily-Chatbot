---
sidebar_label: ListRetirableGrants
title: ListRetirableGrants
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
    description: 'Must be "TrentService.ListRetirableGrants"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "RetiringPrincipal",
    type: "string",
    description: "The principal that can retire the grant. To specify the principal, use the Amazon Resource Name (ARN) of an AWS principal.",
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
    name: "Grants",
    description: "A list of grants that the specified principal can retire."
  },
  {
    name: "Grants[].Constraints",
    description: "A structure that contains additional constraints on the grant."
  },
  {
    name: "Grants[].Constraints.EncryptionContextEquals",
    description: "A list of key-value pairs that must match exactly the encryption context in the request."
  },
  {
    name: "Grants[].Constraints.EncryptionContextSubset",
    description: "A list of key-value pairs that must be included in the encryption context of the request."
  },
  {
    name: "Grants[].CreationDate",
    description: "The date and time when the grant was created."
  },
  {
    name: "Grants[].GrantId",
    description: "The unique identifier for the grant."
  },
  {
    name: "Grants[].GranteePrincipal",
    description: "The principal that receives the grant's permissions."
  },
  {
    name: "Grants[].IssuingAccount",
    description: "The account under which the grant was issued."
  },
  {
    name: "Grants[].KeyId",
    description: "The Amazon Resource Name (ARN) of the KMS key to which the grant applies."
  },
  {
    name: "Grants[].Name",
    description: "The friendly name that identifies the grant."
  },
  {
    name: "Grants[].Operations",
    description: "The list of operations permitted by the grant."
  },
  {
    name: "Grants[].RetiringPrincipal",
    description: "The principal that can retire the grant."
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

# ListRetirableGrants

Gets a list of all grants for which the specified principal is the retiring principal.

## Description

The `ListRetirableGrants` operation returns a list of all grants for which the specified principal is the retiring principal. A retiring principal is a principal that can retire a grant. For more information about grants, see [Using Grants](/docs/api/q-kms/user-manual/using-grants).

:::note
- The retiring principal must be specified.
- The response might include multiple grants for the same KMS key.
- When there are multiple grants, use the `GrantId` to distinguish between them.
:::

## Request Syntax

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.ListRetirableGrants"
    },
    body: {
      "Limit": 20,
      "Marker": "eyJlbmNyeXB0ZWREYXRhIjpbMTIsMzQsNTYsNzgsOTBdfQ==",
      "RetiringPrincipal": "arn:aws:iam::111122223333:role/AdminRole"
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

### Example 1: List retirable grants for a principal

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.ListRetirableGrants"
    },
    body: {
      "RetiringPrincipal": "arn:aws:iam::111122223333:role/AdminRole"
    }
  }}
  response={{
    status: 200,
    headers: {
      "Content-Type": "application/x-amz-json-1.1"
    },
    body: {
      "Grants": [
        {
          "CreationDate": 1668815672.0,
          "GrantId": "abcde1234a123",
          "GranteePrincipal": "arn:aws:iam::111122223333:role/ExampleRole",
          "IssuingAccount": "arn:aws:iam::111122223333:root",
          "KeyId": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab",
          "Operations": [
            "Decrypt",
            "Encrypt"
          ],
          "RetiringPrincipal": "arn:aws:iam::111122223333:role/AdminRole"
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
      "Grants": [
        {
          "Constraints": {
            "EncryptionContextEquals": {
              "string": "string"
            },
            "EncryptionContextSubset": {
              "string": "string"
            }
          },
          "CreationDate": "number",
          "GrantId": "string",
          "GranteePrincipal": "string",
          "IssuingAccount": "string",
          "KeyId": "string",
          "Name": "string",
          "Operations": ["string"],
          "RetiringPrincipal": "string"
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

To use the `ListRetirableGrants` operation, you must have the following permissions:
- `kms:ListRetirableGrants` on the KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="ListRetirableGrants"
  description="List grants that can be retired by a principal."
  parameters={[
    ...REQUEST_PARAMETERS.map(param => ({
      name: param.name.toLowerCase(),
      type: param.type === "integer" ? "number" : param.type,
      required: param.required,
      placeholder: param.name === "RetiringPrincipal" ? "arn:aws:iam::111122223333:role/AdminRole" :
                  param.name === "Limit" ? "20" : "Base64-encoded pagination token",
      description: param.description
    }))
  ]}
  exampleResponse={{
    "Grants": [
      {
        "CreationDate": 1668815672.0,
        "GrantId": "abcde1234a123",
        "GranteePrincipal": "arn:aws:iam::111122223333:role/ExampleRole",
        "IssuingAccount": "arn:aws:iam::111122223333:root",
        "KeyId": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab",
        "Operations": [
          "Decrypt",
          "Encrypt"
        ],
        "RetiringPrincipal": "arn:aws:iam::111122223333:role/AdminRole"
      }
    ],
    "Truncated": false
  }}
/> 