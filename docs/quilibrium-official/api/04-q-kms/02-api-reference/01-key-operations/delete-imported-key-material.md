---
sidebar_label: DeleteImportedKeyMaterial
title: DeleteImportedKeyMaterial
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
    description: 'Must be "TrentService.DeleteImportedKeyMaterial"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "string",
    description: "Identifies the KMS key from which you are deleting imported key material. The value can be the ID or ARN of a KMS key.",
    required: true
  }
];

export const RESPONSE_ELEMENTS = [];

# DeleteImportedKeyMaterial

Deletes the imported key material from a KMS key that was created with imported key material.

## Description

The \`DeleteImportedKeyMaterial\` operation deletes the imported key material from the specified KMS key. This operation makes the KMS key unusable. For more information about importing key material into KMS keys, see [Importing Key Material](/docs/api/q-kms/user-manual/importing-key-material).

:::note
- When this operation is complete, the KMS key's key state changes to \`PendingImport\`.
- After you delete key material, you can use ImportKeyMaterial to reimport the same key material into the KMS key.
- The KMS key that you use for this operation must have been created with the \`Origin\` parameter set to \`EXTERNAL\`.
:::

## Request Syntax

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.DeleteImportedKeyMaterial"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab"
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

### Example 1: Delete imported key material from a KMS key

<ApiExample
  request={{
    method: "POST",
    path: "/",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "TrentService.DeleteImportedKeyMaterial"
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
    body: {}
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
    body: {}
  }}
/>

## Response Elements

This operation returns no response elements.

## Special Errors

| Error Code | Description |
|------------|-------------|
| DependencyTimeoutException | The system timed out while trying to fulfill the request. |
| InvalidArnException | The request was rejected because a specified ARN was not valid. |
| KMSInternalException | The request was rejected because an internal error occurred. |
| KMSInvalidStateException | The request was rejected because the key state is not valid for this operation. |
| NotFoundException | The request was rejected because the specified entity or resource could not be found. |
| UnsupportedOperationException | The request was rejected because a specified parameter is not supported or a specified resource is not valid for this operation. |

## Permissions

To use the \`DeleteImportedKeyMaterial\` operation, you must have the following permissions:
- \`kms:DeleteImportedKeyMaterial\` on the KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="DeleteImportedKeyMaterial"
  description="Delete imported key material from a KMS key."
  parameters={[
    {
      name: "keyId",
      type: "string",
      required: true,
      placeholder: "1234abcd-12ab-34cd-56ef-1234567890ab",
      description: "The identifier of the KMS key from which you are deleting imported key material"
    }
  ]}
  exampleResponse={{}}
/> 