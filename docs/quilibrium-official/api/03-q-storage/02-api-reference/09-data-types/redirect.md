---
sidebar_label: Redirect
title: Redirect
---

# Redirect

Container element that provides instructions for redirecting the request.

## Syntax

```xml
<Redirect>
   <HostName>string</HostName>
   <HttpRedirectCode>string</HttpRedirectCode>
   <Protocol>string</Protocol>
   <ReplaceKeyPrefixWith>string</ReplaceKeyPrefixWith>
   <ReplaceKeyWith>string</ReplaceKeyWith>
</Redirect>
```

## Elements

| Name | Type | Description | Required |
|------|------|-------------|----------|
| HostName | String | The host name to use in the redirect request. | No |
| HttpRedirectCode | String | The HTTP redirect code to use on the response. Not required if one of the siblings is present. | No |
| Protocol | String | Protocol to use when redirecting requests. The default is the protocol that is used in the original request.<br/><br/>Valid Values: `http, https` | No |
| ReplaceKeyPrefixWith | String | The object key prefix to use in the redirect request. For example, to redirect requests for all pages in a subfolder, you can set the key prefix to that subfolder and specify the replacement prefix. Cannot be used with ReplaceKeyWith. | No |
| ReplaceKeyWith | String | The specific object key to use in the redirect request. For example, redirect request to error.html. Cannot be used with ReplaceKeyPrefixWith. | No |

:::note
At least one of these elements must be specified in a Redirect.
::: 