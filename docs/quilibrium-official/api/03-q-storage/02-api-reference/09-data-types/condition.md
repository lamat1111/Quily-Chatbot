---
sidebar_label: Condition
title: Condition
---

# Condition

Container for describing a condition that must be met for the specified redirect to be applied.

## Syntax

```xml
<Condition>
   <HttpErrorCodeReturnedEquals>string</HttpErrorCodeReturnedEquals>
   <KeyPrefixEquals>string</KeyPrefixEquals>
</Condition>
```

## Elements

| Name | Type | Description | Required |
|------|------|-------------|----------|
| HttpErrorCodeReturnedEquals | String | The HTTP error code when the redirect is applied. In the event of an error, if the error code equals this value, then the specified redirect is applied. | No |
| KeyPrefixEquals | String | The object key name prefix when the redirect is applied. For example, to redirect requests for ExamplePage.html, the key prefix will be ExamplePage.html. | No |

:::note
At least one of these elements must be specified in a Condition.
::: 