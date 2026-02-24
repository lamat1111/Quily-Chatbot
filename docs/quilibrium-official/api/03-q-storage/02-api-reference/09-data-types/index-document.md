---
sidebar_label: IndexDocument
title: IndexDocument
---

# IndexDocument

Container for the suffix configuration of the website index document.

## Syntax

```xml
<IndexDocument>
   <Suffix>string</Suffix>
</IndexDocument>
```

## Elements

| Name | Type | Description | Required |
|------|------|-------------|----------|
| Suffix | String | A suffix that is appended to a request that is for a directory on the website endpoint (e.g. if the suffix is index.html and you make a request to samplebucket/images/, the data that is returned will be for the object with the key name images/index.html). The suffix must not be empty and must not include a slash character. | Yes | 