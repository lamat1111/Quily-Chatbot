# QStorage API Reference

This section provides detailed information about the QStorage API operations. QStorage is designed to be compatible with the Amazon S3 API, making it easy to use with existing S3 clients and SDKs.

## API Categories

### Bucket Operations
- [CreateBucket](/docs/api/q-storage/api-reference/bucket-operations/create-bucket)
- [DeleteBucket](/docs/api/q-storage/api-reference/bucket-operations/delete-bucket)
- [ListBuckets](/docs/api/q-storage/api-reference/bucket-operations/list-buckets)
- [HeadBucket](/docs/api/q-storage/api-reference/bucket-operations/head-bucket)

### Object Operations
- [PutObject](/docs/api/q-storage/api-reference/object-operations/put-object)
- [GetObject](/docs/api/q-storage/api-reference/object-operations/get-object)
- [DeleteObject](/docs/api/q-storage/api-reference/object-operations/delete-object)
- [CopyObject](/docs/api/q-storage/api-reference/object-operations/copy-object)
- [ListObjects](/docs/api/q-storage/api-reference/object-operations/list-objects)
- [HeadObject](/docs/api/q-storage/api-reference/object-operations/head-object)

### Multipart Upload Operations
- [CreateMultipartUpload](/docs/api/q-storage/api-reference/multipart-operations/create-multipart-upload)
- [UploadPart](/docs/api/q-storage/api-reference/multipart-operations/upload-part)
- [CompleteMultipartUpload](/docs/api/q-storage/api-reference/multipart-operations/complete-multipart-upload)
- [AbortMultipartUpload](/docs/api/q-storage/api-reference/multipart-operations/abort-multipart-upload)
- [ListMultipartUploads](/docs/api/q-storage/api-reference/multipart-operations/list-multipart-uploads)
- [ListParts](/docs/api/q-storage/api-reference/multipart-operations/list-parts)

### Access Control
- [GetBucketAcl](/docs/api/q-storage/api-reference/bucket-operations/get-bucket-acl)
- [PutBucketAcl](/docs/api/q-storage/api-reference/bucket-operations/put-bucket-acl)
- [GetObjectAcl](/docs/api/q-storage/api-reference/object-operations/get-object-acl)
- [PutObjectAcl](/docs/api/q-storage/api-reference/object-operations/put-object-acl)

### Lifecycle Operations
- [PutBucketLifecycle](/docs/api/q-storage/api-reference/bucket-operations/put-bucket-lifecycle)
- [GetBucketLifecycle](/docs/api/q-storage/api-reference/bucket-operations/get-bucket-lifecycle)
- [DeleteBucketLifecycle](/docs/api/q-storage/api-reference/bucket-operations/delete-bucket-lifecycle)

<!-- ### Analytics and Metrics
- [GetBucketMetrics](analytics-metrics/get-bucket-metrics)
- [PutBucketMetrics](analytics-metrics/put-bucket-metrics)
- [ListBucketMetrics](analytics-metrics/list-bucket-metrics)
- [DeleteBucketMetrics](analytics-metrics/delete-bucket-metrics) -->

<!-- ### Notification Operations
- [PutBucketNotification](notification-operations/put-bucket-notification)
- [GetBucketNotification](notification-operations/get-bucket-notification) -->

### Website Operations
- [PutBucketWebsite](/docs/api/q-storage/api-reference/bucket-operations/put-bucket-website)
- [GetBucketWebsite](/docs/api/q-storage/api-reference/bucket-operations/get-bucket-website)
- [DeleteBucketWebsite](/docs/api/q-storage/api-reference/bucket-operations/delete-bucket-website) 