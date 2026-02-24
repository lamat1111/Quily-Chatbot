# Upload an Object

When you upload a file to QStorage, it is stored as an object. Objects consist of the file data and metadata that describes the object. You can have an unlimited number of objects in a bucket. Before you can upload files to a QStorage bucket, you need write permissions for the bucket.

You can upload any file type — images, backups, data, movies, and so on — into a QStorage bucket. The maximum size of a file that you can upload depends on the method you use:

* Using the QStorage CLI: Up to 5 GB in a single operation
* Using multipart upload: Up to 5 TB

If you upload an object with a key name that already exists in a versioning-enabled bucket, QStorage creates another version of the object instead of replacing the existing object.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Upload Methods

Depending on the size of the data that you're uploading, QStorage offers the following options:

* **Single operation upload**: With a single operation, you can upload a single object up to 5 GB in size.
* **Multipart upload**: Using the multipart upload operation, you can upload a single large object, up to 5 TB in size.

The multipart upload operation is designed to improve the upload experience for larger objects. You can upload an object in parts. These object parts can be uploaded independently, in any order, and in parallel. You can use a multipart upload for objects from 5 MB to 5 TB in size.

<Tabs>
  <TabItem value="qcli" label="Using Q's CLI Tooling" default>
```bash
# Upload a file to a bucket
qcli s3api cp /path/to/local/file.txt s3://bucket-name/

# Upload a file to a specific path in a bucket
qcli s3api cp /path/to/local/file.txt s3://bucket-name/folder/file.txt

# Upload a file with specific metadata
qcli s3api cp /path/to/local/file.txt s3://bucket-name/ --metadata '{"key1":"value1","key2":"value2"}'

# Upload a directory recursively
qcli s3api cp /path/to/local/directory s3://bucket-name/directory/ --recursive
```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-party S3-compatible CLI">
```bash
# Upload a file to a bucket
aws s3 cp /path/to/local/file.txt s3://bucket-name/ --endpoint-url https://qstorage.quilibrium.com

# Upload a file with specific metadata
aws s3api put-object --bucket bucket-name --key file.txt --body /path/to/local/file.txt --metadata '{"key1":"value1","key2":"value2"}' --endpoint-url https://qstorage.quilibrium.com

# Upload a large file using multipart upload
aws s3 cp /path/to/large/file.txt s3://bucket-name/ --endpoint-url https://qstorage.quilibrium.com
```
  </TabItem>
</Tabs>

## Success
You should see a list of files that were uploaded and the end destination:
```bash
upload: relative/path/to/file.txt to s3://bucket-name/file.txt 
```

## Listing Uploaded Content
To verify that your content is uploaded see: 

## Organizing Objects Using Folders

When you upload objects to QStorage, you can organize them using folders. In QStorage, folders are represented as prefixes that appear in the object key name.

For example, if you upload an object named `sample1.jpg` to a folder named `images`, the key name is `images/sample1.jpg`. The object is displayed as `sample1.jpg` in the `images` folder.

When you upload a folder, QStorage uploads all of the files and subfolders from the specified folder to your bucket. It then assigns an object key name that is a combination of the uploaded file name and the folder name.

### Using MetaData to Tag your Objects
You can further use your own tags on Object uploads to organize your content:
```bash
<cli-upload-command> --metadata '{"key1":"value1","key2":"value2"}'
```

See [Working with Metadata](/docs/api/q-storage/user-manual/working-with-objects/working-with-metadata) for more information.

## Related Functions

- [Delete an Object](/docs/api/q-storage/user-manual/working-with-objects/delete-an-object)
- [Working with Metadata](/docs/api/q-storage/user-manual/working-with-objects/working-with-metadata)