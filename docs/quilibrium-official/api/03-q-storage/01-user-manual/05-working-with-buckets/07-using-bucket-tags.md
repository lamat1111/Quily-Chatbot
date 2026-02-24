---
id: using-bucket-tags
title: Using Bucket Tags
sidebar_label: Using Bucket Tags
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Using Bucket Tags

Bucket tagging gives you a way to categorize your storage in QStorage. Each tag is a key-value pair that you can use to organize buckets, track costs, implement access controls, and manage bucket lifecycles. This topic explains how to work with bucket tags in QStorage.

## Understanding Bucket Tags

Bucket tags in QStorage have the following characteristics:

- Each bucket can have up to 50 tags
- Each tag key must be unique for a bucket
- Tag keys and values are case-sensitive
- Tag keys can be up to 128 Unicode characters in length
- Tag values can be up to 256 Unicode characters in length
- Tag keys and values must not contain the prefix `qstorage:` or `q-storage:` (reserved for QStorage system use)

## Benefits of Using Bucket Tags

Bucket tags provide several benefits:

- **Cost allocation**: You can track costs for different categories of buckets
- **Access control**: You can grant permissions based on bucket tags
- **Organizational clarity**: You can visually identify buckets with specific tags
- **Resource grouping**: You can group related buckets together for management purposes
- **Automation**: You can use tags to trigger automated processes or workflows

## Adding Tags to Buckets

You can add tags when you create a bucket or add them to existing buckets.

### Adding Tags During Bucket Creation

<Tabs>
  <TabItem value="qconsole" label="Using QConsole">
      1. Sign in to QConsole
      2. Navigate to QStorage
      3. Start the bucket creation process
      4. In the creation dialog, add tags in the "Tags" section
      5. Complete the bucket creation
  </TabItem>
  <TabItem value="qcli" label="Using Q's CLI Tooling">
      When creating a bucket, you can specify tags:

      ```bash
      qcli s3api create-bucket --bucket bucket-name --tagging "TagSet=[{Key=project,Value=alpha}]"
      ```

  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-Party S3-Compatible CLI">
      ```bash
      aws s3api create-bucket --bucket bucket-name --tagging "TagSet=[{Key=project,Value=alpha}]" --endpoint-url https://qstorage.quilibrium.com
      ```

  </TabItem>
</Tabs>

### Adding Tags to Existing Buckets

<Tabs>
  <TabItem value="qconsole" label="Using QConsole">
      1. Sign in to QConsole
      2. Navigate to QStorage
      3. Select the bucket
      4. Open the bucket properties
      5. Navigate to the "Tags" section
      6. Add or modify tags
      7. Save changes
  </TabItem>
  <TabItem value="qcli" label="Using Q's CLI Tooling">
      ```bash
      q s3api put-bucket-tagging --bucket bucket-name --tagging "TagSet=[{Key=project,Value=alpha},{Key=environment,Value=production}]"
      ```

      You can also use a JSON file to specify the tags:

      ```bash
      qcli s3api put-bucket-tagging --bucket bucket-name --tagging file://tagging.json
      ```

      Where `tagging.json` contains:

      ```json
      {
        "TagSet": [
          {
            "Key": "project",
            "Value": "alpha"
          },
          {
            "Key": "environment",
            "Value": "production"
          }
        ]
      }
      ```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-Party S3-Compatible CLI">
      ```bash
      aws s3api put-bucket-tagging --bucket bucket-name --tagging "TagSet=[{Key=project,Value=alpha},{Key=environment,Value=production}]" --endpoint-url https://qstorage.quilibrium.com
      ```
  </TabItem>
</Tabs>

## Viewing Bucket Tags

