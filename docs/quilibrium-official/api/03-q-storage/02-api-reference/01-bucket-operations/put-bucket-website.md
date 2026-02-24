---
title: PutBucketWebsite
label: PutBucketWebsite
---

import ParamsTable from '@site/src/components/ParamsTable';

# PutBucketWebsite

Sets the website configuration for a bucket. When you enable static website hosting, you can access the website using the bucket's website endpoint.

## Permissions

To use this operation, you must have the `PutBucketWebsite` permission on the bucket. By default, only the bucket owner has this permission.

## Request Headers

export const REQUEST_HEADERS = [
  {
    name: 'Content-MD5',
    description: 'The base64-encoded 128-bit MD5 digest of the website configuration.',
    required: true,
    type: 'String'
  },
  {
    name: 'x-amz-expected-bucket-owner',
    description: 'The account ID of the expected bucket owner.',
    required: false,
    type: 'String'
  }
];

<ParamsTable parameters={REQUEST_HEADERS} type="parameter" />

## Request URI Parameters

export const URI_PARAMETERS = [
  {
    name: 'Bucket',
    description: 'The bucket name.',
    required: true,
    type: 'String'
  }
];

<ParamsTable parameters={URI_PARAMETERS} type="parameter" />

## Request Body

The request must include an XML document with a `WebsiteConfiguration` element. The configuration includes the following elements:

export const REQUEST_ELEMENTS = [
  {
    name: 'ErrorDocument',
    description: 'The object key name to use when a 4XX class error occurs.',
    required: false,
    type: 'Container'
  },
  {
    name: 'IndexDocument',
    description: 'Container for the suffix that is appended to a request that is for a directory on the website endpoint.',
    required: true,
    type: 'Container'
  },
  {
    name: 'RedirectAllRequestsTo',
    description: 'Container for redirect information. You can redirect all requests to another website.',
    required: false,
    type: 'Container'
  },
  {
    name: 'RoutingRules',
    description: 'Container for a collection of RoutingRule elements.',
    required: false,
    type: 'Container'
  }
];

<ParamsTable parameters={REQUEST_ELEMENTS} type="parameter" />

## Request Syntax

```http
PUT /?website HTTP/1.1
Host: example-bucket.qstorage.quilibrium.com
Content-MD5: ContentMD5
x-amz-expected-bucket-owner: ExpectedBucketOwner

<?xml version="1.0" encoding="UTF-8"?>
<WebsiteConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <ErrorDocument>
      <Key>error.html</Key>
   </ErrorDocument>
   <IndexDocument>
      <Suffix>index.html</Suffix>
   </IndexDocument>
   <RedirectAllRequestsTo>
      <HostName>example.com</HostName>
      <Protocol>https</Protocol>
   </RedirectAllRequestsTo>
   <RoutingRules>
      <RoutingRule>
         <Condition>
            <KeyPrefixEquals>docs/</KeyPrefixEquals>
         </Condition>
         <Redirect>
            <ReplaceKeyWith>documents/</ReplaceKeyWith>
         </Redirect>
      </RoutingRule>
   </RoutingRules>
</WebsiteConfiguration>
```

## Response Headers

The operation returns only common response headers.

## Response Body

This operation does not return a response body.

## Response Errors

export const ERRORS = [
  {
    name: 'InvalidArgument',
    description: 'Invalid argument.',
    type: 'Error'
  },
  {
    name: 'MalformedXML',
    description: 'The XML provided was not well-formed or did not validate against the published schema.',
    type: 'Error'
  }
];

<ParamsTable parameters={ERRORS} type="response" />

## Examples

### Configure a Bucket as a Static Website

The following request configures a bucket for website hosting. The configuration specifies index.html as the index document and error.html as the error document.

#### Sample Request

```http
PUT /?website HTTP/1.1
Host: example-bucket.qstorage.quilibrium.com
Content-MD5: 0123456789abcdef0123456789abcdef
Date: Thu, 27 Jan 2024 12:00:00 GMT
Authorization: authorization string

<?xml version="1.0" encoding="UTF-8"?>
<WebsiteConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <IndexDocument>
      <Suffix>index.html</Suffix>
   </IndexDocument>
   <ErrorDocument>
      <Key>error.html</Key>
   </ErrorDocument>
</WebsiteConfiguration>
```

#### Sample Response

```http
HTTP/1.1 200 OK
x-amz-request-id: 1234567890ABCDEF
Date: Thu, 27 Jan 2024 12:00:00 GMT
Server: QStorage
```

## API Test Component

import ApiTester from '@site/src/components/ApiTester';

<ApiTester
  method="PUT"
  endpoint="/?website"
  headers={REQUEST_HEADERS}
  uriParameters={URI_PARAMETERS}
  requestElements={REQUEST_ELEMENTS}
/> 