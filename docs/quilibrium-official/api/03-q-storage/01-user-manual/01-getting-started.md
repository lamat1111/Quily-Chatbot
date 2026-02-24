import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Getting Started
Being that QStorage is a object store, it utilizes standard S3 terminology adapted to fit the Q Network:

| Term | Description | Example |
|------|-------------|---------|
| Bucket | A container for objects stored in QStorage. Every object is contained within a bucket. | A bucket named "my-documents" to store personal files |
| Object | The fundamental entities stored in QStorage. Objects consist of data and metadata. | A photo file named "vacation.jpg" stored in the "my-documents" bucket |
| Key | The unique identifier for an object within a bucket. | "photos/2023/vacation.jpg" as the key for an image file |
| Region | A geographic area where data is stored. <b>Noteably, Quilibrium is made up of one big region.</b> | The entire network is global, so there are no regions. |
| Access Control | Mechanisms to manage who can access objects and what actions they can perform. In Quilibrium, roles can be given to different keys. | One user has a key that can only read objects. |
| Versioning | A feature that keeps multiple variants of an object in the same bucket. | Maintaining previous versions of a document as it's updated |

<Tabs>
  <TabItem value="qconsole" label="Via QConsole" default>
    Many common QStorage actions can be done through the QConsole, which provides a user-friendly interface for managing your storage resources. 
    
    Here's how to access QStorage through the QConsole:

    1. Open your web browser and navigate to [QConsole](https://console.quilibrium.com)
    2. Sign in with your QConsole account credentials
    3. From the main dashboard, locate and click on the "Services" dropdown in the navigation menu
    4. Select "QStorage" from the list of available services
    5. You will be directed to the QStorage dashboard where you can:
       - View your existing buckets
       - Create new buckets
       - Upload, download, and manage objects
       - Configure bucket settings and permissions
       - Monitor storage usage and metrics

    The QStorage dashboard provides a comprehensive view of your storage resources and allows you to perform all common storage operations without using command-line tools.
  </TabItem>
  <TabItem value="qcli" label="Via QCLI">
    Quilibrium's native CLI tooling provides a straightforward way to interact with QStorage from your command line. The QCLI automatically uses the correct endpoints for QStorage operations.
    
    To get started with QCLI for QStorage:
    
    1. Ensure you have QCLI installed and configured with your credentials
    2. Use the `qcli s3` or `qcli s3api` commands to manage your storage
    3. Run `qcli s3 help` for a list of available commands
  </TabItem>
  <TabItem value="thirdparty" label="Via 3rd party CLI/SDKs">
    QStorage is compatible with standard S3 clients and SDKs. You can use tools like AWS CLI, boto3 (Python), AWS SDK for JavaScript, and other S3-compatible clients by configuring them to use the QStorage endpoint.
    
    Basic configuration example for AWS CLI:
    
    ```bash
    aws configure
    # Set your QStorage credentials:
    # AWS Access Key ID: ABC123 (Alpha-numeric format)
    # AWS Secret Access Key: mYad+fa332/daefad (string format)
    # Default region name: (leave empty)
    # Default output format: json (or your preference)
    ```
    
    Then use with the endpoint parameter:
    
    ```bash
    aws s3 ls --endpoint-url https://qstorage.quilibrium.com
    ```
  </TabItem>
</Tabs>

# Get Started
- To create a bucket in QStorage, see the [Create a Bucket](/docs/api/q-storage/user-manual/working-with-buckets/creating-a-bucket) guide.
- To learn how to upload objects to your QStorage buckets, see [Upload an Object](/docs/api/q-storage/user-manual/working-with-objects/upload-an-object).
- For instructions on downloading objects from QStorage, refer to [Download an Object](/docs/api/q-storage/user-manual/working-with-objects/downloading-an-object).
- To understand how to copy, move, or renaming objects between buckets or within the same bucket, check out [Copying, Moving, Renaming Objects](/docs/api/q-storage/user-manual/working-with-objects/copying-moving-renaming-objects).
- For information on how to delete objects and buckets in QStorage, see:
  - [Delete a Bucket](/docs/api/q-storage/user-manual/working-with-buckets/delete-a-bucket)
  - [Delete an Object](/docs/api/q-storage/user-manual/working-with-objects/delete-an-object)
  - [Empty a Bucket](/docs/api/q-storage/user-manual/working-with-buckets/empty-a-bucket)
