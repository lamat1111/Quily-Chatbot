---
sidebar_label: Rule
title: Rule
---

import ParamsTable from '@site/src/components/ParamsTable';

export const RULE_ELEMENTS = [
  {
    name: "Prefix",
    type: "String",
    description: "Object key prefix that identifies one or more objects to which this rule applies.",
    required: true
  },
  {
    name: "Status",
    type: "String",
    description: "If 'Enabled', the rule is currently being applied. If 'Disabled', the rule is not currently being applied.",
    required: true,
    enum: ["Enabled", "Disabled"]
  },
  {
    name: "AbortIncompleteMultipartUpload",
    type: "<a href=\"/docs/api/q-storage/api-reference/data-types/abort-incomplete-multipart-upload\">AbortIncompleteMultipartUpload</a>",
    description: "Specifies the days since the initiation of an incomplete multipart upload that QStorage will wait before permanently removing all parts of the upload.",
    required: false
  },
  {
    name: "Expiration",
    type: "<a href=\"/docs/api/q-storage/api-reference/data-types/lifecycle-expiration\">LifecycleExpiration</a>",
    description: "Specifies the expiration for the lifecycle of the object.",
    required: false
  },
  {
    name: "ID",
    type: "String",
    description: "Unique identifier for the rule. The value can't be longer than 255 characters.",
    required: false
  },
  {
    name: "NoncurrentVersionExpiration",
    type: "<a href=\"/docs/api/q-storage/api-reference/data-types/noncurrent-version-expiration\">NoncurrentVersionExpiration</a>",
    description: "Specifies when noncurrent object versions expire. Upon expiration, QStorage permanently deletes the noncurrent object versions. You set this lifecycle configuration action on a bucket that has versioning enabled (or suspended) to request that QStorage delete noncurrent object versions at a specific period in the object's lifetime.",
    required: false
  }
];

# Rule

Specifies lifecycle rules for a QStorage bucket. For more information, see [PutBucketLifecycle](/docs/api/q-storage/api-reference/bucket-operations/put-bucket-lifecycle).

## Elements

<ParamsTable parameters={RULE_ELEMENTS} type="response" />

## See Also
- [GetBucketLifecycle](/docs/api/q-storage/api-reference/bucket-operations/get-bucket-lifecycle)
- [PutBucketLifecycle](/docs/api/q-storage/api-reference/bucket-operations/put-bucket-lifecycle)
- [DeleteBucketLifecycle](/docs/api/q-storage/api-reference/bucket-operations/delete-bucket-lifecycle) 