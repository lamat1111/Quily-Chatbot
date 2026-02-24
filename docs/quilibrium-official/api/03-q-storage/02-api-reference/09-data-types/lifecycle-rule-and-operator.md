---
sidebar_label: LifecycleRuleAndOperator
title: LifecycleRuleAndOperator
---

# LifecycleRuleAndOperator

This is used in a Lifecycle Rule Filter to apply a logical AND to two or more predicates. The Lifecycle Rule will apply to any object matching all of the predicates configured inside the And operator.

## Contents

### ObjectSizeGreaterThan

Minimum object size to which the rule applies.

**Type**: Long  
**Required**: No

### ObjectSizeLessThan

Maximum object size to which the rule applies.

**Type**: Long  
**Required**: No

### Prefix

Prefix identifying one or more objects to which the rule applies.

**Type**: String  
**Required**: No

### Tag

This tag must exist in the object's tag set in order for the rule to apply.

**Type**: Tag  
**Required**: No

## Examples

### Example 1: Size and prefix filter

```xml
<And>
   <Prefix>logs/</Prefix>
   <ObjectSizeGreaterThan>500</ObjectSizeGreaterThan>
   <ObjectSizeLessThan>64000</ObjectSizeLessThan>
</And>
```

### Example 2: Size and tag filter

```xml
<And>
   <ObjectSizeGreaterThan>1000</ObjectSizeGreaterThan>
   <ObjectSizeLessThan>100000</ObjectSizeLessThan>
   <Tag>
      <Key>Environment</Key>
      <Value>Production</Value>
   </Tag>
</And>
```

### Example 3: Complete filter with all conditions

```xml
<And>
   <Prefix>logs/</Prefix>
   <ObjectSizeGreaterThan>500</ObjectSizeGreaterThan>
   <ObjectSizeLessThan>64000</ObjectSizeLessThan>
   <Tag>
      <Key>Environment</Key>
      <Value>Production</Value>
   </Tag>
</And>
``` 