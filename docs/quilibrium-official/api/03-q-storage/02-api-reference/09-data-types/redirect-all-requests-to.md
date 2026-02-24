---
sidebar_label: RedirectAllRequestsTo
title: RedirectAllRequestsTo
---

# RedirectAllRequestsTo

Container element that specifies the redirect behavior of all requests to a website endpoint of a bucket.

## Syntax

```xml
<RedirectAllRequestsTo>
   <HostName>string</HostName>
   <Protocol>string</Protocol>
</RedirectAllRequestsTo>
```

## Elements

| Name | Type | Description | Required |
|------|------|-------------|----------|
| HostName | String | Name of the host where requests will be redirected. | Yes |
| Protocol | String | Protocol to use (http or https) when redirecting requests. The default is the protocol that is used in the original request. | No | 