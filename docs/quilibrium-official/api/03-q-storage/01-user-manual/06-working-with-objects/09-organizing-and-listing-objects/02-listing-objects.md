---
id: listing-objects
title: Listing Objects
sidebar_label: Listing Objects
---

# Listing Objects

QStorage provides several ways to list the objects in your buckets. You can list all objects, list objects with a specific prefix, or list objects hierarchically using delimiters. This topic explains the different methods for listing objects in QStorage.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Understanding Object Listing

When you list objects in a bucket, QStorage returns a list of objects up to 1,000 objects per response by default. You can use pagination parameters to retrieve a subset of objects or to iterate through the complete list of objects.

### Important Concepts for Listing Objects

- **Prefix**: Filter the results to include only objects whose keys begin with the specified prefix.
- **Delimiter**: Character used to group keys. If you specify a delimiter, the operation returns a list of distinct key prefixes in `CommonPrefixes`. These prefixes represent keys that share a common prefix up to the delimiter.
- **Pagination**: For buckets with many objects, the list operation might return only a portion of the objects. In these cases, the response includes a continuation token that you can use in a subsequent request to fetch the next set of objects.

## Listing All Objects in a Bucket

<Tabs>
  <TabItem value="qconsole" label="Using QConsole" default>
To list all objects in a bucket using QConsole:

1. Sign in to QConsole
2. Navigate to QStorage
3. Select the bucket you want to view
4. The objects in the bucket will be displayed in the console
  </TabItem>
  <TabItem value="qcli" label="Using Q's CLI Tooling">
To list all objects in a bucket using Q's CLI:

```bash
q s3 ls s3://bucket-name
```

For a more detailed listing:

```bash
q s3 ls s3://bucket-name --recursive
```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-Party S3-Compatible CLI">
If you're using a third-party S3-compatible CLI, you can list objects with:

```bash
s3cmd ls s3://bucket-name
```

Or with the AWS CLI:

```bash
aws s3 ls s3://bucket-name --endpoint-url https://qstorage.quilibrium.com
```
  </TabItem>
</Tabs>

## Listing Objects with a Prefix

To list objects with a specific prefix (for example, all objects in a "folder"):

<Tabs>
  <TabItem value="qconsole" label="Using QConsole" default>
1. Sign in to QConsole
2. Navigate to QStorage
3. Select the bucket you want to view
4. Navigate to the folder or use the search functionality to filter by prefix
  </TabItem>
  <TabItem value="qcli" label="Using Q's CLI Tooling">
```bash
q s3 ls s3://bucket-name/prefix/
```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-Party S3-Compatible CLI">
```bash
s3cmd ls s3://bucket-name/prefix/
```

Or with the AWS CLI:

```bash
aws s3 ls s3://bucket-name/prefix/ --endpoint-url https://qstorage.quilibrium.com
```
  </TabItem>
</Tabs>

## Listing Objects Hierarchically (Using Delimiters)

When you use a delimiter, QStorage treats the delimiter as a break in the hierarchy, allowing you to list objects in a folder-like structure.

<Tabs>
  <TabItem value="qconsole" label="Using QConsole" default>
QConsole automatically uses delimiters to present objects in a hierarchical structure.
  </TabItem>
  <TabItem value="qcli" label="Using Q's CLI Tooling">
```bash
q s3 ls s3://bucket-name --delimiter "/"
```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-Party S3-Compatible CLI">
With the AWS CLI:

```bash
aws s3api list-objects-v2 --bucket bucket-name --delimiter "/" --endpoint-url https://qstorage.quilibrium.com
```
  </TabItem>
</Tabs>

## Pagination for Large Object Lists

For buckets with many objects, you'll need to handle pagination:

<Tabs>
  <TabItem value="qcli" label="Using Q's CLI Tooling" default>
The CLI tools handle pagination automatically in most cases.
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-Party S3-Compatible API">
```bash
aws s3api list-objects-v2 --bucket bucket-name --max-items 100 --starting-token YOUR_CONTINUATION_TOKEN --endpoint-url https://qstorage.quilibrium.com
```
  </TabItem>
</Tabs>

## Best Practices for Listing Objects

- **Use prefixes and delimiters** to organize and retrieve objects efficiently
- **Implement pagination** when dealing with buckets containing many objects
- **Consider performance implications** when listing large buckets frequently
- **Use appropriate listing patterns** based on your application's needs:
  - For simple browsing, use delimiter-based listing
  - For complete inventory, use recursive listing
  - For specific file types, use prefix filtering

## Performance Considerations

Listing operations on buckets with a large number of objects can be resource-intensive. Consider the following:

- Avoid frequent listing of entire buckets with many objects
- Use specific prefixes to narrow down the results
- Implement caching mechanisms if your application frequently lists the same objects
- For applications that need to track changes, consider using bucket notifications instead of repeated listing operations 