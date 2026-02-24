---
sidebar_label: Owner
title: Owner
---

# Owner

Container for the bucket owner's information.

## Syntax

```xml
<Owner>
   <DisplayName>string</DisplayName>
   <ID>string</ID>
</Owner>
```

## Elements

| Name | Type | Description | Required |
|------|------|-------------|----------|
| DisplayName | String | Screen name of the bucket owner. | No |
| ID | String | ID of the bucket owner. | Yes |

## Properties

| Property | Type | Description | Required |
|----------|------|-------------|-----------|
| DisplayName | String | The display name of the owner | No |
| ID | String | The ID of the owner | No |

## Description

The Owner type represents ownership information for QStorage resources. It contains identifying information about the owner of a bucket or object.

### DisplayName

The human-readable name associated with the owner. This is a friendly identifier that makes it easier to recognize the owner.

### ID

A unique identifier for the owner. This is the canonical way to identify the owner of a resource.

## Example

```xml
<Owner>
  <ID>q12345678example</ID>
  <DisplayName>user1</DisplayName>
</Owner>
```

## Usage

The Owner type is commonly used in responses for operations that return resource metadata, such as:

- ListBuckets
- GetBucketAcl
- GetObjectAcl
- HeadBucket
- HeadObject

The owner information helps identify who owns or created the resources in QStorage.
