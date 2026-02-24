---
sidebar_label: TagResource
title: TagResource
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
    description: 'Must be "TrentService.TagResource"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "string",
    description: "Identifies the KMS key you are tagging. Specify the key ID or key ARN of the KMS key.",
    required: true
  },
  {
    name: "Tags",
    type: "Array of Tags",
    description: "One or more tags. Each tag consists of a tag key and a tag value. Consists of TagKey and TagValue pairs.",
    required: true
  }
];

# TagResource

Adds or edits tags on a KMS key.

## Description

Adds one or more tags to a KMS key. Each tag consists of a tag key and a tag value. Tag keys and tag values are both required, but tag values can be empty (null) strings.

You cannot use the same tag key more than once per KMS key. If you specify a tag key that is already associated with the KMS key, `TagResource` updates the tag value of that tag.

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
      "X-Amz-Target": "TrentService.TagResource"
    },
    body: {
    "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
    "Tags": [
      {
        "TagKey": "Purpose",
        "TagValue": "Test"
      },
      {
        "TagKey": "Environment",
        "TagValue": "Production"
      }
    ]
}
  }}
  response={{}}
/>

## Response Elements

This operation has no response elements.

## Special Errors

| Error Code | Description |
|------------|-------------|
| InvalidArnException | The request was rejected because a specified ARN, or an ARN in a key policy, is not valid. |
| KMSInvalidStateException | The request was rejected because the state of the specified resource is not valid for this request. |
| KMSNotFoundException | The request was rejected because the specified entity or resource could not be found. |
| TagException | The request was rejected because one or more tags are not valid. |
| TooManyTagsException | The request was rejected because the number of tags on the KMS key exceeds the limit. |

## Permissions

To use the `TagResource` operation, you must have the following permissions:
- `kms:TagResource` on the KMS key

## Try It Out

<ApiTester
  operation="TagResource"
  description="Add or edit tags on a KMS key."
  parameters={REQUEST_PARAMETERS}
  exampleResponse={{}}
/> 