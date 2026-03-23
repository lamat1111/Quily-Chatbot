---
title: "QStorage API Reference — S3-Compatible REST API"
source: official_docs_synthesis
date: 2026-02-11
type: technical_reference
topics:
  - QStorage API
  - S3 API
  - bucket operations
  - object operations
  - multipart upload
  - data types
  - REST API
  - credentials
  - authentication
  - HMAC signatures
---

# QStorage API Reference — S3-Compatible REST API

QStorage is Quilibrium's S3-compatible object storage service built on the decentralized Quilibrium Network. It provides scalable, censorship-resistant, privacy-respecting data storage and retrieval through a REST API that is highly compatible with the Amazon S3 API. Existing S3 clients, SDKs, and CLI tools work with QStorage by simply pointing them at the QStorage endpoint.

## API Endpoint and Base URL

All QStorage API requests are sent to a single base endpoint:

```
https://qstorage.quilibrium.com
```

Bucket-level operations use virtual-hosted-style addressing. Each bucket is accessed via a subdomain of the base endpoint:

```
https://{BucketName}.qstorage.quilibrium.com
```

For example, a bucket named `my-data` is accessed at `https://my-data.qstorage.quilibrium.com`.

## Authentication and Credentials

QStorage uses the same HMAC-based authentication mechanism as Amazon S3 (AWS Signature Version 4). Every request must be signed with your QConsole credentials, which consist of an **Access Key ID** (alphanumeric string) and a **Secret Access Key**.

### Obtaining Credentials

Credentials can be managed through three methods:

- **QConsole** (recommended): A web interface for creating API keys, managing access permissions, monitoring usage, and rotating keys. QConsole keys follow a hierarchical structure similar to AWS accounts, enabling role-based access control with the principle of least privilege.
- **QKMS**: Quilibrium's dedicated Key Management Service for centralized cryptographic key management, automated key rotation, and audit logging.
- **Third-party tools**: Any S3-compatible KMS or credential management tool can be used by configuring it with the QStorage endpoint.

### Configuring CLI Tools

Using Quilibrium's native CLI (`qcli`):

```bash
qcli configure
qcli s3 ls
```

Using the AWS CLI or any third-party S3-compatible CLI:

```bash
aws configure
# Access Key ID: your-access-key
# Secret Access Key: your-secret-key
# Default region name: (leave empty)

aws s3 ls --endpoint-url https://qstorage.quilibrium.com
```

### Credential Best Practices

- Use unique credentials for different services and applications.
- Implement least-privilege access through QConsole's hierarchical key structure.
- Rotate keys regularly.
- Monitor for unauthorized access.

## Common Request Headers

Every QStorage request includes standard HTTP headers plus S3-compatible custom headers:

| Header | Description |
|--------|-------------|
| `Host` | The bucket endpoint, e.g. `my-bucket.qstorage.quilibrium.com` |
| `x-amz-date` | Timestamp of the request (ISO 8601) |
| `Authorization` | AWS Signature Version 4 authorization string |
| `x-amz-content-sha256` | SHA-256 hash of the request payload |
| `x-amz-expected-bucket-owner` | Optional: expected account ID of the bucket owner (returns 403 on mismatch) |
| `x-amz-request-payer` | Optional: set to `requester` for Requester Pays buckets |

## Common Response Headers

All responses include:

| Header | Description |
|--------|-------------|
| `x-amz-id-2` | An identifier for the request |
| `x-amz-request-id` | A unique identifier for troubleshooting |
| `Date` | The date and time the response was sent |

---

## Bucket Operations

Buckets are the top-level containers for objects in QStorage. Bucket names must be globally unique across all QStorage users.

### Bucket Naming Rules

- Must be 3 to 63 characters long.
- May contain only lowercase letters, numbers, dots (`.`), and hyphens (`-`).
- Must begin and end with a letter or number.
- Must not be formatted as an IP address (e.g., `192.168.5.4`).

