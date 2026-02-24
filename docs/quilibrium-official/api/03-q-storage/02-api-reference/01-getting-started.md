import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Getting Started with QStorage API

QStorage provides an S3-compatible API that allows you to store and retrieve any amount of data, at any time, from anywhere on the Quilibrium Network. This API reference documentation provides details about the operations and parameters available in the QStorage API.

## API Endpoint

The QStorage API endpoint is:

```
https://qstorage.quilibrium.com
```

## Authentication

QStorage uses the same authentication mechanism as Amazon S3. You need to provide your QConsole credentials (access key and secret key) to authenticate your requests.

<Tabs>
  <TabItem value="qcli" label="Using Q's CLI Tooling" default>
    Quilibrium's native CLI tooling will automatically use the correct endpoint and authentication for QStorage operations.
    
    ```bash
    # Configure your credentials
    qcli configure
    
    # Use QStorage commands
    qcli s3 ls
    ```
  </TabItem>
  <TabItem value="thirdparty" label="Using a Third-party S3-compatible CLI">
    You can use any S3-compatible client or SDK by configuring it to use the QStorage endpoint and your QConsole credentials.
    
    ```bash
    # Configure AWS CLI with your QConsole credentials
    aws configure
    # AWS Access Key ID: ABC123 (alpha-numeric format)
    # AWS Secret Access Key: Adadf4dad/adsf+da4 (string format)
    # Default region name: (leave empty)
    # Default output format: json (or your preference)
    
    # Use S3 commands with the QStorage endpoint
    aws s3 ls --endpoint-url https://qstorage.quilibrium.com
    ```
  </TabItem>
</Tabs>

## Available Operations

QStorage supports the following basic API operations (see API Reference sections for extensive list):

### Object Operations

* [PutObject](/docs/api/q-storage/api-reference/object-operations/put-object) - Adds an object to a bucket
* [GetObject](/docs/api/q-storage/api-reference/object-operations/get-object) - Retrieves an object from a bucket
* [CopyObject](/docs/api/q-storage/api-reference/object-operations/copy-object) - Creates a copy of an object
* [DeleteObject](/docs/api/q-storage/api-reference/object-operations/delete-object) - Removes an object from a bucket

### Bucket Operations

* [CreateBucket](/docs/api/q-storage/api-reference/bucket-operations/create-bucket) - Creates a new bucket
* [DeleteBucket](/docs/api/q-storage/api-reference/bucket-operations/delete-bucket) - Deletes a bucket

## S3 Compatibility

QStorage is designed to be compatible with the Amazon S3 API, which means you can use existing S3 clients and SDKs to interact with QStorage. However, there may be some differences or limitations compared to Amazon S3.

For more information about the Amazon S3 API, you can refer to the [Amazon S3 API Reference](https://docs.aws.amazon.com/AmazonS3/latest/API/Welcome.html).

## Error Responses

QStorage returns standard HTTP status codes to indicate the success or failure of an API request. In addition, error responses include an XML error document that provides details about the error.

Example error response:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Error>
   <Code>NoSuchBucket</Code>
   <Message>The specified bucket does not exist</Message>
   <BucketName>non-existent-bucket</BucketName>
   <RequestId>4442587FB7D0A2F9</RequestId>
</Error>
```

## Next Steps

To get started with QStorage, you can:

1. Create a bucket using the [CreateBucket](/docs/api/q-storage/api-reference/bucket-operations/create-bucket) operation
2. Upload an object using the [PutObject](/docs/api/q-storage/api-reference/object-operations/put-object) operation
3. Download an object using the [GetObject](/docs/api/q-storage/api-reference/object-operations/get-object) operation
4. Copy an object using the [CopyObject](/docs/api/q-storage/api-reference/object-operations/copy-object) operation
5. Delete an object using the [DeleteObject](/docs/api/q-storage/api-reference/object-operations/delete-object) operation
6. Delete a bucket using the [DeleteBucket](/docs/api/q-storage/api-reference/bucket-operations/delete-bucket) operation 