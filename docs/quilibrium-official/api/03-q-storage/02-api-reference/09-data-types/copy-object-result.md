---
sidebar_label: CopyObjectResult
title: CopyObjectResult
---

# CopyObjectResult

Container for response elements from a CopyObject operation.

## Syntax

```xml
<CopyObjectResult>
   <ETag>string</ETag>
   <LastModified>timestamp</LastModified>
</CopyObjectResult>
```

## Elements

| Name | Type | Description | Required |
|------|------|-------------|----------|
| ETag | String | The entity tag (ETag) that represents the copied object. The ETag reflects only changes to the contents of an object, not its metadata. | Yes |
| LastModified | Timestamp | The date and time at which the copied object was last modified. | Yes | 