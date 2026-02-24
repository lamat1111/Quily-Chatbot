---
title: Empty A Bucket
sidebar_label: Empty A Bucket
---
# Empty a Bucket
Emptying a bucket means deleting all Objects from a bucket, but keeping the bucket itself.

This can be useful in the manner that you keep the bucket name reserved preventing impersonation, in regards to public buckets, but no longer need to pay for the contents.

Emptying a bucket is permenant.  There is no undo.  All Objects, including their metadata and versioning are removed.

Prefixes are supported, e.g. `s3://bucket-name/doc` would empty folders docA and docB.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="qcli" label="Using Q's CLI Tooling" default>
```
Coming Soon
```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-party S3-compatible CLI">
```
aws s3 rm s3://bucket-name --recursive --endpoint https://qstorage.quilibrium.com
```
  </TabItem>
</Tabs>