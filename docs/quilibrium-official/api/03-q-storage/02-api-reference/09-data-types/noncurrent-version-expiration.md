---
sidebar_label: NoncurrentVersionExpiration
title: NoncurrentVersionExpiration
---

# NoncurrentVersionExpiration

Specifies when noncurrent object versions expire. Upon expiration, QStorage permanently deletes the noncurrent object versions. You set this lifecycle configuration action on a bucket that has versioning enabled (or suspended) to request that QStorage delete noncurrent object versions at a specific period in the object's lifetime.

## Contents

### NewerNoncurrentVersions

Specifies the number of newer noncurrent object versions to retain. If there are this many more recent noncurrent versions, this object version can be expired.

**Type**: Integer  
**Required**: No

### NoncurrentDays

Specifies the number of days an object is noncurrent object version expires.

**Type**: Integer  
**Required**: No

## Examples

### Example 1: Basic noncurrent version expiration

```xml
<NoncurrentVersionExpiration>
   <NoncurrentDays>30</NoncurrentDays>
</NoncurrentVersionExpiration>
```

### Example 2: With newer versions retention

```xml
<NoncurrentVersionExpiration>
   <NewerNoncurrentVersions>5</NewerNoncurrentVersions>
   <NoncurrentDays>90</NoncurrentDays>
</NoncurrentVersionExpiration>
``` 