<Tabs>
  <TabItem value="qconsole" label="Using QConsole">
      1. Sign in to QConsole
      2. Navigate to QStorage
      3. Select the bucket
      4. View tags in the bucket properties
  </TabItem>
  <TabItem value="qcli" label="Using Q's CLI Tooling">
      ```bash
      qcli s3api get-bucket-tagging --bucket bucket-name
      ```

      The response will include the tag set:

      ```json
      {
        "TagSet": [
          {
            "Key": "project",
            "Value": "alpha"
          },
          {
            "Key": "environment",
            "Value": "production"
          }
        ]
      }
      ```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-Party S3-Compatible CLI">
      ```bash
      aws s3api get-bucket-tagging --bucket bucket-name --endpoint-url https://qstorage.quilibrium.com
      ```
  </TabItem>
</Tabs>

## Editing and Removing Tags

### Editing Tags

<Tabs>
  <TabItem value="qconsole" label="Using QConsole">
      1. Sign in to QConsole
      2. Navigate to QStorage
      3. Select the bucket
      4. Open the bucket properties
      5. Navigate to the "Tags" section
      6. Edit the existing tags
      7. Save changes
  </TabItem>
  <TabItem value="qcli" label="Using Q's CLI Tooling">
      To edit tags, you need to replace all existing tags with a new set of tags:

      ```bash
      qcli s3api put-bucket-tagging --bucket bucket-name --tagging "TagSet=[{Key=project,Value=beta},{Key=environment,Value=staging}]"
      ```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-Party S3-Compatible CLI">
      To edit tags, you need to replace all existing tags with a new set of tags:

      ```bash
      aws s3api put-bucket-tagging --bucket bucket-name --tagging "TagSet=[{Key=project,Value=beta},{Key=environment,Value=staging}]" --endpoint-url https://qstorage.quilibrium.com
      ```
  </TabItem>
</Tabs>

### Removing All Tags

<Tabs>
  <TabItem value="qconsole" label="Using QConsole">
      1. Sign in to QConsole
      2. Navigate to QStorage
      3. Select the bucket
      4. Open the bucket properties
      5. Navigate to the "Tags" section
      6. Remove all tags
      7. Save changes
  </TabItem>
  <TabItem value="qcli" label="Using Q's CLI Tooling">
      To remove all tags, use the delete-bucket-tagging command:

      ```bash
      qcli s3api delete-bucket-tagging --bucket bucket-name
      ```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-Party S3-Compatible CLI">
      ```bash
      aws s3api delete-bucket-tagging --bucket bucket-name --endpoint-url=https://qstorage.quilibrium.com
      ```
  </TabItem>
</Tabs>

## Using Tags for Cost Allocation

Bucket tags are an effective way to track storage costs for different projects, departments, or environments. By applying tags that represent business categories, you can analyze costs based on these categories.

For example, you might tag buckets with:

- `project=alpha` - To track costs for Project Alpha
- `department=marketing` - To track costs for the Marketing department
- `environment=production` - To track costs for production environments

## Using Tags for Access Control

You can use bucket tags to control access to specific buckets by creating policies that include conditions based on bucket tags.

Example policy that allows access only to buckets with a specific tag:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "s3:ResourceTag/environment": "development"
        }
      }
    }
  ]
}
```

## Differences Between Bucket Tags and Object Tags

It's important to understand the differences between bucket tags and object tags:

1. **Scope**: Bucket tags apply to the entire bucket, while object tags apply to individual objects
2. **Cost allocation**: Only bucket tags can be used for cost allocation reporting
3. **Quantity**: Buckets can have up to 50 tags, while objects can have up to 10 tags
4. **Use cases**: Bucket tags are typically used for broad categorization, while object tags are used for fine-grained organization

For information about object tagging, see [Using Object Tags](/docs/api/q-storage/user-manual/working-with-objects/organizing-and-listing-objects/using-tags).

## Best Practices for Bucket Tagging

- **Develop a consistent tagging strategy** across your organization
- **Use meaningful key-value pairs** that are easy to understand
- **Document your tagging schema** to ensure consistent usage across teams
- **Consider automation** for applying tags consistently
- **Regularly review and update tags** to ensure they remain relevant
- **Use standardized tag keys** such as "project", "environment", "department", etc.
- **Avoid storing sensitive information** in tag values
- **Combine bucket tags with object tags** for comprehensive organization 