### CreateBucket

Creates a new bucket.

```
PUT / HTTP/1.1
Host: {BucketName}.qstorage.quilibrium.com
```

**Optional headers**: `x-amz-acl` (canned ACL: `private`, `public-read`, `public-read-write`, `authenticated-read`), `x-amz-bucket-object-lock-enabled`, `x-amz-object-ownership`, and grant headers (`x-amz-grant-full-control`, `x-amz-grant-read`, `x-amz-grant-write`, `x-amz-grant-read-acp`, `x-amz-grant-write-acp`).

**Request body** (optional):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<CreateBucketConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
</CreateBucketConfiguration>
```

**Success response**: HTTP 200 with `Location` header containing the bucket URI.

**Errors**: `BucketAlreadyExists`, `BucketAlreadyOwnedByYou`, `InvalidBucketName`, `TooManyBuckets`, `403 Forbidden`.

**Permission**: `s3:CreateBucket`.

### DeleteBucket

Deletes an empty bucket. All objects (including all versions and delete markers) must be removed first.

```
DELETE / HTTP/1.1
Host: {BucketName}.qstorage.quilibrium.com
```

**Success response**: HTTP 204 (No Content). No response body.

**Errors**: `BucketNotEmpty`, `NoSuchBucket`, `403 Forbidden`.

**Permission**: `s3:DeleteBucket`.

### ListBuckets

Returns all buckets owned by the authenticated user, in alphabetical order.

```
GET / HTTP/1.1
Host: qstorage.quilibrium.com
```

**Query parameters**: `max-buckets` (default 1000), `continuation-token` (for pagination), `prefix` (filter by bucket name prefix).

**Response body** (XML):

```xml
<ListAllMyBucketsResult>
  <Owner>
    <ID>123456789012</ID>
    <DisplayName>user@example.com</DisplayName>
  </Owner>
  <Buckets>
    <Bucket>
      <Name>my-bucket-1</Name>
      <CreationDate>2024-03-01T12:00:00.000Z</CreationDate>
    </Bucket>
  </Buckets>
  <IsTruncated>false</IsTruncated>
</ListAllMyBucketsResult>
```

**Permission**: `s3:ListAllMyBuckets`.

### HeadBucket

Checks whether a bucket exists and whether you have access. Returns HTTP 200 if the bucket exists, HTTP 404 if it does not. No response body.

```
HEAD / HTTP/1.1
Host: {BucketName}.qstorage.quilibrium.com
```

**Permission**: `s3:ListBucket`.

### GetBucketTagging

Returns the tag set associated with a bucket.

```
GET /?tagging HTTP/1.1
Host: {BucketName}.qstorage.quilibrium.com
```

**Response body** (XML):

```xml
<Tagging xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
  <TagSet>
    <Tag>
      <Key>project</Key>
      <Value>project-one</Value>
    </Tag>
  </TagSet>
