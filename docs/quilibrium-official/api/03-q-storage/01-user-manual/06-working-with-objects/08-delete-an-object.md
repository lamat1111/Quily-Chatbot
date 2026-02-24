import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Delete an Object

You can delete one or more objects directly from QStorage. This section explains how to delete objects from a QStorage bucket.

## Deleting a Single Object


<Tabs>
  <TabItem value="qcli" label="Using Q's CLI Tooling" default>
```bash
# Delete a single object
qcli s3api rm s3://bucket-name/file.txt

# Delete an object with a specific version ID (if versioning is enabled)
qcli s3api rm s3://bucket-name/file.txt --version-id version-id
```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-party S3-compatible CLI">
```bash
# Delete a single object
aws s3 rm s3://bucket-name/file.txt --endpoint-url https://qstorage.quilibrium.com

# Delete an object with a specific version ID (if versioning is enabled)
aws s3api delete-object --bucket bucket-name --key file.txt --version-id version-id --endpoint-url https://qstorage.quilibrium.com
```
  </TabItem>
</Tabs>

## Deleting Multiple Objects

You can delete multiple objects in a single request, which is useful for efficiently deleting a large number of objects.

<Tabs>
  <TabItem value="qcli" label="Using Q's CLI Tooling" default>
```bash
# Delete all objects with a specific prefix
qcli s3api rm s3://bucket-name/prefix/ --recursive

# Delete all objects in a bucket
qcli s3api rm s3://bucket-name/ --recursive
```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-party S3-compatible CLI">
```bash
# Delete all objects with a specific prefix
aws s3 rm s3://bucket-name/prefix/ --recursive --endpoint-url https://qstorage.quilibrium.com

# Delete all objects in a bucket
aws s3 rm s3://bucket-name/ --recursive --endpoint-url https://qstorage.quilibrium.com
```
  </TabItem>
</Tabs>

## Deleting Objects in a Versioned Bucket

If you have enabled versioning on your bucket, deleting an object doesn't permanently remove it. Instead, QStorage adds a delete marker, which becomes the current version of the object. To permanently delete a versioned object, you must delete all versions of the object.

<Tabs>
  <TabItem value="qcli" label="Using Q's CLI Tooling" default>
```bash
# Delete a specific version of an object
qcli s3api rm s3://bucket-name/file.txt --version-id version-id

# Delete all versions of all objects in a bucket
qcli s3api rm s3://bucket-name/ --recursive --versions
```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-party S3-compatible CLI">
```bash
# Delete a specific version of an object
aws s3api delete-object --bucket bucket-name --key file.txt --version-id version-id --endpoint-url https://qstorage.quilibrium.com

# List all versions of all objects in a bucket
aws s3api list-object-versions --bucket bucket-name --endpoint-url https://qstorage.quilibrium.com

# Delete all versions of all objects in a bucket (requires scripting)
# First, list all versions and delete markers
aws s3api list-object-versions --bucket bucket-name --endpoint-url https://qstorage.quilibrium.com > versions.json

# Then, parse the JSON and delete each version (example using jq and a shell script)
# This is a simplified example and may need adjustment for your specific case
for version in $(jq -r '.Versions[] | .Key + " " + .VersionId' versions.json); do
  key=$(echo $version | cut -d' ' -f1)
  versionId=$(echo $version | cut -d' ' -f2)
  aws s3api delete-object --bucket bucket-name --key "$key" --version-id "$versionId" --endpoint-url https://qstorage.quilibrium.com
done
```
  </TabItem>
</Tabs>

## Success
The response you should see upon Object deletion is a list of files deleted:
```
delete: s3://qstorage-demo-bucket/file.txt
```

## Considerations When Deleting Objects

1. **Permissions**: Ensure you have the necessary permissions to delete objects.

2. **Versioning**: If versioning is enabled, understand the implications of deleting objects.

3. **Deletion Costs**: There are no additional costs for deleting objects in QStorage.

4. **Irreversible Operation**: Deleting objects is generally irreversible, especially if versioning is not enabled.

5. **Multipart Uploads**: If you have incomplete multipart uploads, you should abort them to avoid storage charges.

