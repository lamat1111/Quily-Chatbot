---
sidebar_label: LifecycleRuleFilter
title: LifecycleRuleFilter
---

# LifecycleRuleFilter

The `Filter` is used to identify objects that a Lifecycle Rule applies to. A `Filter` must have exactly one of `Prefix`, `Tag`, or `And` specified.

## Contents

### And

This is used in a Lifecycle Rule Filter to apply a logical AND to two or more predicates. The Lifecycle Rule will apply to any object matching all of the predicates configured inside the And operator.

**Type**: LifecycleRuleAndOperator  
**Required**: No

### Prefix

Prefix identifying one or more objects to which the rule applies.

**Type**: String  
**Required**: No

:::note
Replacement must be made for object keys containing special characters (such as carriage returns) when using XML requests.
:::

### Tag

This tag must exist in the object's tag set in order for the rule to apply.

**Type**: Tag  
**Required**: No

## Examples

### Example 1: Filter by prefix

```xml
<Filter>
   <Prefix>logs/</Prefix>
</Filter>
```

### Example 2: Filter by tag

```xml
<Filter>
   <Tag>
      <Key>Environment</Key>
      <Value>Production</Value>
   </Tag>
</Filter>
```

### Example 3: Filter with multiple conditions

```xml
<Filter>
   <And>
      <Prefix>logs/</Prefix>
      <ObjectSizeGreaterThan>500</ObjectSizeGreaterThan>
      <ObjectSizeLessThan>64000</ObjectSizeLessThan>
      <Tag>
         <Key>Environment</Key>
         <Value>Production</Value>
      </Tag>
   </And>
</Filter>
``` 