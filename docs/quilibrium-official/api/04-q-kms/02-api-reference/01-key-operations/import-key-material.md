---
sidebar_label: ImportKeyMaterial
title: ImportKeyMaterial
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
    description: 'Must be "TrentService.ImportKeyMaterial"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "EncryptedKeyMaterial",
    type: "blob",
    description: "The encrypted key material to import. The key material must be encrypted with the public key from the same GetParametersForImport response.",
    required: true
  },
  {
    name: "ExpirationModel",
    type: "string",
    description: "Specifies whether the key material expires.<br/><br/>Valid Values: <span class=\"valid-value\">KEY_MATERIAL_EXPIRES | KEY_MATERIAL_DOES_NOT_EXPIRE.</span>",
    required: true
  },
  {
    name: "ImportToken",
    type: "blob",
    description: "The import token that you received in the response to a previous GetParametersForImport request.",
    required: true
  },
  {
    name: "KeyId",
    type: "string",
    description: "The identifier of the KMS key to import the key material into. This must identify a symmetric encryption KMS key with no key material.",
    required: true
  },
  {
    name: "ValidTo",
    type: "timestamp",
    description: "The time at which the imported key material expires. Required when ExpirationModel is KEY_MATERIAL_EXPIRES.",
    required: false
  }
];

# ImportKeyMaterial

Imports key material into a KMS key.

## Description

The `ImportKeyMaterial` operation imports key material into a KMS key. This operation completes the process of importing key material into QKMS. Before calling this operation, you must first call `GetParametersForImport` to get the public key and import token.

:::note
- The KMS key must be in a compatible key state and have no key material.
- The key material must be encrypted with the public key from a `GetParametersForImport` response.
- The import token must be from the same `GetParametersForImport` response.
- The public key, import token, and encrypted key material must be from the same `GetParametersForImport` response.
- For more information about importing key material, see [Importing Key Material](/docs/api/q-kms/user-manual/importing-key-material).
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
      "X-Amz-Target": "TrentService.ImportKeyMaterial"
    },
    body: {
      "EncryptedKeyMaterial": "AQICAHiBzWrXqca+q2GRHuHjYWJP+Xz9sXBxqt/9pB1lXKg4HQGZ4gXL/8Aw/zrIQEUHAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQM6v4DhjrVUqgdqVEuAgEQgDsgli8KqqW4qp0g9ZWnHdRGYc3ZJzpV3xH9qVGFRwzVVKJNK/Ey/fGS2tl4TOQXLcTYJMEOxR8gPjA=",
      "ExpirationModel": "KEY_MATERIAL_EXPIRES",
      "ImportToken": "AQICAHiBzWrXqca+q2GRHuHjYWJP+Xz9sXBxqt/9pB1lXKg4HQGZ4gXL/8Aw/zrIQEUHAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQM6v4DhjrVUqgdqVEuAgEQgDsgli8KqqW4qp0g9ZWnHdRGYc3ZJzpV3xH9qVGFRwzVVKJNK/Ey/fGS2tl4TOQXLcTYJMEOxR8gPjA=",
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "ValidTo": 1668815672.0
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
| ExpiredImportTokenException | The request was rejected because the provided import token has expired. |
| IncorrectKeyMaterialException | The request was rejected because the provided key material is invalid or incompatible with the KMS key. |
| InvalidArnException | The request was rejected because a specified ARN was not valid. |
| InvalidCiphertextException | The request was rejected because the specified ciphertext has been corrupted or is otherwise invalid. |
| InvalidImportTokenException | The request was rejected because the provided import token is invalid or is not associated with the specified KMS key. |
| KMSInternalException | An internal error occurred. |
| KMSInvalidStateException | The request was rejected because the key state is not valid for this operation. |
| NotFoundException | The request was rejected because the specified entity or resource could not be found. |

## Permissions

To use the `ImportKeyMaterial` operation, you must have the following permissions:
- `kms:ImportKeyMaterial` on the KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="ImportKeyMaterial"
  description="Import key material into a KMS key."
  parameters={REQUEST_PARAMETERS}
  exampleResponse={{}}
/> 