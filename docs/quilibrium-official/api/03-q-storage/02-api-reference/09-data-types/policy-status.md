---
sidebar_label: PolicyStatus
title: PolicyStatus
---

# PolicyStatus

Container for the policy status of a bucket.

## Contents

### IsPublic

The policy status for this bucket. `TRUE` indicates that this bucket is public. `FALSE` indicates that the bucket is not public.

**Type**: Boolean  
**Required**: Yes

## Example

```xml
<PolicyStatus xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
   <IsPublic>TRUE</IsPublic>
</PolicyStatus>
``` 