</Tagging>
```

**Errors**: `NoSuchBucket`, `NoSuchTagSet`, `403 Forbidden`.

**Permission**: `s3:GetBucketTagging`.

### GetBucketAcl

Returns the Access Control List (ACL) of a bucket, including the owner and a list of grants.

```
GET /?acl HTTP/1.1
Host: {BucketName}.qstorage.quilibrium.com
```

**Permission**: `s3:GetBucketAcl`.

---

## Object Operations

Objects are the fundamental entities stored in QStorage buckets, consisting of data and metadata.

### PutObject

Uploads an object to a bucket. If an object with the same key already exists, it is replaced entirely.

```
PUT /{ObjectKey} HTTP/1.1
Host: {BucketName}.qstorage.quilibrium.com
Content-Length: {size}
Content-Type: {mime-type}
```

**Key constraints**:
- Maximum single PUT size: **5 GB**. For larger objects, use multipart upload.
- For objects larger than 100 MB, multipart upload is recommended for reliability.
- User-defined metadata (headers with `x-amz-meta-*` prefix) is limited to 2 KB total.
- QStorage never adds partial objects; a success response means the entire object was stored.

**Optional features**:
- **ACLs**: Set via `x-amz-acl` (canned) or `x-amz-grant-*` headers.
- **Data integrity**: `Content-MD5`, or checksum headers (`x-amz-checksum-crc32`, `x-amz-checksum-crc32c`, `x-amz-checksum-sha1`, `x-amz-checksum-sha256`).
- **Server-side encryption**: `x-amz-server-side-encryption` with values `AES256` (SSE-S3) or `verenc` (SSE-KMS via QKMS).
- **Object Lock**: `x-amz-object-lock-mode` (`GOVERNANCE` or `COMPLIANCE`), `x-amz-object-lock-retain-until-date`, `x-amz-object-lock-legal-hold`.
- **Tagging**: `x-amz-tagging` (URL-encoded key=value pairs).

**Example request and response**:

```http
PUT /hello.txt HTTP/1.1
Host: my-bucket.qstorage.quilibrium.com
Content-Length: 11
Content-Type: text/plain

Hello World
```

```http
HTTP/1.1 200 OK
ETag: "7778aef83f66abc1fa1e8477f296d394"
x-amz-request-id: TX234S0F24A06C7
```

**Errors**: `NoSuchBucket`, `EntityTooLarge`, `InvalidDigest`, `MissingContentLength`, `403 Forbidden`.

**Permission**: `s3:PutObject` (plus `s3:PutObjectAcl` and `s3:PutObjectTagging` for ACLs and tags).

### GetObject

Retrieves an object from a bucket. The response includes the object data in the body and metadata in headers.

```
GET /{ObjectKey} HTTP/1.1
Host: {BucketName}.qstorage.quilibrium.com
```

**Query parameters**: `versionId`, `partNumber`, and response-override parameters (`response-content-type`, `response-content-disposition`, `response-cache-control`, `response-content-encoding`, `response-content-language`, `response-expires`).

**Optional headers**: `Range` (byte range requests, e.g. `bytes=0-1024`), conditional headers (`If-Match`, `If-None-Match`, `If-Modified-Since`, `If-Unmodified-Since`), SSE-C decryption headers.

**Example -- range request**:

```http
GET /hello.txt HTTP/1.1
Host: my-bucket.qstorage.quilibrium.com
Range: bytes=0-4
```

```http
HTTP/1.1 206 Partial Content
Content-Range: bytes 0-4/11
Content-Length: 5
ETag: "7778aef83f66abc1fa1e8477f296d394"

Hello
```

**Errors**: `NoSuchBucket`, `NoSuchKey`, `InvalidRange`, `PreconditionFailed`, `403 Forbidden`, `304 Not Modified`.

**Permission**: `s3:GetObject`.

### DeleteObject

Removes an object from a bucket. The operation is idempotent -- deleting the same object multiple times has no additional effect.

```
DELETE /{ObjectKey} HTTP/1.1
Host: {BucketName}.qstorage.quilibrium.com
```

**Query parameters**: `versionId` (to delete a specific version).

**Success response**: HTTP 204 (No Content).

**Permission**: `s3:DeleteObject`.

### CopyObject

Creates a copy of an existing object. The source is specified via the `x-amz-copy-source` header.

```
PUT /{DestinationKey} HTTP/1.1
Host: {DestBucket}.qstorage.quilibrium.com
x-amz-copy-source: {SourceBucket}/{SourceKey}
```

**Key constraints**: Cannot copy objects larger than 5 GB in a single operation (use multipart copy instead).

**Metadata handling**: By default (`x-amz-metadata-directive: COPY`), metadata is copied from the source. Set to `REPLACE` to provide new metadata.

**Response body** (XML):

```xml
<CopyObjectResult>
  <LastModified>2024-03-01T12:00:00.000Z</LastModified>
  <ETag>"7778aef83f66abc1fa1e8477f296d394"</ETag>
