---
title: "QStorage — S3-Compatible Decentralized Storage User Guide"
source: official_docs_synthesis
date: 2026-02-11
type: technical_reference
topics:
  - QStorage
  - S3 compatible
  - buckets
  - objects
  - access control
  - regions
  - versioning
  - pricing
  - privacy
  - encryption at rest
  - Reed-Solomon
  - credentials
  - Q Console
---

# QStorage: S3-Compatible Decentralized Object Storage

QStorage is Quilibrium's S3-compatible object storage service built on top of the Quilibrium Network. It delivers best-in-class scalability, decentralization, reliability, security, and performance for storing and retrieving data. Because it leverages the decentralized Quilibrium protocol, QStorage provides censorship-resistant, privacy-first, and redundant storage that traditional cloud providers cannot match.

## S3 API Compatibility

QStorage's API is highly compatible with the Amazon S3 API. Any existing AWS CLI commands, SDKs (boto3 for Python, AWS SDK for JavaScript, etc.), and third-party S3-compatible tools work with QStorage by simply changing the endpoint URL to `https://qstorage.quilibrium.com`. No code changes are required beyond the endpoint configuration. For additional compatibility reference, see [AWS S3 Documentation](https://docs.aws.amazon.com/s3/).

### Supported S3 Features

QStorage supports the full breadth of S3 operations including: object versioning, multipart uploads, ACLs and bucket policies, CORS configuration, static website hosting with CNAME redirection, QNS integration (your-name.q resolves to your QStorage website), lifecycle rules, encryption at rest, object lock and legal hold, basic logging, inventory and analytics, and S3 Select compatibility. S3 Select support is particularly notable because most S3-compatible storage providers do not implement it.

---

## Getting Started

QStorage uses standard S3 terminology adapted for the Quilibrium Network:

| Term | Description |
|------|-------------|
| **Bucket** | A container for objects. Every object is stored within a bucket. |
| **Object** | The fundamental entity stored in QStorage, consisting of data and metadata. Objects can be up to 5 TB. |
| **Key** | The unique identifier for an object within a bucket (e.g., `photos/2023/vacation.jpg`). |
| **Region** | A geographic area where data is stored. Quilibrium has one global region: `q-world-1`. |
| **Versioning** | Keeps multiple variants of an object in the same bucket. |

### Three Ways to Access QStorage

