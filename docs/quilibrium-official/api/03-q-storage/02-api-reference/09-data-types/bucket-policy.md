---
sidebar_label: BucketPolicy
title: BucketPolicy
---

# BucketPolicy

Container for the bucket policy.

## Contents

### Version

Version of the policy language.

**Type**: String  
**Required**: Yes

### Statement

Container for policy statements.

**Type**: Array of Statement  
**Required**: Yes

## Example

```json
{
   "Version": "2012-10-17",
   "Statement": [
      {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::my-bucket/*"
      }
   ]
}
``` 