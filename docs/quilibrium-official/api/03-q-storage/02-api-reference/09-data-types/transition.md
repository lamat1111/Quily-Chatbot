---
sidebar_label: Transition
title: Transition
---

# Transition

Specifies when a QStorage object transitions to a specified storage class.

## Contents

### Date

Indicates at what date the object is to be moved or deleted.

**Type**: Timestamp  
**Required**: No

### Days

Indicates the lifetime, in days, of the objects that are subject to the rule. The value must be a non-zero positive integer.

**Type**: Integer  
**Required**: No

### StorageClass

The class of storage used to store the object.

**Type**: String  
**Required**: No

## Examples

### Example 1: Transition after days

```xml
<Transition>
   <Days>90</Days>
   <StorageClass>STANDARD_IA</StorageClass>
</Transition>
```

### Example 2: Transition on specific date

```xml
<Transition>
   <Date>2024-12-31T00:00:00.000Z</Date>
   <StorageClass>GLACIER</StorageClass>
</Transition>
``` 