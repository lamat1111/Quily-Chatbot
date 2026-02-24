---
title: KeyPolicies
sidebar_label: KeyPolicies
---

# Key Policies

This guide explains how to create and manage key policies in QKMS.

## Overview

Key policies are the primary way to control access to KMS keys. Every KMS key must have exactly one key policy, which contains statements that determine who can use and manage the key.

## Policy Structure

A key policy document is a JSON document that consists of:
- Policy version
- One or more statements that define permissions

### Basic Policy Structure

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Enable IAM User Permissions",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:verenc:111122223333:root"
      },
      "Action": "kms:*",
      "Resource": "*"
    }
  ]
}
```

## Writing Key Policies

[Coming Soon]

## Best Practices

[Coming Soon]

## Related Operations

- `GetKeyPolicy`
- `PutKeyPolicy`
- `ListKeyPolicies` 