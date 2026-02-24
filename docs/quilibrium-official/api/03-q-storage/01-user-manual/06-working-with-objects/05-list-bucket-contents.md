import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Listing a Bucket's Contents

Listing a Bucket's content is a fundamental command to see what currently exists utilizing [ListObjectsV2](/docs/api/q-storage/api-reference/object-operations/list-objects-v2).

## List Bucket

<Tabs>
  <TabItem value="qconsole" label="Using QConsole" default>
    To create a bucket using QConsole:

    1. Log in to your QConsole account
    2. Navigate to the QStorage service section
    3. Select the relavant bucket
    4. You should see a list of the bucket's content by Object name.

    Your new bucket will appear in the bucket list and is immediately available for use.
  </TabItem>
  <TabItem value="qcli" label="Using Q's CLI tooling">
    Quilibrium's native CLI tooling will default to use the correct endpoint.
    ```bash
     qcli s3api list-objects --bucket qstorage-demo-bucket
    ```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-party S3-compatible CLI">
    You can utilize a third-party S3-compatible CLI with a QStorage API key and modifying the endpoint to point to QStorage.

    ```bash
    aws s3api list-objects \
        --bucket qstorage-demo-bucket \
        --endpoint-url https://qstorage.quilibrium.com
    ```

    You can utilize the other methods to set this as described in their [documentation](https://docs.aws.amazon.com/cli/v1/userguide/cli-configure-files.html).  
  </TabItem>

</Tabs>

## Filter Object Return Output
You can additionally use the --query argument to filter the output of list-objects down to the key value and size for each object:

```bash
qcli s3api list-objects --bucket qstorage-demo-bucket --query 'Contents[].{Key: Key, Size: Size}'
```
This should reduce the size of your output (and response size) to only what you need for your subsequent commands.

### Filter Objects By MetaData
If you have user-defined data, you have to list your bucket contents for the keys:
```
qcli s3api list-objects --bucket bucket-name --query 'Contents[].{Key: Key}'
```
then loop through the Object's keys using the [HEAD API request](/docs/api/q-storage/api-reference/object-operations/head-object) for each Object to get the metadata and then filter by the Tags and their respective Values in your application's language.
```

## Success
When complete you should see a response of:
  ```json
  {
    "Contents": [
        {
            "Key": "TEST",
            "LastModified": "2025-04-05T00:01:33+00:00",
            "ETag": "\"98fe4eeb7a37b06cc47b4ad1d4c18b0d\"",
            "Size": 61,
            "StorageClass": "STANDARD",
            "Owner": {
                "DisplayName": "test-admin",
                "ID": "test-admin"
            }
        }
    ],
    "RequestCharged": null,
    "Prefix": ""
}
```

### Success With Query
```json
[
    {
        "Key": "TEST",
        "Size": 61
    }
]
```

### Success with Empty Bucket
```
null
```

## Related Function

- [Delete Object](/docs/api/q-storage/user-manual/working-with-objects/delete-an-object)