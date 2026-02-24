---
sidebar_label: GetBucketWebsite
title: GetBucketWebsite
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ApiTester from '@site/src/components/ApiTester';
import ParamsTable from '@site/src/components/ParamsTable';
import ApiExample from '@site/src/components/ApiExample';

export const HEADER_PARAMETERS = [
  {
    name: "x-amz-expected-bucket-owner",
    type: "text",
    description: "The account ID of the expected bucket owner",
    required: false,
    placeholder: "123456789012"
  }
];

export const RESPONSE_HEADERS = [
  {
    name: "x-amz-id-2",
    description: "An identifier for the request"
  },
  {
    name: "x-amz-request-id",
    description: "A unique identifier for the request"
  },
  {
    name: "Date",
    description: "The date and time at which the response was sent"
  }
];

export const RESPONSE_ELEMENTS = [
  {
    name: "WebsiteConfiguration",
    description: "Container for website configuration. See <a href='/docs/api/q-storage/api-reference/data-types/website-configuration'>WebsiteConfiguration</a> for details."
  },
  {
    name: "IndexDocument",
    description: "Container for the index document suffix configuration. See <a href='/docs/api/q-storage/api-reference/data-types/index-document'>IndexDocument</a> for details."
  },
  {
    name: "ErrorDocument",
    description: "Container for the error document configuration. See <a href='/docs/api/q-storage/api-reference/data-types/error-document'>ErrorDocument</a> for details."
  },
  {
    name: "RedirectAllRequestsTo",
    description: "Container for redirect all requests to another website. See <a href='/docs/api/q-storage/api-reference/data-types/redirect-all-requests-to'>RedirectAllRequestsTo</a> for details."
  },
  {
    name: "RoutingRules",
    description: "Container for routing rules. See <a href='/docs/api/q-storage/api-reference/data-types/routing-rule'>RoutingRule</a> for details."
  }
];

# GetBucketWebsite

Returns the website configuration for a bucket.

## Description

The `GetBucketWebsite` operation returns the website configuration associated with a bucket. To host a website on QStorage, you can configure a bucket as a static website.

:::note
- To use this operation, you must have permission to perform the `s3:GetBucketWebsite` action.
- You must be the bucket owner to use this operation.
- If the bucket does not have a website configuration, QStorage returns a `NoSuchWebsiteConfiguration` error.
:::

## Request Syntax

<ApiExample
  request={{
    method: "GET",
    path: "/?website",
    headers: {
      "Host": "_BucketName_.qstorage.quilibrium.com",
      "x-amz-expected-bucket-owner": "_OwnerAccountId_"
    }
  }}
  response={{}}
/>

This operation does not have a request body.

## Request Parameters

### Headers

<ParamsTable parameters={HEADER_PARAMETERS} />

## Examples

### Example 1: Get bucket website configuration

<ApiExample
  request={{
    method: "GET",
    path: "/?website",
    headers: {
      "Host": "_my-bucket_.qstorage.quilibrium.com"
    }
  }}
  response={{
    status: 200,
    headers: {
      "x-amz-id-2": "_Example7qoYGN7uMuFuYS6m7a4l_",
      "x-amz-request-id": "_TX234S0F24A06C7_",
      "Date": "_Wed, 01 Mar 2024 12:00:00 GMT_"
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<WebsiteConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <IndexDocument>
      <Suffix>index.html</Suffix>
   </IndexDocument>
   <ErrorDocument>
      <Key>error.html</Key>
   </ErrorDocument>
   <RoutingRules>
      <RoutingRule>
         <Condition>
            <KeyPrefixEquals>docs/</KeyPrefixEquals>
            <HttpErrorCodeReturnedEquals>404</HttpErrorCodeReturnedEquals>
         </Condition>
         <Redirect>
            <Protocol>https</Protocol>
            <HostName>docs.example.com</HostName>
            <ReplaceKeyWith>index.html</ReplaceKeyWith>
            <HttpRedirectCode>301</HttpRedirectCode>
         </Redirect>
      </RoutingRule>
   </RoutingRules>
</WebsiteConfiguration>`
  }}
/>

## Response Syntax

<ApiExample
  request={{}}
  response={{
    status: 200,
    headers: {
      "x-amz-id-2": "_RequestId_",
      "x-amz-request-id": "_AmazonRequestId_",
      "Date": "_ISO8601Date_"
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<WebsiteConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <IndexDocument>
      <Suffix>_IndexDocumentSuffix_</Suffix>
   </IndexDocument>
   <ErrorDocument>
      <Key>_ErrorDocumentKey_</Key>
   </ErrorDocument>
   <RedirectAllRequestsTo>
      <HostName>_HostName_</HostName>
      <Protocol>_Protocol_</Protocol>
   </RedirectAllRequestsTo>
   <RoutingRules>
      <RoutingRule>
         <Condition>
            <KeyPrefixEquals>_PrefixMatch_</KeyPrefixEquals>
            <HttpErrorCodeReturnedEquals>_HttpErrorCode_</HttpErrorCodeReturnedEquals>
         </Condition>
         <Redirect>
            <Protocol>_Protocol_</Protocol>
            <HostName>_HostName_</HostName>
            <ReplaceKeyPrefixWith>_ReplaceKeyPrefix_</ReplaceKeyPrefixWith>
            <ReplaceKeyWith>_ReplaceKey_</ReplaceKeyWith>
            <HttpRedirectCode>_RedirectHttpCode_</HttpRedirectCode>
         </Redirect>
      </RoutingRule>
   </RoutingRules>
</WebsiteConfiguration>`
  }}
/>

## Response Elements

### Response Headers

<ParamsTable responseElements={RESPONSE_HEADERS} type="response" />

### Response Body Elements

<ParamsTable responseElements={RESPONSE_ELEMENTS} type="response" />

## Special Errors

| Error Code | Description |
|------------|-------------|
| NoSuchBucket | The specified bucket does not exist |
| NoSuchWebsiteConfiguration | The specified bucket does not have a website configuration |
| 403 | Forbidden. Authentication failed or you do not have permission to get the bucket website configuration |

## Permissions

You must have the `s3:GetBucketWebsite` permission.

## Try It Out

<ApiTester
  operation="GetBucketWebsite"
  description="Get the website configuration of a bucket."
  parameters={[
    {
      name: "bucketName",
      type: "text",
      required: true,
      placeholder: "my-bucket",
      description: "Name of the bucket to get website configuration from"
    },
    ...HEADER_PARAMETERS
  ]}
  exampleResponse={{
    "WebsiteConfiguration": {
      "IndexDocument": {
        "Suffix": "index.html"
      },
      "ErrorDocument": {
        "Key": "error.html"
      },
      "RoutingRules": [
        {
          "Condition": {
            "KeyPrefixEquals": "docs/",
            "HttpErrorCodeReturnedEquals": "404"
          },
          "Redirect": {
            "Protocol": "https",
            "HostName": "docs.example.com",
            "ReplaceKeyWith": "index.html",
            "HttpRedirectCode": "301"
          }
        }
      ]
    }
  }}
/> 