</CopyObjectResult>
```

**Permission**: `s3:GetObject` on source, `s3:PutObject` on destination.

### HeadObject

Retrieves object metadata without returning the object body. Useful for checking existence, size, content type, and other metadata.

```
HEAD /{ObjectKey} HTTP/1.1
Host: {BucketName}.qstorage.quilibrium.com
```

Returns metadata via response headers: `Content-Length`, `Content-Type`, `ETag`, `Last-Modified`, `x-amz-server-side-encryption`, `x-amz-meta-*`, and more.

**Permission**: `s3:GetObject`.

### ListObjectsV2

Returns up to 1000 objects in a bucket per request. Supports pagination, prefix filtering, and delimiter-based grouping.

```
GET /?list-type=2 HTTP/1.1
Host: {BucketName}.qstorage.quilibrium.com
```

**Query parameters**: `list-type=2` (required), `prefix`, `delimiter`, `max-keys`, `start-after`, `continuation-token`, `encoding-type`, `fetch-owner`.

**Response body** (XML):

```xml
<ListBucketResult>
  <Name>my-bucket</Name>
  <Prefix>documents/</Prefix>
  <KeyCount>2</KeyCount>
  <MaxKeys>1000</MaxKeys>
  <IsTruncated>false</IsTruncated>
  <Contents>
    <Key>documents/report.pdf</Key>
    <LastModified>2024-03-01T11:00:00.000Z</LastModified>
    <ETag>"7778aef83f66abc1fa1e8477f296d394"</ETag>
    <Size>52428800</Size>
    <StorageClass>STANDARD</StorageClass>
  </Contents>
  <CommonPrefixes>
    <Prefix>documents/2024/</Prefix>
  </CommonPrefixes>
</ListBucketResult>
```

Use `NextContinuationToken` from the response as the `continuation-token` in subsequent requests when `IsTruncated` is `true`.

**Permission**: `s3:ListBucket`.

---

## Multipart Upload Operations

Multipart upload allows uploading large objects in parts for improved reliability and performance. It is required for objects larger than 5 GB and recommended for objects larger than 100 MB.

### Multipart Upload Workflow

1. **Initiate** with `CreateMultipartUpload` to get an `UploadId`.
2. **Upload parts** with `UploadPart`, specifying `partNumber` (1-10,000) and the `UploadId`.
3. **Complete** with `CompleteMultipartUpload`, listing all parts and their ETags.
4. Or **abort** with `AbortMultipartUpload` to cancel and free storage.

### CreateMultipartUpload

Initiates a multipart upload and returns an `UploadId`.

```
POST /{ObjectKey}?uploads HTTP/1.1
Host: {BucketName}.qstorage.quilibrium.com
Content-Type: application/zip
```

**Response body** (XML):

```xml
<InitiateMultipartUploadResult>
  <Bucket>my-bucket</Bucket>
  <Key>large-file.zip</Key>
  <UploadId>VXBsb2FkIElEIGZvciA2aWWp...</UploadId>
</InitiateMultipartUploadResult>
```

**Permission**: `s3:PutObject`.

### UploadPart

Uploads a single part of a multipart upload.

```
PUT /{ObjectKey}?partNumber={N}&uploadId={UploadId} HTTP/1.1
Host: {BucketName}.qstorage.quilibrium.com
Content-Length: {partSize}

[Part data]
```

**Constraints**:
- Part numbers: 1 to 10,000.
- Minimum part size: **5 MB** (except the last part).
- Uploading with the same part number overwrites the previous part.

Returns an `ETag` header for the uploaded part (needed for `CompleteMultipartUpload`).

**Permission**: `s3:PutObject`.

### CompleteMultipartUpload

Assembles all uploaded parts into a single object.

```
POST /{ObjectKey}?uploadId={UploadId} HTTP/1.1
Host: {BucketName}.qstorage.quilibrium.com

