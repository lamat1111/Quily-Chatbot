---
sidebar_label: UntagResource
title: UntagResource
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
    description: 'Must be "TrentService.UntagResource"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "string",
    description: "Identifies the KMS key from which you are removing tags. Specify the key ID or key ARN of the KMS key.",
    required: true
  },
  {
    name: "TagKeys",
    type: "array",
    description: "One or more tag keys. Specify only the tag keys, not the tag values.",
    required: true
  }
];

# UntagResource

Removes tags from a KMS key.

## Description

Removes the specified tags from the specified KMS key. When you specify a tag key, the operation removes both the tag key and its associated tag value. To remove multiple tags from multiple KMS keys, use one call to `UntagResource` for each KMS key.

To identify which tags to remove, specify the tag key. The tag key is case sensitive. If you specify a tag key that does not exist on the KMS key, the operation succeeds, but it does not remove a tag.

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
      "X-Amz-Target": "TrentService.UntagResource"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "TagKeys": [
        "Purpose",
        "Environment"
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

## Permissions

To use the `UntagResource` operation, you must have the following permissions:
- `kms:UntagResource` on the KMS key

## Try It Out

<ApiTester
  operation="UntagResource"
  description="Remove tags from a KMS key."
  parameters={REQUEST_PARAMETERS}
  exampleResponse={{}}
/> 