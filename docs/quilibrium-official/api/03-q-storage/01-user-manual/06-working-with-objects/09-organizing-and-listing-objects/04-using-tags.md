---
id: using-tags
title: Using Object Tags
sidebar_label: Using Object Tags
---

# Using Object Tags

Object tagging gives you a way to categorize storage in QStorage. Each tag is a key-value pair that you can use to organize objects, track costs, implement access controls, and manage object lifecycles. This topic explains how to work with object tags in QStorage.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Understanding Object Tags

Object tags in QStorage have the following characteristics:

- Each object can have up to 10 tags
- Each tag key must be unique for an object
- Tag keys and values are case-sensitive
- Tag keys and values can contain up to 128 Unicode characters
- Tag keys and values must not contain the prefix `qs3:` (reserved for QStorage system use)

## Benefits of Using Object Tags

Object tags provide several benefits:

- **Fine-grained access control**: You can grant permissions based on object tags
- **Detailed cost allocation**: You can track costs for different categories of objects
- **Lifecycle management**: You can specify lifecycle rules based on object tags
- **Organizational clarity**: You can visually identify objects with specific tags

## Adding Tags to Objects

You can add tags when you upload an object or add them to existing objects.

### Adding Tags During Upload

<Tabs>
  <TabItem value="qconsole" label="Using QConsole" default>
1. Sign in to QConsole
2. Navigate to QStorage
3. Select the bucket where you want to upload the object
4. Start the upload process
5. In the upload dialog, add tags in the "Tags" section
6. Complete the upload

Your new bucket will appear in the bucket list and is immediately available for use.
  </TabItem>
  <TabItem value="qcli" label="Using Q's CLI Tooling">
```bash
q s3api put-object --bucket bucket-name --key object-key --body file-path --tagging "key1=value1&key2=value2"
```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-Party S3-Compatible CLI">
```bash
aws s3api put-object --bucket bucket-name --key object-key --body file-path --tagging "key1=value1&key2=value2" --endpoint-url https://qstorage.quilibrium.com
```
  </TabItem>
</Tabs>

### Adding Tags to Existing Objects

<Tabs>
  <TabItem value="qconsole" label="Using QConsole" default>
1. Sign in to QConsole
2. Navigate to QStorage
3. Select the bucket containing the object
4. Select the object
5. Open the object properties
6. Navigate to the "Tags" section
7. Add or modify tags
8. Save changes
  </TabItem>
  <TabItem value="qcli" label="Using Q's CLI Tooling">
```bash
q s3api put-object-tagging --bucket bucket-name --key object-key --tagging 'TagSet=[{Key=key1,Value=value1},{Key=key2,Value=value2}]'
```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-Party S3-Compatible CLI">
```bash
aws s3api put-object-tagging --bucket bucket-name --key object-key --tagging 'TagSet=[{Key=key1,Value=value1},{Key=key2,Value=value2}]' --endpoint-url https://qstorage.quilibrium.com
```
  </TabItem>
</Tabs>

## Viewing Object Tags

<Tabs>
  <TabItem value="qconsole" label="Using QConsole" default>
1. Sign in to QConsole
2. Navigate to QStorage
3. Select the bucket containing the object
4. Select the object
5. View tags in the object properties
  </TabItem>
  <TabItem value="qcli" label="Using Q's CLI Tooling">
```bash
q s3api get-object-tagging --bucket bucket-name --key object-key
```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-Party S3-Compatible CLI">
```bash
aws s3api get-object-tagging --bucket bucket-name --key object-key --endpoint-url https://qstorage.quilibrium.com
```
  </TabItem>
</Tabs>

## Editing and Removing Tags

### Editing Tags

<Tabs>
  <TabItem value="qconsole" label="Using QConsole" default>
1. Sign in to QConsole
2. Navigate to QStorage
3. Select the bucket containing the object
4. Select the object
5. Open the object properties
6. Navigate to the "Tags" section
7. Edit the existing tags
8. Save changes
  </TabItem>
  <TabItem value="qcli" label="Using Q's CLI Tooling">
To edit tags, you need to replace all existing tags with a new set of tags:

```bash
q s3api put-object-tagging --bucket bucket-name --key object-key --tagging 'TagSet=[{Key=key1,Value=new-value1},{Key=key2,Value=value2}]'
```
  </TabItem>
</Tabs>

### Removing All Tags

<Tabs>
  <TabItem value="qconsole" label="Using QConsole" default>
1. Sign in to QConsole
2. Navigate to QStorage
3. Select the bucket containing the object
4. Select the object
5. Open the object properties
6. Navigate to the "Tags" section
7. Remove all tags
8. Save changes
  </TabItem>
  <TabItem value="qcli" label="Using Q's CLI Tooling">
```bash
qcli s3api delete-object-tagging --bucket bucket-name --key object-key
```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-Party S3-Compatible CLI">
```bash
aws s3api delete-object-tagging --bucket bucket-name --key object-key --endpoint-url=https://qstorage.quilibrium.com
```
  </TabItem>
</Tabs>

## Using Tags with Batch Operations

You can add, replace, or delete tags for multiple objects in a single operation using batch operations.

### Using Q's CLI Tooling

For batch operations, you can use the `q s3api` command with a script or use the higher-level `q s3` commands.

## Using Tags for Access Control

You can use object tags to control access to specific objects by creating policies that include conditions based on object tags.

Example policy that allows access only to objects with a specific tag:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": "arn:q-world-1:qstorage:::bucket-name/*",
      "Condition": {
        "StringEquals": {
          "s3:ExistingObjectTag/access": "public"
        }
      }
    }
  ]
}
```

## Using Tags for Cost Allocation

You can use object tags to track costs for different categories of objects. By applying tags that represent business categories (such as project, department, or environment), you can analyze costs based on these categories.

## Best Practices for Object Tagging

- **Develop a consistent tagging strategy** across your organization
- **Use meaningful key-value pairs** that are easy to understand
- **Limit the number of tags** to those that are necessary (remember the limit of 10 tags per object)
- **Consider automation** for applying tags consistently
- **Regularly review and update tags** to ensure they remain relevant
- **Document your tagging schema** to ensure consistent usage across teams
- **Use tags in combination with prefixes** for more comprehensive organization
- **Consider tag-based lifecycle rules** for automated management of objects 