<?xml version="1.0" encoding="UTF-8"?>
<CompleteMultipartUpload>
  <Part>
    <PartNumber>1</PartNumber>
    <ETag>"7778aef83f66abc1fa1e8477f296d394"</ETag>
  </Part>
  <Part>
    <PartNumber>2</PartNumber>
    <ETag>"aaaa1234bbbb5678cccc9012dddd3456"</ETag>
  </Part>
</CompleteMultipartUpload>
```

Parts must be listed in ascending order by part number. Processing may take several minutes.

**Response body** (XML):

```xml
<CompleteMultipartUploadResult>
  <Location>https://my-bucket.qstorage.quilibrium.com/large-file.zip</Location>
  <Bucket>my-bucket</Bucket>
  <Key>large-file.zip</Key>
  <ETag>"7778aef83f66abc1fa1e8477f296d394-2"</ETag>
</CompleteMultipartUploadResult>
```

**Errors**: `NoSuchUpload`, `EntityTooSmall`, `InvalidPart`, `InvalidPartOrder`, `MalformedXML`.

**Permission**: `s3:PutObject`.

### AbortMultipartUpload

Cancels a multipart upload and frees storage consumed by uploaded parts.

```
DELETE /{ObjectKey}?uploadId={UploadId} HTTP/1.1
Host: {BucketName}.qstorage.quilibrium.com
```

**Success response**: HTTP 204.

**Note**: If parts are still being uploaded when the abort is issued, those in-flight uploads may or may not succeed. You may need to call abort multiple times to fully free all storage.

**Permission**: `s3:AbortMultipartUpload`.

### ListMultipartUploads and ListParts

- `ListMultipartUploads`: Lists in-progress multipart uploads for a bucket.
- `ListParts`: Lists the parts that have been uploaded for a specific multipart upload.

---

## Server-Side Encryption

QStorage encrypts all objects at rest by default. Additional encryption options are available:

| Option | Header Value | Description |
|--------|-------------|-------------|
| SSE-S3 | `x-amz-server-side-encryption: AES256` | Encryption with QStorage-managed keys |
| SSE-KMS | `x-amz-server-side-encryption: verenc` | Encryption with QKMS-managed keys |
| DSSE-KMS | `x-amz-server-side-encryption: verenc:dsse` | Double encryption with QKMS keys |

When using SSE-KMS (`verenc`), you can specify:
- The KMS key ID: `x-amz-server-side-encryption-aws-kms-key-id`
- Encryption context: `x-amz-server-side-encryption-context` (Base64-encoded JSON)
- Bucket Key optimization: `x-amz-server-side-encryption-bucket-key-enabled: true`

**Important**: If you use SSE on top of the default encryption, your data is encrypted twice -- once with your specified key and once for storage.

---

## Data Types

### Bucket

Container for bucket information, returned by `ListBuckets`.

```xml
<Bucket>
  <Name>string</Name>
  <CreationDate>timestamp</CreationDate>
  <BucketRegion>string</BucketRegion>
</Bucket>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Name | String | Yes | The bucket name |
| CreationDate | Timestamp | Yes | When the bucket was created |
| BucketRegion | String | No | Region where the bucket is located |

### Object

Represents an object in `ListObjectsV2` responses.

| Field | Type | Description |
|-------|------|-------------|
| Key | String | The object key (min length 1) |
| LastModified | Timestamp | When the object was last modified |
| ETag | String | Entity tag (MD5 hash for standard uploads) |
| Size | Long | Size in bytes |
| StorageClass | String | Storage class (e.g. `STANDARD`) |
| Owner | Owner | Owner information (if requested) |
| ChecksumAlgorithm | Array | Checksum algorithm(s) used |

### Owner

Identifies the owner of a bucket or object.

