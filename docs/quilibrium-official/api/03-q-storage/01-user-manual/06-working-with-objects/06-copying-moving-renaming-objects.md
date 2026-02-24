# Copying, Moving, and Renaming Objects

QStorage allows you to copy, move, and rename objects within and between buckets. This section explains how to perform these operations.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Copying Objects

Copying objects in QStorage creates a copy of an object that already exists in QStorage. You can create a copy of an object within the same bucket or copy an object from one bucket to another.

<Tabs>
  <TabItem value="qcli" label="Using Q's CLI Tooling" default>
```bash
# Copy an object within the same bucket
qcli s3api cp s3://bucket-name/source-file.txt s3://bucket-name/destination-file.txt

# Copy an object to another bucket
qcli s3api cp s3://source-bucket/file.txt s3://destination-bucket/file.txt

# Copy an object and modify its metadata
qcli s3api cp s3://bucket-name/file.txt s3://bucket-name/file.txt --metadata '{"key1":"value1","key2":"value2"}' --metadata-directive REPLACE

# Copy multiple objects using a prefix
qcli s3api cp s3://bucket-name/prefix/ s3://bucket-name/new-prefix/ --recursive
```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-party S3-compatible CLI">
```bash
# Copy an object within the same bucket
aws s3 cp s3://bucket-name/source-file.txt s3://bucket-name/destination-file.txt --endpoint-url https://qstorage.quilibrium.com

# Copy an object to another bucket
aws s3 cp s3://source-bucket/file.txt s3://destination-bucket/file.txt --endpoint-url https://qstorage.quilibrium.com

# Copy an object and modify its metadata
aws s3api copy-object --copy-source bucket-name/file.txt --bucket bucket-name --key new-file.txt --metadata '{"key1":"value1","key2":"value2"}' --metadata-directive REPLACE --endpoint-url https://qstorage.quilibrium.com
```
  </TabItem>
</Tabs>

## Moving Objects

QStorage doesn't provide a direct move operation. Instead, moving an object is a two-step process: copy the object to the new location, then delete the original object.

<Tabs>
  <TabItem value="qcli" label="Using Q's CLI Tooling" default>
```bash
# Move an object within the same bucket
qcli s3api mv s3://bucket-name/source-file.txt s3://bucket-name/destination-file.txt

# Move an object to another bucket
qcli s3api mv s3://source-bucket/file.txt s3://destination-bucket/file.txt

# Move multiple objects using a prefix
qcli s3api mv s3://bucket-name/prefix/ s3://bucket-name/new-prefix/ --recursive
```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-party S3-compatible CLI">
```bash
# Move an object within the same bucket
aws s3 mv s3://bucket-name/source-file.txt s3://bucket-name/destination-file.txt --endpoint-url https://qstorage.quilibrium.com

# Move an object to another bucket
aws s3 mv s3://source-bucket/file.txt s3://destination-bucket/file.txt --endpoint-url https://qstorage.quilibrium.com
```
  </TabItem>
</Tabs>

## Renaming Objects

In QStorage, there is no direct rename operation. Renaming an object is essentially the same as moving it: you copy the object with a new key name and then delete the original.

<Tabs>
  <TabItem value="qcli" label="Using Q's CLI Tooling" default>
```bash
# Rename an object
qcli s3api mv s3://bucket-name/old-name.txt s3://bucket-name/new-name.txt
```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-party S3-compatible CLI">
```bash
# Rename an object
aws s3 mv s3://bucket-name/old-name.txt s3://bucket-name/new-name.txt --endpoint-url https://qstorage.quilibrium.com
```
  </TabItem>
</Tabs>

## Copying Large Objects

When copying large objects (over 5 GB), you need to use multipart copy operations. Many CLI tools and SDKs handle this automatically for you.

## Considerations When Copying, Moving, or Renaming Objects

1. **Permissions**: Ensure you have the necessary permissions for both the source and destination buckets and objects.

2. **Metadata and Properties**: When copying objects, you can choose to retain or replace the metadata of the source object.

3. **Versioning**: If versioning is enabled, copying or moving an object creates a new version of the object at the destination.

4. **Cost**: Copying objects between different buckets may incur data transfer costs.

5. **Time**: Copying or moving large objects or multiple objects can take time, especially across different buckets.