---
sidebar_label: LifecycleExpiration
title: LifecycleExpiration
---

# LifecycleExpiration

Specifies the expiration for the lifecycle of the object in the form of date, days and, whether the object has a delete marker.

## Contents

### Date

Indicates at what date the object is to be moved or deleted.

**Type**: Timestamp  
**Required**: No

### Days

Indicates the lifetime, in days, of the objects that are subject to the rule. The value must be a non-zero positive integer.

**Type**: Integer  
**Required**: No

### ExpiredObjectDeleteMarker

Indicates whether QStorage will remove a delete marker with no noncurrent versions. If set to true, the delete marker will be expired; if set to false the policy takes no action. This cannot be specified with Days or Date in a Lifecycle Expiration Policy.

**Type**: Boolean  
**Required**: No

## Examples

### Example 1: Expire after days

```xml
<Expiration>
   <Days>30</Days>
</Expiration>
```

### Example 2: Expire on specific date

```xml
<Expiration>
   <Date>2024-12-31T00:00:00.000Z</Date>
</Expiration>
```

### Example 3: Remove delete marker

```xml
<Expiration>
   <ExpiredObjectDeleteMarker>true</ExpiredObjectDeleteMarker>
</Expiration>
``` 