```xml
<Owner>
  <ID>q12345678example</ID>
  <DisplayName>user1</DisplayName>
</Owner>
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| ID | String | Yes | Unique owner identifier |
| DisplayName | String | No | Human-readable owner name |

### Tag

A key-value pair for resource tagging.

```xml
<Tag>
  <Key>Project</Key>
  <Value>Project One</Value>
</Tag>
```

Both `Key` and `Value` are required strings.

### CompletedPart

Used in `CompleteMultipartUpload` requests to identify an uploaded part.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| PartNumber | Integer | Yes | Part number (1-10,000) |
| ETag | String | Yes | ETag from the `UploadPart` response |
| ChecksumCRC32 | String | No | CRC32 checksum if applicable |
| ChecksumSHA256 | String | No | SHA256 checksum if applicable |

### ErrorDetails

Returned in error responses.

| Field | Type | Description |
|-------|------|-------------|
| ErrorCode | String | The error code |
| ErrorMessage | String | Description of the error |

---

## Error Responses

QStorage returns standard HTTP status codes. Error responses include an XML body:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Error>
  <Code>NoSuchBucket</Code>
  <Message>The specified bucket does not exist</Message>
  <BucketName>non-existent-bucket</BucketName>
  <RequestId>4442587FB7D0A2F9</RequestId>
</Error>
```

### Common Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | InvalidBucketName | The bucket name is not valid |
| 400 | EntityTooLarge | Object exceeds maximum allowed size |
| 400 | MalformedXML | The XML request body is not well-formed |
| 403 | Forbidden | Authentication failed or insufficient permissions |
| 404 | NoSuchBucket | The specified bucket does not exist |
| 404 | NoSuchKey | The specified object key does not exist |
| 404 | NoSuchUpload | The specified multipart upload does not exist |
| 409 | BucketAlreadyExists | The bucket name is already taken |
| 409 | BucketNotEmpty | Cannot delete a bucket that contains objects |
| 412 | PreconditionFailed | A conditional header check failed |
| 416 | InvalidRange | The requested byte range is not satisfiable |

---

## Frequently Asked Questions

**Is QStorage fully compatible with Amazon S3?**
QStorage is designed to be highly compatible with the S3 API but is not a 1:1 replica. Core operations (bucket CRUD, object CRUD, multipart upload, ACLs, tagging, lifecycle, website hosting) are supported. Existing S3 SDKs and CLI tools work by changing the endpoint URL to `https://qstorage.quilibrium.com`.

**What is the maximum object size?**
A single `PutObject` request supports up to 5 GB. For larger objects, use multipart upload, which supports parts numbered 1 through 10,000 with a minimum part size of 5 MB (except the last part).

**How do I authenticate requests?**
QStorage uses AWS Signature Version 4 (HMAC-based). Obtain your Access Key ID and Secret Access Key from QConsole, then configure your S3 client with these credentials and the QStorage endpoint.

**What encryption options are available?**
All objects are encrypted at rest by default (SSE-S3 with AES256). You can optionally use SSE-KMS with QKMS keys (`verenc`) or double encryption (`verenc:dsse`). Customer-provided keys (SSE-C) are also supported.

**How do I host a static website on QStorage?**
QStorage supports S3 website hosting operations: `PutBucketWebsite`, `GetBucketWebsite`, and `DeleteBucketWebsite`. Configure an index document and optional error document, then point your domain to the bucket's website endpoint.

**Can I use Object Lock to prevent deletion?**
Yes. Enable Object Lock on the bucket at creation time, then set retention modes (`GOVERNANCE` or `COMPLIANCE`) and retention periods on individual objects. Legal holds can also be applied independently.

**What tools can I use with QStorage?**
Any S3-compatible tool works, including: `qcli` (Quilibrium's native CLI), AWS CLI, AWS SDKs (Python boto3, JavaScript AWS SDK, Go SDK, etc.), rclone, MinIO Client, Cyberduck, and others.

*Last updated: 2026-02-11T15:00:00*
