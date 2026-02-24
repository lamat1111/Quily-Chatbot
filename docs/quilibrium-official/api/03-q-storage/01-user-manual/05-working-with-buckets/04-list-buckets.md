import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Listing a Bucket's Contents

Listing a Bucket's content is a fundamental command to see what currently exists utilizing [ListBuckets](/docs/api/q-storage/user-manual/working-with-buckets/list-buckets).

## List Bucket

<Tabs>
  <TabItem value="qconsole" label="Using QConsole" default>
    To create a bucket using QConsole:

    1. Log in to your QConsole account
    2. Navigate to the QStorage service section
    3. You should see for your account listed.

    Your new bucket will appear in the bucket list and is immediately available for use.
  </TabItem>
  <TabItem value="qcli" label="Using Q's CLI tooling">
    Quilibrium's native CLI tooling will default to use the correct endpoint.
    ```bash
     qcli s3 ls
    ```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-party S3-compatible CLI">
    You can utilize a third-party S3-compatible CLI with a QStorage API key and modifying the endpoint to point to QStorage.

    ```bash
    aws s3 ls --endpoint-url https://qstorage.quilibrium.com
    ```

    You can utilize the other methods to set this as described in their [documentation](https://docs.aws.amazon.com/cli/v1/userguide/cli-configure-files.html).  
  </TabItem>

</Tabs>

 ## Success
  When complete you should see a response of:
  ```json
  2025-04-04 14:50:38 test-bucket
  ```

## Related Operations

- [Delete A Bucket](/docs/api/q-storage/user-manual/working-with-buckets/delete-a-bucket)
- [Empty A Bucket](/docs/api/q-storage/user-manual/working-with-buckets/empty-a-bucket)
- [Using Bucket Tags](/docs/api/q-storage/user-manual/working-with-buckets/using-bucket-tags)
- [Listing Bucket Contents](/docs/api/q-storage/user-manual/working-with-objects/list-bucket-contents)
  

