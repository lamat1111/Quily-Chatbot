---
sidebar_label: LifecycleRule
title: LifecycleRule
---

# LifecycleRule

A lifecycle rule for individual objects in a QStorage bucket.

## Contents

### Status

If 'Enabled', the rule is currently being applied. If 'Disabled', the rule is not currently being applied.

**Type**: String  
**Valid Values**: `Enabled | Disabled`  
**Required**: Yes

### AbortIncompleteMultipartUpload

Specifies the days since the initiation of an incomplete multipart upload that QStorage will wait before permanently removing all parts of the upload.

**Type**: AbortIncompleteMultipartUpload  
**Required**: No

```xml
<AbortIncompleteMultipartUpload>
   <DaysAfterInitiation>integer</DaysAfterInitiation>
</AbortIncompleteMultipartUpload>
```

### Expiration

Specifies the expiration for the lifecycle of the object in the form of date, days and, whether the object has a delete marker.

**Type**: LifecycleExpiration  
**Required**: No

```xml
<Expiration>
   <Date>timestamp</Date>
   <Days>integer</Days>
   <ExpiredObjectDeleteMarker>boolean</ExpiredObjectDeleteMarker>
</Expiration>
```

### Filter

The `Filter` is used to identify objects that a Lifecycle Rule applies to. A `Filter` must have exactly one of `Prefix`, `Tag`, or `And` specified. `Filter` is required if the `LifecycleRule` does not contain a `Prefix` element.

**Type**: LifecycleRuleFilter  
**Required**: No

```xml
<Filter>
   <And>
      <Prefix>string</Prefix>
      <ObjectSizeGreaterThan>long</ObjectSizeGreaterThan>
      <ObjectSizeLessThan>long</ObjectSizeLessThan>
      <Tag>
         <Key>string</Key>
         <Value>string</Value>
      </Tag>
   </And>
   <Prefix>string</Prefix>
   <Tag>
      <Key>string</Key>
      <Value>string</Value>
   </Tag>
</Filter>
```

### ID

Unique identifier for the rule. The value cannot be longer than 255 characters.

**Type**: String  
**Required**: No

### NoncurrentVersionExpiration

Specifies when noncurrent object versions expire. Upon expiration, QStorage permanently deletes the noncurrent object versions. You set this lifecycle configuration action on a bucket that has versioning enabled (or suspended) to request that QStorage delete noncurrent object versions at a specific period in the object's lifetime.

**Type**: NoncurrentVersionExpiration  
**Required**: No

```xml
<NoncurrentVersionExpiration>
   <NewerNoncurrentVersions>integer</NewerNoncurrentVersions>
   <NoncurrentDays>integer</NoncurrentDays>
</NoncurrentVersionExpiration>
```

<!-- ### NoncurrentVersionTransitions

Specifies the transition rule for the lifecycle rule that describes when noncurrent objects transition to a specific storage class. If your bucket is versioning-enabled (or versioning is suspended), you can set this action to request that QStorage transition noncurrent object versions to a specific storage class at a set period in the object's lifetime.

**Type**: Array of NoncurrentVersionTransition  
**Required**: No

```xml
<NoncurrentVersionTransition>
   <NewerNoncurrentVersions>integer</NewerNoncurrentVersions>
   <NoncurrentDays>integer</NoncurrentDays>
   <StorageClass>string</StorageClass>
</NoncurrentVersionTransition>
``` -->

### Prefix

:::warning Deprecated
This member has been deprecated. Prefix identifying one or more objects to which the rule applies. This is no longer used; use `Filter` instead.
:::

**Type**: String  
**Required**: No

:::note
Replacement must be made for object keys containing special characters (such as carriage returns) when using XML requests.
:::

### Transitions

Specifies when a QStorage object transitions to being marked for deletion.

**Type**: Array of Transition  
**Required**: No

```xml
<Transition>
   <Date>timestamp</Date>
   <Days>integer</Days>
   <!-- <StorageClass>string</StorageClass> -->
</Transition>
```

## Examples

### Example 1: Basic Lifecycle Rule

```xml
<Rule>
   <ID>ExampleRule</ID>
   <Filter>
      <Prefix>logs/</Prefix>
   </Filter>
   <Status>Enabled</Status>
   <Expiration>
      <Days>30</Days>
   </Expiration>
</Rule>
```

### Example 2: Complex Lifecycle Rule with Multiple Conditions

```xml
<Rule>
   <ID>ComplexRule</ID>
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
   <Status>Enabled</Status>
   <Transition>
      <Days>90</Days>
      <StorageClass>STANDARD_IA</StorageClass>
   </Transition>
   <Expiration>
      <Days>365</Days>
      <ExpiredObjectDeleteMarker>true</ExpiredObjectDeleteMarker>
   </Expiration>
   <AbortIncompleteMultipartUpload>
      <DaysAfterInitiation>7</DaysAfterInitiation>
   </AbortIncompleteMultipartUpload>
</Rule>
``` 