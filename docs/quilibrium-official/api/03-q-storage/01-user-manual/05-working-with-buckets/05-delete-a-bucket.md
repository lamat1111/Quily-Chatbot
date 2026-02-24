# Delete a Bucket

Once a bucket has been emptied, it can be deleted. 

A bucket with Objects cannot be deleted.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Deleting all Objects in a Bucket
Before deleting a bucket, you must first empty it by removing all objects. For detailed instructions on emptying a bucket, please refer to [Empty a Bucket](/docs/api/q-storage/user-manual/working-with-buckets/empty-a-bucket).

You can also delete objects individually before deleting the bucket. For more information on deleting individual objects, see [Delete an Object](/docs/api/q-storage/user-manual/working-with-objects/delete-an-object).

## Bucket Deletion

<Tabs>
  <TabItem value="qcli" label="Using Q's CLI Tooling" default>
```
Coming soon
```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-party S3-compatible CLI">
```
aws s3 rb s3://quil-s3-demo-bucket --force  
```
  </TabItem>
</Tabs>

## Deleting a Public Bucket
You should consider whether or not you actually want to delete a bucket that has been made public.
- Do not delete if you plan to re-use a public bucket, deleting will allow somebody else to use the window between deletion and recreation to publish their own bucket with that name (private bucket names can collide, public ones cannot).
- An empty bucket does not cost you anything, but can be a way to fool people into tricking people about who owns the bucket if you let somebody else take a name you previously used.
   - An example would be if you had content hosted in a bucket named `quil-s3-demo-official` and then deleted it.  Somebody could reserve that name and put up similar content with malicious intent so it would appear to be you.
