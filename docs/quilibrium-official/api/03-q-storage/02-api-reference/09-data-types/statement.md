---
sidebar_label: Statement
title: Statement
---

# Statement

Container for a policy statement.

## Contents

### Sid

Optional identifier for the statement.

**Type**: String  
**Required**: No

### Effect

Whether the statement allows or denies access.

**Type**: String  
**Valid Values**: `Allow | Deny`  
**Required**: Yes

### Principal

Account, user, role, or service to which this policy applies.

**Type**: String or Object  
**Required**: Yes

### Action

List of actions this policy allows or denies.

**Type**: String or Array of String  
**Required**: Yes

### Resource

Object or bucket to which this policy applies.

**Type**: String or Array of String  
**Required**: Yes

### Condition

Optional conditions for when this policy is in effect.

**Type**: Object  
**Required**: No

## Example

```json
{
   "Sid": "PublicReadGetObject",
   "Effect": "Allow",
   "Principal": "*",
   "Action": "s3:GetObject",
   "Resource": "arn:aws:s3:::my-bucket/*",
   "Condition": {
      "StringEquals": {
         "s3:prefix": "public/"
      }
   }
}
``` 