**Via Q Console (Web UI):** Navigate to [console.quilibrium.com](https://console.quilibrium.com), sign in, select "QStorage" from the Services dropdown. The dashboard provides drag-and-drop file management, bucket creation, settings configuration, and usage monitoring.

**Via QCLI (Quilibrium CLI):** Use `qcli s3` or `qcli s3api` commands. QCLI automatically targets the correct QStorage endpoint. Run `qcli s3 help` for available commands.

**Via Third-Party S3 CLIs and SDKs:** Configure the AWS CLI or any S3-compatible tool:

```bash
aws configure
# AWS Access Key ID: <your-access-key>
# AWS Secret Access Key: <your-secret-key>
# Default region name: (leave empty or use q-world-1)
# Default output format: json

aws s3 ls --endpoint-url https://qstorage.quilibrium.com
```

---

## Credentials and Authentication

To interact with QStorage you need the following credentials, which are created and managed through Q Console:

| Credential | Format | Example |
|---|---|---|
| Access Key ID | Alphanumeric string | `ABCDEF12D213546709A` |
| Account ID | Integer | `1000000000` |
| Secret Key | String | `AbcdI32/daY+jjad4M...` |
| Endpoint | URL | `https://qstorage.quilibrium.com` |
| Region | String | `q-world-1` |

### Credential Setup with AWS CLI

Edit your AWS configuration files to permanently store QStorage credentials:

```bash
# ~/.aws/config
[default]
region = q-world-1
```

```bash
# ~/.aws/credentials
[default]
aws_access_key_id = <Your Access Key ID>
aws_secret_access_key = <Your Secret Access Key>
aws_account_id = <Your Account ID>
services = qstorage

[services qstorage]
s3 =
  endpoint_url = https://qstorage.quilibrium.com
```

### Managing Credentials in Q Console

Q Console provides a web interface to create new API keys, manage access permissions, monitor credential usage, rotate keys for security, and visually manage keys associated with different services.

### Key Hierarchy and Best Practices

QConsole keys follow a hierarchical structure similar to AWS IAM accounts, enabling custom roles with limited permissions for implementing the principle of least privilege. Best practices include: using unique credentials per service, implementing least privilege, rotating keys regularly, and monitoring for unauthorized access.

---

## Working with Buckets

A bucket is a container (similar to a top-level folder) that holds your objects. You can store unlimited data across unlimited objects within a bucket. Billing is per-GB stored plus request counts.

### Bucket Naming Rules

Bucket names must be 3-63 characters long, consist only of lowercase letters, numbers, periods, and hyphens, begin and end with a letter or number, must not contain two adjacent periods, and must not be formatted as an IP address (e.g., 123.456.7.8).

**Security and compatibility restrictions:**
- Must not start with `xn--` (prevents homoglyph attacks on subdomains)
- Must not start with `sthree-` or `amzn-s3-demo-`
- Must not end with `-s3alias`, `--ol-s3`, `.mrap`, or `--x-s3`

These additional restrictions maintain compatibility with S3 tooling and prevent security vulnerabilities.

**Public vs. private naming:** Public bucket names must be globally unique across the entire Quilibrium Network because they are routed through the Public Bucket Proxy. Private bucket names only need to be unique within your account namespace. Plan your naming strategy early if you anticipate making a bucket public.

**Best practices:** Avoid periods in bucket names (they complicate virtual-host-style addressing certificates). Never delete a public bucket to reuse the name since another user could claim it, potentially impersonating your content. Append GUIDs to bucket names if you need unpredictable names. Note that bucket names can be edited to resolve uniqueness conflicts when making a private bucket public.

### Creating a Bucket

```bash
# Using QCLI
qcli s3 create-bucket --bucket my-bucket-name

# Using AWS CLI
aws s3api create-bucket \
    --bucket my-bucket-name \
    --endpoint-url https://qstorage.quilibrium.com
```

Successful creation returns: `{ "Location": "/my-bucket-name" }`

In Q Console: navigate to QStorage, click "Create Bucket", enter a name, configure settings, click "Create."

### Listing Buckets

```bash
# Using QCLI
qcli s3 ls

# Using AWS CLI
aws s3 ls --endpoint-url https://qstorage.quilibrium.com
```

Output shows bucket creation dates and names, e.g.: `2025-04-04 14:50:38 test-bucket`

### Deleting a Bucket

A bucket must be empty before it can be deleted. Remove all objects first (see "Emptying a Bucket" below), then:

```bash
# Using AWS CLI (--force empties and deletes)
aws s3 rb s3://my-bucket-name --force --endpoint-url https://qstorage.quilibrium.com
```

**Warning about public buckets:** Do not delete a public bucket if you plan to reuse the name. The window between deletion and recreation allows someone else to claim that name, potentially impersonating your content. An empty bucket costs nothing and reserves the name.

### Emptying a Bucket

Emptying deletes all objects but preserves the bucket itself. This operation is permanent with no undo -- all objects, metadata, and version history are removed. Prefix filtering is supported (e.g., `s3://bucket-name/doc` would empty folders starting with "doc").

```bash
# Using AWS CLI
aws s3 rm s3://bucket-name --recursive --endpoint https://qstorage.quilibrium.com
```

### Editing Bucket Visibility (Public/Private)

All buckets and objects are private by default. No one can access your data unless they hold your encryption key.

When a bucket or object is made public, a **Public Bucket Proxy** is created. The proxy process works as follows:

1. A program or user sends a request to the public bucket proxy
2. The proxy has a cache of bucket and file names that can be requested
3. The requested file or bucket is looked up inside the network
4. If found, data is decrypted using the configured key (the key itself is never exposed)
5. Decrypted data is sent back through the proxy to the requester

Public bucket URLs follow the pattern: `bucketname.qstorage.quilibrium.com`

For website hosting, set your DNS CNAME to point to this bucket domain name. QNS integration also allows `your-name.q` domains to resolve to your QStorage-hosted website.

### Using Bucket Tags

Tags are key-value pairs for categorizing buckets. Each bucket supports up to 50 tags. Tag keys can be up to 128 characters and values up to 256 characters. Keys prefixed with `qstorage:` or `q-storage:` are reserved for system use.

```bash
# Add tags during bucket creation
aws s3api create-bucket --bucket my-bucket \
    --tagging "TagSet=[{Key=project,Value=alpha}]" \
    --endpoint-url https://qstorage.quilibrium.com

# Add tags to an existing bucket
aws s3api put-bucket-tagging --bucket my-bucket \
    --tagging "TagSet=[{Key=project,Value=alpha},{Key=environment,Value=production}]" \
    --endpoint-url https://qstorage.quilibrium.com

# View tags
aws s3api get-bucket-tagging --bucket my-bucket \
    --endpoint-url https://qstorage.quilibrium.com

# Remove all tags
aws s3api delete-bucket-tagging --bucket my-bucket \
    --endpoint-url https://qstorage.quilibrium.com
```

Tags enable cost allocation tracking, tag-based access control policies, organizational grouping, and automation triggers.

---

## Working with Objects

Objects are the fundamental entities in QStorage. Each object consists of a key (path), value (data up to 5 TB), metadata (system-defined and user-defined), access control information, and tags (up to 10 per object).

### Metadata and Billing

User-defined metadata can be up to 2 KB in size per object. While metadata is relatively small compared to object content, it contributes to overall storage costs. QStorage bills based on the aggregate storage used across all objects (data + metadata), not on a per-object basis. System metadata is necessary for object management and included in storage calculations.

### Uploading Objects

```bash
# Upload a file
qcli s3api cp /path/to/file.txt s3://bucket-name/

# Upload with metadata
qcli s3api cp /path/to/file.txt s3://bucket-name/ \
    --metadata '{"key1":"value1","key2":"value2"}'

# Upload a directory recursively
qcli s3api cp /path/to/directory s3://bucket-name/directory/ --recursive

# Using AWS CLI
aws s3 cp /path/to/file.txt s3://bucket-name/ \
    --endpoint-url https://qstorage.quilibrium.com
```

**Upload size limits:** Single operation uploads support up to 5 GB. Multipart upload supports objects from 5 MB to 5 TB, allowing parallel and resumable uploads.

In Q Console, use the drag-and-drop interface to upload files directly into buckets.

### Downloading Objects

```bash
# Download a file
qcli s3api cp s3://bucket-name/file.txt ./

# Download a directory recursively
qcli s3api cp s3://bucket-name/directory/ /local/path/ --recursive

# Download a specific version
aws s3api get-object --bucket bucket-name --key file.txt \
    --version-id <version-id> /local/path/file.txt \
    --endpoint-url https://qstorage.quilibrium.com
```

### Copying, Moving, and Renaming Objects

```bash
# Copy within same bucket
qcli s3api cp s3://bucket/source.txt s3://bucket/dest.txt

# Copy between buckets
qcli s3api cp s3://source-bucket/file.txt s3://dest-bucket/file.txt

# Move (copy + delete original)
qcli s3api mv s3://bucket/old-path.txt s3://bucket/new-path.txt

# Rename (same as move)
qcli s3api mv s3://bucket/old-name.txt s3://bucket/new-name.txt
```

There is no native "move" or "rename" API operation. These are implemented as copy-then-delete. For objects over 5 GB, multipart copy is required (most CLI tools handle this automatically).

### Deleting Objects

```bash
# Delete a single object
qcli s3api rm s3://bucket-name/file.txt

# Delete all objects with a prefix
qcli s3api rm s3://bucket-name/prefix/ --recursive

# Delete a specific version
qcli s3api rm s3://bucket-name/file.txt --version-id <version-id>
```

In versioned buckets, deleting an object adds a delete marker rather than permanently removing the data. To permanently delete, you must delete all versions. There are no additional costs for delete operations.

---

## Access Control

QStorage resources (buckets and objects) are private by default. You must explicitly grant permissions to allow others to access your data.

### Access Control Mechanisms

QStorage supports both resource-based access control (ACLs at the bucket and object level) and user-based access control (policies with IAM-style permissions). The QConsole key hierarchy allows creating custom roles with scoped permissions -- for example, a key that can only read objects but not write or delete.

### Tag-Based Access Control

You can create policies that condition access on bucket tags:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:ListBucket"],
    "Resource": "*",
    "Condition": {
      "StringEquals": {
        "s3:ResourceTag/environment": "development"
      }
    }
  }]
}
```

### IAM Policies vs Bucket Policies

There are two separate ways to control access in QStorage:

| Type | Attached to | Managed via | When to use |
|------|------------|-------------|-------------|
| **IAM Policies** | Users or Roles | QConsole (Identity and Authorization) | Control what a specific user or role can do across all buckets |
| **Bucket Policies** | A specific bucket | QConsole or AWS CLI (`put-bucket-policy`) | Control who can access a specific bucket (e.g., make it public) |

For most use cases, IAM policies attached to users via QConsole are the recommended approach.

### Example: Creating a Scoped Backup User

This walkthrough shows how to create a dedicated user with limited permissions — useful for automated backup tools or any service that should only access a specific bucket.

1. Go to **Identity and Authorization** in QConsole
2. Create a new **user** called `backup-agent`
3. Create a new **policy** called `backup-readwrite`:
   - Effect: **Allow**
   - Actions: `s3:GetObject`, `s3:PutObject`, `s3:ListBucket`, `s3:DeleteObject`
   - Resources: `arn:aws:s3:::backup-bucket/*`
4. Attach the policy to the `backup-agent` user
5. Use the `backup-agent` access key and secret key in your backup tool

This way, even if those credentials are compromised, the attacker can only access the backup bucket — nothing else.

### Multi-Account Hierarchy

QStorage supports AWS-style multi-account hierarchical features for cross-account asset sharing. Unlike traditional cloud providers where accounts are siloed, Quilibrium enables composability between assets across different accounts -- useful in decentralized applications where resources need to be shared.

---

## Regions and Network Replication

Quilibrium currently operates a single global region: **`q-world-1`**. All data is stored across the entire network rather than in isolated geographic data centers.

Any ARNs that reference a region should use `q-world-1`. Example ARN: `arn:q-world-1:bucket/q-demo-bucket`

### Reed-Solomon Encoding and Replication

Data stored on the Quilibrium Network is replicated using **Reed-Solomon encoding** through verifiable encryption. For paid-tier data, replication follows the same standard as all network data (including tokens):

- Each shard is maintained by **24 to 32 geographically distributed nodes**
- Past 32 nodes per shard, data breaks down into smaller sub-shards
- Reed-Solomon encoding allows data reconstruction even if some nodes go offline
- Strong availability guarantees are enforced: if nodes drop below a threshold, network halts are induced, incentivizing nodes to remain online and store data faithfully

For free-tier data, replication occurs within Quilibrium Inc.'s own infrastructure across multiple data centers in multiple geographic regions. All data is encrypted at rest regardless of tier.

---

## Privacy and Encryption

QStorage is built with privacy as a fundamental principle, not an add-on feature. Security and encryption are table stakes, not value-add services.

### Encryption at Rest and in Transit

All data is encrypted in transit. At the storage layer, every object's data blob and associated metadata are encrypted with protocol-level verifiable encryption. Even public bucket data is stored encrypted at rest -- decryption happens only when requested through the Public Bucket Proxy.

Without the correct encryption key, there is no way to query, discover, or determine whether data even exists on the network, even by the original uploader.

### Metadata Privacy

Quilibrium Inc. and the underlying network operators have no access to any user metadata. All metadata is encrypted and inaccessible to Quilibrium or network operators. Billing is handled by the network itself. Only data explicitly marked as public is visible to others.

### How Public Data Works

When you make a bucket or object public, you provide your encryption key to the Public Bucket Proxy (not to the public). The proxy uses your key behind the scenes to decrypt data for public requests. The key is never exposed to end users -- they receive the unencrypted data on the other side of the proxy.

### User Control

You maintain complete control over who can access your data, how long it is stored, and what is made public. QStorage's privacy-first architecture helps meet regulatory compliance requirements while maintaining data confidentiality.

### Censorship Resistance

Quilibrium is a permissionless protocol. If a node hosts data and you can route to that node, you can access the data regardless of censorship. Individual nodes can choose not to propagate public assets, but the network routes around censorship by design.

---

## Object Versioning

Object versioning preserves, retrieves, and restores every version of every object stored in a bucket.

### Versioning States

A bucket can be in one of three states:

| State | Behavior |
|-------|----------|
| **Unversioned** (default) | No version history is maintained. Overwrites replace objects. |
| **Versioning-enabled** | Every upload creates a new version. Deletes add delete markers instead of removing data. |
| **Versioning-suspended** | Existing versions are preserved but new uploads do not create new versions. |

### Related API Operations

- `GetBucketVersioning` -- check the versioning state of a bucket
- `PutBucketVersioning` -- enable or suspend versioning
- `ListObjectVersions` -- list all versions of objects in a bucket
- `GetObjectVersion` -- retrieve a specific version
- `DeleteObjectVersion` -- permanently delete a specific version

When versioning is enabled and you upload an object with a key that already exists, QStorage creates a new version rather than replacing the existing object.

---

## Pricing

### Free Tier

QStorage offers **5 GB of free storage**. Free-tier data is replicated within Quilibrium Inc.'s infrastructure across multiple data centers and geographic regions. Data is encrypted at rest, even for public buckets.

### Paid Tiers

For data beyond the free tier, QStorage offers pay-as-you-go pricing with optional monthly billing. Paid-tier data receives full network replication through the decentralized Quilibrium protocol (24-32 nodes per shard with Reed-Solomon encoding).

**Storage costs** are billed per-GB based on total data volume and storage duration.

**Request costs** are broken down by operation type:
- PUT, COPY, POST, LIST requests are charged at one rate
- GET and other retrieval requests are charged at a separate rate
- Data transfer (egress) may incur additional charges

Quilibrium targets competitive pricing in the S3-compatible storage market. The proxy layer and tiered caching architecture significantly reduce egress costs compared to traditional cloud providers.

### Cost Optimization Tips

- Implement lifecycle policies to automatically transition or expire objects
- Use object tagging for cost allocation and tracking
- Monitor usage patterns to identify optimization opportunities
- Empty unneeded buckets rather than deleting them (empty buckets are free and reserve the name)

### Payment Methods

| Payment Method | Description |
|---|---|
| **$QUIL** | Pay with Quilibrium's native token |
| **$wQUIL** | Pay with wrapped QUIL tokens |
| **$USDC** | Pay with USD Coin stablecoin (converted to $QUIL at billing time) |
| **Fiat** | Pay in fiat currency through Q Console; Quilibrium Inc. settles to the network in $QUIL |

All pricing is denominated in USD with crypto conversions at the current market rate at billing time.

---

## Q Console Integration

Q Console at [console.quilibrium.com](https://console.quilibrium.com) provides a full web interface for QStorage management:

- **Bucket management:** Create, list, configure, and delete buckets
- **Object management:** Drag-and-drop upload, download, and organize objects
- **Website hosting:** Two-click website deployment -- create a public bucket and upload your static site
- **Credential management:** Create API keys, manage permissions, rotate keys
- **Tag management:** Visual tag editing for buckets and objects
- **Usage monitoring:** Track storage consumption and request metrics
- **QKMS integration:** Use QKMS-managed keys for encryption of data going into QStorage
- **Template system:** Publish bucket configurations as templates that others can clone

### Website Hosting via Q Console

QStorage supports static website hosting with CDN-level performance through tiered caching. The process is straightforward:

1. Create a public bucket
2. Upload your static site files (drag-and-drop supported)
3. Set your DNS CNAME to `bucketname.qstorage.quilibrium.com`
4. Optionally integrate with QNS for `.q` domain resolution

Response times target tens of milliseconds through layered caching. Only static websites are supported; back-end services require separate hosting.

---

## Frequently Asked Questions

**Is QStorage really 100% S3-compatible?**
QStorage is highly compatible with Amazon's S3 API. Existing AWS tooling, SDKs, and third-party S3 clients work by changing the endpoint to `https://qstorage.quilibrium.com`. Core functionality is fully supported, though some differences exist. For complete compatibility details, refer to the [AWS S3 Documentation](https://docs.aws.amazon.com/s3/) and QStorage-specific guides.

**Can I host a website on QStorage?**
Yes. Create a public bucket, upload your static site, and configure DNS. QStorage supports CNAME redirection and QNS integration. Free-tier (5 GB) may be sufficient for many websites. Response times are designed to be CDN-competitive.

**How is my data protected?**
All data is encrypted at rest using verifiable encryption, even public buckets. Without the correct key, data cannot be queried, discovered, or read. Metadata is also encrypted. Quilibrium Inc. and network operators cannot access your data.

**What happens if network nodes go offline?**
Reed-Solomon encoding allows data reconstruction even if some nodes fail. The network's incentive model penalizes nodes that go offline (potential network halts) to ensure data availability. Free-tier data is additionally replicated across Quilibrium Inc.'s infrastructure.

**Do I need to buy a domain to host a website?**
Yes, QStorage does not offer domain registration. You need to purchase a domain separately and configure the CNAME to point to your public bucket endpoint. QNS names (`.q` domains) are available through the Quilibrium Name Service.

**Can I migrate from AWS S3 to QStorage?**
Yes. Because QStorage is S3-compatible, migration is straightforward: update your endpoint configuration, transfer your credentials, and use standard S3 tools to sync data. No application code changes are required beyond endpoint configuration.

**What is the difference between free and paid tier replication?**
Free-tier data is replicated within Quilibrium Inc.'s infrastructure (multiple data centers, multiple regions). Paid-tier data receives full decentralized network replication across 24-32 geographically distributed nodes per shard with Reed-Solomon encoding.

*Last updated: 2026-02-14*
