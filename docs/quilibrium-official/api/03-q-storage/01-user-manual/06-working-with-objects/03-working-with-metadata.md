# Working with Metadata

There are two kinds of object metadata in QStorage: *system-defined metadata* and *user-defined metadata*. System-defined metadata includes metadata such as the object's creation date and size. User-defined metadata is metadata that you can choose to set at the time that you upload an object.

When you create an object, you specify the *object key* (or *key name*), which uniquely identifies the object in a QStorage bucket. You can also set user-defined metadata in QStorage at the time that you upload the object.

After you upload the object, you can't modify this user-defined metadata. The only way to modify this metadata is to make a copy of the object and set the metadata.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## System-defined Object Metadata

For each object stored in a bucket, QStorage maintains a set of system metadata. QStorage processes this system metadata as needed. For example, QStorage maintains object-creation date and size metadata, using this information as part of object management.

## Billing and Metadata

When considering how QStorage handles billing, it's important to understand how metadata affects storage costs:

- **Storage Billing**: QStorage bills for the total storage used by your objects, which includes both the object data itself and its metadata. However, the billing is primarily based on the total data size of all objects rather than tracking each object individually.

- **Metadata Size**: While metadata is relatively small compared to object content, it does contribute to the overall storage size. User-defined metadata can be up to 2 KB per object, which is included in your storage calculations.

- **System Metadata Impact**: System metadata is necessary for object management and is included in the storage calculations, but typically has minimal impact on overall billing.

- **Granularity**: Billing is calculated based on the aggregate storage used across all objects in your buckets, not on a per-object basis. This means QStorage tracks the total storage consumption rather than billing for each object individually.

For specific details about current billing rates and how storage is calculated, please refer to the [QStorage pricing documentation](/docs/api/q-storage/user-manual/pricing).


There are two categories of system metadata:

* **System controlled** – Metadata such as the object-creation date is system controlled, which means that only QStorage can modify the value.
* **User controlled** – Other system metadata, e.g. whether the object is public or not, are examples of system metadata whose values you control.

When you create objects, you can configure the values of these system metadata items or update the values when you need to.

## User-defined Object Metadata

When uploading an object, you can also assign metadata to the object. You provide this optional information as a name-value (key-value) pair when you send a request to create the object.

User-defined metadata is a set of key-value pairs. QStorage stores user-defined metadata keys in lowercase. User-defined metadata can be as large as 2 KB in size. The size of user-defined metadata is measured by taking the sum of the number of bytes in the UTF-8 encoding of each key and value.

### Adding User-defined Metadata

<Tabs>
  <TabItem value="qcli" label="Using Q's CLI Tooling" default>
```bash
# Add metadata when uploading an object
qcli s3api cp /path/to/local/file.txt s3://bucket-name/ --metadata '{"key1":"value1","key2":"value2"}'

# Add metadata to an existing object by making a copy
qcli s3api cp s3://bucket-name/file.txt s3://bucket-name/file.txt --metadata '{"key1":"value1","key2":"value2"}' --metadata-directive REPLACE
```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-party S3-compatible CLI">
```bash
# Add metadata when uploading an object
aws s3api put-object --bucket bucket-name --key file.txt --body /path/to/local/file.txt --metadata '{"key1":"value1","key2":"value2"}' --endpoint-url https://qstorage.quilibrium.com

# Add metadata to an existing object by making a copy
aws s3api copy-object --copy-source bucket-name/file.txt --bucket bucket-name --key file.txt --metadata '{"key1":"value1","key2":"value2"}' --metadata-directive REPLACE --endpoint-url https://qstorage.quilibrium.com
```
  </TabItem>
</Tabs>

## Retrieving Object Metadata

You can retrieve object metadata without retrieving the object itself. This is useful if you're only interested in an object's metadata. To retrieve metadata, you must have READ access to the object.

<Tabs>
  <TabItem value="qcli" label="Using Q's CLI Tooling" default>
```bash
# Get object metadata
qcli s3api head-object s3://bucket-name/file.txt
```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-party S3-compatible CLI">
```bash
# Get object metadata
aws s3api head-object --bucket bucket-name --key file.txt --endpoint-url https://qstorage.quilibrium.com
```
  </TabItem>
</Tabs>

## Best Practices for Metadata

1. **Keep metadata concise**: Metadata is limited to 2 KB in size, so keep your metadata concise and relevant.
2. **Use consistent naming conventions**: Establish a consistent naming convention for your metadata keys to make them easier to manage.
3. **Avoid sensitive information**: Do not store sensitive information in user-defined metadata, as it is not encrypted by default.
4. **Use metadata for searchability**: Metadata can be used to categorize and search for objects, so consider what metadata would be useful for finding objects later.