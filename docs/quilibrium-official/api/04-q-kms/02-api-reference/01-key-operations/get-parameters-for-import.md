---
sidebar_label: GetParametersForImport
title: GetParametersForImport
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
    description: 'Must be "TrentService.GetParametersForImport"',
    required: true
  }
];

export const REQUEST_PARAMETERS = [
  {
    name: "KeyId",
    type: "string",
    description: "The identifier of the KMS key that will be associated with the imported key material. This must identify a symmetric encryption KMS key with no key material.",
    required: true
  },
  {
    name: "WrappingAlgorithm",
    type: "string",
    description: "The algorithm you will use to encrypt the key material before importing it.<br/><br/>Valid Values: <span class=\"valid-value\">RSAES_OAEP_SHA_1 | RSAES_OAEP_SHA_256.</span>",
    required: true
  },
  {
    name: "WrappingKeySpec",
    type: "string",
    description: "The type of wrapping key (public key) to return in the response. Currently, the only valid value is RSA_2048.",
    required: true
  }
];

export const RESPONSE_ELEMENTS = [
  {
    name: "ImportToken",
    description: "The import token to send in a subsequent ImportKeyMaterial request."
  },
  {
    name: "KeyId",
    description: "The Amazon Resource Name (ARN) of the KMS key to use in a subsequent ImportKeyMaterial request."
  },
  {
    name: "ParametersValidTo",
    description: "The time at which the import token and public key are no longer valid. After this time, you cannot use them to make an ImportKeyMaterial request and you must send another GetParametersForImport request."
  },
  {
    name: "PublicKey",
    description: "The public key to use to encrypt the key material before importing it."
  }
];

# GetParametersForImport

Gets the parameters needed to import key material into a KMS key.

## Description

The `GetParametersForImport` operation returns the parameters you need to import key material into a KMS key. This operation is part of the process of importing key material into QKMS.

:::note
- This operation returns a public key and an import token. Use the public key to encrypt the key material that you want to import. Store the import token to send with a subsequent `ImportKeyMaterial` request.
- The public key and import token from the same response must be used together. They can be used only with the KMS key specified in the request.
- The public key and import token are valid only for the time specified in the response.
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
      "X-Amz-Target": "TrentService.GetParametersForImport"
    },
    body: {
      "KeyId": "1234abcd-12ab-34cd-56ef-1234567890ab",
      "WrappingAlgorithm": "RSAES_OAEP_SHA_1",
      "WrappingKeySpec": "RSA_2048"
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
| KMSInternalException | An internal error occurred. |
| KMSInvalidStateException | The request was rejected because the key state is not valid for this operation. |
| NotFoundException | The request was rejected because the specified entity or resource could not be found. |
| UnsupportedOperationException | The request was rejected because a specified parameter is not supported or a specified resource is not valid for this operation. |

## Permissions

To use the `GetParametersForImport` operation, you must have the following permissions:
- `kms:GetParametersForImport` on the KMS key (specified in the policy)

## Try It Out

<ApiTester
  operation="GetParametersForImport"
  description="Get parameters for importing key material into a KMS key."
  parameters={REQUEST_PARAMETERS}
  exampleResponse={{
    "ImportToken": "AQICAHiBzWrXqca+q2GRHuHjYWJP+Xz9sXBxqt/9pB1lXKg4HQGZ4gXL/8Aw/zrIQEUHAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQM6v4DhjrVUqgdqVEuAgEQgDsgli8KqqW4qp0g9ZWnHdRGYc3ZJzpV3xH9qVGFRwzVVKJNK/Ey/fGS2tl4TOQXLcTYJMEOxR8gPjA=",
    "KeyId": "arn:verenc:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab",
    "ParametersValidTo": 1668815672.0,
    "PublicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuYE8HvJDVa3J7k0fvWd8YqZoQKr+7fz9zKg+J4jZ9f0n"
  }}
/> 