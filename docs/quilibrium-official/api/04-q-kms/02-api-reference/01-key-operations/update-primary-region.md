---
sidebar_label: UpdatePrimaryRegion
title: UpdatePrimaryRegion
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
    description: 'Must be "TrentService.UpdatePrimaryRegion"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "string",
    description: "Identifies the current primary key. You can use the key ID or key ARN of the primary key.",
    required: true
  },
  {
    name: "PrimaryRegion",
    type: "string",
    description: "The Region of the current replica key that you want to make the primary key.",
    required: true
  }
];

# UpdatePrimaryRegion

Updates the primary region of a multi-Region key.

## Description

The `UpdatePrimaryRegion` operation changes the primary region of a multi-Region key to a different region. When you update the primary region, KMS creates a new primary key in the specified region and updates the key material and metadata of all related multi-Region keys to match the new primary key.

:::note
- This operation is only valid for multi-Region keys.
- The specified Region must already have a replica key.
- You cannot perform this operation on a key in a Region that is scheduled for deletion.
- While the operation is in progress, the key state of all affected multi-Region keys is `UPDATING`.
- This operation can take several minutes to complete.
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
      "X-Amz-Target": "TrentService.UpdatePrimaryRegion"
    },
    body: {
      "KeyId": "mrk-1234abcd12ab34cd56ef1234567890ab",
      "PrimaryRegion": "us-west-2"
    }
  }}
  response={{}}
/>

## Response Elements

This operation returns no response data.

## Special Errors

| Error Code | Description |
|------------|-------------|
| DependencyTimeoutException | The system timed out while trying to fulfill the request. |
| InvalidArnException | The request was rejected because a specified ARN was not valid. |
| KMSInternalException | An internal error occurred. |
| KMSInvalidStateException | The request was rejected because the key state is not valid for this operation. |
| NotFoundException | The request was rejected because the specified entity or resource could not be found. |
| UnsupportedOperationException | The request was rejected because a specified parameter is not supported or a specified resource is not valid for this operation. |

## Permissions

To use the `UpdatePrimaryRegion` operation, you must have the following permissions:
- `kms:UpdatePrimaryRegion` on both the current primary key and the new primary key

## Try It Out

<ApiTester
  operation="UpdatePrimaryRegion"
  description="Update the primary region of a multi-Region key."
  parameters={REQUEST_PARAMETERS}
  exampleResponse={{}}
/> 