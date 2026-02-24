import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Create a Bucket
Creating a bucket is necessary to start uploading Objects.

<Tabs>
  <TabItem value="qconsole" label="Using QConsole" default>
    To create a bucket using QConsole:

    1. Log in to your QConsole account
    2. Navigate to the QStorage service section
    3. Click on the "Create Bucket" button
    4. Enter a bucket name, for naming help and guidelines refer to the [Naming documentation](/docs/api/q-storage/user-manual/working-with-buckets/bucket-names)
       - Plan for a unique name if it will be public
    5. Configure any additional settings as needed
    6. Click "Create" to finalize the bucket creation

    Your new bucket will appear in the bucket list and is immediately available for use.
  </TabItem>
  <TabItem value="qcli" label="Using Q's CLI tooling">
    Quilibrium's native CLI tooling will default to use the correct endpoint.
    ```bash
     qcli s3 create-bucket --bucket quil-s3-demo-bucket
    ```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-party S3-compatible CLI">
    You can utilize a third-party S3-compatible CLI with a QStorage API key and modifying the endpoint to point to QStorage.

    ```bash
    aws s3api create-bucket \
        --bucket quil-s3-demo-bucket \
        --endpoint-url https://qstorage.quilibrium.com
    ```

    You can utilize the other methods to set this as described in their [documentation](https://docs.aws.amazon.com/cli/v1/userguide/cli-configure-files.html).  
  </TabItem>

</Tabs>

 ## Success
  When complete you should see a response of:
  ```json
  {
    "Location": "/tyler-test"
  }
  ```

## What's Next?
- [Edit Bucket Visibility](/docs/api/q-storage/user-manual/working-with-buckets/edit-bucket-visibility)
- [Add an Object to Bucket](/docs/api/q-storage/user-manual/working-with-objects/upload-an-object)
- [Delete a Bucket](/docs/api/q-storage/user-manual/working-with-buckets/delete-a-bucket)
- [Empty a Bucket](/docs/api/q-storage/user-manual/working-with-buckets/empty-a-bucket)
- [Using Bucket Tags](/docs/api/q-storage/user-manual/working-with-buckets/using-bucket-tags)

