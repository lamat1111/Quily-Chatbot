# Organizing Objects Using Folders

In QStorage, objects are the primary resources, and objects are stored in buckets. QStorage buckets have a flat structure instead of a hierarchy like you would see in a file system. However, for organizational simplicity, QStorage supports the concept of folders as a means of grouping objects.

Folders in QStorage work by using a shared name prefix for grouped objects. In other words, the grouped objects have names that begin with a common string. This common string, or shared prefix, is the folder name. Object names are also referred to as key names.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## How Folders Work in QStorage

For example, you can create a folder in a bucket named `photos` and store an object named `myphoto.jpg` in it. The object is then stored with the key name `photos/myphoto.jpg`, where `photos/` is the prefix.

Here are two more examples:

* If you have three objects in your bucket — `logs/date1.txt`, `logs/date2.txt`, and `logs/date3.txt` — QStorage will show a folder named `logs`. If you open the folder, you will see three objects: `date1.txt`, `date2.txt`, and `date3.txt`.
* If you have an object named `photos/2023/example.jpg`, QStorage shows you a folder named `photos` that contains the folder `2023`. The folder `2023` contains the object `example.jpg`.

You can have folders within folders, but not buckets within buckets. You can upload and copy objects directly into a folder. Folders can be created, deleted, and made public, but they can't be renamed. Objects can be copied from one folder to another.

## Important Notes About Folders

When you create a folder in QStorage, the system creates a 0-byte object. This object key is set to the folder name that you provided plus a trailing forward slash (`/`) character. For example, if you create a folder named `photos` in your bucket, QStorage creates a 0-byte object with the key `photos/`. This object is created to support the idea of folders.

Also, any pre-existing object that's named with a trailing forward slash character (`/`) appears as a folder in QStorage. For example, an object with the key name `examplekeyname/` appears as a folder and not as an object. Otherwise, it behaves like any other object and can be viewed and manipulated through the CLI or API.

## Creating a Folder

<Tabs>
  <TabItem value="qconsole" label="Using QConsole" default>
1. Navigate to the QConsole
2. Select the bucket where you want to create a folder
3. Click on "Create folder"
4. Enter a name for the folder (for example, `documents`)
5. Click "Create folder"
  </TabItem>
  <TabItem value="qcli" label="Using Q's CLI Tooling">
You can create folders using the CLI by either creating a 0-byte object with a trailing slash or by uploading objects with the folder prefix:

```bash
# Create an empty folder
qcli s3api put-object --bucket bucket-name --key folder-name/ --body /dev/null

# Upload an object to a folder (creates the folder if it doesn't exist)
qcli s3api cp /path/to/local/file.txt s3://bucket-name/folder-name/
```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-party S3-compatible CLI">
```bash
# Create an empty folder
aws s3api put-object --bucket bucket-name --key folder-name/ --body /dev/null --endpoint-url https://qstorage.quilibrium.com

# Upload an object to a folder (creates the folder if it doesn't exist)
aws s3 cp /path/to/local/file.txt s3://bucket-name/folder-name/ --endpoint-url https://qstorage.quilibrium.com
```
  </TabItem>
</Tabs>

## Making Folders Public

We recommend blocking all public access to your QStorage folders and buckets unless you specifically require a public folder or bucket. When you make a folder public, anyone on the internet can view all the objects that are grouped in that folder.

<Tabs>
  <TabItem value="qconsole" label="Using QConsole" default>
1. Navigate to the QConsole
2. Select the bucket containing the folder you want to make public
3. Select the folder
4. Click on "Make public"
5. Confirm your action
  </TabItem>
  <TabItem value="qcli" label="Using Q's CLI Tooling">
You can make a folder public by setting the ACL for all objects in the folder:

```bash
# Make all objects in a folder public
qcli s3api put-object-acl --bucket bucket-name --prefix folder-name/ --acl public-read --recursive
```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-party S3-compatible CLI">
```bash
# Make all objects in a folder public
aws s3 cp s3://bucket-name/folder-name/ s3://bucket-name/folder-name/ --acl public-read --recursive --metadata-directive REPLACE --endpoint-url https://qstorage.quilibrium.com
```
  </TabItem>
</Tabs>

> **Warning**: After you make a folder public, you can't make it private again with a single action. Instead, you must set permissions on each individual object in the public folder so that the objects have no public access.

## Calculating Folder Size

<Tabs>
  <TabItem value="qconsole" label="Using QConsole" default>
1. Navigate to the QConsole
2. Select the bucket containing the folder
3. Select the checkbox next to the folder name
4. Click on "Actions" and select "Calculate total size"

The total size and number of objects will be displayed. Note that this information is only available temporarily and will need to be recalculated if you navigate away from the page.
  </TabItem>
  <TabItem value="qcli" label="Using Q's CLI Tooling">
```bash
# List all objects in a folder with their sizes
qcli s3api ls s3://bucket-name/folder-name/ --recursive --human-readable --summarize
```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-party S3-compatible CLI">
```bash
# List all objects in a folder with their sizes
aws s3 ls s3://bucket-name/folder-name/ --recursive --human-readable --summarize --endpoint-url https://qstorage.quilibrium.com
```
  </TabItem>
</Tabs>

## Deleting Folders

When you delete a folder, all objects within that folder are also deleted.

<Tabs>
  <TabItem value="qconsole" label="Using QConsole" default>
1. Navigate to the QConsole
2. Select the bucket containing the folder you want to delete
3. Select the checkbox next to the folder name
4. Click on "Delete"
5. Confirm the deletion
  </TabItem>
  <TabItem value="qcli" label="Using Q's CLI Tooling">
```bash
# Delete a folder and all its contents
qcli s3api rm s3://bucket-name/folder-name/ --recursive
```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-party S3-compatible CLI">
```bash
# Delete a folder and all its contents
aws s3 rm s3://bucket-name/folder-name/ --recursive --endpoint-url https://qstorage.quilibrium.com
```
  </TabItem>
</Tabs>

> **Warning**: This action deletes all objects in the folder. When deleting folders, wait for the delete action to finish before adding new objects to the folder. Otherwise, new objects might be deleted as well. 