---
sidebar_label: ListGrants
title: ListGrants
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
    description: 'Must be "TrentService.ListGrants"',
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
  },
  {
    name: "GrantId",
    type: "string",
    description: "Returns only the grant with the specified grant ID.",
    required: false
  },
  {
    name: "GranteePrincipal",
    type: "string",
    description: "Returns only grants where the specified principal is the grantee principal for the grant.",
    required: false
  }
];

export const RESPONSE_ELEMENTS = [
  {
    name: "Grants",
    description: "A list of grants.",
    children: [
      {
        name: "Constraints",
        description: "A structure that contains additional constraints on the grant.",
        children: [
          {
            name: "EncryptionContextEquals",
            description: "A list of key-value pairs that must match exactly the encryption context in the request."
          },
          {
            name: "EncryptionContextSubset",
            description: "A list of key-value pairs that must be included in the encryption context of the request."
          }
        ]
      },
      {
        name: "CreationDate",
        description: "The date and time when the grant was created."
      },
      {
        name: "GrantId",
        description: "The unique identifier for the grant."
      },
      {
        name: "GranteePrincipal",
        description: "The principal that receives the grant's permissions."
      },
      {
        name: "IssuingAccount",
        description: "The account under which the grant was issued."
      },
      {
        name: "KeyId",
        description: "The Amazon Resource Name (ARN) of the KMS key to which the grant applies."
      },
      {
        name: "Name",
        description: "The friendly name that identifies the grant."
      },
      {
        name: "Operations",
        description: "The list of operations permitted by the grant."
      },
      {
        name: "RetiringPrincipal",
        description: "The principal that can retire the grant."
      }
    ]
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

# ListGrants

Gets a list of all grants for the specified KMS key.

## Description

The `ListGrants` operation gets a list of all grants for the specified KMS key. A grant is a policy instrument that allows QKMS principals to use KMS keys in cryptographic operations. A grant also can allow QKMS principals to view a KMS key (DescribeKey) and create and manage grants.

:::note
- You must specify the KMS key in all requests.
- You can filter the grant list by grant ID or grantee principal.
- The GranteePrincipal field in the grant does not contain the grantee principal's ARN until after the grant is used.
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
      "X-Amz-Target": "TrentService.ListGrants"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "Limit": 20,
      "Marker": "eyJlbmNyeXB0ZWREYXRhIjpbMTIsMzQsNTYsNzgsOTBdfQ=="
    }
  }}
  response={{}}
/>

## Response Elements

<ParamsTable responseElements={RESPONSE_ELEMENTS} type="response" />

## Special Errors

| Error Code | Description |
|------------|-------------|
| DependencyTimeoutException | The system timed out while trying to fulfill the request. |
| InvalidArnException | The request was rejected because a specified ARN was not valid. |
| InvalidGrantIdException | The request was rejected because the specified grant ID is not valid. |
| InvalidMarkerException | The request was rejected because the marker that specifies where pagination should next begin is not valid. |
| KMSInternalException | An internal error occurred. |
| KMSInvalidStateException | The request was rejected because the key state is not valid for this operation. |
| NotFoundException | The request was rejected because the specified entity or resource could not be found. |

## Permissions

To use the `ListGrants` operation, you must have the following permissions:
- `kms:ListGrants` on the KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="ListGrants"
  description="List grants for a KMS key."
  parameters={REQUEST_PARAMETERS}
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