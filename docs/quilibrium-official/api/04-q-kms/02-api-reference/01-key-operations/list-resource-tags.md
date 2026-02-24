---
sidebar_label: ListResourceTags
title: ListResourceTags
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
    description: 'Must be "TrentService.ListResourceTags"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "string",
    description: "Identifies the KMS key whose tags you want to list. Specify the key ID or key ARN of the KMS key.",
    required: true
  },
  {
    name: "Limit",
    type: "integer",
    description: "Use this parameter to specify the maximum number of items to return. When this value is present, Q-KMS does not return more than the specified number of items, but it might return fewer.",
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
    name: "NextMarker",
    description: "When Truncated is true, this element is present and contains the value to use for the Marker parameter in a subsequent request."
  },
  {
    name: "Tags",
    description: "A list of tags. Each tag consists of a tag key and a tag value.",
    children: [
      {
        name: "TagKey",
        description: "The key of the tag."
      },
      {
        name: "TagValue",
        description: "The value of the tag."
      }
    ]
  },
  {
    name: "Truncated",
    description: "A flag that indicates whether there are more items in the list. When this value is true, the list in this response is truncated. To get more items, pass the value of the NextMarker element in subsequent requests."
  }
];

# ListResourceTags

Returns all tags on the specified KMS key.

## Description

Returns all tags on the specified KMS key. For help finding the key ID and ARN of a KMS key, use the `ListKeys` or `DescribeKey` operations.

This operation uses pagination. Use the Marker parameter in a subsequent request to retrieve more items. When there are no more items to return, the response does not include a Marker value.

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
      "X-Amz-Target": "TrentService.ListResourceTags"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "Limit": 10,
      "Marker": "eyJlbmNyeXB0..."
    }
  }}
  response={{}}
/>

## Response Elements

<ParamsTable responseElements={RESPONSE_ELEMENTS} type="response" />

## Special Errors

| Error Code | Description |
|------------|-------------|
| InvalidArnException | The request was rejected because a specified ARN, or an ARN in a key policy, is not valid. |
| InvalidMarkerException | The request was rejected because the marker that specifies where pagination should next begin is not valid. |
| KMSInvalidStateException | The request was rejected because the state of the specified resource is not valid for this request. |
| KMSNotFoundException | The request was rejected because the specified entity or resource could not be found. |

## Permissions

To use the `ListResourceTags` operation, you must have the following permissions:
- `kms:ListResourceTags` on the KMS key

## Try It Out

<ApiTester
  operation="ListResourceTags"
  description="List tags for a KMS key."
  parameters={REQUEST_PARAMETERS}
  exampleResponse={{
    "NextMarker": "eyJlbmNyeXB0...",
    "Tags": [
      {
        "TagKey": "Purpose",
        "TagValue": "Test"
      },
      {
        "TagKey": "Environment",
        "TagValue": "Production"
      }
    ],
    "Truncated": true
  }}
/> 