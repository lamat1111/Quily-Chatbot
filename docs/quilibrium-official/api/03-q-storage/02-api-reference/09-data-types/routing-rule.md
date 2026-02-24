---
sidebar_label: RoutingRule
title: RoutingRule
---

# RoutingRule

Container for one routing rule that identifies a condition and a redirect.

## Syntax

```xml
<RoutingRule>
   <Condition>
      <HttpErrorCodeReturnedEquals>string</HttpErrorCodeReturnedEquals>
      <KeyPrefixEquals>string</KeyPrefixEquals>
   </Condition>
   <Redirect>
      <HostName>string</HostName>
      <HttpRedirectCode>string</HttpRedirectCode>
      <Protocol>string</Protocol>
      <ReplaceKeyPrefixWith>string</ReplaceKeyPrefixWith>
      <ReplaceKeyWith>string</ReplaceKeyWith>
   </Redirect>
</RoutingRule>
```

## Elements

| Name | Type | Description | Required |
|------|------|-------------|----------|
| Condition | [Condition](/docs/api/q-storage/api-reference/data-types/condition) | Container for describing a condition that must be met for the specified redirect to be applied. If no condition is specified, all requests will be redirected. | No |
| Redirect | [Redirect](/docs/api/q-storage/api-reference/data-types/redirect) | Container element that provides instructions for redirecting the request. You can redirect requests to another host, to another page, or with another protocol. | Yes | 