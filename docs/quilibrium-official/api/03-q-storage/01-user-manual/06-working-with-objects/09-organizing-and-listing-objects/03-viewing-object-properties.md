---
id: viewing-object-properties
title: Viewing Object Properties
sidebar_label: Viewing Object Properties
---

# Viewing Object Properties

Every object stored in QStorage has a set of properties that provide information about the object. These properties include metadata, size, and other attributes. This topic explains how to view and understand object properties in QStorage.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Object Properties Overview

Object properties in QStorage include:

- **Key (Name)**: The unique identifier for the object within the bucket
- **Size**: The size of the object in bytes
- **Last Modified**: The date and time when the object was last modified
- **ETag**: A hash of the object, which can be used to verify the integrity of the object
- **Owner**: The owner of the object
- **Content Type**: The MIME type of the object
- **User-defined Metadata**: Custom metadata that you can assign to objects

## Viewing Object Properties

<Tabs>
  <TabItem value="qconsole" label="Using QConsole" default>
To view object properties using QConsole:

1. Sign in to QConsole
2. Navigate to QStorage
3. Select the bucket containing the object
4. Select the object you want to view
5. View the object properties in the details panel
  </TabItem>
  <TabItem value="qcli" label="Using Q's CLI Tooling">
To view object properties using Q's CLI:

```bash
q s3api head-object --bucket bucket-name --key object-key
```

For a more detailed view:

```bash
q s3api get-object-attributes --bucket bucket-name --key object-key --object-attributes "ETag,Checksum,ObjectSize,StorageClass,ObjectParts"
```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-Party S3-Compatible CLI">
Using the AWS CLI:

```bash
aws s3api head-object --bucket bucket-name --key object-key --endpoint-url https://qstorage.quilibrium.com
```
  </TabItem>
</Tabs>

## Understanding Object Metadata

Object metadata in QStorage is divided into two categories:

### System-defined Metadata

System-defined metadata includes information that QStorage sets automatically, such as:

- Date created
- Object size
- Content type
- Last modified date

You cannot modify system-defined metadata after the object is created.

### User-defined Metadata

User-defined metadata consists of name-value pairs that you can specify when you upload an object. This metadata is stored with the object and returned when you download the object.

To view user-defined metadata:

<Tabs>
  <TabItem value="qconsole" label="Using QConsole" default>
1. Sign in to QConsole
2. Navigate to QStorage
3. Select the bucket containing the object
4. Select the object
5. View the metadata in the object properties section
  </TabItem>
  <TabItem value="qcli" label="Using Q's CLI Tooling">
```bash
q s3api head-object --bucket bucket-name --key object-key
```

The response will include any user-defined metadata with the prefix `x-amz-meta-`.
  </TabItem>
</Tabs>

## Viewing Object Versions

If versioning is enabled on your bucket, you can view properties for specific versions of an object:

<Tabs>
  <TabItem value="qconsole" label="Using QConsole" default>
1. Sign in to QConsole
2. Navigate to QStorage
3. Select the bucket containing the object
4. Enable the "Show versions" option
5. Select the specific version of the object
6. View the properties for that version
  </TabItem>
  <TabItem value="qcli" label="Using Q's CLI Tooling">
```bash
q s3api head-object --bucket bucket-name --key object-key --version-id version-id
```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-Party S3-Compatible CLI">
```bash
aws s3api head-object --bucket bucket-name --key object-key --version-id version-id --endpoint-url https://qstorage.quilibrium.com
```
  </TabItem>
</Tabs>

## Viewing Object Legal Holds and Retention Information

If you're using Object Lock features, you can view legal hold and retention information:

<Tabs>
  <TabItem value="qcli" label="Using Q's CLI Tooling" default>
```bash
q s3api get-object-legal-hold --bucket bucket-name --key object-key
```

```bash
q s3api get-object-retention --bucket bucket-name --key object-key
```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-Party S3-Compatible CLI">
```bash
aws s3api get-object-legal-hold --bucket bucket-name --key object-key --endpoint-url https://qstorage.quilibrium.com
```

```bash
aws s3api get-object-retention --bucket bucket-name --key object-key --endpoint-url https://qstorage.quilibrium.com
```
  </TabItem>
</Tabs>

## Best Practices for Working with Object Properties

- **Regularly audit object properties** to ensure they meet your storage and compliance requirements
- **Use consistent metadata naming conventions** to make it easier to search and organize objects
- **Monitor object sizes and last modified dates** to track changes and manage storage costs
- **Use ETags for integrity verification** when transferring objects between systems
- **Leverage user-defined metadata** to add application-specific information to your objects 