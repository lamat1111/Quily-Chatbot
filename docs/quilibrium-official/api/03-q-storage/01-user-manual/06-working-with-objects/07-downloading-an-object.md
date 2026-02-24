import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Downloading an Object

After you upload an object to a bucket, you can download the object to your local computer or access it programmatically. This section explains how to download objects from a QStorage bucket.


<Tabs>
  <TabItem value="qcli" label="Using Q's CLI Tooling" default>
```bash
# Download a file from a bucket to the current directory
qcli s3api cp s3://bucket-name/file.txt ./

# Download a file from a bucket to a specific location
qcli s3api cp s3://bucket-name/file.txt /path/to/local/destination/

# Download a file and specify the output filename
qcli s3api cp s3://bucket-name/file.txt /path/to/local/destination/new-filename.txt

# Download an entire directory recursively
qcli s3api cp s3://bucket-name/directory/ /path/to/local/destination/ --recursive
```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-party S3-compatible CLI">
```bash
# Download a file from a bucket
aws s3 cp s3://bucket-name/file.txt /path/to/local/destination/ --endpoint-url https://qstorage.quilibrium.com

# Download an entire directory recursively
aws s3 cp s3://bucket-name/directory/ /path/to/local/destination/ --recursive --endpoint-url https://qstorage.quilibrium.com

# Get a specific version of an object (if versioning is enabled)
aws s3api get-object --bucket bucket-name --key file.txt --version-id version-id /path/to/local/destination/file.txt --endpoint-url https://qstorage.quilibrium.com
```
  </TabItem>
</Tabs>

## Downloading Objects with Specific Versions

If you have enabled versioning on your bucket, multiple versions of an object might exist in the bucket. By default, QStorage retrieves the most recent version. To download a specific version of an object, you need to specify the version ID.

```bash
# Using a third-party S3-compatible CLI
aws s3api get-object --bucket bucket-name --key file.txt --version-id version-id /path/to/local/destination/file.txt --endpoint-url https://qstorage.quilibrium.com
```

## Downloading Large Objects

When downloading large objects, you might want to consider using multipart download capabilities to improve performance and resilience. Multipart downloads allow you to download parts of an object in parallel and resume downloads if they are interrupted.

Some third-party tools and SDKs automatically handle multipart downloads for large objects, making the process seamless for you.

## Best Practices for Downloading Objects

1. **Use the appropriate tool for the job**: For simple downloads, the CLI tools are sufficient. For more complex scenarios or application integration, consider using SDKs.

2. **Consider network conditions**: When downloading large objects, be aware of network conditions and consider using multipart downloads to improve resilience.

3. **Verify downloads**: After downloading an object, consider verifying its integrity by comparing checksums.

4. **Manage permissions**: Ensure you have the necessary permissions to download the objects you need.