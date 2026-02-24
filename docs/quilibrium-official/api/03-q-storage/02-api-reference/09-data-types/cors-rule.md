# CORSRule

Specifies a cross-origin access rule for a bucket.

## Properties

| Property | Type | Description | Required |
|----------|------|-------------|-----------|
| AllowedMethods | Array of strings | HTTP methods that you allow the origin to execute. Valid Values: `GET, PUT, HEAD, POST, DELETE` | Yes |
| AllowedOrigins | Array of strings | One or more origins you want customers to be able to access the bucket from | Yes |
| AllowedHeaders | Array of strings | Headers that are specified in the `Access-Control-Request-Headers` header. These headers are allowed in a preflight OPTIONS request | No |
| ExposeHeaders | Array of strings | One or more headers in the response that you want customers to be able to access from their applications (for example, from a JavaScript `XMLHttpRequest` object) | No |
| ID | String | Unique identifier for the rule. The value cannot be longer than 255 characters | No |
| MaxAgeSeconds | Integer | The time in seconds that your browser is to cache the preflight response for the specified resource | No |

## Description

The CORSRule type defines a Cross-Origin Resource Sharing (CORS) rule for a bucket. CORS enables client web applications loaded in one domain to interact with resources in a different domain.

:::note
- At least one AllowedMethods element must be specified
- At least one AllowedOrigins element must be specified
- The rule can include up to one of each of the optional parameters
:::

## Examples

### Basic CORS Rule

```xml
<CORSRule>
  <AllowedOrigin>https://example.com</AllowedOrigin>
  <AllowedMethod>GET</AllowedMethod>
  <AllowedMethod>PUT</AllowedMethod>
  <MaxAgeSeconds>3000</MaxAgeSeconds>
  <ExposeHeader>ETag</ExposeHeader>
</CORSRule>
```

### CORS Rule with Multiple Origins and Headers

```xml
<CORSRule>
  <ID>rule-1</ID>
  <AllowedOrigin>https://example1.com</AllowedOrigin>
  <AllowedOrigin>https://example2.com</AllowedOrigin>
  <AllowedMethod>GET</AllowedMethod>
  <AllowedMethod>POST</AllowedMethod>
  <AllowedHeader>Authorization</AllowedHeader>
  <AllowedHeader>Content-Type</AllowedHeader>
  <ExposeHeader>ETag</ExposeHeader>
  <ExposeHeader>x-amz-meta-custom-header</ExposeHeader>
  <MaxAgeSeconds>3600</MaxAgeSeconds>
</CORSRule>
```

## Usage

The CORSRule type is used in operations that manage CORS configuration for buckets, such as:

- PutBucketCors
- GetBucketCors

Each CORS configuration can contain up to 100 rules. 